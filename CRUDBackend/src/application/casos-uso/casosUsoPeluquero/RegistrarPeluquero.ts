import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";
import { RegistrarPeluqueroDTO, validarPeluqueroDTO } from "../../dtos/RegistrarPeluqueroDTO.js";
import { hashearPassword } from "../../hashearPassword.js";
import { EntityManager } from "@mikro-orm/core";

export class RegistrarPeluquero{
    constructor(private readonly repo:PeluqueroRepository){};

    async ejecutar(dto:RegistrarPeluqueroDTO, em:EntityManager):Promise<string[] | Peluquero>{
        const errores = await validarPeluqueroDTO(dto, em);
        if(errores.length > 0) return errores;
        
        if(!dto.password){
            return ['La contraseña es obligatoria al crear un peluquero.'];
        };

        const peluquero = new Peluquero();
        peluquero.nombre = dto.nombre;
        peluquero.fecha_Ingreso = dto.fecha_Ingreso;
        peluquero.tipo = dto.tipo;
        peluquero.rol = dto.rol || 'peluquero';
        peluquero.email = dto.email;
        peluquero.password = await hashearPassword(dto.password);

        await this.repo.guardar(peluquero);
        return peluquero;
    };
};