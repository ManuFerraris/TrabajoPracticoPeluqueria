import PDFDocument from 'pdfkit';
import { Pago } from './pago.entity.js';

function formatearFechaLocal(fechaUTC: Date | string): string {
    const fecha = typeof fechaUTC === 'string' ? new Date(fechaUTC) : fechaUTC;
    return new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(fecha);
};

// Función para construir el PDF del recibo y poder usar en llamadas de stripe y efectivo.
export async function buildReciboPDF(pago: Pago): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Uint8Array[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });

        doc.on('error', reject);

        doc.fontSize(20).text('Comprobante de Pago', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.text(`ID de Pago: ${pago.id}`);
        doc.text(`Cliente: ${pago.turno.cliente.NomyApe}`);
        doc.text(`Fecha de pago: ${formatearFechaLocal(pago.fecha_hora)}`);
        doc.text(`Método: ${pago.metodo}`);
        doc.text(`Estado: ${pago.estado}`);
        doc.moveDown();

        doc.text(`Peluquero: ${pago.turno.peluquero.nombre}`);
        doc.text(`Servicio: ${pago.turno.servicio.tipoServicio.nombre}`);
        doc.text(`Fecha del turno: ${pago.turno.fecha_hora}`);
        doc.text(`Código de turno: ${pago.turno.codigo_turno}`);
        doc.text(`Monto total: $${pago.monto}`);
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(10).text('Este comprobante no es una factura legal. Es una constancia de pago generada por el sistema.', {
            align: 'center',
            width: 500
        });
        doc.fontSize(10).text("Colman's hairstyle, the sound of your hair ;)", {
            align: 'center',
            width: 500
        });

        doc.end();
    });
};