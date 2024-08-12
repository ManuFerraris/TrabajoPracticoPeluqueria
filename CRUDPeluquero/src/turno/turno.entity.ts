export class Turno {
    constructor (
        public codigo: number,
        public codigo_peluquero: number, //FK de PELUQUERO
        public codigo_cliente: number, //FK de CLIENTE
        public fecha_hora: string,
        public tipo_turno: string,
        public porcentaje: number,
        public estado: string
    ) {}
}