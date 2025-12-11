export async function connectWithTimeout<T>(connectFn: () => Promise<T>, timeoutMs = 20000): Promise<T> {
  let timer: any;
  try {
    return await Promise.race([
      connectFn(),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('wallet_connect_timeout')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
