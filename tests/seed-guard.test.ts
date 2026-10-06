import { describe, expect, it } from 'vitest';
import { assertLocalOnly } from '../scripts/seed-local-test-data.mjs';

const local = {
  DIRECT_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
};

describe('local test data seed guard', () => {
  it('allows a fully local environment', () => {
    expect(() => assertLocalOnly(local)).not.toThrow();
  });

  it.each([
    ['DIRECT_URL', 'postgresql://u:p@db.example.supabase.co:5432/postgres'],
    ['DATABASE_URL', 'postgresql://u:p@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'],
    ['NEXT_PUBLIC_SUPABASE_URL', 'https://abcdefgh.supabase.co'],
  ])('refuses when %s is not local', (key, value) => {
    expect(() => assertLocalOnly({ ...local, [key]: value })).toThrow(/not local/);
  });

  it('refuses in production mode or with a missing URL', () => {
    expect(() => assertLocalOnly({ ...local, NODE_ENV: 'production' })).toThrow(/production/);
    expect(() => assertLocalOnly({ ...local, DIRECT_URL: undefined })).toThrow(/not set/);
  });
});
