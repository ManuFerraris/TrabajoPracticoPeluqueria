import { populate } from "dotenv";
import { Servicio } from "../../Servicio/servicio.entity.js";
import { ServicioRepository } from "../../application/interfaces/ServicioRepository.js";
import { EntityManager } from "@mikro-orm/mysql";

export class ServicioRepositoryORM implements ServicioRepository {

    constructor(private readonly em: EntityManager) {};

    async guardar(servicio: Servicio): Promise<void> {
        await this.em.persistAndFlush(servicio);
    };

    async getAllServicios(): Promise<Servicio[]> {
        return await this.em.findAll(Servicio);
    };

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

    async obtenerMontoTotalMensual(desde:Date, hasta:Date):Promise<Servicio[]>{
        return await this.em.find(
            Servicio,
            {
                ausencia_cliente: 'Se presento',
                turno: {
                    fecha_hora: {
                    $gte: desde,
                    $lt: hasta
                    }
                }
            }
        );
    };

    async buscarMiTurno(servicio: Servicio): Promise<Servicio> {
        return await this.em.findOneOrFail(Servicio, servicio, {populate: ['turno']});
    };
};