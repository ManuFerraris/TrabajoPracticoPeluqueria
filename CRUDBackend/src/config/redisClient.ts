import Redis from 'ioredis';

const redisClient = new Redis( process.env.REDIS_URL! );

/*const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
});*/

export default redisClient;