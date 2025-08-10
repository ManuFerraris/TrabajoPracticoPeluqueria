import { EntityManager } from "@mikro-orm/core";
import { Cliente } from "../../cliente/clientes.entity.js";
import { Localidad } from "../../localidad/localidad.entity.js";

export interface ClienteDTO {
    dni: string;
    NomyApe: string;
    direccion: string;
    email:string;
    telefono: string;
    codigo_localidad: number;
    password: string;
    estado: 'Activo' | 'Sancionado'
};

export async function validarClienteDTO(
    dto: ClienteDTO,
    em: EntityManager,
    actualizar:boolean = false,
    codigo_cliente?:number
    ):Promise<{errores: string[], localidad?: Localidad|undefined}>{
    
    const errores: string[] = [];


    if(!actualizar && (!dto.dni || (dto.dni.length < 7 || dto.dni.length > 8))){
        errores.push('El DNI es obligatorio y acepta 7 u 8 caracteres (sin puntos).');
    };

    if(!actualizar && (!dto.NomyApe || dto.NomyApe.length > 40) ){
        errores.push('El nombre y apellido no puede superar los 40 caracteres.');
    };

    if(!actualizar && !dto.email){
        errores.push('El email es obligatorio.');
    }else{
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if( !actualizar && !emailRegex.test(dto.email)){
            errores.push('Formato de email invalido.');
        };
    };
    
    if(!actualizar && (!dto.direccion || dto.direccion.length > 80)){
        errores.push('La direccion es obligatoria y no puede superar los 40 caracteres.');
    };

    if(!actualizar && dto.estado !== undefined && (dto.estado !== 'Activo' && dto.estado !== 'Sancionado')){
        errores.push('El estado debe ser "Activo" o "Sancionado".');
    };

    if (!actualizar || (actualizar && dto.password)) {
        if(!dto.password){
            errores.push('La contraseña es obligatoria');
        }else{
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
            const esPasswodValida = regex.test(dto.password);
            if(!esPasswodValida){
                errores.push('Formato de contraseña invalido. Debe tener al menos 8 caracteres, una minuscula, una mayuscula, un caracter especial, y un numero.');
            };
        };
    };
    
    if(dto.dni !== undefined){
        const clienteExistente = await em.findOne(Cliente, {dni: dto.dni});
        if(clienteExistente && clienteExistente.codigo_cliente !== codigo_cliente){ 
            errores.push(`Ya existe un cliente con el DNI: ${dto.dni}.`);
        };
    };
    
    if(dto.email !== undefined){
        const clienteEmialExistente = await em.findOne(Cliente, {email: dto.email});
        if(clienteEmialExistente && clienteEmialExistente.codigo_cliente !== codigo_cliente){
            errores.push(`Ya existe un cliente con el email: ${dto.email}.`);
        };
    };
    

    let localidadExistente: Localidad | null = null;
    if(dto.codigo_localidad !== undefined){
        localidadExistente = await em.findOne(Localidad, {codigo: dto.codigo_localidad});
        if(!localidadExistente){
            errores.push(`No existe la localidad con el codigo: ${dto.codigo_localidad}`);
        };
    };
    
    return {errores, localidad:localidadExistente ?? undefined};    
};