import express, { NextFunction, Request, Response } from 'express';

import { Producto } from './producto/productos.js';
import { Cliente } from './cliente/clientes.entity.js';

import { peluqueroRouter } from './peluquero/peluquero.routes.js';
import { clienteRouter } from './cliente/cliente.routes.js';

const app = express() //app va a ser del tipo express
app.use(express.json())//Para que express.json funcione para todos 

///***PELUQUERO***///
///***************///

app.use('/api/peluqueros', peluqueroRouter) 
//Decimos que use peluqueroRouter para que use todas las peticiones
//que llegan a esta ruta (definidas en la aplicacion).
app.use('/api/peluqueros/:codigo', peluqueroRouter)

///***PRODUCTO***///
///**************///

//Producto de prueba para ver si es devuelto
const productos: Producto[] = [
    new Producto(
        '55',
        'Aceite de Coco',
        17
    ),
]

function sanitizeProductoInput(req:Request, res:Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        stock: req.body.stock
    }
    next()
}

//GET ALL DE PRODUCTOS
app.get('/api/productos', (req, res) => {
    res.json({data: productos})
})

//GET DE PRODUCTOS
app.get('/api/productos/:codigo', (req, res) => {
    const codigo = parseInt(req.params.codigo, 10); // Convertimos req.params.codigo a número
    const producto = productos.find((producto) => producto.codigo === req.params.codigo)
    if(!producto){
        return res.status(404).send({message:'Producto no encontrado'})
    }
    res.json({data: producto}) //Devuelve el producto encontrado
})

//POST DE PRODUCTOS
app.post('/api/productos', sanitizeProductoInput, (req, res)=> {
    const input = req.body.sanitizedInput
    const {codigo, nombre, stock} = req.body //Obtenemos los elementos que necesitamos de nuestro req.body
    const producto = new Producto(
        input.codigo,
        input.nombre,
        input.stock
    )
    productos.push(producto)
    return res.status(201).send({message:'Producto creado', data: producto})
})

//PUT DE PRODUCTOS
app.put('/api/productos/:codigo', sanitizeProductoInput, (req, res) => {
    const codigo = parseInt(req.params.codigo, 10);
    const productocodx = productos.findIndex((producto)=> producto.codigo === req.params.codigo)
    if(productocodx === -1){
        return res.status(404).send({message:'Producto no encontrado'})
    }

    productos[productocodx] = {...productos[productocodx], ...req.body.sanitizedInput}
    return res.status(200).send({message:"Actualizacion correcta", data:productos[productocodx]})
})

//DELETE DE PRODUCTOS
app.delete('/api/productos/:codigo', (req, res)=> {
    const codigo = parseInt(req.params.codigo, 10);
    const productocodx = productos.findIndex((producto)=> producto.codigo === req.params.codigo)
    if(productocodx === -1){
        return res.status(404).send({message:'Producto no encontrado'})
    }
    productos.splice(productocodx, 1)
    return res.status(200).send({message: 'Producto borrado exitosamente'})
})



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