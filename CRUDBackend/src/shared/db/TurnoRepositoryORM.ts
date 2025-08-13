import { Turno } from "../../turno/turno.entity.js";
import { TurnoRepository } from "../../application/interfaces/TurnoRepository.js";
import { EntityManager } from "@mikro-orm/core";
import { FilterQuery } from "@mikro-orm/mysql";
import { populate } from "dotenv";
import { Cliente } from "../../cliente/clientes.entity.js";

export class TurnoRepositoryORM implements TurnoRepository {

    constructor(private readonly em: EntityManager) {};

    async buscarPorFecha(desde: Date, hasta: Date): Promise<Turno[]> {
        return await this.em.find(
            Turno, 
            {
                fecha_hora: { $gte:desde, $lt:hasta }
            },
            { populate: ['cliente', 'peluquero', 'servicio'] }
        );
    };

    async buscarTurnoCanceladoPorMes(desde: Date, hasta: Date): Promise<Turno[]> {
        return await this.em.find(
            Turno,
            {
                fecha_hora: {$gte: desde, $lt: hasta},
                estado: 'Cancelado',
            },
            { populate: ['cliente', 'peluquero', 'servicio'] }
        )
    };

    async getAllTurnos():Promise<Turno[]> {
        return await this.em.findAll(
            Turno,
            { 
                populate: ['cliente', 'peluquero', 'servicio']
            }
        );
    };

    async buscarTurno(codigo_turno: number): Promise<Turno | null> {
        const turno = await this.em.findOne(
            Turno,
            {
                codigo_turno
            },
            {
                populate: ['cliente', 'peluquero', 'servicio']
            },
        );
        if(turno) return turno;
        return null;
    };
    
    async guardar(turno:Turno):Promise<void>{
        await this.em.persistAndFlush(turno);
    };

    async eliminarTurno(turno: Turno): Promise<void> {
        await this.em.removeAndFlush(turno);
    };

    async getTurnosPorEstado(estadoIng: string, codPel:number): Promise<Turno[]> {
        return await this.em.find(Turno,
            {
                estado: estadoIng,
                peluquero: {codigo_peluquero:codPel}
            },
            {
                populate: ['peluquero']
            }
        );
    };

    async buscarTurnoCliente(cliente:Cliente): Promise<Turno[]> {
        return await this.em.find(Turno,
            {
                cliente
            },
            {
                populate: ['peluquero', 'servicio', 'cliente']
            }
        );
    };
};