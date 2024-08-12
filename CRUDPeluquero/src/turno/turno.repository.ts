import { repository } from "../shared/repository.js";
import { Turno } from "./turno.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";


export class TurnoRepository implements repository<Turno>{
    
    public async findAll(): Promise<Turno[] | undefined> {
        const [turnos] = await pool.query('select * from turno')
        return turnos as Turno[]
    }

    public async getOne(item: { codigo: number; }): Promise<Turno | undefined> {
        const codigo = item.codigo
        const [turnos] = await pool.query<RowDataPacket[]>('select * from turno where codigo_turno = ?', [codigo])
        if(turnos.length === 0){
            return undefined
        }
        const turno = turnos[0] as Turno
        return turno
    }

    public async add(turnoInput: Turno): Promise<Turno | undefined> {
        const {codigo, codigo_peluquero,codigo_cliente, fecha_hora, tipo_turno, porcentaje, estado} = turnoInput
        
        // Validación de existencia del peluquero
        const [peluqueroExists] = await pool.query<RowDataPacket[]>('SELECT 1 FROM peluquero WHERE codigo_peluquero = ?', [codigo_peluquero]);
        if (peluqueroExists.length === 0) {
            throw new Error('Peluquero no existe');
        }

        // Validación de existencia del cliente
        const [clienteExists] = await pool.query<RowDataPacket[]>('SELECT 1 FROM cliente WHERE codigo_cliente = ?', [codigo_cliente]);
        if (clienteExists.length === 0) {
            throw new Error('Cliente no existe');
        }

        // Validación de fecha
        if (isNaN(new Date(fecha_hora).getTime())) {
            throw new Error('Fecha de turno no válida');
        }
        //Se genera el nuevo turno
        const [result] = await pool.query<ResultSetHeader>('insert into turno (codigo_peluquero,codigo_cliente, fecha_hora, tipo_turno, porcentaje, estado) values (?,?,?,?,?,?)',
        [codigo_peluquero,codigo_cliente, fecha_hora, tipo_turno, porcentaje, estado])
        turnoInput.codigo = result.insertId // Usamos 'insertId' para obtener el ID insertado
        return turnoInput
    }

    public async update(item: Turno): Promise<Turno | undefined> {
        const {codigo, codigo_peluquero,codigo_cliente, fecha_hora, tipo_turno, porcentaje, estado} = item;
         // Validar existencia de código de cliente
        const [clientes] = await pool.query<RowDataPacket[]>('SELECT * FROM cliente WHERE codigo_cliente = ?', [codigo_cliente]);
        if (clientes.length === 0) {
            throw new Error('Código de cliente no existe');
        }

        // Validar existencia de código de peluquero
        const [peluqueros] = await pool.query<RowDataPacket[]>('SELECT * FROM peluquero WHERE codigo_peluquero = ?', [codigo_peluquero]);
        if (peluqueros.length === 0) {
            throw new Error('Código de peluquero no existe');
        }
        
        // Validar existencia del turno
        const existingTurno = await this.getOne({codigo});
        if (!existingTurno) {
            return undefined; // No se encontró el turno para actualizar
        }
        let mysqlDate: string | undefined;
        if (fecha_hora) {
            const parsedDate = new Date(fecha_hora);
            if (!isNaN(parsedDate.getTime())) {
                mysqlDate = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
            } else {
                throw new Error('Invalid date format for fecha_Ingreso');
            }
        }

    const updateFields: string[] = [];
    const params: any[] = [];
    if (codigo_peluquero !== undefined) {
        updateFields.push('codigo_peluquero = ?');
        params.push(codigo_peluquero);
    }
    if (codigo_cliente !== undefined) {
        updateFields.push('codigo_cliente = ?');
        params.push(codigo_cliente);
    }
    if (mysqlDate !== undefined) {
        updateFields.push('fecha_hora = ?');
        params.push(mysqlDate);
    }
    if (tipo_turno !== undefined) {
        updateFields.push('tipo_turno = ?');
        params.push(tipo_turno);
    }
    if (porcentaje !== undefined) {
        updateFields.push('porcentaje = ?');
        params.push(porcentaje);
    }
    if (estado !== undefined) {
        updateFields.push('estado = ?');
        params.push(estado);
    }
    if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
    }

    params.push(codigo);
    const query = `UPDATE turno SET ${updateFields.join(', ')} WHERE codigo_turno = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
        return undefined; // No se encontró el recurso para actualizar
    } 
    return { ...item, codigo }; // Devolver el objeto actualizado 
    }

    public async delete(item: { codigo: number; }): Promise<Turno | undefined> {
        try{
            const turnoAEliminar = await this.getOne(item);
            await pool.query('delete from turno where codigo_turno = ?', item.codigo);
            return turnoAEliminar;
        }catch(error:any){
            throw new Error('Incapaz de eliminar Turno')
        }
    }
}