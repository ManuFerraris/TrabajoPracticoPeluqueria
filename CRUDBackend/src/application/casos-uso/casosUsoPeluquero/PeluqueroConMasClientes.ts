import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";

export class PeluqueroConMasClientes {
    constructor(private readonly repo:PeluqueroRepository){};

    async ejecutar():Promise<Peluquero[]>{
        const peluqueros = await this.repo.getAllPeluquerosConTurnosYCLientes();

        const peluqueroConCantidad: { 
            peluquero:Peluquero; 
            clientesUnicos: number;
        }[] = peluqueros.map(p => {
            const clientes = new Set(
                p.turnos
                    .filter(t => t.cliente !== undefined && t.cliente !== null)
                    .map(t => t.cliente.codigo_cliente)
            );
            return {peluquero: p, clientesUnicos: clientes.size};
        });
        const top3 = peluqueroConCantidad
            .sort((a, b) => b.clientesUnicos - a.clientesUnicos)
            .slice(0, 3)
            .map(p => p.peluquero);

        return top3;
    };
};