import { TipoServicio } from "../../../TipoServicio/tiposervicio.entity.js";
import { TipoServicioRepository } from "../../interfaces/TipoServicioRepository.js";
import { TipoServicioDTO, validarTipoServicioDTO } from "../../dtos/RegistrarTipoServicioDTO.js";
import { EntityManager } from "@mikro-orm/core";

export class RegistrarTipoServicio {
    constructor(private readonly repo:TipoServicioRepository){};

    async ejecutar(dto:TipoServicioDTO, em:EntityManager):Promise<TipoServicio | string[]>{
        const { errores } = await validarTipoServicioDTO(dto, em);
        if(errores.length > 0) return errores;

        const tipoServicio = new TipoServicio();
        tipoServicio.descripcion = dto.descripcion;
        tipoServicio.nombre = dto.nombre;
        tipoServicio.duracion_estimada = dto.duracion_estimada;
        tipoServicio.precio_base = dto.precio_base;
        await this.repo.guardar(tipoServicio);

        return tipoServicio;
    };
};