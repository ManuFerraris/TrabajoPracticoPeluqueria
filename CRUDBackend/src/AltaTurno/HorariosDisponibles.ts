import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import { PeluqueroRepository } from "../application/interfaces/PeluqueroRepository.js";
import { TipoServicioRepository } from "../application/interfaces/TipoServicioRepository.js";
import { TurnoRepository } from "../application/interfaces/TurnoRepository.js";
import { EntityManager } from "@mikro-orm/core";
import { seSuperpone } from "../peluquero/funciones/superposicionFechasTurnos.js";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

export class HorariosDisponibles{
    constructor(
        private readonly pelRepo: PeluqueroRepository,
        private readonly turRepo: TurnoRepository,
        private readonly tSRepo: TipoServicioRepository
    ){};

    async ejecutar(codPel:number, codTS:number,fecha:string, em:EntityManager):Promise<{  errores?: string[]; horarios?: string[];}>{
        const horarios:string[] = [];

        if (!fecha || !dayjs(fecha, "YYYY-MM-DD", true).isValid()) {
            return {errores: [`La fecha ingresada: ${fecha} no posee el formato valido "YYYY-MM-DD" o no fue ingresada`]};
        };

        const peluquero = await this.pelRepo.buscarPeluquero(codPel);
        if(!peluquero) return {errores: [`No existe el peluquero con codigo ${codPel}.`]};

        const tipoServicio = await this.tSRepo.obtenerTipoServicio(codTS);
        if(!tipoServicio) return{ errores: [`No se encontro un tipo de servicio con codigo ${codTS}.`]};

        const turnos = await this.turRepo.getTurnosPorEstado("Activo", codPel);

        // En turno tenemos la fecha y hora.
        // En tipoServicio tenemos la duracion estimada.

        // Definimos rango laboral por defecto.
        const diaSeleccionado = dayjs(fecha, "YYYY-MM-DD");

        const ahora = dayjs(); //Obtenemos la hora actual
        const esHoy = diaSeleccionado.isSame(ahora, "day");
        const horaInicio = esHoy ? ahora.hour() + (ahora.minute() > 0 ? 1 : 0) : 8;

        const inicioDia = diaSeleccionado.hour(horaInicio).minute(0);   // 08:00
        const finDia = diaSeleccionado.hour(20).minute(0);     // 20:00
        const duracion = tipoServicio.duracion_estimada; // en minutos

        // Guardamos los turnos de dicho peluquero y del dia seleccionado en turnosDelDia.
        const turnosDelDia = turnos.filter( turno => {
            const turnoFecha = dayjs(turno.fecha_hora);
            return turnoFecha.isSame(diaSeleccionado, "day");
        });

        // Generamos slots cada 'duracion' en minutos.
        let slot = inicioDia;
        while (slot.clone().add(duracion, "minute").isSameOrBefore(finDia)) {
            const slotInicio = slot.clone();
            const slotFin = slot.clone().add(duracion, "minute");

            const ocupado = turnosDelDia.some(turno => {
                const turnoInicio = dayjs.utc(turno.fecha_hora).local();
                const turnoFin = turnoInicio.add(duracion, "minute");
                return seSuperpone(slotInicio, slotFin, turnoInicio, turnoFin);
            });

            if (!ocupado) {
                horarios.push(slotInicio.format("HH:mm"));
            }

            slot = slot.add(duracion, "minute"); // avanzar al siguiente slot
        }
        return {errores: undefined, horarios};
    };
};