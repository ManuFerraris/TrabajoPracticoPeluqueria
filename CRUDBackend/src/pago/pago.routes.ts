import { Router } from 'express';
import {
  findAll,
  getOne,
  crearPago,
  update,
  remove,
  sanitizePagoInput,
  getStripeSession
} from './pago.controller.js';


export const pagoRouter = Router();

pagoRouter.get('/stripe-session/:id', getStripeSession);
pagoRouter.get('/', findAll);
pagoRouter.get('/:id', getOne);
pagoRouter.post('/realizarPago/:codigo_turno/:metodo', crearPago);
pagoRouter.put('/:id', sanitizePagoInput, update);
pagoRouter.delete('/:id', remove);