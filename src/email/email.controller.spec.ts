import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller.js';
import { EmailService } from './email.service.js';
import {
  emailResponseExample,
  sendEmailExample,
} from './dto/email.examples.js';

describe('EmailController', () => {
  let controller: EmailController;
  const emailService = { sendMessage: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [{ provide: EmailService, useValue: emailService }],
    }).compile();

    controller = module.get(EmailController);
  });

  it('maps a contact message onto the email service', async () => {
    emailService.sendMessage.mockResolvedValue(emailResponseExample);

    await expect(controller.send(sendEmailExample)).resolves.toBe(
      emailResponseExample,
    );
    expect(emailService.sendMessage).toHaveBeenCalledWith(sendEmailExample);
  });
});
