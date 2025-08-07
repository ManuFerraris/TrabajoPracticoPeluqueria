export function crearFechaNeutral(fecha: string): Date {
    return new Date(fecha + "T12:00:00");
}