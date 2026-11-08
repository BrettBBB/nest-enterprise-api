import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailResponseDto } from './dto/email-response.dto.js';
import {
  emailResponseExample,
  sendEmailExample,
} from './dto/email.examples.js';
import { SendEmailDto } from './dto/send-email.dto.js';
import { EmailService } from './email.service.js';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Send a contact message' })
  @ApiBody({
    type: SendEmailDto,
    examples: {
      sample: {
        summary: 'Sample message',
        description: 'A message a visitor can send from the contact form.',
        value: sendEmailExample,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The message was accepted for delivery.',
    type: EmailResponseDto,
    example: emailResponseExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or the mail provider rejected the message.',
  })
  send(@Body() sendEmailDto: SendEmailDto) {
    return this.emailService.sendMessage({
      name: sendEmailDto.name,
      email: sendEmailDto.email,
      message: sendEmailDto.message,
    });
  }
}
