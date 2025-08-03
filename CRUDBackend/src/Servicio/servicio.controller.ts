import { Request, Response, NextFunction } from "express";
import { MikroORM } from "@mikro-orm/mysql";
import { ServicioRepositoryORM } from "../shared/db/ServicioRepositoryORM.js";
import { BuscarServicio } from "../application/casos-uso/casosUsoServicio/buscarServicio.js";
import { EliminarServicio } from "../application/casos-uso/casosUsoServicio/eliminarServicio.js";
import { validarParametrosFiltrado } from "../turno/funcionesTurno/validarparametrosFiltrados.js";
import { IngresosMensuales } from "../application/casos-uso/casosUsoServicio/IngresosMensuales.js";

/*function sanitizeServicioInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        monto: req.body.monto,
        estado: req.body.estado,
        adicional_adom: req.body.adicional_adom,
        ausencia_cliente: req.body.ausencia_cliente,
        medio_pago: req.body.medio_pago,
        turno_codigo_turno: req.body.turno_codigo_turno,
        tipo_servicio_codigo: req.body.tipo_servicio_codigo,
        total: req.body.total,
    };

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}
*/
//Funciones para validar:
//----------------------//

function validaMonto (monto: number){
    if (monto < 0){
        return false;
    }
    return true;
};

function validaEstado(estado:string){
    if (estado != 'Pendiente' && estado != 'Pago'){
        return false;
    }
    return true;
};

function validaAdicionalAdom(adicional_adom:number){
    if (adicional_adom < 0){
        return false;
    }
    return true;
}

function validaAusenciaCliente(ausencia_cliente:string){
    if (ausencia_cliente != 'Se presento' && ausencia_cliente != 'Esta ausente'){
        return false;
    }
    return true;
};

function validaMedioDePago(medio_pago:string){
    if (medio_pago != 'Mercado Pago' && medio_pago != 'Efectivo'){
        return false;
    }
    return true;
};

/*
async function findAll(req: Request, res: Response) {
    try {
        const servicios = await em.find(Servicio, {});
        return res.status(200).json({ message: 'Todos los servicios encontrados', data: servicios });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
*/

