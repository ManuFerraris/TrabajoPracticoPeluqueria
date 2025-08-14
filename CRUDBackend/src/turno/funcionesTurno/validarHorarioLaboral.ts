import { toZonedTime } from "date-fns-tz";

export function validarHorarioLaboral(fechaHora: Date) {
    const zonaHoraria = "America/Argentina/Buenos_Aires";

    const fechaUTC = new Date(fechaHora);
    const fechaTurno = toZonedTime(fechaUTC, zonaHoraria);
    
    const diaSemana = fechaTurno.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const hora = fechaTurno.getHours();

    // Domingos 
    if (diaSemana === 0) {
        return "No se pueden agendar turnos los domingos.";
    };

    // Lunes a viernes
    if (diaSemana >= 1 && diaSemana <= 5 && (hora < 8 || hora >= 21)) {
        return "El horario de atención es entre las 8:00hs y las 20:59hs.";
    };

    // Sábados
    if (diaSemana === 6 && (hora < 8 || hora >= 12)) {
        return "Los sábados, el horario de atención es entre las 8:00hs y las 12:00hs.";
    };

    return null;
};