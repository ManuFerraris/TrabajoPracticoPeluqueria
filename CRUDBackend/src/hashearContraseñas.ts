import 'reflect-metadata'; // Necesario para TypeORM y MikroORM
import bcrypt from 'bcrypt'; // Algoritmo que se usa para ahashar la contraseña.
import { orm } from './shared/db/orm.js'; // Conecta con la base de datos
import { Cliente } from './cliente/clientes.entity'; // Nuestra entidad cliente
import { Peluquero } from './peluquero/peluqueros.entity';

async function hashearContraseñas() {
    const em = orm.em.fork(); //Crea un nuevo EntityManager que conecta a la BD y evita conflictos con otras operaciones.

    const clientes = await em.find(Cliente, {});
    //console.log(`Se encontraron ${clientes.length} clientes.`);
    let cambiosRealizados = 0; // Contador para saber si hubo cambios

    for (const cliente of clientes) {
        if (!cliente.password.startsWith('$2b$')) { // Si no está hasheada
            cliente.password = await bcrypt.hash(cliente.password, 10);
            //console.log(`Hasheando: ${cliente.email}`);
            cambiosRealizados++;
        }
    }

    if (cambiosRealizados > 0) {
        await em.flush(); // guarda todos los cambios
        //console.log('Contraseñas hasheadas exitosamente.');
    } else {
        //console.log('No se encontraron contraseñas para hashear.');
    }

}

hashearContraseñas();

//********** Hashear contraseñas de peluqueros ***********//
async function hashearContraseñasPeluquero() {
    const em = orm.em.fork(); //Crea un nuevo EntityManager que conecta a la BD y evita conflictos con otras operaciones.

    const peluqueros = await em.find(Peluquero, {});
    //console.log(`Se encontraron ${peluqueros.length} peluqueros.`);
    let cambiosRealizados = 0; // Contador para saber si hubo cambios

    for (const peluquero of peluqueros) {
        if (!peluquero.password.startsWith('$2b$')) { // Si no está hasheada
            peluquero.password = await bcrypt.hash(peluquero.password, 10);
            //console.log(`Hasheando: ${peluquero.email}`);
            cambiosRealizados++;
        }
    }

    if (cambiosRealizados > 0) {
        await em.flush(); // guarda todos los cambios
        //console.log('Contraseñas hasheadas exitosamente.');
    } else {
        console.log('No se encontraron contraseñas para hashear.');
    }

}

hashearContraseñasPeluquero();

(async () => {
    await hashearContraseñas();
    await hashearContraseñasPeluquero();
    await orm.close(true); // Cerrar al final, solo una vez
    })();