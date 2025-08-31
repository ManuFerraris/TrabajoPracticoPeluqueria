import { Pago } from "../../pago/pago.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { PagoRepository } from "../../application/interfaces/PagoRepository.js";

export class PagoRepositoryORM implements PagoRepository {
    constructor(private readonly em:EntityManager){};

    async guardar(pago: Pago):Promise<Pago> {
        await this.em.persistAndFlush(pago);
        return pago;
    };

};