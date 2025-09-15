import app from "./app.js";
import redisClient from "./config/redisClient.js";
import { syncSchema } from "./shared/db/orm.js";
import { SeedAdmin } from "./seedAdmin.js";
import { PeluqueroRepositoryORM } from "./shared/db/PeluqueroRepositoryORM.js";
import { orm } from "./shared/db/orm.js";

async function bootstrap(){
    try{
        
        redisClient.on("error", err => console.error("Error en Redis: ", err));
        if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
            await redisClient.connect();
        };

        app.locals.redis = redisClient;

        await syncSchema(); // Sincroniza el esquema de la base de datos

        app.locals.peluqueroRepo = new PeluqueroRepositoryORM(orm.em.fork());
        const seedAdmin = new SeedAdmin(app.locals.peluqueroRepo);
        await seedAdmin.ejecutar(); // Ejecuta la siembra del admin.

        app.listen(3000, () => {
            console.log('Server running on http://localhost:3000/');
        });

    }catch(error){
        console.error("Error al iniciar la app:", error);
        process.exit(1);
    };
};

bootstrap();