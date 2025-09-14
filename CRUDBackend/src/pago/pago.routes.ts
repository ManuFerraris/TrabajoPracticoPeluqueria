import { Router } from 'express';
import {
  findAll,
  getOne,
  update,
  remove,
  getStripeSession,
  crearPago,
  historialPagosCliente,
  generarReciboPDF
} from './pago.controller.js';

export const pagoRouter = Router();

pagoRouter.get('/reciboPDF/:id', generarReciboPDF);
pagoRouter.get('/historialPagosCliente/:codigo_cliente', historialPagosCliente);
pagoRouter.get('/stripe-session/:id', getStripeSession);
pagoRouter.get('/', findAll);
pagoRouter.get('/:id', getOne);
pagoRouter.post('/realizarPago/:codigo_turno/:metodo', crearPago);
pagoRouter.put('/:id', update);
pagoRouter.delete('/:id', remove);