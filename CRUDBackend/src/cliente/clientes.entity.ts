import { Entity, Property, OneToMany, Collection, PrimaryKey, ManyToOne,Rel } from "@mikro-orm/core"
import { Turno } from "../turno/turno.entity.js"
import { Localidad } from "../localidad/localidad.entity.js";

@Entity()
export class Cliente{

    @PrimaryKey()
    codigo_cliente!:number;

    @Property({nullable: false})
    dni!: string;

    @Property({nullable: false})
    NomyApe!: string;

    @Property({nullable: true})
    email?: string;

    @Property({nullable: false})
    direccion!: string;

    @Property({nullable: true})
    telefono?: string;

    @Property({ default: "Activo"})
    estado!: string;

    @OneToMany(() => Turno, turno => turno.cliente)
    turnos = new Collection<Turno>(this);

    @ManyToOne(() => Localidad, { nullable: true })
    localidad!: Rel<Localidad>;
}
//Queda igual