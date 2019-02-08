import keys from './keys';
import redis, { RedisClient } from 'redis';
import { zero, one, BigInteger } from 'big-integer';

// Redis stuffs
const redisClient: RedisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort ? parseInt(keys.redisPort) : undefined,
  retry_strategy: () => 1000
});

const sub: RedisClient = redisClient.duplicate();

// Fibonacci calculation
/* Slow recursive version */
const fib_1 = (index: number): number => {
  if (index < 2) return 1;
  return fib_1(index - 1) + fib_1(index - 2);
};

/* Fast exponentiation matrix version */
const multiply = async (...matrices: BigInteger[][]): Promise<BigInteger[]> =>
  matrices.reduce(([a, b, c], [d, e, f]) => [
    a.times(d).plus(b.times(e)),
    a.times(e).plus(b.times(f)),
    b.times(e).plus(c.times(f))
  ]);

const power = async (matrix: BigInteger[], n: number): Promise<BigInteger[]> => {
  if (n === 1) return matrix;
  const half = await power(matrix, Math.floor(n / 2));
  return n % 2 === 0
    ? await multiply(half, half)
    : await multiply(half, half, matrix);
};

const fib = async (index: number): Promise<BigInteger | number> => index < 2
  ? index
  : await power([one, one, zero], index - 1).then(res => res[0]);

const count = async (n: string): Promise<string> => {
  const start = Date.now();
  const len = `${await fib(parseInt(n))}`.length;
  const end = Date.now();
  return (end - start) + 'ms ' + len;
}

// Sub
sub.on('message', async (chanel, message) => {
  redisClient.hset('values', message, await count(message));
});

sub.subscribe('insert');
