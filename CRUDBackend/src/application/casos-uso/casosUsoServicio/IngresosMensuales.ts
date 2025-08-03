import { Servicio } from "../../../Servicio/servicio.entity.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";

export class IngresosMensuales {
    constructor(private readonly repo: ServicioRepository) {};

    async ejecutar(mes:string):Promise<number>{
        const [anioStr, mesStr ] = mes.split("-");
        const anioNum = Number(anioStr);
        const mesNum = Number(mesStr);
        const desde = new Date(anioNum, mesNum -1, 1);
        const hasta = new Date(anioNum, mesNum, 1);

        console.log("Desde y hasta: ", desde, hasta);
        const serviciosCobrados = await this.repo.obtenerMontoTotalMensual(desde, hasta);

        console.log(serviciosCobrados);
        
        const total = serviciosCobrados.reduce((sum:number, servicio:Servicio) => {
            return sum + (servicio.total ?? 0);
        }, 0);

        return total;
    }
}