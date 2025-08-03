import { Servicio } from "../../Servicio/servicio.entity.js";
import { ServicioRepository } from "../../application/interfaces/ServicioRepository.js";
import { EntityManager } from "@mikro-orm/mysql";

export class ServicioRepositoryORM implements ServicioRepository {

    constructor(private readonly em: EntityManager) {};

    async buscarServicio(codigo: number): Promise<Servicio | null> {
        const servicio = await this.em.findOne(
            Servicio,
            {
                codigo
            },
            {
                populate: ['tipoServicio', 'turno']
            },
        );
        if(servicio) return servicio;
        return null;
    };

    async eliminarServicio(servico: Servicio): Promise<void> {
        await this.em.removeAndFlush(servico);
    };
};