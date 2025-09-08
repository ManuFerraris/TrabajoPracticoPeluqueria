import { TurnoRepository } from "../../interfaces/TurnoRepository.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";
import { TurnosEIngresosXPel } from "./funcionesAuxiliares/TurnosEIngresosXPel.js";
import { TurnosADomicilio } from "./funcionesAuxiliares/TurnosADomicilio.js";

interface ResumenXPeluquero{
    nomPel:string; 
    cantTurnos:number;
    ingNeto:number;
};

interface ResumenDistribucion {
    peluqueros: ResumenXPeluquero[];
    cantTurnosADom: number;
    porcTotal: number;
};

export class ResumenPorPeluquero{
    constructor(
        private readonly repoTurno:TurnoRepository,
        private readonly repoPel:PeluqueroRepository 
    ) {};

    async ejecutar(fechaDesde:Date, fechaHasta:Date):Promise<{estado:number, mensaje:string, datos:ResumenDistribucion | null}>{

        const turnos = await this.repoTurno.buscarPorFecha(fechaDesde, fechaHasta);
        if(turnos.length === 0){
            return {
                estado: 404,
                mensaje: `No se encontraron turnos entre las fechas ${fechaDesde} y ${fechaHasta}.`,
                datos: null,
            };
        };

        const turnosAtendidos = turnos.filter(t => t.estado === "Atendido");

        const peluqueros = await this.repoPel.getAllPeluqueros();
        if(peluqueros.length === 0){
            return {
                estado: 404,
                mensaje: `No se encontraron peluqueros registrados.`,
                datos: null,
            };
        };

        const peluqueroResumen = TurnosEIngresosXPel(turnosAtendidos);
        const domicilioResumen = TurnosADomicilio(turnosAtendidos);

        /*console.log({
            totalTurnos: turnos.length,
            totalAtendidos: turnosAtendidos.length,
            turnosADom: domicilioResumen.cantTurnosADom,
            porcTotal: domicilioResumen.porcTotal,
        });*/

        return {
            estado: 200,
            mensaje: `Resumen generado correctamente`,
            datos: {
                peluqueros: peluqueroResumen,
                cantTurnosADom: domicilioResumen.cantTurnosADom,
                porcTotal: domicilioResumen.porcTotal
            },
        };
    };
};