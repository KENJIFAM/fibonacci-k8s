import keys from './keys';
import redis, { RedisClient } from 'redis';

const redisClient: RedisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort ? parseInt(keys.redisPort) : undefined,
  retry_strategy: () => 1000
});

const sub: RedisClient = redisClient.duplicate();

const fib = (index: number): number => {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

sub.on('message', (chanel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)).toString());
});

sub.subscribe('insert');
