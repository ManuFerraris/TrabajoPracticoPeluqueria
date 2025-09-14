import { Pago } from "../../pago/pago.entity.js";
import { Cliente } from "../../cliente/clientes.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { PagoRepository } from "../../application/interfaces/PagoRepository.js";

export class PagoRepositoryORM implements PagoRepository {
    constructor(private readonly em:EntityManager){};

    async guardar(pago: Pago):Promise<Pago> {
        await this.em.persistAndFlush(pago);
        return pago;
    };

    async buscarPago(codigo: number): Promise<Pago | null> {
        const pago = await this.em.findOne(
            Pago, 
            {
                id:codigo
            }, 
            { 
                populate: [
                    'turno', 
                    'turno.servicio', 
                    'turno.servicio.tipoServicio', 
                    'turno.cliente',
                    'turno.peluquero'
                ],
            },
        );
        return pago;
    };

    async buscarTodosLosPagos(): Promise<Pago[]> {
        return await this.em.find(
            Pago,
            {},
            { 
                populate: ['turno', 'turno.servicio', 'turno.servicio.tipoServicio', 'turno.cliente']
            }
        );
    };

    async eliminarPago(pago:Pago): Promise<void> {
        await this.em.removeAndFlush(pago);
        return;
    };

    async buscarMisPagos(cliente:Cliente): Promise<Pago[]> {
        return await this.em.find(
            Pago,
            {turno: { cliente: cliente }},
            { populate: ['turno', 'turno.servicio', 'turno.servicio.tipoServicio', 'turno.cliente'] }
        );
    };
};