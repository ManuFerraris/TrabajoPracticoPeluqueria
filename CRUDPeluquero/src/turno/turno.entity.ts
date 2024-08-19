import { Entity, Property, ManyToOne, Rel, PrimaryKey } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";



@Entity()
export class Turno{

    @PrimaryKey()
    codigo_turno!:number;

    @Property({nullable: false})
    fecha_hora!: string;

    @Property({nullable: false})
    tipo_turno!: string;
    
    @Property({nullable: true})
    porcentaje!: number;

    @Property({nullable: false})
    estado!: string

    @ManyToOne(() => Cliente, {nullable: false})
    cliente!: Rel<Cliente>;

    @ManyToOne(() => Peluquero, {nullable: false})
    peluquero!: Rel<Peluquero>;
}