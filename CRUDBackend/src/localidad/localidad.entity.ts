import { Entity, Property, OneToMany, Collection, PrimaryKey } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";

@Entity()
export class Localidad {
    @PrimaryKey()
    codigo!:number;

    @Property({nullable: false})
    nombre!:string;

    @Property({nullable: false})
    provincia!:string;

    @Property({nullable: false})
    codigo_postal!:string;

    @Property({nullable: false})
    pais!:string;

    @Property({nullable: true})
    descripcion!:string;

    @OneToMany(() => Cliente, cliente => cliente.localidad)
    clientes = new Collection<Cliente>(this);

}
//Queda igual