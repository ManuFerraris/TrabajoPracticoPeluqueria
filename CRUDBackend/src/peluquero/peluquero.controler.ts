import { Request, Response, NextFunction } from "express"
import { orm } from "../shared/db/orm.js"
import { Peluquero } from "./peluqueros.entity.js"
import { Turno } from "../turno/turno.entity.js"
import bcrypt from "bcryptjs"

const em = orm.em

const SALT_ROUNDS = 12;

function sanitizePeluqueroInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo_peluquero: req.body.codigo_peluquero,
        nombre:req.body.nombre,
        fecha_Ingreso:req.body.fecha_Ingreso,
        tipo: req.body.tipo,
        rol: req.body.rol,
        email: req.body.email,
        password: req.body.password,
        }
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}

async function findAll(req: Request, res:Response){  //FUNCIONAL
    try{
            const peluquero = await em.findOne(Peluquero, {
                codigo_peluquero: req.user.codigo
            });
            
            if (!peluquero) {
                return res.status(404).json({ message: "Peluquero no encontrado" });
            }
            
            return res.json(peluquero);
        }catch(error:any){
            console.error("Error al obtener peluquero:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
};

async function getOne(req:Request, res:Response){  //FUNCIONAL
    try{
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero)
        if (isNaN(codigo_peluquero)) {
            return res.status(400).json({ message: 'Código de peluquero inválido' });
        }
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });

        if (peluquero) {
            return res.status(200).json({ message: 'Peluquero encontrado', data: peluquero });
        } else {
            return res.status(404).json({ message: 'Peluquero no encontrado' });
        }
    }catch(error:any){
        return res.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
};

async function add(req: Request, res:Response){ //FUNCIONAL
    try {
        const { nombre, fecha_Ingreso, tipo, email, password } = req.body;
        // Validación de campos
        if (!nombre || !fecha_Ingreso || !tipo || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        if (isNaN(Date.parse(fecha_Ingreso))) {
            return res.status(400).json({ message: 'Fecha de ingreso inválida' });
        };

        // Verificar si el peluquero ya existe
        const peluqueroExistente = await em.findOne(Peluquero, { email });
        if (peluqueroExistente) {
            return res.status(400).json({ message: 'El peluquero ya existe' });
        };

        if(tipo !== "Domicilio" && tipo !== "Sucursal"){
            return res.status(400).json({ message: 'Tipo inválido, debe ser "Domicilio" o "Sucursal"' });
        };

        //HASHEO DE CONTRASEÑA//
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
                
        const rol_pel = "peluquero"
        
        const peluquero = new Peluquero()
        peluquero.nombre = nombre,
        peluquero.fecha_Ingreso = new Date(fecha_Ingreso),
        peluquero.tipo = tipo,
        peluquero.rol = rol_pel,
        peluquero.email = email,
        peluquero.password = hashedPassword,

        em.persist(peluquero);
        await em.flush();
        return res.status(201).json({ 
            message: 'Peluquero creado', 
            data: {
                ...peluquero,
                password: undefined // No devolvemos el hash en la respuesta!!!!!!!
            }
        });
    }catch(error: any) {
        return res.status(500).json({ message: error.message });
    }
};

async function update(req: Request, res: Response){ //FUNCIONAL
    try{
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero);

        if(isNaN(codigo_peluquero)){
            return res.status(400).json({ message: 'Código de peluquero inválido' });
        };

        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });

        if(!peluquero){
            return res.status(404).json({ message: 'Peluquero no encontrado' });
        };

        const { nombre, fecha_Ingreso, tipo, email, password, rol } = req.body.sanitizedInput;

        if (fecha_Ingreso && isNaN(Date.parse(fecha_Ingreso))) {
            return res.status(400).json({ message: 'Fecha de ingreso inválida' });
        };

        if (email && email !== peluquero.email) {
            const peluqueroExistente = await em.findOne(Peluquero, { email });
            if (peluqueroExistente) {
                return res.status(400).json({ message: 'Ya existe un peluquero con ese email' });
            }
        };

        if(tipo && tipo !== "Domicilio" && tipo !== "Sucursal"){
            return res.status(400).json({ message: 'Tipo inválido, debe ser "Domicilio" o "Sucursal"' });
        };

        if(rol && rol!=="peluquero" && rol!=="admin"){
            return res.status(400).json({ message: 'Rol inválido, debe ser "peluquero" o "admin"' });
        };

        // Re-hashear contraseña si fue enviada
        let hashedPassword = peluquero.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        };

        em.assign(peluquero, {
            ...(nombre && { nombre }),
            ...(fecha_Ingreso && { fecha_Ingreso: new Date(fecha_Ingreso) }),
            ...(tipo && { tipo }),
            ...(email && { email }),
            password: hashedPassword
        });

        await em.flush();

        return res.status(200).json({
            message: 'Peluquero actualizado',
            data: {
                ...peluquero,
                password: undefined // NUNCA DEVOLVER EL HASH!!!!
            }
        });

    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
};

async function remove(req: Request, res: Response){
    try{
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero)
        if(isNaN(codigo_peluquero)){
            return res.status(400).json({ message: 'Código de peluquero inválido' });
        }
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });
        if(!peluquero){
            return res.status(404).json({ message: 'Peluquero no encontrado' })
        } 
        const turnos = await em.find(Turno, { peluquero });
        if (turnos.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar el peluquero porque tiene turnos asignados' });
        }
        await em.removeAndFlush(peluquero)
        return res.status(200).json({message: 'Peluquero borrado Exitosamente'})
    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
};

export {findAll, getOne, add, update, remove, sanitizePeluqueroInput}