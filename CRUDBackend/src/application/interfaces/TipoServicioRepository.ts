import { TipoServicio } from "../../TipoServicio/tiposervicio.entity.js";

export interface TipoServicioRepository {
    listarTiposServicios():Promise<TipoServicio[]>;
    obtenerTipoServicio(codVal:number):Promise<TipoServicio | null>;
    eliminarTipoServicio(tipoServicio:TipoServicio):Promise<void>;
    guardar(tipoServicioAActualizar:TipoServicio):Promise<TipoServicio | null>;
    buscarMisServicios(tipoServico: TipoServicio):Promise<TipoServicio>; 
};