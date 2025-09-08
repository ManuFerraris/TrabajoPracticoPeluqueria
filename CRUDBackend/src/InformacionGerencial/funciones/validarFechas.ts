export function validarFechas(fechaDesde: string, fechaHasta: string): { valido: boolean; mensaje?: string } {
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);

    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
        return { valido: false, mensaje: "Las fechas no tienen formato válido." };
    };

    if (desde > hasta) {
        return { valido: false, mensaje: "La fecha 'desde' no puede ser posterior a la fecha 'hasta'." };
    };

    return { valido: true };
};