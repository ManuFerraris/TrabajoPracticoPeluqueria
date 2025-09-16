import cron from 'node-cron';
import { orm } from "../shared/db/orm.js";
import { Turno } from "../turno/turno.entity.js";

const em = orm.em

cron.schedule('0 * * * *', async () => { // Corre cada hora
    try {
        const ahora = new Date();
        const limite = new Date(ahora.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 24 horas desde ahora

        // Buscar turnos que están dentro de las próximas 24 horas y no están cancelados ni sancionados
        const turnosProximos = await em.find(Turno, {
            fecha_hora: { $lte: limite },
            estado: { $nin: ['Cancelado', 'Sancionado'] }
        });

        for (const turno of turnosProximos) {
            const horasRestantes = (new Date(turno.fecha_hora).getTime() - ahora.getTime()) / (60 * 60 * 1000);
            if (horasRestantes <= 24 && turno.estado !== 'Cancelado') {
                turno.estado = 'Sancionado';
                await em.persistAndFlush(turno);
                //console.log(`Turno ${turno.codigo_turno} sancionado por no cancelarse 24 horas antes.`);
            }
        }
    } catch (error) {
        console.error('Error al sancionar turnos:', error);
    }
});
