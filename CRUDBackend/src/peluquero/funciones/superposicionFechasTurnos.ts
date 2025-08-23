import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Dayjs } from "dayjs";

dayjs.extend(utc);

export function seSuperpone(
    slotInicio: Dayjs,
    slotFin: Dayjs,
    turnoInicio: Dayjs,
    turnoFin: Dayjs
): boolean {
    return (
        slotInicio.isBefore(turnoFin) && slotFin.isAfter(turnoInicio)
    ) || (
        slotInicio.isSame(turnoInicio) && slotFin.isSame(turnoFin)
    );
};