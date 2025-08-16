import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";

export class CambiarEstado{
    constructor(private readonly repo:TurnoRepository){};

    async ejecutar(codTur:number, estado:string):Promise<Turno | string>{

        const turno = await this.repo.buscarTurno(codTur);
        if(!turno){
            return `No existe el turno con codigo ${codTur}`;
        };
        const ESTADOS_VALIDOS = ["Activo", "Cancelado", "Sancionado"];
        if (!ESTADOS_VALIDOS.includes(estado)) {
            return `El estado ingresado: "${estado}" es inválido. Debe ser ${ESTADOS_VALIDOS.join(', ')}.`;
        };

        turno.estado = estado;
        await this.repo.guardar(turno);
        return turno
    };
};