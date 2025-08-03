import { Turno } from "../../../turno/turno.entity.js";
import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { Cliente } from "../../../cliente/clientes.entity.js";
import { EntityManager } from "@mikro-orm/mysql";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";
import { RegistrarTurnoDTO } from "../../dtos/RegistrarTurnoDTO.js";
import { validarTurnoDTO } from "../../dtos/RegistrarTurnoDTO.js";

export class ActualizarTurno {
    constructor(private readonly repo:TurnoRepository){};

    async ejecutar(codTurno:number, dto:RegistrarTurnoDTO, em:EntityManager,actualizacion:boolean):Promise<{ errores: string[], turnoActualizado?: Turno }> {
        
        const turnoAActualizar = await this.repo.buscarTurno(codTurno);
        if(!turnoAActualizar){
            return { errores: ['Turno no encontrado.'] };
        };

        const errores = await validarTurnoDTO(dto, em, actualizacion);
        if (errores.length > 0) return {errores};

        const cliente = await em.findOneOrFail(Cliente, { codigo_cliente: dto.codigo_cliente });
        const peluquero = await em.findOneOrFail(Peluquero, { codigo_peluquero: dto.codigo_peluquero });

        const fechaTurno = new Date(dto.fecha_hora);
        if (isNaN(fechaTurno.getTime())) {
            return { errores: ['La fecha y hora no es válida.'] };
        };

        turnoAActualizar.cliente = cliente;
        turnoAActualizar.peluquero = peluquero;
        turnoAActualizar.fecha_hora = fechaTurno;
        turnoAActualizar.tipo_turno = dto.tipo_turno;
        turnoAActualizar.estado = dto.estado;
        turnoAActualizar.porcentaje = dto.tipo_turno === 'A Domicilio' ? 25 : 0;

        await this.repo.guardar(turnoAActualizar);
        return { errores: [], turnoActualizado: turnoAActualizar };
    };
};