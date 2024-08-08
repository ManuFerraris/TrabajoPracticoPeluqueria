import express, { NextFunction, Request, Response } from 'express';
import { Peluquero } from './peluquero/peluqueros.entity.js';
import { Producto } from './producto/productos.js';
import { Cliente } from './cliente/clientes.js';
import { PeluqueroRepository } from './peluquero/peluquero.repository.js';

const app = express() //app va a ser del tipo express
app.use(express.json())//Para que express.json funcione para todos 


//API Rest, la usamos para comunicar el frontend con el backend
//Usa los siguientes metodos para:
// get:obtener info de recursos | post: crear nuevos recursos | delete: borrar recursos
// put & patch para mdificar recursos



///***PELUQUERO***///
///***************///

const repository = new PeluqueroRepository()

//Peluquero de prueba para ver si es devuelto
const peluqueros: Peluquero[] = [
    new Peluquero(
    "Leon",
    88,
    new Date("2006-02-26T00:00:00Z"),
    ["Sucursal"]
    ),
]

//Creamos una funcion que actue como un meddleware
function sanitizePeluqueroInput(req: Request, res: Response, next:NextFunction){

    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        fechaingreso: req.body.fechaingreso,
        tipo: req.body.tipo,
    }
    //Mas validaciones para la seguridad e integridad de los datos
    //Para quitar el elemento que no queremos:
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}



app.get('/api/peluqueros', (req, res) => {
    res.json({data:repository.findAll() }); //Enviamos la lista de peluqueros como respuesta
})

app.get('/api/peluqueros/:codigo', (req, res) => {
    const codigo = parseInt(req.params.codigo, 10); // Convertimos req.params.codigo a número
    const peluquero = repository.getOne({codigo})
    if(!peluquero){
        return res.status(404).send({message: 'Peluquero no encontrado' }) 
    };
    res.json({data: peluquero});
});

//Debemos incluir un middleware para que forme req.body y pasar toda la informacion hacia el app.post
app.post('/api/peluqueros',sanitizePeluqueroInput, (req, res) => {
    //info disponible dentro de la req.body
    const input = req.body.sanitizedInput;

    //Procedemos a crear nuestro nuevo peluquero con la nueva informacion.
    // elementos que recuperamos del body
    const peluqueroInput = new Peluquero(
        input.nombre,
        parseInt(input.codigo, 10), 
        new Date(input.fechaingreso),
        input.tipo); 
        

    const peluquero = repository.add(peluqueroInput) //lo agregamos al contenido de nuestra coleccion
    return res.status(201).send({message: 'Peluquero Creado', data: peluquero}); //Este states indica que se creo' el recurso.
});

app.put('/api/peluqueros/:codigo',sanitizePeluqueroInput ,(req, res) => {
    const codigo = parseInt(req.params.codigo, 10); // Convertir el parámetro codigo a número
    const input = req.body.sanitizedInput
    input.codigo = codigo
    const peluquero = repository.update(input)

    if(!peluquero){ //no lo encontro
        return res.status(404).send({message: 'Peluquero no encontrado' })
    }
    return res.status(200).send({message:'Actualizacion exitosa', data: peluquero})
});

app.patch('/api/peluqueros/:codigo',sanitizePeluqueroInput ,(req, res) => {
    const codigo = parseInt(req.params.codigo, 10); // Convertir el parámetro codigo a número
    const input = req.body.sanitizedInput
    input.codigo = codigo
    const peluquero = repository.update(input)

    if(!peluquero){ //no lo encontro
        return res.status(404).send({message: 'Peluquero no encontrado' })
    }
    return res.status(200).send({message:'Actualizacion exitosa', data: peluquero})
});

app.delete('/api/peluqueros/:codigo', (req, res) => {
    const codigo = parseInt(req.params.codigo, 10);
    const peluquero = repository.delete({codigo})

    if(!peluquero){
        res.status(404).send({message: 'Peluquero no encontrado' })
    } else{
    res.status(200).send({message: 'Peluquero borrado exitosamente'})
    }
});


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
///**************///

//Cliente de prueba para ver si es devuelto
const clientes: Cliente[] = [
    new Cliente(
    45521084,
    "Jose",
    "Chavez",
    "17 y 41 nro 975",
    "ferrarismanu@gmail.com",
    "2473448855"
    ),
]

function sanitizeClienteInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        dni: req.body.dni,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        direccion: req.body.direccion,
        mail: req.body.mail,
        telefono: req.body.telefono,
    }
    //Mas validaciones para la seguridad e integridad de los datos
    //Para quitar el elemento que no queremos:
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}

//GET ALL DE CLIENTES
app.get('/api/clientes', (req, res) => {
    res.json({data: clientes});
});

//GET DE CLIENTE
app.get('/api/clientes/:dni', (req, res ) => {
    const dni = parseInt(req.params.dni, 10); // Convertir el parámetro dni a número
    const cliente = clientes.find(cliente => cliente.dni === dni);
    if(!cliente){
        return res.status(404).send({ message: 'Cliente no encontrado' }); // Agregué el return aca
    }
    res.json({data: cliente})
});

//POST DE CLIENTE
app.post('/api/clientes', sanitizeClienteInput, (req, res) => {
    const input = req.body.sanitizedInput;

    const cliente = new Cliente(
        parseInt(input.dni, 10),
        input.nombre,
        input.apellido,
        input.direccion,
        input.mail,
        input.telefono,
    )
    clientes.push(cliente)
    return res.status(201).send({message: 'Cliente Creado', data: cliente});
})

//PUT DE CLIENTE
app.put('/api/clientes/:dni', sanitizeClienteInput,(req, res) => {
    const dni = parseInt(req.params.dni, 10);
    const dniClienteIndex = clientes.findIndex(cliente => cliente.dni === dni);

    if (dniClienteIndex === -1) {
        return res.status(404).send({ message: 'Cliente no encontrado' });
    }

    // Actualizar los datos del cliente
    clientes[dniClienteIndex] = {...clientes[dniClienteIndex], ...req.body.sanitizedInput}
    // Enviar respuesta con el cliente actualizado
    res.status(200).send({ message: 'Cliente actualizado', data: clientes[dniClienteIndex] });
});

//PATCH DE CLIENTE
app.patch('/api/clientes/:dni',sanitizeClienteInput ,(req, res) => {
    const dni = parseInt(req.params.dni, 10);
    const dniClienteIndex = clientes.findIndex(cliente => cliente.dni === dni)

    if(dniClienteIndex === -1){ //no lo encontro
        return res.status(404).send({message: 'Cliente no encontrado' })
    }
    Object.assign(clientes[dniClienteIndex], req.body.sanitizedInput)
    clientes[dniClienteIndex] = {...clientes[dniClienteIndex], ...req.body.sanitizedInput}
    return res.status(200).send({message:'Cliente actualizado exitosamente', data: clientes[dniClienteIndex]})
});

//DELETE DE CLIENTE
app.delete('/api/clientes/:dni', (req, res) => {
    const dni = parseInt(req.params.dni, 10);
    const dniClienteIndex = clientes.findIndex(cliente => cliente.dni === dni)

    if(dniClienteIndex===-1){
        res.status(404).send({message: 'Cliente no encontrado' })
    } else{
    clientes.splice(dniClienteIndex,1)
    res.status(200).send({message: 'Cliente eliminado exitosamente'})
    }
});

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