import { EntityManager } from "@mikro-orm/core";
import { Localidad } from "../../localidad/localidad.entity.js";

export interface LocalidadDTO {
    nombre: string;
    provincia: string;
    codigo_postal: string;
    pais: 'Argentina' | 'Uruguay';
    descripcion: string;
};

export async function validarLocalidadDTO(
    dto: LocalidadDTO,
    em: EntityManager,
    codigo?:number,
    actualizacion:boolean = false,
    ): Promise<string[]>{

    const errores:string[] = [];

    if((!dto.nombre || dto.nombre.length > 30) && !actualizacion){
        errores.push('Nombre no ingresado o supera los 30 caracteres.');
    };
    if((!dto.provincia || dto.provincia.length === 0) && !actualizacion){
        errores.push('La provincia es obligatoria.');
    };
    if((!dto.codigo_postal || dto.codigo_postal.length === 0) && !actualizacion){
        errores.push('El codigo postal es obligatorio');
    };
    if((!dto.descripcion || dto.descripcion.length > 50) && !actualizacion){
        errores.push('La descripcion es obligatoria y no debe pasar los 50 caracteres.');
    };
    if((!dto.pais || (dto.pais !== 'Argentina' && dto.pais !== 'Uruguay')) && !actualizacion){
        errores.push('El pais es obligatorio y solo son validos "Argentina" o "Uruguay".');
    };

    if(!actualizacion){
        const localidadExistente = await em.findOne(
        Localidad,
        {
            codigo_postal: dto.codigo_postal
        });
    
        if(localidadExistente){
            errores.push('La localidad con dicho codigo postal ya existe');
        };
    } else {
        const localidadExistente = await em.findOne(
            Localidad,
            {
                codigo_postal:dto.codigo_postal
            }
        );
        if(localidadExistente && localidadExistente.codigo !== codigo){
            errores.push('Ya existe otra localidad con ese código postal');
        };
    };

    return errores;
};