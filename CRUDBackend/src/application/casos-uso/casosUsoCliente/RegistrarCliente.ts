import { Cliente } from "../../../cliente/clientes.entity.js";
import { Localidad } from "../../../localidad/localidad.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";
import { ClienteDTO, validarClienteDTO } from "../../dtos/RegistrarClienteDTO.js";
import { EntityManager } from "@mikro-orm/core";
import { hashearPassword } from "../../hashearPassword.js";

export class RegistrarCliente{
    constructor(private readonly repo:ClienteRepository){};

    async ejecutar(dto:ClienteDTO, em:EntityManager):Promise<Cliente | string[]>{
        const {errores, localidad: localidadExistente} = await validarClienteDTO(dto, em);
        if(errores.length > 0 || localidadExistente === undefined){
            return errores;
        };

        const hoy = new Date();
        const fechaIngreso = hoy.toISOString().slice(0, 10); // YYYY-MM-DD como en la entidad peluquero.

        const cliente = new Cliente();
        cliente.NomyApe = dto.NomyApe;
        cliente.direccion = dto.direccion;
        cliente.dni = dto.dni;
        cliente.email = dto.email;
        cliente.localidad = localidadExistente;
        cliente.telefono = dto.telefono;
        cliente.estado = "Activo";
        cliente.fecha_Ingreso = fechaIngreso;
        cliente.password = await hashearPassword(dto.password);
        cliente.rol = "cliente";

        await this.repo.guardar(cliente);

        return cliente;
    };
};