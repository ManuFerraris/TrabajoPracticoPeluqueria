import { Peluquero } from "../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../application/interfaces/PeluqueroRepository.js";
import { EntityManager } from "@mikro-orm/core";
import { Turno } from "../../turno/turno.entity.js";

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
        console.log("Peluquero guardado y actualizado: ", peluquero)
        return peluquero;
    };

    async eliminarPeluquero(peluquero: Peluquero): Promise<void> {
        await this.em.removeAndFlush(peluquero);
    };

    async getAllPeluquerosConTurnosYCLientes(): Promise<Peluquero[]> {
        return this.em.findAll(Peluquero, {populate: ['turnos.cliente']})
    };

    async getMisTurnos(codigo_pel: number): Promise<Turno[]> {
        return await this.em.find(
            Turno,
            {
                estado: 'Activo',
                peluquero: {codigo_peluquero: codigo_pel}
            },
            { populate: ['peluquero', 'pago'] }
        );
    };

    async findByEmail(email: string): Promise<Peluquero | null> {
        return await this.em.findOne(Peluquero, { email });
    }
};