import express, { NextFunction, Request, Response } from 'express';
import { Peluquero } from './peluquero.js';

const app = express() //app va a ser del tipo express
app.use(express.json())//Para que express.json funcione para todos 


//API Rest, la usamos para comunicar el frontend con el backend
//Usa los siguientes metodos para:
// get:obtener info de recursos | post: crear nuevos recursos | delete: borrar recursos
// put & patch para mdificar recursos

const peluqueros: Peluquero[] = []; //Inicializando como un arreglo vacio

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
    res.json({data:peluqueros}); //Enviamos la lista de peluqueros como respuesta
})

app.get('/api/peluqueros/:codigo', (req, res) => {
    const codigo = parseInt(req.params.codigo, 10); // Convertimos req.params.codigo a número
    const peluquero = peluqueros.find((peluquero)=> peluquero.codigo === codigo);
    if(!peluquero){
        return res.status(404).send({message: 'Peluquero not found' }) 
    };
    res.json({data: peluquero});
});

//Debemos incluir un middleware para que forme req.body y pasar toda la informacion hacia el app.post
app.post('/api/peluqueros',sanitizePeluqueroInput, (req, res) => {
    //info disponible dentro de la req.body
    const input = req.body.sanitizedInput;

    //Procedemos a crear nuestro nuevo peluquero con la nueva informacion.
    // elementos que recuperamos del body
    const peluquero = new Peluquero(
        input.nombre,
        parseInt(input.codigo, 10), 
        new Date(input.fechaingreso),
        input.tipo); 
        

    peluqueros.push(peluquero) //lo agregamos al contenido de nuestra coleccion
    return res.status(201).send({message: 'Peluquero Creado', data: peluquero}); //Este states indica que se creo' el recurso.
});

app.put('/api/peluqueros/:codigo',sanitizePeluqueroInput ,(req, res) => {
    const codigo = parseInt(req.params.codigo, 10);
    const peluqueroCodigox = peluqueros.findIndex(peluquero => peluquero.codigo === codigo)

    if(peluqueroCodigox === -1){ //no lo encontro
        return res.status(404).send({message: 'Peluquero not found' })
    }
    
    peluqueros[peluqueroCodigox] = {...peluqueros[peluqueroCodigox], ...req.body.sanitizedInput}
    return res.status(200).send({message:'peluquero updated successfully', data: peluqueros[peluqueroCodigox]})
});

app.patch('/api/peluqueros/:codigo',sanitizePeluqueroInput ,(req, res) => {
    const codigo = parseInt(req.params.codigo, 10);
    const peluqueroCodigox = peluqueros.findIndex(peluquero => peluquero.codigo === codigo)

    if(peluqueroCodigox === -1){ //no lo encontro
        return res.status(404).send({message: 'Peluquero not found' })
    }
    Object.assign(peluqueros[peluqueroCodigox], req.body.sanitizedInput)
    peluqueros[peluqueroCodigox] = {...peluqueros[peluqueroCodigox], ...req.body.sanitizedInput}
    return res.status(200).send({message:'peluquero updated successfully', data: peluqueros[peluqueroCodigox]})
});

app.delete('/api/peluqueros/:codigo', (req, res) => {
    const codigo = parseInt(req.params.codigo, 10);
    const peluqueroCodigox = peluqueros.findIndex(peluquero => peluquero.codigo === codigo)

    if(peluqueroCodigox===-1){
        res.status(404).send({message: 'Peluquero not found' })
    } else{
    peluqueros.splice(peluqueroCodigox,1)
    res.status(200).send({message: 'peluquero deleted succesffully'})
    }
});

//Le vamos a decir que conteste a todo lo que venga a la raiz de nuestro sitio
app.use('/',(req, res) => {
    res.send('<h1>Hola!!</h1>');
});

//Para los errores de rutas incorrectas
app.use((_, res)=> {
    return res.status(404).send({message: 'Resource not found'})
})

app.listen(3000, ()=> {
    console.log('Server running on http://localhost:3000/');
});