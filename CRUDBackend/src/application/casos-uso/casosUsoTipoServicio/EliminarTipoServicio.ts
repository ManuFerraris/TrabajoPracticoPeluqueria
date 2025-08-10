import { TipoServicioRepository } from "../../interfaces/TipoServicioRepository.js";

export class EliminarTipoServicio{
    constructor(private readonly repo:TipoServicioRepository){};

    async ejecutar(codVal:number):Promise<string[]>{
        const errores:string[] = [];

        const tipoServicio = await this.repo.obtenerTipoServicio(codVal);
        if(!tipoServicio){
            errores.push(`No se encontro ningun Tipo de Servicio con el codigo ${codVal}`);
            return errores;
        };
        if(tipoServicio.servicio.length > 0){
            errores.push(`El servicio con codigo ${codVal} tiene servicios asociados.`);
            return errores;
        };

        await this.repo.eliminarTipoServicio(tipoServicio);

        return errores;
    };
};