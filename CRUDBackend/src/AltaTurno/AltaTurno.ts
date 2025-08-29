import { TurnoRepository } from "../application/interfaces/TurnoRepository.js";
import { ServicioRepository } from "../application/interfaces/ServicioRepository.js";
import { Turno } from "../turno/turno.entity.js";
import { Servicio } from "../Servicio/servicio.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { crearTurnoDesdeDTO } from "./crearTurnoDesdeDTO.js";
import { crearServicioDesdeDTO } from "./crearServicioDesdeDTO.js";

export interface AltaTurnoDTO{
    fecha_hora: Date; // elige el cliente.
    tipo_turno: "Sucursal" | "A Domicilio"; // elige el cliente.
    porcentaje: number; // calcula el sistema.
    estado: "Activo" | "Cancelado" | "Sancionado" | "Atendido"; // setea el sistema 'Activo' por default.
    codigo_cliente: number; // se obtiene en el frontend del useAuth.
    codigo_peluquero: number; // elige el cliente.
};

export interface AltaServicioDTO{
    monto: number; // calcula el sistema.
    estado: "Pendiente" | "Pago"; // setea el sistema "Pendiente".
    ausencia_cliente: "Se presento" | "Esta ausente" | "Esperando atencion"; // setea el sistema "Esperando atencion".
    medio_pago: "Stripe" | "Efectivo"; // elige el cliente.
    turno_codigo_turno: number; // es el creado por el sistema instantes antes.
    tipo_servicio_codigo: number; // elige el cliente.
};

export class AltaTurno{
    constructor(
        private readonly turnoRepo: TurnoRepository,
        private readonly servicioRepo: ServicioRepository
    ){};

    //CasoUso
    async ejecutar(turnoDTO: AltaTurnoDTO, servicioDTO: AltaServicioDTO, em: EntityManager):Promise<typeof TurnoConServicioDTO  | string[]>{

        const turno = await this.crearTurno(turnoDTO, em);
        if(Array.isArray(turno)){ return turno };

        const servicio = await this.crearServicio(servicioDTO, turno.codigo_turno, em);
        if(Array.isArray(servicio)){ return servicio };

        const TurnoConServicioDTO = { turno, servicio };

        return TurnoConServicioDTO
    };

    private async crearTurno(dto:AltaTurnoDTO, em:EntityManager):Promise<Turno | string[]>{
        const turno = await crearTurnoDesdeDTO(dto, em);

        if( Array.isArray(turno) ) { return turno };

        await this.turnoRepo.guardar(turno);
        return turno;
    };

    private async crearServicio(dto:AltaServicioDTO, codTur: number, em:EntityManager):Promise<Servicio | string[]>{
        const servicio = await crearServicioDesdeDTO(dto, codTur, em);

        if(Array.isArray(servicio)){ return servicio };

        await this.servicioRepo.guardar(servicio);
        return servicio;
    };
};