export class Servicio{
    constructor(
        public codigo: number,
        public codigo_turno:number, //FK del turno
        public monto:number,
        public estado: string,
        public adicional_adom: number,
        public ausencia_cliente: string,
        public medio_pago: string
    ){}
}