import { Test, TestingModule } from '@nestjs/testing';
import { ResendAdapter } from './adapters/resend.js';
import { EmailService, contactRecipient } from './email.service.js';
import { sendEmailExample } from './dto/email.examples.js';

describe('EmailService', () => {
  let service: EmailService;
  const resend = { send: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    delete process.env.RESEND_FROM;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ResendAdapter, useValue: resend },
      ],
    }).compile();

    service = module.get(EmailService);
  });

  it('sends the message to the contact address and replies to the sender', async () => {
    resend.send.mockResolvedValue({ id: 'email-1' });

    await expect(service.sendMessage(sendEmailExample)).resolves.toEqual({
      id: 'email-1',
    });
    expect(resend.send).toHaveBeenCalledWith({
      from: 'Brett Brinkhoff <onboarding@resend.dev>',
      to: contactRecipient,
      replyTo: sendEmailExample.email,
      subject: 'Contact from Ada Lovelace',
      text: 'I would like to talk about a full-stack role.\n\nAda Lovelace\nada@example.com',
    });
  });
});
