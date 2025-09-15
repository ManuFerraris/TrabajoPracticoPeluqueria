import { Peluquero } from "./peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "./application/interfaces/PeluqueroRepository.js";
import { hashearPassword } from "./application/hashearPassword.js";

import dotenv from "dotenv";
dotenv.config();
const EMAIL = process.env.ADMIN_EMAIL as string;
const PASSWORD = process.env.ADMIN_PASSWORD as string;

if (!EMAIL || !PASSWORD) {
    throw new Error("ADMIN_EMAIL o ADMIN_PASSWORD no están definidos en el entorno");
};

export class SeedAdmin {
    constructor(private readonly peluqueroRepo: PeluqueroRepository) {};
    async ejecutar() {
        const existe = await this.peluqueroRepo.findByEmail(EMAIL);

        if (!existe) {
            const peluquero = new Peluquero();
            peluquero.nombre = "Manuel Ferraris";
            peluquero.fecha_Ingreso = new Date().toISOString().slice(0, 10);
            peluquero.tipo = "Sucursal";
            peluquero.rol = "admin";
            peluquero.email = EMAIL;
            peluquero.password = await hashearPassword(PASSWORD);

            await this.peluqueroRepo.guardar(peluquero);
            console.log("Admin creado!");
        } else {
            console.log("El admin ya existe!");
        };
    };
};