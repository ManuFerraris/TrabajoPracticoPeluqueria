// Definimos las rutas en este archivo para mantener mas claridad en el codigo
// y evitar errores de escritura. Ademas facilita refactor y cambios de prefijos,
// mejora el aotocompletado en IDEs y permite documentar rutas con comentarios.

export const RUTAS = {
    HISTORIAL_CLIENTE: (codigo_cliente:number) => `/turnos/historial-cliente/${codigo_cliente}`,
    HISTORIAL_PELUQUERO: (codigo_peluquero:number) => `/turnos/historial-peluquero/${codigo_peluquero}`,
    //Agreguen mas rutas aca
};