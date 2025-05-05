import { Entity, PrimaryKey, Property, Rel, ManyToOne } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";

@Entity()
export class RefreshToken {

    @PrimaryKey({type: 'number'})
    id!: number;

    @Property({ type: 'string' })
    token!: string;

    @ManyToOne(() => Cliente, { nullable: true })
    cliente?:Rel<Cliente>; // Relación con Cliente, puede ser nula si el token no pertenece a un cliente

    @ManyToOne(() => Peluquero, { nullable: true })
    peluquero?:Rel<Peluquero>; // Relación con Peluquero, puede ser nula si el token no pertenece a un peluquero
};