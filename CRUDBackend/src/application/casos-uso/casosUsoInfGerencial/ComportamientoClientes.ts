import { TurnoRepository } from "../../interfaces/TurnoRepository.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";
import { CantidadClientes } from "./funcionesAuxiliares/CantidadClientes.js";
import { CantClientesCancel } from "./funcionesAuxiliares/CantClientesCancel.js";

interface Datos {
	cantTotalClientes: number,
	cantClientesNuevos: number,
	clientesCancelaciones: {
		nombre:string,
		cantCancel:number
	};
};

export class ComportamientoClientes{
    constructor(
        private readonly repoCli: ClienteRepository,
        private readonly repoTur: TurnoRepository
    ) {};

    async ejecutar (fechaDesde:Date, fechaHasta:Date):Promise<{estado:number, mensaje:string, datos:Datos | null}>{
        
        const turnos = await this.repoTur.buscarPorFecha(fechaDesde, fechaHasta);
        if(turnos.length === 0){
            return {
                estado: 404,
                mensaje: `No se encontraron turnos entre las fechas ${fechaDesde} y ${fechaHasta}.`,
                datos: null,
            };
        };

        const clientes = await this.repoCli.obtenerClientes();
        if(clientes.length === 0){
            return {
                estado:200,
                mensaje: 'No se encontraron clientes.',
                datos:null
            };
        };

        const { cantTotalClientes, cantClientesNuevos } = CantidadClientes(clientes, fechaDesde, fechaHasta);
        const clientesCancelaciones = CantClientesCancel(clientes, turnos);
        return{
            estado:200,
            mensaje:'Datos obtenidos con exito.',
            datos: {
                cantTotalClientes,
                cantClientesNuevos,
                clientesCancelaciones
                }
        };
    };
};