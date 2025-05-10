import { Entity, Property, ManyToOne, Rel, PrimaryKey, OneToOne } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
import { Servicio } from "../Servicio/servicio.entity.js";

@Entity()
export class Turno {

    @PrimaryKey({type:'number'})
    codigo_turno!: number;

    @Property({type:'string', nullable: false })
    fecha_hora!: string;

    @Property({type:'string', nullable: false })
    tipo_turno!: string;

    @Property({type:'number', nullable: true })
    porcentaje!: number;

    @Property({type:'string', nullable: false })
    estado!: string;

    @ManyToOne(() => Cliente, { nullable: false })
    cliente!: Rel<Cliente>;

    @ManyToOne(() => Peluquero, { nullable: false })
    peluquero!: Rel<Peluquero>;

    @OneToOne(() => Servicio, servicio => servicio.turno, { nullable: true, orphanRemoval: true })
    servicio!: Rel<Servicio>;
}