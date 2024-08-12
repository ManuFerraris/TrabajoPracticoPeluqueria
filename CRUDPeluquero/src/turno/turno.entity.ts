export class Turno {
    constructor (
        public codigo: number,
        public codigo_pel: number, //FK de PELUQUERO
        public codigo_cli: number, //FK de CLIENTE
        public fecha_hora: Date,
        public tipo_turno: string,
        public porcentaje: number,
        public estado: string
    ) {}
}