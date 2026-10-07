import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sendSpy = vi.fn(async (_msg: unknown) => ({ error: null }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendSpy };
  },
}));

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  sendSpy.mockClear();
  vi.restoreAllMocks();
});

async function client() {
  const mod = await import('@/lib/email/send');
  return mod.resendClient();
}

const msg = { from: 'a', to: 'pilgrim@test.local', replyTo: 'r@test.local', subject: 'Hello', html: '<p>x</p>' };

describe('email transport in production (unchanged)', () => {
  it('sends through Resend to the real recipient with the subject untouched', async () => {
    process.env.VERCEL_ENV = 'production';
    process.env.RESEND_API_KEY = 're_test';
    process.env.STAGING_EMAIL_TO = 'staging@test.local';
    await (await client()).emails.send(msg);
    expect(sendSpy).toHaveBeenCalledWith(msg);
  });

  it('still requires the key: never falls back to a file or the console', async () => {
    delete process.env.RESEND_API_KEY;
    const path = join(tmpdir(), `prod-${Date.now()}.log`);
    process.env.EMAIL_LOG_PATH = path;
    process.env.VERCEL_ENV = 'production';
    await expect(client()).rejects.toThrow('RESEND_API_KEY is not set');
    expect(existsSync(path)).toBe(false);
  });
});

describe('email transport outside production', () => {
  it.each(['preview', 'development', undefined])('VERCEL_ENV=%s sends only to STAGING_EMAIL_TO, prefixed', async (env) => {
    if (env) process.env.VERCEL_ENV = env;
    else delete process.env.VERCEL_ENV;
    process.env.RESEND_API_KEY = 're_test';
    process.env.STAGING_EMAIL_TO = 'staging@test.local';
    await (await client()).emails.send({ ...msg, to: ['op@test.local', 'b@test.local'] });
    expect(sendSpy).toHaveBeenCalledWith({
      ...msg,
      to: 'staging@test.local',
      subject: '[STAGING] to op@test.local, b@test.local: Hello',
    });
  });

  it.each([
    ['STAGING_EMAIL_TO', { RESEND_API_KEY: 're_test' }],
    ['RESEND_API_KEY', { STAGING_EMAIL_TO: 'staging@test.local' }],
  ])('without %s it logs to the console and sends nothing', async (_missing, vars) => {
    process.env.VERCEL_ENV = 'preview';
    delete process.env.RESEND_API_KEY;
    delete process.env.STAGING_EMAIL_TO;
    delete process.env.EMAIL_LOG_PATH;
    Object.assign(process.env, vars);
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    await expect((await client()).emails.send(msg)).resolves.toEqual({ error: null });
    expect(sendSpy).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('[email] not sent'), expect.objectContaining({ to: 'pilgrim@test.local', subject: 'Hello' }));
  });

  it('writes to EMAIL_LOG_PATH locally when no key is set, and sends nothing', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.VERCEL_ENV;
    const path = join(mkdtempSync(join(tmpdir(), 'mail-')), 'logs', 'emails.log');
    process.env.EMAIL_LOG_PATH = path;
    await (await client()).emails.send(msg);
    expect(sendSpy).not.toHaveBeenCalled();
    const line = JSON.parse(readFileSync(path, 'utf8').trim());
    expect(line).toMatchObject({ to: 'pilgrim@test.local', subject: 'Hello' });
  });
});
