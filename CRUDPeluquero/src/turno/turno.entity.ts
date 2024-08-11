export class Turno {
    constructor (
        public codigo: number,
        public fecha_hora: Date,
        public tipo_turno: string,
        public porcentaje: number,
        public estado: string
    ) {}
}