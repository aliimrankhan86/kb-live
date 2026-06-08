export const DBAdapter = new Proxy(
  {},
  {
    get() {
      throw new Error('Prisma DBAdapter is server-only and cannot run in the browser.');
    },
  }
);