export const getOne = async (req: Request, res: Response) => {
    try {
        const {codigo} = req.params;
        if(!codigo){
            res.status(400).json({ message: 'Código de servicio inválido' });
            return;
        };

        const codigoNumero = Number(codigo);
        if(isNaN(codigoNumero)){
            res.status(400).json({ message: 'El codigo debe ser un numero.' });
            return;
        };

        //const codigo = Number.parseInt(req.params.codigo);
        if (isNaN(codigoNumero)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new BuscarServicio(repo);

        const servicio = await casouso.ejecutar(codigoNumero);

        if(!servicio){
            res.status(400).json({message: 'No se encontro el Servicio' });
            return;
        };

        res.status(200).json(servicio);
        return;
    }catch(error:any){
        console.error('Error al eliminar el turno.',error);
        res.status(500).json({message: error.message})
        return;
    }
}

/*
async function add(req: Request, res: Response) {
    try {
        const { monto, estado, adicional_adom, ausencia_cliente, medio_pago, turno_codigo_turno, tipo_servicio_codigo, total } = req.body.sanitizedInput;
        
        if (!turno_codigo_turno) {
            return res.status(400).json({ message: 'Código de turno no proporcionado.' });
        }
        
        // Verificar si el turno existe en la base de datos
        const cod_tur = Number(turno_codigo_turno);
        if(isNaN(cod_tur)){
            return res.status(404).json({ message: 'Codigo de turno invalido'})
        };

        const turno = await em.findOne(Turno, { codigo_turno: cod_tur });
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado.' });
        };

        if(turno.servicio){
            return res.status(404).json({ message: 'El turno tiene un servicio asignado.'})
        };

        const codTS = Number(tipo_servicio_codigo);
        if(isNaN(codTS)){
            return res.status(404).json({ message: 'Codigo de tipo de servicio Invalido.'})
        };

        const tipo_Servicio = await em.findOne(TipoServicio, {codigo_tipo:codTS});
        if(!tipo_Servicio){
            return res.status(404).json({ message: 'Tipo de servicio no encontrado.'})
        };

        // Verificar si el turno ya tiene un servicio asociado
        if (turno.servicio) {
            return res.status(400).json({ message: 'El turno ya tiene un servicio asociado.' });
        };

        //VALIDACIONES//

        if(!validaMonto(monto)){
            return res.status(400).json({ message: 'El monto no puede ser menor a 0.'})
        };

        if(!validaEstado(estado)){
            return res.status(400).json({ message: 'El estado debe ser Pendiente o Pagado.'})
        };

        /*if(!validaAdicionalAdom(adicional_adom)){
            return res.status(400).json({ message: 'El adicional a domicilio no debe ser menor que 0.'})
        };*/
/*
        if(!validaAusenciaCliente(ausencia_cliente)){
            return res.status(400).json({ message: 'Las opciones validas son: "Se presento" o "Esta ausente."'})
        };

        if(!validaMedioDePago(medio_pago)){
            return res.status(400).json({ message: 'Las opciones validas son "Efectivo" o "Mercado pago."'})
        };

        //Calculamos el total del servicio.
        //Sacamos el porcentaje del turno
        const porcentaje_turno = (turno.porcentaje)/100; //Obtener el porc. del turno
        console.log('Trae el porcentaje:', porcentaje_turno);

        const prec_base = tipo_Servicio.precio_base; //Obtener el precio base del TipoServicio
        console.log('Trae el precio base:', prec_base);

        let precio_parcial_Final = monto + prec_base + monto*porcentaje_turno  //Calculamos el precio parcial
        let precio_a_dom = monto*porcentaje_turno;
        console.log('Precio final 1: ', precio_parcial_Final);

        const tip_tur = turno.tipo_turno;
        if(!tip_tur){
            return res.status(404).json({ message: 'El turno no tiene un Tipo de Turno asignado.'})
        };

        let adic_adom = 0;
        if (tip_tur === 'A Domicilio') {
            adic_adom = precio_a_dom;
            console.log('Adicional por servicio a domicilio (25%):', adic_adom);
        }

        if(medio_pago === "Mercado Pago"){
            precio_parcial_Final *= 1.05  //5% De recargo por usar MercadoPago
        };

        console.log('Si es mercado pago se suma un 5%: ', precio_parcial_Final)

        const precioFinal = precio_parcial_Final;
        
        // Crear el servicio
        const servicio = new Servicio();
        servicio.monto = monto;
        servicio.estado = estado;
        servicio.adicional_adom = adic_adom;
        servicio.ausencia_cliente = ausencia_cliente;
        servicio.medio_pago = medio_pago;
        servicio.turno = turno; // Asociar el turno al servicio
        servicio.tipoServicio = tipo_Servicio;
        servicio.total = precioFinal;

        // Persistir el servicio en la base de datos
        await em.persistAndFlush(servicio);

        // Asociar el servicio al turno
        turno.servicio = servicio;
        await em.persistAndFlush(turno);

        return res.status(201).json({ message: 'Servicio creado', data: servicio });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
*/

/*
async function update(req: Request, res: Response) { //FUNCIONAL
    try {

        const codigo = Number(req.params.codigo);
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        };

        const servicioAActualizar = await em.findOne(Servicio, { codigo });
        if (!servicioAActualizar) {
            return res.status(404).json({ message: 'El servicio no existe' });
        };

        // Verificar si sanitizedInput existe
        if (!req.body.sanitizedInput) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        };

        const { monto, estado, adicional_adom, ausencia_cliente, medio_pago, turno_codigo_turno, tipo_servicio_codigo } = req.body.sanitizedInput;

        //VALIDACIONES//
        //************/
/*
        if(!validaMonto(monto)){
            return res.status(400).json({ message: 'El monto no puede ser menor a 0.'})
        };

        if(!validaEstado(estado)){
            return res.status(400).json({ message: 'El estado debe ser Pendiente o Pagado'})
        };

        if(!validaAdicionalAdom(adicional_adom)){
            return res.status(400).json({ message: 'El adicional a domicilio no debe ser menor que 0'})
        };

        if(!validaAusenciaCliente(ausencia_cliente)){
            return res.status(400).json({ message: 'Las opciones validas son: "Se presento" o "Esta ausente"'})
        };

        if(!validaMedioDePago(medio_pago)){
            return res.status(400).json({ message: 'Las opciones validas son "Efectivo" o "Mercado pago"'})
        };

        const codTS = Number(tipo_servicio_codigo);
        if(isNaN(codTS)){
            return res.status(404).json({ message: 'Codigo de tipo de servicio Invalido.'})
        };

        const tipo_Servicio = await em.findOne(TipoServicio, {codigo_tipo:codTS});
        if(!tipo_Servicio){
            return res.status(404).json({ message: 'Tipo de servicio no encontrado.'})
        };

        // Validacion del código de turno
        const cod_Tur = Number(req.body.sanitizedInput.turno_codigo_turno);
        if(isNaN(cod_Tur)){
            return res.status(404).json({ message: 'Codigo de turno invalido.' });
        };
        if (cod_Tur) {
            const turno = await em.findOne(Turno, { codigo_turno: cod_Tur });

            if (!turno) {
                return res.status(404).json({ message: 'Turno no encontrado.' });
            }

            // Verificar si el turno ya tiene un servicio asociado
            const servicioExistente = await em.findOne(Servicio, { turno: turno });
            if (servicioExistente && servicioExistente.codigo !== servicioAActualizar.codigo) {
                return res.status(400).json({
                    message: 'Conflicto de clave única',
                    error: 'El turno ya tiene un servicio asociado. Por favor, elige otro turno o elimina el servicio existente.'
                });
            }

            // Asignamos el nuevo turno al servicio
            servicioAActualizar.turno = turno;
        }

        const turno = await em.findOne(Turno, { codigo_turno: cod_Tur });
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado.' });
        };

        if (!tipo_Servicio) {
            return res.status(404).json({ message: 'El tipo de servicio no existe.' });
        };

        //Calculamos el total del servicio.
        //Sacamos el porcentaje del turno
        const monto_num = Number(monto)
        if (isNaN(monto_num)) {
            return res.status(400).json({ message: 'Monto inválido.' });
        }

        let adicional_adom_num = Number(adicional_adom)
        if (isNaN(adicional_adom_num)) {
            adicional_adom_num = 0;
        }

        const porcentaje_turno = (turno.porcentaje)/100;
        if (isNaN(porcentaje_turno)) {
            return res.status(400).json({ message: 'Porcentaje del turno no válido.' });
        }

        const prec_base = Number(tipo_Servicio.precio_base);
        if (isNaN(prec_base)) {
            return res.status(400).json({ message: 'Precio base del tipo de servicio no válido.' });
        }
        let precioFinal = monto_num + adicional_adom_num + prec_base + monto_num*porcentaje_turno 
        let precio_a_dom = monto_num*porcentaje_turno;

        console.log('Adic a dom: ', adicional_adom_num)
        console.log('monto: ', monto_num)
        console.log('Porc. turno: ', porcentaje_turno)
        console.log('Precio base: ', prec_base)
        console.log('Precio final: ', precioFinal)
        console.log('Precio a dom: ', precio_a_dom)

        const tip_tur = turno.tipo_turno;
        if(!tip_tur){
            return res.status(404).json({ message: 'El turno no tiene un Tipo de Turno asignado.'})
        };
        
        let adic_adom = 0;
        if (tip_tur === 'A Domicilio') {
            adic_adom = precio_a_dom;
            console.log('Adicional por servicio a domicilio (25%):', adic_adom);
        }

        if(medio_pago === "Mercado Pago"){
            precioFinal = precioFinal*1.05 //5% Por pagar con MP
        };

        servicioAActualizar.total = precioFinal;
        // Actualizar los demás campos
        em.assign(servicioAActualizar, req.body.sanitizedInput);
        await em.flush();

        return res.status(200).json({ message: 'Servicio actualizado correctamente', data: servicioAActualizar });
    
    } catch (error: any) {
        // Manejar el error de clave única de MySQL
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Conflicto de clave única',
                error: 'El turno ya está asociado a otro servicio. Por favor, elige otro turno o elimina el servicio existente.'
            });
        };

        return res.status(500).json({ message: error.message });
    }
}
*/

export const remove = async (req: Request, res: Response):Promise<void> => {
    try {
        const {codigo} = req.params;
        if(!codigo){
            res.status(400).json({ message: 'Código de servicio inválido.' });
            return;
        };

        const codigoNumber = Number(codigo)
        if (isNaN(codigoNumber)) {
            res.status(400).json({ message: 'El codigo de servicio debe ser un numero.' });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new EliminarServicio(repo);

        const errores = await casouso.ejecutar(codigoNumber);

        if(errores.length > 0){
            const status = errores[0] === 'Servicio no encontrado.' ? 404 : 409; // 409 = Conflicto
            res.status(status).json({ message: errores[0] });
            return;
        };

        res.status(200).json({ message: 'Servicio eliminado exitosamente' });
        return;
    
    }catch(error:any){
        console.error('Error al eliminar el servicio.',error);
        res.status(500).json({message: error.message})
        return;
    };
};

export const ingresosMensuales = async (req:Request, res:Response):Promise<void> => {
    try{
        const { mes } = req.query;
        if(!mes){
            res.status(400).json({ messaje: 'No se ingreso ningun mes.'});
            return; 
        };

        const mesStr = req.query.mes?.toString() ?? '';
        const errores = validarParametrosFiltrado(mesStr);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0] });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new IngresosMensuales(repo);

        const totalMes = await casouso.ejecutar(mes.toString());
        if(totalMes === 0){
            res.status(400).json({ message: 'No hubo facturacion en dicho mes.'})
            return;
        };

        res.status(200).json(totalMes);
        return;
    }catch(error:any){
        console.error('Error al calcular el total mensual.',error);
        res.status(500).json({ error: 'Error interno del servidor.' });
        return;
    }
}
//export { sanitizeServicioInput, findAll, getOne, add, update, remove };
