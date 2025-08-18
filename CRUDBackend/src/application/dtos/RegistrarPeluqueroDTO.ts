import { EntityManager } from "@mikro-orm/core";
import { Peluquero } from "../../peluquero/peluqueros.entity.js";

export interface RegistrarPeluqueroDTO {
    nombre:string;
    fecha_Ingreso:string;
    tipo: "Sucursal" | "Domicilio";
    email: string;
    password?:string;
    rol: "admin" | "peluquero";
};

export async function validarPeluqueroDTO(
    dto: RegistrarPeluqueroDTO,
    em: EntityManager,
    actualizacion:boolean = false,
    codigo_peluquero?:number):Promise<string[]>{
    const errores:string[] = [];

    if(!actualizacion && !dto.nombre ){
        errores.push("El nombre es obligatorio.");
    };
    if (actualizacion && dto.nombre !== undefined && dto.nombre.trim() === "") {
        errores.push("El nombre no puede estar vacío.");
    };

    let fechaValida = false;
    if (dto.fecha_Ingreso) {
        const fecha = new Date(dto.fecha_Ingreso);
        fechaValida = !isNaN(fecha.getTime());
    };
    if (!actualizacion && !fechaValida) {
    errores.push("Fecha de ingreso inválida.");
    };
    
    
    if(!actualizacion && !dto.email ){
        errores.push("El email es obligatorio.");
    };
    if (actualizacion && dto.email !== undefined && dto.email.trim() === "") {
        errores.push("El email no puede estar vacío.");
    };

    if (dto.email) {
        let peluqueroConEseEmail;

        if (actualizacion && codigo_peluquero) {
            peluqueroConEseEmail = await em.findOne(Peluquero, {
            email: dto.email,
            codigo_peluquero: { $ne: codigo_peluquero }
            });
        } else {
            peluqueroConEseEmail = await em.findOne(Peluquero, {email: dto.email});
        }

        if (peluqueroConEseEmail) {
            errores.push("El email ya está en uso por otro peluquero.");
        };
    };

    const peluqueroExistente = await em.findOne(Peluquero, { email: dto.email });
    if (!actualizacion && peluqueroExistente) {
        errores.push("El peluquero ya existe.");
    };


    const tiposValidos = ["Domicilio", "Sucursal"];
    if (!actualizacion && !tiposValidos.includes(dto.tipo)) {
        errores.push('Tipo inválido, debe ser "Domicilio" o "Sucursal".');
    };
    if (actualizacion && dto.tipo && !tiposValidos.includes(dto.tipo)) {
        errores.push('Tipo inválido en actualización, debe ser "Domicilio" o "Sucursal".');
    };

    if(!actualizacion && !dto.password){
        errores.push("La contraseña es obligatoria.");
    };
    if (actualizacion && dto.password !== undefined && dto.password.trim() === "") {
        errores.push("La contraseña no puede estar vacía.");
    };

    const rolesValidos = ["peluquero", "admin"];
    if (!actualizacion && !rolesValidos.includes(dto.rol)) {
        errores.push("El rol debe ser 'peluquero' o 'admin'.");
    };
    if (actualizacion && dto.rol && !rolesValidos.includes(dto.rol)) {
        errores.push("Rol inválido en actualización, debe ser 'peluquero' o 'admin'.");
    };

    return errores;
};