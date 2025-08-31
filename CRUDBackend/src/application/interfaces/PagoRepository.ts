import { Pago } from "../../pago/pago.entity.js";

export interface PagoRepository {
    guardar(pago:Pago):Promise<Pago>;
    buscarPago(codigo:number):Promise<Pago | null>;
    buscarTodosLosPagos():Promise<Pago[]>;
    eliminarPago(pago:Pago):Promise<void>;
};