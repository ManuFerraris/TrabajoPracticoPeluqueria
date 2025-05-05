import { Peluquero } from "./peluqueros.entity.js";
import { em } from "../shared/db/orm.js";

export class PeluqueroRepository {
    //busca al peluquero por email (devuelve null si no lo encuentra)
    static async findByEmail(email: string): Promise<Peluquero | null> {
        return em.findOne(Peluquero, { email });
    };
};