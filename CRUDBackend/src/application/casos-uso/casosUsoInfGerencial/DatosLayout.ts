import { TurnoRepository } from "../../interfaces/TurnoRepository.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";
import { DatosTurnos } from "./funcionesAuxiliares/DatosTurnos.js";
import { MetricaIngresos } from "./funcionesAuxiliares/MetricaIngresos.js";
import { EstadosClientes } from "./funcionesAuxiliares/EstadosClientes.js";

interface Datos {
    cantTurnosAten:number;
	cantTurnosCancel:number;
	ingNeto:number;
	ingBruto:number;
	promIngPorTurno:number;
	cantCliActivos:number;
	cantCliSancionados:number;
};

export class DatosLayout {
    constructor(
        private readonly repoTurno: TurnoRepository,
        private readonly repoCli: ClienteRepository
    ){};

    async ejecutar(fechaDesde:Date, fechaHasta:Date):Promise<{estado:number, mensaje: string, datos:Datos | null}>{
        const turnos = await this.repoTurno.buscarPorFecha(fechaDesde, fechaHasta);
        if(turnos.length === 0){
            return {
                estado: 200,
                mensaje:`No hay turnos entre el rango ${fechaDesde} y ${fechaHasta}.`,
                datos: null
            };
        };
        const clientes = await this.repoCli.obtenerClientes();
        if(clientes.length === 0){
            return {
                estado: 200,
                mensaje:`No se encontraron clientes registrados.`,
                datos: null
            };
        };

        const {cantTurnosAten, cantTurnosCancel} = DatosTurnos(turnos);

        const {ingNeto, ingBruto, promIngPorTurno} = MetricaIngresos(turnos);

        const {cantCliActivos, cantCliSancionados} = EstadosClientes(clientes);

        return {
            estado: 200,
            mensaje: `Datos encontrados.`,
            datos: {
                cantTurnosAten,
                cantTurnosCancel,
                ingNeto,
                ingBruto,
                promIngPorTurno,
                cantCliActivos,
                cantCliSancionados,
            },
        };
    };
};