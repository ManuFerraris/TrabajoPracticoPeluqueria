import { Entity, Property, OneToMany, Collection, PrimaryKey } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class Peluquero{

    @PrimaryKey()
    codigo_peluquero!:number;

    @Property({ nullable: false })
    nombre!: string;

    @Property({type: 'date', nullable: false })
    fecha_Ingreso!: Date;

    @Property({ nullable: false })
    tipo!: string;

    @OneToMany(() => Turno, turno => turno.peluquero)
    turnos = new Collection<Turno>(this);
}