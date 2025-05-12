import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { peluqueroRouter } from './peluquero/peluquero.routes.js';
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { clienteRouter } from './cliente/cliente.routes.js';
import { turnoRouter } from './turno/turno.routes.js';
import { localidadRouter } from './localidad/localidad.routes.js';
import { servicioRouter } from './Servicio/servicio.routes.js';
import { tipoServicioRouter } from './TipoServicio/TipoServicio.routes.js';
import { buscadorRouter } from './buscador/buscador.route.js';
import { loginRouter } from './auth/auth.routes.js';
import { AppError } from './shared/errors/AppError.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

// Rutas
app.use('/api/peluqueros', peluqueroRouter);
app.use('/api/clientes', clienteRouter);
app.use('/api/turnos', turnoRouter);
app.use('/api/servicios', servicioRouter);
app.use('/api/localidades', localidadRouter);
app.use('/api/tiposervicio', tipoServicioRouter);
app.use('/api/buscador', buscadorRouter);
app.use('/api/auth', loginRouter);

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

// Middleware de errores estándar
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
});

await syncSchema();

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/');
});
