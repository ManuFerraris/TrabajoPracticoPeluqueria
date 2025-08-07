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
import { historialClienteRouter } from './historialCliente/historialCliente.routes.js';
import { historialPeluqueroRouter } from './historialPeluquero/historialPeluquero.routes.js';
import { loginRouter } from './auth/auth.routes.js';
import { AppError } from './shared/errors/AppError.js';
import  cors  from 'cors'

const app = express();
app.locals.orm = orm; // Guardo la instancia global en el contexto de Express
                      //para que cada Controller pueda acceder de manera local.
app.options('*', cors());
app.use(cors({
    origin: 'http://localhost:3001', // Puerto del frontend!
    credentials: true
})); // Habilita CORS para todas las rutas

app.use(express.json())//Para que express.json funcione para todos 

// Middleware para crear un contexto por request
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
app.use('/api/turnos/historial/cliente', historialClienteRouter);

///***HISTORIAL PELUQUEROS***///
///*******************///
app.use('/api/turnos/historial/peluquero', historialPeluqueroRouter);

///***RUTA PARA EL LOGIN***///
///**************************************///
app.use('/api/auth', loginRouter);

///***RESPUESTAS PARA TODAS LAS CRUDS***///
///*************************************///

//Le vamos a decir que conteste a todo lo que venga a la raiz de nuestro sitio
/*app.use('/',(req, res) => {
    res.send('<h1>Hola!!</h1>');
});*/

// Middleware para manejar errores 404
app.use((req,res)=>{
    res.status(404).send({message:"Recurso no encontrado"})
})

// Middleware para manejar errores internos del servidor
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor', details: err.message });
});

// Rutas (verificar motivo de existencia).
app.use('/api/peluqueros', peluqueroRouter);
app.use('/api/clientes', clienteRouter);
app.use('/api/turnos', turnoRouter);
app.use('/api/servicios', servicioRouter);
app.use('/api/localidades', localidadRouter);
app.use('/api/tiposervicio', tipoServicioRouter);
app.use('/api/buscador', buscadorRouter);
app.use('/api/auth', loginRouter);

// Middleware 404 | Ver para sacar y dejar los errores estándares
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
