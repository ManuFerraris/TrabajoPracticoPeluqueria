import express from 'express';
import { peluqueroRouter } from './peluquero/peluquero.routes.js';
import { clienteRouter } from './cliente/cliente.routes.js';
import { productoRouter } from './producto/producto.routes.js';

const app = express() //app va a ser del tipo express
app.use(express.json())//Para que express.json funcione para todos 


///***PELUQUERO***///
///***************///
app.use('/api/peluqueros', peluqueroRouter) //Decimos que use peluqueroRouter para que use todas las peticiones que llegan a esta ruta (definidas en la aplicacion).
app.use('/api/peluqueros/:codigo', peluqueroRouter)


///***PRODUCTO***///
///**************///
app.use('/api/productos', productoRouter)
app.use('/api/productos/:codigo', productoRouter)


///***CLIENTE***///
///*************///
app.use('/api/clientes', clienteRouter)
app.use('/api/clientes/:codigo', clienteRouter)


///***RESPUESTAS PARA TODAS LAS CRUDS***///
///*************************************///
app.use((req,res)=>{
    res.status(404).send({message:"Recurso no encontrado"})
})

//Le vamos a decir que conteste a todo lo que venga a la raiz de nuestro sitio
app.use('/',(req, res) => {
    res.send('<h1>Hola!!</h1>');
});

app.listen(3000, ()=> {
    console.log('Server running on http://localhost:3000/');
});