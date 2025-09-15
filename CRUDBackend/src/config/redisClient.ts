import Redis from 'ioredis';
import dotenv from "dotenv";

dotenv.config();
const REDISURL = process.env.REDIS_URL as string;

const redisClient = new Redis( REDISURL, {
    lazyConnect: true, // evitar conexión automática
});

/*const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
});*/

export default redisClient;