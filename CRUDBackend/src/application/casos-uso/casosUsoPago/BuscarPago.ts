import { Pago } from "../../../pago/pago.entity.js";
import { PagoRepository } from "../../interfaces/PagoRepository.js";

export class BuscarPago {
    constructor(private readonly repo:PagoRepository){};

    async ejecutar(codPago:number):Promise<Pago | string>{
        const pago = await this.repo.buscarPago(codPago);
        if(!pago ){
            return `No se ha encontrado el pago con codigo: ${codPago}`;
        };
        return pago;
    };
};