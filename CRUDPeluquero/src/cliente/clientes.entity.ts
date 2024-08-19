import { Entity, Property, OneToMany, Collection, PrimaryKey } from "@mikro-orm/core"
import { Turno } from "../turno/turno.entity.js"

@Entity()
export class Cliente{

    @PrimaryKey()
    codigo_cliente!:number;

    @Property({nullable: false})
    dni!: number;

    @Property({nullable: false})
    NomyApe!: string;

    @Property({nullable: true})
    email!: string;

    @Property({nullable: false})
    direccion!: string;

    @Property({nullable: true})
    telefono!: string

    @OneToMany(() => Turno, turno => turno.cliente)
    turnos = new Collection<Turno>(this);
}