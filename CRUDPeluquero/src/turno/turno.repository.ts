import { repository } from "../shared/repository.js";
import { Turno } from "./turno.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";


export class TurnoRepository implements repository<Turno>{
    
    public async findAll(): Promise<Turno[] | undefined> {
        throw new Error('No implementado')
    }

    public async getOne(item: { codigo: number; }): Promise<Turno | undefined> {
        throw new Error('No implementado')
    }

    public async add(item: Turno): Promise<Turno | undefined> {
        throw new Error('No implementado')
    }

    public async update(item: Turno): Promise<Turno | undefined> {
        throw new Error('No implementado')
    }

    public async delete(item: { codigo: number; }): Promise<Turno | undefined> {
        throw new Error('No implementado')
    }
}