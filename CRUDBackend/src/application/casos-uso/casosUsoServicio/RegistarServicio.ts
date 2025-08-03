import { Servicio } from "../../../Servicio/servicio.entity.js";
import { TipoServicio } from "../../../TipoServicio/tiposervicio.entity.js";
import { Turno } from "../../../turno/turno.entity.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";
import { RegistrarServicioDTO, validarServicioDTO } from "../../dtos/RegistrarServicioDTO.js";
import { EntityManager } from "@mikro-orm/mysql";
import { calcularTotal } from "../../../Servicio/funcionesServicio/calcularTotal.js";

export class RegistrarServicio {
    constructor(private readonly repo:ServicioRepository){};

    async ejecutar(dto:RegistrarServicioDTO, em:EntityManager ):Promise<string[] | Servicio>{
        const errores = await validarServicioDTO(dto, em);

        if(errores.length > 0) return errores;

        const turno = await em.findOneOrFail(Turno, {codigo_turno:dto.turno_codigo_turno});
        const tipoServicio = await em.findOneOrFail(TipoServicio, {codigo_tipo: dto.tipo_servicio_codigo});

        const {total, adicional_adom} = calcularTotal(dto, turno, tipoServicio);

        const servicio = new Servicio();
        servicio.monto = dto.monto;
        servicio.estado = dto.estado;
        servicio.adicional_adom = adicional_adom;
        servicio.ausencia_cliente = dto.ausencia_cliente;
        servicio.medio_pago = dto.medio_pago;
        servicio.turno = turno;
        servicio.tipoServicio = tipoServicio;
        servicio.total = total;

        await this.repo.guardar(servicio);
        return servicio;
    };
};