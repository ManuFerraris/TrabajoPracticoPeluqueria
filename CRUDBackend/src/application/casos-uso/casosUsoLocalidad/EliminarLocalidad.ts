import { Localidad } from "../../../localidad/localidad.entity.js";
import { LocalidadRepository } from "../../interfaces/LocalidadRepository.js";

export class EliminarLocalidad {
    constructor( private readonly repo:LocalidadRepository ){};

    async ejecutar(codigo: number):Promise<string[]>{
        const errores:string[] = [];

        const localidadAEliminar = await this.repo.getOne(codigo);
        if(!localidadAEliminar){
            errores.push('No se encontro la localidad a eliminar.');
            return errores;
        };

        await this.repo.eliminarLocalidad(localidadAEliminar);
        return errores;
    };
};