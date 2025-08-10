import { Cliente } from "../../../cliente/clientes.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";
import { EntityManager } from "@mikro-orm/core";
import { ClienteDTO, validarClienteDTO } from "../../dtos/RegistrarClienteDTO.js";
import { hashearPassword } from "../../hashearPassword.js";

export class ActualizarCliente {
    constructor(private readonly repo: ClienteRepository){};

    async ejecutar(dto: ClienteDTO, codVal:number, em:EntityManager, actualizar:boolean = true):Promise<{ errores: string[], clienteActualizado?: Cliente}> {
        
        const clienteAActualizar = await this.repo.getOne(codVal);
        if(!clienteAActualizar){
            return {errores: [`Cliente a actualizar con codigo ${codVal} no encontrado.`]}
        };

        const {errores, localidad: localidadExistente} = await validarClienteDTO(dto, em, actualizar, codVal);
        if(errores.length > 0 ){
            return {errores};
        };
        
        if(dto.NomyApe){ clienteAActualizar.NomyApe = dto.NomyApe };
        if(dto.dni){ clienteAActualizar.dni = dto.dni };
        if(dto.direccion){ clienteAActualizar.direccion = dto.direccion };
        if(dto.email){ clienteAActualizar.email = dto.email };
        if(dto.password){
            clienteAActualizar.password = await hashearPassword(dto.password);
        };
        if(dto.telefono){ clienteAActualizar.telefono = dto.telefono };
        if(dto.codigo_localidad && localidadExistente){ clienteAActualizar.localidad = localidadExistente };
        if(dto.estado){ clienteAActualizar.estado = dto.estado }
        await this.repo.guardar(clienteAActualizar);
        return { errores, clienteActualizado: clienteAActualizar };
    };
};