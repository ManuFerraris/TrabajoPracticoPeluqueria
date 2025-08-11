import redisClient from "../config/redisClient.js";

export async function validateResetRequest(email:string, ip:string): Promise<"ok" | "blocked" | "invalid">{
    if(!email) return "invalid";

    const attempts = await redisClient.get(`reset_attempts:${ip}`);
    if(attempts && parseInt(attempts) >= 5){
        await new Promise(res => setTimeout(res, 1000));
        return "blocked";
    };

    const newAttempts = await redisClient.incr(`reset_attempts:${ip}`);
    if(newAttempts === 1){
        await redisClient.expire(`reset_attempts:${ip}`, 300);
    };
    return "ok";
};