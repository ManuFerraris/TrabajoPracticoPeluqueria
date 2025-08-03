import { Turno } from "../../../turno/turno.entity.js";
import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { Cliente } from "../../../cliente/clientes.entity.js";
import { RegistrarTurnoDTO, validarTurnoDTO } from "../../dtos/RegistrarTurnoDTO.js";
import { TurnoRepositoryORM } from "../../../shared/db/TurnoRepositoryORM.js";
import { EntityManager } from "@mikro-orm/mysql";

export class RegistrarTurno {
    constructor(private readonly turnoRepo:TurnoRepositoryORM) {};

    async ejecutar(dto:RegistrarTurnoDTO, em:EntityManager):Promise<string[] | Turno>{
        const errores = await validarTurnoDTO(dto, em);
        if (errores.length > 0) return errores;

        const cliente = await em.findOneOrFail(Cliente, { codigo_cliente: dto.codigo_cliente });
        const peluquero = await em.findOneOrFail(Peluquero, { codigo_peluquero: dto.codigo_peluquero });

        // Crear el turno
        const turno = new Turno();
        turno.cliente = cliente;
        turno.peluquero = peluquero;
        turno.fecha_hora = new Date(dto.fecha_hora);
        turno.tipo_turno = dto.tipo_turno;
        turno.estado = dto.estado;
        turno.porcentaje = dto.tipo_turno === 'A Domicilio' ? 25 : 0;

        await this.turnoRepo.guardar(turno);
        return turno;
    }
}