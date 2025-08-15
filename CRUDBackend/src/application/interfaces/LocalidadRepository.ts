import { Localidad } from "../../localidad/localidad.entity.js";

export interface LocalidadRepository {
    getAll():Promise<Localidad[]>;
    getOne(codigoLocalidad:number):Promise<Localidad | null>;
    guardar(localidad:Localidad):Promise<Localidad>;
    eliminarLocalidad(localidad:Localidad):Promise<void>;
    obtenerMisClientes(localidad:Localidad):Promise<Localidad>;
};