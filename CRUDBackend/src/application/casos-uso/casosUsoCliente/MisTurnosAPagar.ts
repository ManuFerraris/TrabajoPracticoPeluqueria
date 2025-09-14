import { Turno } from "../../../turno/turno.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";

export class MisTurnosAPagar{
    constructor(private readonly repo:ClienteRepository){};
    async ejecutar(codCli:number):Promise<Turno[] | string>{
        const cliente = await this.repo.getOne(codCli);
        if(!cliente){
            return `No se encontro el cliente con el codigo ${codCli}.`
        };
        const turnos = await this.repo.misTurnosActivos(cliente);
        const turnosSinPagoStripe = turnos.filter(turno => 
            (!turno.pago || turno.pago?.estado === "Pendiente") &&
            turno.servicio.medio_pago === 'Stripe');
        return turnosSinPagoStripe;
    };
};