import { repository } from "../shared/repository.js";
import { Costo } from "./costo.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class CostoRepository implements repository <Costo>{
    public async findAll(): Promise<Costo[] | undefined> {
        const [costos] = await pool.query('select * from costo')
        return costos as Costo[]
    }

    public async getOne(item: { codigo: number; }): Promise<Costo | undefined> {
        const codigo = item.codigo
        const [costos] = await pool.query<RowDataPacket[]>('select * from costo where codigo = ?', [codigo])
        if(costos.length === 0){
            return undefined
        }
        const costo = costos[0] as Costo
        return costo
    }

    public async add(costoInput: Costo): Promise<Costo | undefined> {
        const {codigo, codigo_turno, monto, estado, adicional_adom, ausencia_cliente, medio_pago} = costoInput
        
        // Validación de existencia del turno
        const [turnoExists] = await pool.query<RowDataPacket[]>('SELECT 1 FROM turno WHERE codigo_turno = ?', [codigo_turno]);
        if (turnoExists.length === 0) {
            throw new Error('El turno no existe');
        }
        const [result] = await pool.query<ResultSetHeader>('insert into costo (codigo_turno, monto, estado, adicional_adom, ausencia_cliente, medio_pago) values (?,?,?,?,?,?)',
        [codigo_turno, monto, estado, adicional_adom, ausencia_cliente, medio_pago])
        costoInput.codigo = result.insertId 
        return costoInput
    }

    public async update(item: Costo): Promise<Costo | undefined> {
        const {codigo, codigo_turno, monto, estado, adicional_adom, ausencia_cliente, medio_pago} = item;

    // Validamos la existencia del costo
    const existingCosto = await this.getOne({codigo});
    if (!existingCosto) {
        return undefined; // No se encontró el costo a actualizar
    }

    // Validación condicional de existencia del turno
    if (codigo_turno !== undefined) {
        const [turnoExists] = await pool.query<RowDataPacket[]>('SELECT 1 FROM turno WHERE codigo_turno = ?', [codigo_turno]);
        if (turnoExists.length === 0) {
            throw new Error('El turno no existe');
        }
    }

    const updateFields: string[] = [];
    const params: any[] = [];
    if (codigo_turno !== undefined) {
        updateFields.push('codigo_turno = ?');
        params.push(codigo_turno);
    }
    if (monto !== undefined) {
        updateFields.push('monto = ?');
        params.push(monto);
    }
    if (estado !== undefined) {
        updateFields.push('estado = ?');
        params.push(estado);
    }
    if (adicional_adom !== undefined) {
        updateFields.push('adicional_adom = ?');
        params.push(adicional_adom);
    }
    if (ausencia_cliente !== undefined) {
        updateFields.push('ausencia_cliente = ?');
        params.push(ausencia_cliente);
    }
    if (medio_pago !== undefined) {
        updateFields.push('medio_pago = ?');
        params.push(medio_pago);
    }
    if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
    }

    params.push(codigo);
    const query = `UPDATE costo SET ${updateFields.join(', ')} WHERE codigo = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
        return undefined; // No se encontró el recurso para actualizar
    } 
    return { ...item, codigo }; // Devolver el objeto actualizado
}

    public async delete(item: { codigo: number; }): Promise<Costo | undefined> {
        try {
            const costoAEliminar = await this.getOne(item);
            if (!costoAEliminar) {
                throw new Error('El costo no existe');
            }
            await pool.query('DELETE FROM costo WHERE codigo = ?', [item.codigo]);
            return costoAEliminar;
        } catch (error: any) {
            throw new Error(`Incapaz de eliminar el costo: ${error.message}`);
        }
    }
}