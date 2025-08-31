import { Pago } from "../../../pago/pago.entity.js";
import { PagoRepository } from "../../interfaces/PagoRepository.js";

export class EliminarPago {
    constructor(private readonly repo:PagoRepository){};

    async ejecutar(id:number):Promise<string[]>{
        const errores:string[] = [];

        const pago = await this.repo.buscarPago(id);
        if(!pago){
            errores.push(`No se encontro el pago con codigo ${id}`);
            return errores;
        };
        await this.repo.eliminarPago(pago);
        return errores;
    };
};