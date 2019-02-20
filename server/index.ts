import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import redis, { RedisClient } from 'redis';
import keys from './keys';

// Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Client
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort ? parseInt(keys.pgPort) : undefined
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => process.exit(1));

// Redis Client
const redisClient: RedisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort ? parseInt(keys.redisPort) : undefined,
  retry_strategy: () => 1000
});
const pub: RedisClient = redisClient.duplicate();

// Express route
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index: string = req.body.index;

  if (parseInt(index) > 1000000) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  pub.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, () => {
  console.log('Listening');
});
