import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Cliente } from "./clientes.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";
import { Turno } from "../turno/turno.entity.js";

const em = orm.em //Especie de repositorio de todas las entidades que tenemos.

function sanitizeClienteInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo_cliente: req.body.codigo_cliente,
        dni:req.body.dni,
        NomyApe:req.body.NomyApe,
        email: req.body.email,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        codigo_localidad: req.body.codigo_localidad,
        password: req.body.password
    }
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}
//Funciones para validar:
//----------------------//
function validarTelefono(telefono:string) {
    const regex = /^\+?[0-9]{10,15}$/; // Solo números y opcionalmente el símbolo +

    if (telefono.length < 10 || telefono.length > 15) {
      return false; // Longitud inválida
    }

    if (!regex.test(telefono)) {
      return false; // Formato inválido
    }

    return true; // Teléfono válido
}

function validarDni(dni: string){
    if(dni.length >= 7 && dni.length <= 8){
        return true
    }else return false
};

function validarNomyApe(NomyApe: string): boolean {
    if(NomyApe.length <= 40){
        return true;
    }else return false;
}

function validarEmail(email:string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        return true;
    }else return false;
};

function validarDireccion(direccion: string): boolean {
    if(direccion.length <= 80){
        return true;
    }else return false;
}

function validarPassword(contra:string):boolean{
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    return regex.test(contra);
}

async function findAll(req:Request, res:Response){  //FUNCIONAL
    try{
        const cliente = await em.find(Cliente, {}, { populate: ['localidad'] })
        res.status(200).json({message: 'Todos los clientes encontrados', data: cliente})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function getOne(req: Request, res:Response ){  //FUNCIONAL
    try{
        const codigo_cliente = Number.parseInt(req.params.codigo_cliente)
        if (isNaN(codigo_cliente)) {// Verifica si el parámetro es un número válido
            return res.status(400).json({ message: 'Código de cliente inválido' });
        }
        // Buscar el cliente usando findOne en lugar de findOneOrFail
        const cliente = await em.findOne(Cliente, { codigo_cliente }, { populate: ['localidad'] });

        // Maneja el caso cuando el cliente no se encuentra
        if (cliente) {
            return res.status(200).json({ message: 'Cliente encontrado', data: cliente });
        } else {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
    }catch(error:any){
        res.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
};

async function add(req: Request, res: Response) {
    try {
        // Extraer datos del cuerpo de la solicitud
        const { codigo_localidad, dni, NomyApe, email, direccion, telefono, password } = req.body.sanitizedInput;
        // Agregar logs para verificar los datos recibidos
        console.log("Datos recibidos:", req.body.sanitizedInput);
        // Validar que todos los campos requeridos estén presentes
        if (!codigo_localidad || !dni || !NomyApe || !email || !direccion || !telefono || !password) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        // Buscar la localidad
        const localidad = await em.findOne(Localidad, { codigo: codigo_localidad });
        if (!localidad) {
            return res.status(400).json({ message: 'Localidad no encontrada' });
        }

        //VALIDACIONES//
        //**//
        if (!validarDni(dni)) {
            return res.status(400).json({ message: 'El DNI debe tener 7 u 8 caracteres'})
        }

        if (!validarNomyApe(NomyApe)) {
            return res.status(400).json({ message: 'El nombre y apellido no puede tener más de 40 caracteres.' });
        }

        if (!validarEmail(email)) {
            return res.status(400).json({ message: 'El formato del email es inválido.' });
        }

        if (!validarDireccion(direccion)) {
            return res.status(400).json({ message: 'La direccion no puede tener más de 80 caracteres.' });
        }

        if (!validarTelefono(telefono)) {
            return res.status(400).json({ message: 'El formato del número de teléfono es inválido.' });
        }

        if(!validarPassword(password)){
            return res.status(400).json({ message: 'El formato de la contraseña es invalido.' });
        }

        const estado_cli = "Activo"

        // Crear una nueva instancia de Cliente
        const cliente = new Cliente();
        cliente.localidad = localidad;
        cliente.dni = dni;
        cliente.NomyApe = NomyApe;
        cliente.email = email;
        cliente.direccion = direccion;
        cliente.telefono = telefono;
        cliente.estado = estado_cli;
        cliente.password = password;
        // Persistir el nuevo cliente en la base de datos
        await em.persistAndFlush(cliente);
        return res.status(201).json({ message: 'Cliente creado', data:cliente });
    } catch (error: any) {
        // Manejo de errores
        console.error("Error al crear el cliente:", error);
        return res.status(500).json({ message: error.message });
    }
}
async function update(req: Request, res: Response) {
    try {
        const codigo_cliente = Number.parseInt(req.params.codigo_cliente);
        if (isNaN(codigo_cliente)) {
            return res.status(400).json({ message: 'Código de cliente inválido' });
        }

        const clienteAActualizar = await em.findOne(Cliente, { codigo_cliente });
        if (!clienteAActualizar) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const datosSanitizados = req.body.sanitizedInput;
        if (!datosSanitizados || Object.keys(datosSanitizados).length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        }

        //VALIDACIONES//
        //**//
        const { codigo_localidad, dni, NomyApe, email, direccion, telefono, password } = datosSanitizados;

        if (!validarDni(dni)) {
            return res.status(400).json({ message: 'El DNI debe tener 7 u 8 caracteres' });
        }

        if (!validarNomyApe(NomyApe)) {
            return res.status(400).json({ message: 'El nombre y apellido no puede tener más de 40 caracteres.' });
        }

        if (!validarEmail(email)) {
            return res.status(400).json({ message: 'El formato del email es inválido.' });
        }

        if (!validarDireccion(direccion)) {
            return res.status(400).json({ message: 'La direccion no puede tener más de 80 caracteres.' });
        }

        if (!validarTelefono(telefono)) {
            return res.status(400).json({ message: 'El formato del número de teléfono es inválido.' });
        }

        if(!validarPassword(password)){
            return res.status(400).json({ message: 'El formato de la contraseña es invalido.' });
        }
//Validacion del codigo de localidad:
        if (codigo_localidad !== undefined && codigo_localidad !== null) {
            const localidad = await em.findOne(Localidad, { codigo: codigo_localidad });
            if (!localidad) {
                return res.status(404).json({ message: 'Localidad no encontrada' });
            }
            clienteAActualizar.localidad = localidad;
        }

        const estado_cli = "Activo";
        clienteAActualizar.estado = estado_cli;

        em.assign(clienteAActualizar, datosSanitizados);
        await em.flush();

        return res.status(200).json({ message: 'Cliente actualizado', data: clienteAActualizar });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

async function remove(req: Request, res: Response){ //FUNCIONAL
    try{
        const codigo_cliente = Number.parseInt(req.params.codigo_cliente)
        if(isNaN(codigo_cliente)){
            return res.status(400).json({ message: 'Código de cliente inválido' });
        }
        const cliente = await em.findOne(Cliente, { codigo_cliente });
        if(!cliente){
            return res.status(404).json({ message: 'Cliente no encontrado' })
        } 
        const turnos = await em.find(Turno, { cliente });
        if (turnos.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar el cliente porque tiene turnos asignados' });
        }else{
            await em.removeAndFlush(cliente)
            return res.status(200).json({message: 'Cliente borrado Exitosamente'})
        }
    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
};

export { sanitizeClienteInput, findAll, getOne, add, update, remove}

