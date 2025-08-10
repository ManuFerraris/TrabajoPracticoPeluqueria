import { TipoServicio } from "../../TipoServicio/tiposervicio.entity.js";
import { TipoServicioRepository } from "../../application/interfaces/TipoServicioRepository.js";
import { EntityManager } from "@mikro-orm/core";

export class TipoServicioRepositoryORM implements TipoServicioRepository {
    constructor(private readonly em:EntityManager){};
    
    async listarTiposServicios(): Promise<TipoServicio[]> {
        return await this.em.find(TipoServicio, {});
    };

    async obtenerTipoServicio(codVal: number): Promise<TipoServicio | null> {
        return this.em.findOne(TipoServicio,
            {
                codigo_tipo:codVal
            },
            {
                populate:['servicio']
            }
        );
    };

    async guardar(tipoServicioAActualizar: TipoServicio): Promise<TipoServicio | null> {
        await this.em.persistAndFlush(tipoServicioAActualizar);
        return tipoServicioAActualizar;
    };

    async eliminarTipoServicio(tipoServicio:TipoServicio): Promise<void> {
        await this.em.removeAndFlush(tipoServicio);
    };
};