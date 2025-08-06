import { Peluquero } from "../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../application/interfaces/PeluqueroRepository.js";
import { EntityManager } from "@mikro-orm/core";
import { populate } from "dotenv";

export class PeluqueroRepositoryORM implements PeluqueroRepository {

    constructor(private readonly em:EntityManager){};

    async getAllPeluqueros(): Promise<Peluquero[]> {
        return await this.em.find(Peluquero, {});
    };

    async buscarPeluquero(codigo: number): Promise<Peluquero | null> {
        return await this.em.findOne(Peluquero, {codigo_peluquero: codigo});
    };

    async guardar(peluquero: Peluquero): Promise<Peluquero> {
        await this.em.persistAndFlush(peluquero);
        return peluquero;
    };

    async eliminarPeluquero(peluquero: Peluquero): Promise<void> {
        await this.em.removeAndFlush(peluquero);
    };

    getAllPeluquerosConTurnosYCLientes(): Promise<Peluquero[]> {
        return this.em.findAll(Peluquero, {populate: ['turnos.cliente']})
    };
};