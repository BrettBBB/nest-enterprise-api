import { Injectable } from '@nestjs/common';
import { ResendAdapter } from './adapters/resend.js';

export const contactRecipient = 'brett.brinkhoff@outlook.com';

const defaultFrom = 'Brett Brinkhoff <onboarding@resend.dev>';

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

@Injectable()
export class EmailService {
  constructor(private readonly resend: ResendAdapter) {}

  sendMessage(message: ContactMessage) {
    const from = process.env.RESEND_FROM?.trim() || defaultFrom;
    return this.resend.send({
      from,
      to: contactRecipient,
      replyTo: message.email,
      subject: `Contact from ${message.name}`,
      text: `${message.message}\n\n${message.name}\n${message.email}`,
    });
  }
}
