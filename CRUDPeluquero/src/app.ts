import 'reflect-metadata'
import express from 'express'
import { peluqueroRouter } from './peluquero/peluquero.routes.js';
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { clienteRouter } from './cliente/cliente.routes.js';
//import { productoRouter } from './producto/producto.routes.js';
import { turnoRouter } from './turno/turno.routes.js';
//import { costoRouter } from './costo/costo.routes.js';

const app = express() //app va a ser del tipo express
app.use(express.json())//Para que express.json funcione para todos 

//luego de los middleware base
app.use((req, res, next) => {
    RequestContext.create(orm.em, next) //em nos permite manejar todas nuestras entidades
})
//Antes de las rutas y middlewares de negocio

///***PELUQUERO***///
///***************///
app.use('/api/peluqueros', peluqueroRouter) //Decimos que use peluqueroRouter para que use todas las peticiones que llegan a esta ruta (definidas en la aplicacion).


///***PRODUCTO***///
///**************///
//app.use('/api/productos', productoRouter)


///***CLIENTE***///
///*************///
app.use('/api/clientes', clienteRouter)


///***TURNO***///
///***********///
app.use('/api/turnos', turnoRouter)


///***COSTO***///
///***********///
//app.use('/api/costos', costoRouter)


///***RESPUESTAS PARA TODAS LAS CRUDS***///
///*************************************///
app.use((req,res)=>{
    res.status(404).send({message:"Recurso no encontrado"})
})

//Le vamos a decir que conteste a todo lo que venga a la raiz de nuestro sitio
app.use('/',(req, res) => {
    res.send('<h1>Hola!!</h1>');
});


await syncSchema() //Nos genera la base de datos con la estructura que nosotros le indicamos, NUNCA EN PRODUCCION
app.listen(3000, ()=> {
    console.log('Server running on http://localhost:3000/');
});