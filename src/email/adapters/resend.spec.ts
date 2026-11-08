import { ResendAdapter } from './resend.js';

const send = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

describe('ResendAdapter', () => {
  const previousKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    send.mockReset();
    process.env.RESEND_API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = previousKey;
  });

  it('returns the id from Resend', async () => {
    send.mockResolvedValue({ data: { id: 'email-1' }, error: null });
    const resend = new ResendAdapter();

    await expect(
      resend.send({
        from: 'Brett Brinkhoff <onboarding@resend.dev>',
        to: 'brett.brinkhoff@outlook.com',
        replyTo: 'ada@example.com',
        subject: 'Contact from Ada',
        text: 'Hello',
      }),
    ).resolves.toEqual({ id: 'email-1' });
    expect(send).toHaveBeenCalledWith({
      from: 'Brett Brinkhoff <onboarding@resend.dev>',
      to: 'brett.brinkhoff@outlook.com',
      replyTo: 'ada@example.com',
      subject: 'Contact from Ada',
      text: 'Hello',
    });
  });
});
