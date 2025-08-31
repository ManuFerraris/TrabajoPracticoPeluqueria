import { Pago } from "../../../pago/pago.entity.js";
import { PagoRepository } from "../../interfaces/PagoRepository.js";

export class BuscarTodosLosPagos {
    constructor(private readonly repo:PagoRepository){};

    async ejecutar():Promise<Pago[]>{
        return await this.repo.buscarTodosLosPagos();
    };
};