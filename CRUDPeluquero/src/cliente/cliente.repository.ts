import { repository } from "../shared/repository.js";
import { Cliente } from "./clientes.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class ClienteRepository implements repository<Cliente>{

    public async findAll(): Promise<Cliente[] | undefined> {
        const [clientes] = await pool.query('select * from cliente')
        return clientes as Cliente[]
    }

    public async getOne(item: { codigo: number; }): Promise<Cliente | undefined> {
        const codigo = item.codigo
        const [clientes] = await pool.query<RowDataPacket[]>('select * from cliente where codigo_cliente = ?', [codigo])
        if(clientes.length === 0){
            return undefined
        }
        const cliente = clientes[0] as Cliente
        return cliente
    }

    public async add(clienteInput: Cliente): Promise<Cliente | undefined> {
        const {codigo, dni, NomyApe, direccion, email, telefono} = clienteInput
        const [result] = await pool.query<ResultSetHeader>
        ('insert into cliente (dni, NomyApe, direccion, email, telefono) values (?,?,?,?,?)',
        [dni, NomyApe, direccion, email, telefono])
        clienteInput.codigo = result.insertId // Usamos 'insertId' para obtener el ID insertado
        return clienteInput
    }

    public async update(item: Cliente): Promise<Cliente | undefined> {
        const {codigo, dni, NomyApe, direccion, email, telefono} = item;

    const updateFields: string[] = [];
    const params: any[] = [];
    if (dni !== undefined) {
        updateFields.push('dni = ?');
        params.push(dni);
    }
    if (NomyApe !== undefined) {
        updateFields.push('NomyApe = ?');
        params.push(NomyApe);
    }
    if (direccion !== undefined) {
        updateFields.push('direccion = ?');
        params.push(direccion);
    }
    if (email !== undefined) {
        updateFields.push('email = ?');
        params.push(email);
    }
    if (telefono !== undefined) {
        updateFields.push('telefono = ?');
        params.push(telefono);
    }
    if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
    }

    params.push(codigo);
    const query = `UPDATE cliente SET ${updateFields.join(', ')} WHERE codigo_cliente = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
        return undefined; // No se encontró el recurso para actualizar
    }
    return { ...item, codigo }; // Devolver el objeto actualizado 
    }

    public async delete(item: { codigo: number; }): Promise<Cliente | undefined> {
        try{
            const clienteAEliminar = await this.getOne(item);
            await pool.query('delete from cliente where codigo_cliente = ?', item.codigo);
            return clienteAEliminar;
        }catch(error:any){
            throw new Error('Incapaz de eliminar Cliente')
        }
    }
}