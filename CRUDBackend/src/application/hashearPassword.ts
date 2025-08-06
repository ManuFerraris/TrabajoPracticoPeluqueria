import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; 
export async function hashearPassword(password:string):Promise<string> {
    const hashPass = await bcrypt.hash(password, SALT_ROUNDS);
    return hashPass;
};