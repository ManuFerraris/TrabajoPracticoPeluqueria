export class Cliente {
    constructor(
        public codigo: number,
        public dni: number,
        public nombre: string,
        public apellido: string,
        public direccion: string,
        public mail: string,
        public telefono: string
    ) {}
}