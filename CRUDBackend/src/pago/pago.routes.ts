import { Router } from 'express';
import {
  findAll,
  getOne,
  crearPago,
  update,
  remove,
  sanitizePagoInput
} from './pago.controller.js';


const router = Router();

// GET todos los pagos
router.get('/', findAll);

// GET un solo pago por ID
router.get('/:id', getOne);

// POST nuevo pago
router.post('/', crearPago);

// PUT actualizar pago
router.put('/:id', sanitizePagoInput, update);

// DELETE eliminar pago
router.delete('/:id', remove);

export { router as pagoRouter };
