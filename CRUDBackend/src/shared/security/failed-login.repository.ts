import Redis from "ioredis";

const redis = new Redis({
    host: "127.0.0.1", // Dirección local
    port: 6379
});

export class FailedLoginRepository{

    //Obtener intentos fallidos de un usuario
    static async getAttempts(email:string): Promise<number>{
        const attempts = await redis.get(`login_attempts_${email}`);
        return attempts ? parseInt(attempts): 0;
    };

    //Incrementar intentos fallidos y establecer expiracion automatica
    static async incrementAttempts(email:string): Promise<void>{
        const attempts = await FailedLoginRepository.getAttempts(email);
        await redis.set(`login_attempts_${email}`, attempts + 1, "EX", 15 * 60); // Expira en 15 minutos.
    };

    //Resetear los intentos al lograr un login exitoso
    static async resetAttempts(email:string): Promise<void>{
        await redis.del(`login_attempts_${email}`);
    };
};