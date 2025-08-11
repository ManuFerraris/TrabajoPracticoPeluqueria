import { generatePasswordResetToken } from "./authService.js";
import { sendPasswordResetEmail } from "../shared/emailService.js";
import redisClient from "../config/redisClient.js";

export async function sendResetInstructions(email:string):Promise<void> {
    await redisClient.setex(`password_reset:${email}`, 300, "1");
    const token = generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, token);
    await new Promise( res => setTimeout(res, 1000));
};