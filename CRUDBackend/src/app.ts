import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import  cors  from 'cors'
import { AppError } from './shared/errors/AppError.js';
import { orm } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import dotenv from "dotenv";

// Routers
import { peluqueroRouter } from './peluquero/peluquero.routes.js';
import { clienteRouter } from './cliente/cliente.routes.js';
import { turnoRouter } from './turno/turno.routes.js';
import { localidadRouter } from './localidad/localidad.routes.js';
import { servicioRouter } from './Servicio/servicio.routes.js';
import { tipoServicioRouter } from './TipoServicio/TipoServicio.routes.js';
import { buscadorRouter } from './buscador/buscador.route.js';
import { historialClienteRouter } from './historialCliente/historialCliente.routes.js';
import { historialPeluqueroRouter } from './historialPeluquero/historialPeluquero.routes.js';
import { loginRouter } from './auth/auth.routes.js';

const app = express();
app.locals.orm = orm; // Guardo la instancia global en el contexto de Express
                      //para que cada Controller pueda acceder de manera local.

// CORS
dotenv.config();
const FRONT_ROUTE = process.env.FRONTEND_ORIGIN as string;

//app.options('*', cors());
app.use(cors({origin: FRONT_ROUTE, credentials: true })); // Habilita CORS para todas las rutas

app.use(express.json()) //Para que express.json funcione para todos 

// Contexto por Request
app.use((req, res, next) => {
    RequestContext.create(orm.em, next) //em nos permite manejar todas nuestras entidades
})

///***PELUQUERO***///
///***************///
app.use('/api/peluqueros', peluqueroRouter) //Decimos que use peluqueroRouter para que use todas las peticiones que llegan a esta ruta (definidas en la aplicacion).


///***CLIENTE***///
///*************///
app.use('/api/clientes', clienteRouter)


///***TURNO***///
///***********///
app.use('/api/turnos', turnoRouter)

///***SERVICIO***///
///***********///
app.use('/api/servicios', servicioRouter)


///***LOCALIDAD***///
///**************///
app.use('/api/localidades', localidadRouter)


///***TIPO SERVICIO***///
///*******************///
app.use('/api/tiposervicio', tipoServicioRouter);

///***BUSCADOR POR CODIGO DE PELUQUERO***///
///**************************************///
app.use('/api/buscador', buscadorRouter);

///***HISTORIAL CLIENTES***///
///*******************///
app.use('/api/turnos/historial-cliente', historialClienteRouter);

///***HISTORIAL PELUQUEROS***///
///*******************///
app.use('/api/turnos/historial-peluquero', historialPeluqueroRouter);

///***RUTA PARA EL LOGIN***///
///**************************************///
app.use('/api/auth', loginRouter);

app.use(express.json({
  strict:true,
  verify:(req, res, buf) => {
    try{
      JSON.parse(buf.toString());
    }catch(error:any){
      throw new AppError('JSON mal formado', 400);
    };
  }
}));

// Middleware 404 | Ver para sacar y dejar los errores estándares
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

// Middleware de errores estándar
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

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

export default app;