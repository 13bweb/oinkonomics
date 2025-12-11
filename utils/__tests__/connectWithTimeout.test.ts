import { connectWithTimeout } from '../connectWithTimeout';

jest.useFakeTimers();

describe('connectWithTimeout', () => {
  it('resolves when connectFn resolves before timeout', async () => {
    const fn = jest.fn(() => Promise.resolve('ok'));
    const p = connectWithTimeout(fn, 5000);
    jest.runAllTimers();
    await expect(p).resolves.toBe('ok');
  });

  it('rejects with timeout when connectFn does not resolve', async () => {
    const fn = jest.fn(() => new Promise(() => {}));
    const p = connectWithTimeout(fn, 1000);
    jest.advanceTimersByTime(1000);
    await expect(p).rejects.toThrow('wallet_connect_timeout');
  });
});
