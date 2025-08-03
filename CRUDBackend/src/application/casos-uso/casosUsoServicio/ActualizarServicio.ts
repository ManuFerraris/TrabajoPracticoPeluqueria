import { EntityManager } from "@mikro-orm/mysql";
import { Servicio } from "../../../Servicio/servicio.entity.js";
import { Turno } from "../../../turno/turno.entity.js";
import { TipoServicio } from "../../../TipoServicio/tiposervicio.entity.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";
import { RegistrarServicioDTO, validarServicioDTO } from "../../dtos/RegistrarServicioDTO.js";
import { calcularTotal } from "../../../Servicio/funcionesServicio/calcularTotal.js";
export class ActualizarServicio {
    constructor(private readonly repo:ServicioRepository){};

    async ejecutar(codigoSer:number, dto:RegistrarServicioDTO, em: EntityManager, actualizar:boolean):Promise<{errores: string[], servicioActualizado?: Servicio}>{
        
        const servicioAActualizar = await em.findOne(Servicio, {codigo: codigoSer});
        if(!servicioAActualizar){
            return { errores: ['Servicio no encontrado.'] };
        };

        const errores = await validarServicioDTO(dto, em, actualizar);
        if (errores.length > 0) return {errores};

        const turno = await em.findOneOrFail(Turno, {codigo_turno:dto.turno_codigo_turno});
        const tipoServicio = await em.findOneOrFail(TipoServicio, {codigo_tipo: dto.tipo_servicio_codigo});

        const {total, adicional_adom} = calcularTotal(dto, turno, tipoServicio);

        servicioAActualizar.monto = dto.monto;
        servicioAActualizar.estado = dto.estado;
        servicioAActualizar.adicional_adom = adicional_adom;
        servicioAActualizar.ausencia_cliente = dto.ausencia_cliente;
        servicioAActualizar.medio_pago = dto.medio_pago;
        servicioAActualizar.turno = turno;
        servicioAActualizar.tipoServicio = tipoServicio;
        servicioAActualizar.total = total;

        await this.repo.guardar(servicioAActualizar);

        return { errores: [], servicioActualizado: servicioAActualizar };
    };

}