import dotenv from "dotenv";
import { MikroORM } from "@mikro-orm/core"; //Para configurar y manejar la base de datos
import { SqlHighlighter } from "@mikro-orm/sql-highlighter"; //Hace que las consultas de SQL sean mas faciles de leer
import { MySqlDriver } from "@mikro-orm/mysql"; //Driver necesario para conectarse a la base de datos MySQL
import { Peluquero } from "../../peluquero/peluqueros.entity.js";
import { Cliente } from "../../cliente/clientes.entity.js";
import { Turno } from "../../turno/turno.entity.js";
import { Localidad } from "../../localidad/localidad.entity.js";
import { TipoServicio } from "../../TipoServicio/tiposervicio.entity.js";
import { historialCliente } from "../../historialCliente/historialCliente.entity.js";
import { historialPeluquero } from "../../historialPeluquero/historialPeluquero.entity.js";
import { Servicio } from "../../Servicio/servicio.entity.js";
import { RefreshToken } from "../../auth/refresh-token.entity.js";

dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL as string; //URL de la base de datos

export const orm = await MikroORM.init({
    entities: [Cliente, Turno, Peluquero, Localidad, TipoServicio, Servicio, RefreshToken, historialCliente, historialPeluquero], // Lista de entidades que se van a usar en la base de datos
    entitiesTs: ['src/**/*.entity.ts'],
    dbName: 'peluqueria',
    driver: MySqlDriver, // Usamos la propiedad 'driver' en lugar de 'type'
    clientUrl: DATABASE_URL, //URL de la base de datos
    highlighter: new SqlHighlighter(),
    debug: true,
    schemaGenerator:{ //Nunca se usa en produccion, SOLO en desarrollo
        disableForeignKeys: true,
        createForeignKeyConstraints: true,
        ignoreSchema: [],
    },
})

export const syncSchema = async () => { //Puede generar la base de datos o actualizarla
    const generator = orm.getSchemaGenerator()
    await generator.updateSchema()
}

export const em = orm.em.fork();