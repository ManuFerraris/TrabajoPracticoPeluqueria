import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";
import { RegistrarPeluqueroDTO, validarPeluqueroDTO } from "../../dtos/RegistrarPeluqueroDTO.js";
import { EntityManager } from "@mikro-orm/core";
import { hashearPassword } from "../../hashearPassword.js";

export class ActualizarPeluquero{
    constructor(private readonly repo:PeluqueroRepository){};

    async ejecutar(codigo_peluquero:number, dto:RegistrarPeluqueroDTO, em:EntityManager, actualizacion:boolean):Promise<{ errores: string[], peluqueroActualizado?: Peluquero }>{
        
        const peluqueroAActualizar = await this.repo.buscarPeluquero(codigo_peluquero);
        if(!peluqueroAActualizar) return {errores: ['No se encontro el peluquero']};
        
        const errores = await validarPeluqueroDTO(dto, em, actualizacion, codigo_peluquero);
        if(errores.length>0) return {errores};

        console.log("Fecha recibida en [ActualizarPeluquero ejecutar]: ", dto.fecha_Ingreso)
        if (dto.nombre) {peluqueroAActualizar.nombre = dto.nombre;};
        if (dto.fecha_Ingreso) {
            console.log("Fecha asiganada en [peluqueroAActualizar.fecha_Ingreso]: ", dto.fecha_Ingreso)
            peluqueroAActualizar.fecha_Ingreso = dto.fecha_Ingreso};
        if (dto.tipo) {peluqueroAActualizar.tipo = dto.tipo;}
        if (dto.rol) {peluqueroAActualizar.rol = dto.rol;}
        if (dto.email) {peluqueroAActualizar.email = dto.email;}
        if (dto.password) {peluqueroAActualizar.password = await hashearPassword(dto.password);}

        console.log("Objeto final antes de guardar:", peluqueroAActualizar);

        await this.repo.guardar(peluqueroAActualizar);
        return { errores: [], peluqueroActualizado: peluqueroAActualizar };
    };
};