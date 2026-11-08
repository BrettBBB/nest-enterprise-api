import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Resend } from 'resend';

export type OutboundEmail = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

@Injectable()
export class ResendAdapter {
  async send(message: OutboundEmail) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('RESEND_API_KEY is not set');
    }

    const result = await new Resend(apiKey).emails.send({
      from: message.from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
    });
    if (result.error) {
      const failure = new Error(result.error.message);
      if (result.error.statusCode === 400 || result.error.statusCode === 422) {
        throw new BadRequestException(result.error.message, { cause: failure });
      }
      throw new InternalServerErrorException(result.error.message, {
        cause: failure,
      });
    }
    return { id: result.data.id };
  }
}
