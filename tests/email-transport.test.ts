import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sendSpy = vi.fn(async () => ({ error: null }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendSpy };
  },
}));

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  sendSpy.mockClear();
});

async function client() {
  const mod = await import('@/lib/email/send');
  return mod.resendClient();
}

describe('email transport', () => {
  it('uses Resend whenever a key is set', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.EMAIL_LOG_PATH = join(tmpdir(), 'never.log');
    await (await client()).emails.send({ from: 'a', to: 'b', subject: 's', html: '<p/>' });
    expect(sendSpy).toHaveBeenCalledOnce();
  });

  it('writes to the log file locally when no key is set, and sends nothing', async () => {
    delete process.env.RESEND_API_KEY;
    const path = join(mkdtempSync(join(tmpdir(), 'mail-')), 'logs', 'emails.log');
    process.env.EMAIL_LOG_PATH = path;
    await (await client()).emails.send({ from: 'a', to: 'pilgrim@example.com', subject: 'Hello', html: '<p>x</p>' });
    expect(sendSpy).not.toHaveBeenCalled();
    const line = JSON.parse(readFileSync(path, 'utf8').trim());
    expect(line).toMatchObject({ to: 'pilgrim@example.com', subject: 'Hello' });
  });

  it('production still requires the key: never falls back to a file', async () => {
    delete process.env.RESEND_API_KEY;
    const path = join(tmpdir(), `prod-${Date.now()}.log`);
    process.env.EMAIL_LOG_PATH = path;
    process.env.VERCEL_ENV = 'production';
    await expect(client()).rejects.toThrow('RESEND_API_KEY is not set');
    expect(existsSync(path)).toBe(false);
  });

  it('without a key or a log path it throws as before', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_LOG_PATH;
    await expect(client()).rejects.toThrow('RESEND_API_KEY is not set');
  });
});
