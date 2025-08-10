import { EntityManager } from "@mikro-orm/core";
import { TipoServicio } from "../../TipoServicio/tiposervicio.entity.js";

export interface TipoServicioDTO{
    nombre:string;
    descripcion:string;
    duracion_estimada:number;
    precio_base:number;
};

export async function validarTipoServicioDTO(
    dto:TipoServicioDTO,
    em:EntityManager,
    codigo_tipo?:number,
    actualizar:boolean = false):Promise<{ errores:string[], tipoServicio?:TipoServicio | undefined }> {
    const errores: string[] = [];
    
    let tipoServicioAActualizar: TipoServicio | undefined = undefined;
    if(actualizar){
        const tipoServicio = await em.findOne(TipoServicio, {codigo_tipo});
        if(!tipoServicio){
            errores.push(`Tipo de servicio con codigo ${codigo_tipo} no encontrado.`);
            return {errores};
        };
        tipoServicioAActualizar = tipoServicio;
    };

    if(!actualizar && (!dto.nombre || dto.nombre.length > 30)){
        errores.push('El nombre es obligatorio y no debe superar los 30 caracteres.');
    };
    if (actualizar && dto.nombre !== undefined && dto.nombre.length > 30) {
        errores.push('El nombre no debe superar los 30 caracteres.');
    };

    if(!actualizar && (!dto.descripcion || dto.descripcion.length > 80)){
        errores.push('La descripcion es obligatoria y no debe superar los 80 caracteres.');
    };
    if (actualizar && dto.descripcion !== undefined && dto.descripcion.length > 80) {
        errores.push('La descripcion no debe superar los 80 caracteres.');
    };
    
    if(!actualizar && (!dto.duracion_estimada || dto.duracion_estimada <= 0)){
        errores.push('La duracion es obligatoria y debe ser un numero positivo.');
    };
    if (actualizar && dto.duracion_estimada !== undefined && dto.duracion_estimada <= 0 ) {
        errores.push('La duracion debe ser un numero positivo.');
    };
    
    if (!actualizar) {
        if (typeof dto.precio_base !== 'number') {
            errores.push('El precio base debe ser un número.');
        } else if (dto.precio_base < 0) {
            errores.push('El precio base debe ser mayor o igual a 0.');
        };
    };
    if (actualizar && dto.precio_base !== undefined && dto.precio_base < 0 ) {
        errores.push('El precio base debe ser un numero mayor o igual a 0.');
    };

    return {errores, tipoServicio:tipoServicioAActualizar ??  undefined};
};