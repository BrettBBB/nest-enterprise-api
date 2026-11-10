import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AssistantController } from './assistant.controller.js';
import { AssistantService } from './assistant.service.js';
import { askAssistantExample } from './dto/assistant.examples.js';

describe('AssistantController', () => {
  let controller: AssistantController;
  const assistantService = { answer: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssistantController],
      providers: [{ provide: AssistantService, useValue: assistantService }],
    }).compile();

    controller = module.get(AssistantController);
  });

  it('streams text events and then a done event', async () => {
    assistantService.answer.mockReturnValue(
      (async function* () {
        yield 'Buffered';
        yield ' and batched.';
      })(),
    );
    const response = fakeResponse();

    await controller.ask(askAssistantExample, response);

    expect(assistantService.answer).toHaveBeenCalledWith(
      askAssistantExample.question,
      askAssistantExample.page,
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.writes).toEqual([
      'data: {"text":"Buffered"}\n\n',
      'data: {"text":" and batched."}\n\n',
      'data: {"done":true}\n\n',
    ]);
    expect(response.end).toHaveBeenCalledOnce();
  });

  it('returns the service error before opening the stream', async () => {
    assistantService.answer.mockReturnValue({
      [Symbol.asyncIterator]() {
        return {
          next() {
            return Promise.reject(
              new ServiceUnavailableException(
                'The architecture assistant is not configured.',
              ),
            );
          },
        };
      },
    });
    const response = fakeResponse();

    await expect(controller.ask(askAssistantExample, response)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(response.write).not.toHaveBeenCalled();
    expect(response.end).not.toHaveBeenCalled();
  });

  it('writes an error event when the stream fails after the first chunk', async () => {
    assistantService.answer.mockReturnValue(
      (async function* () {
        yield 'Partial';
        throw new Error('socket closed');
      })(),
    );
    const response = fakeResponse();

    await controller.ask(askAssistantExample, response);

    expect(response.writes.at(-1)).toBe(
      'data: {"error":"The assistant could not answer that question."}\n\n',
    );
    expect(response.end).toHaveBeenCalledOnce();
  });
});

function fakeResponse() {
  const writes: string[] = [];
  const response = {
    writes,
    status: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
    write: vi.fn((chunk: string) => {
      writes.push(chunk);
    }),
    end: vi.fn(),
  };
  return response as typeof response & Response;
}
