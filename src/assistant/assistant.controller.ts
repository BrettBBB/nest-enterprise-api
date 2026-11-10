import {
  BadGatewayException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AssistantService } from './assistant.service.js';
import { askAssistantExample } from './dto/assistant.examples.js';
import { AskAssistantDto } from './dto/ask-assistant.dto.js';

type AssistantEvent = {
  text?: string;
  done?: true;
  error?: string;
};

@ApiTags('assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Stream an answer drawn from the architecture case studies',
  })
  @ApiBody({
    type: AskAssistantDto,
    examples: {
      sample: {
        summary: 'Compassion messaging',
        value: askAssistantExample,
      },
    },
  })
  @ApiProduces('text/event-stream')
  @ApiResponse({
    status: 200,
    description:
      'Server-sent events. Each data line is JSON with a text delta, then {"done":true}.',
  })
  @ApiResponse({ status: 400, description: 'The question is missing or too long.' })
  @ApiResponse({
    status: 503,
    description: 'The architecture assistant is not configured.',
  })
  async ask(@Body() askAssistantDto: AskAssistantDto, @Res() response: Response) {
    const iterator = this.assistantService
      .answer(askAssistantDto.question, askAssistantDto.page)
      [Symbol.asyncIterator]();
    let first: IteratorResult<string>;
    try {
      first = await iterator.next();
    } catch (error) {
      throw asHttpError(error);
    }

    response.status(200);
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');
    if (!first.done) {
      writeEvent(response, { text: first.value });
    }

    try {
      let next = await iterator.next();
      while (!next.done) {
        writeEvent(response, { text: next.value });
        next = await iterator.next();
      }
      writeEvent(response, { done: true });
    } catch (error) {
      writeEvent(response, { error: httpMessage(error) });
    } finally {
      response.end();
    }
  }
}

function writeEvent(response: Response, event: AssistantEvent) {
  response.write(`data: ${JSON.stringify(event)}\n\n`);
}

function asHttpError(error: unknown) {
  if (error instanceof HttpException) {
    return error;
  }
  return new BadGatewayException('The assistant could not answer that question.');
}

function httpMessage(error: unknown) {
  const httpError = asHttpError(error);
  const body = httpError.getResponse();
  if (typeof body === 'string') {
    return body;
  }
  if (typeof body === 'object' && body && 'message' in body) {
    const message = body.message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }
  return 'The assistant could not answer that question.';
}
