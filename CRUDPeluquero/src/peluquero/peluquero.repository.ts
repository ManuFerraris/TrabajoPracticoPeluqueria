import { repository } from "../shared/repository.js";
import { Peluquero } from "./peluqueros.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";


export class PeluqueroRepository implements repository<Peluquero>{

    public async findAll(): Promise<Peluquero[] | undefined>{
        const [peluqueros] = await pool.query('select * from peluquero')
        return peluqueros as Peluquero[]
        }

    public async getOne(item: { codigo: number; }): Promise<Peluquero | undefined> {
        const codigo = item.codigo
        const [peluqueros] = await pool.query<RowDataPacket[]>('select * from peluquero where codigo_peluquero = ?', [codigo])
        if(peluqueros.length === 0){
            return undefined
        }
        const peluquero = peluqueros[0] as Peluquero
        return peluquero
    }

    public async add(peluqueroInput: Peluquero): Promise<Peluquero | undefined> {
        const {codigo, nombre, fecha_Ingreso, tipo} = peluqueroInput
        const [result] = await pool.query<ResultSetHeader>('insert into peluquero (nombre, fecha_Ingreso, tipo) values (?,?,?)',
        [nombre, fecha_Ingreso, tipo])
        peluqueroInput.codigo = result.insertId // Usamos 'insertId' para obtener el ID insertado
        return peluqueroInput
    }

    public async update(item: Peluquero): Promise<Peluquero | undefined> {
        const { codigo, nombre, fecha_Ingreso, tipo } = item;
    let mysqlDate: string | undefined;
    if (fecha_Ingreso) {
        const parsedDate = new Date(fecha_Ingreso);
        if (!isNaN(parsedDate.getTime())) {
            mysqlDate = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
        } else {
            throw new Error('Invalid date format for fecha_Ingreso');
        }
    }

    const updateFields: string[] = [];
    const params: any[] = [];
    if (nombre !== undefined) {
        updateFields.push('nombre = ?');
        params.push(nombre);
    }
    if (mysqlDate !== undefined) {
        updateFields.push('fecha_Ingreso = ?');
        params.push(mysqlDate);
    }
    if (tipo !== undefined) {
        updateFields.push('tipo = ?');
        params.push(tipo);
    }
    if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
    }

    params.push(codigo);
    const query = `UPDATE peluquero SET ${updateFields.join(', ')} WHERE codigo_peluquero = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
        return undefined; // No se encontró el recurso para actualizar
    }
    return { ...item, codigo }; // Devolver el objeto actualizado 
    }

    public async delete(item: { codigo: number; }): Promise<Peluquero | undefined> {
        try{
            const peluqueroAEliminar = await this.getOne(item);
            await pool.query('delete from peluquero where codigo_peluquero = ?', item.codigo);
            return peluqueroAEliminar;
        }catch(error:any){
            throw new Error('Incapaz de eliminar Peluquero')
        }
    }
}