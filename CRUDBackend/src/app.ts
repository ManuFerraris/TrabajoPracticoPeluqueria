import 'reflect-metadata'
import express, { Request, Response, NextFunction } from 'express';
import { peluqueroRouter } from './peluquero/peluquero.routes.js';
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { clienteRouter } from './cliente/cliente.routes.js';
import { turnoRouter } from './turno/turno.routes.js';
import { localidadRouter } from './localidad/localidad.routes.js';
import { servicioRouter } from './Servicio/servicio.routes.js';
import { tipoServicioRouter } from './TipoServicio/TipoServicio.routes.js';
import  cors  from 'cors'

const app = express() //app va a ser del tipo express
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json())//Para que express.json funcione para todos 

//luego de los middleware base
app.use((req, res, next) => {
    RequestContext.create(orm.em, next) //em nos permite manejar todas nuestras entidades
})
//Antes de las rutas y middlewares de negocio



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


///***RESPUESTAS PARA TODAS LAS CRUDS***///
///*************************************///

// Middleware para manejar errores 404
app.use((req,res)=>{
    res.status(404).send({message:"Recurso no encontrado"})
})


// Middleware para manejar errores internos del servidor
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor', details: err.message });
});

//Le vamos a decir que conteste a todo lo que venga a la raiz de nuestro sitio
app.use('/',(req, res) => {
    res.send('<h1>Hola!!</h1>');
});


await syncSchema() //Nos genera la base de datos con la estructura que nosotros le indicamos, NUNCA EN PRODUCCION
app.listen(3000, ()=> {
    console.log('Server running on http://localhost:3000/');
});