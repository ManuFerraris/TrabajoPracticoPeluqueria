import { EntityManager } from "@mikro-orm/core";
import { Peluquero } from "../../peluquero/peluqueros.entity.js";

export interface RegistrarPeluqueroDTO {
    nombre:string;
    fecha_Ingreso:Date;
    tipo: "Sucursal" | "Domicilio";
    email: string;
    password:string;
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

    let fechaValida = false;
    if (dto.fecha_Ingreso) {
        const fecha = new Date(dto.fecha_Ingreso);
        if (!isNaN(fecha.getTime())) {
            fechaValida = true;
        };
    };
    if (!actualizacion && !fechaValida) {
    errores.push("Fecha de ingreso inválida.");
    };

    if(!actualizacion && !dto.email ){
        errores.push("El email es obligatorio.");
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

    if(!actualizacion && (!dto.tipo || (dto.tipo !== "Domicilio" && dto.tipo !== "Sucursal"))){
        errores.push('Tipo inválido, debe ser "Domicilio" o "Sucursal".');
    };

    if(!actualizacion && !dto.password){
        errores.push("La contraseña es obligatoria.");
    };

    if(!actualizacion && (!dto.rol || (dto.rol !== "peluquero" && dto.rol !== "admin"))){
        errores.push("El rol debe ser 'peluquero' o 'admin'.");
    };

    return errores;
};