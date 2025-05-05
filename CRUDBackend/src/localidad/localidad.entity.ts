import { Entity, Property, OneToMany, Collection, PrimaryKey } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";

@Entity()
export class Localidad {
    @PrimaryKey({type: 'number'})
    codigo!:number;

    @Property({type: 'string', nullable: false})
    nombre!:string;

    @Property({type: 'string', nullable: false})
    provincia!:string;

    @Property({type: 'string', nullable: false})
    codigo_postal!:string;

    @Property({type: 'string', nullable: false})
    pais!:string;

    @Property({type: 'string', nullable: true})
    descripcion!:string;

    @OneToMany(() => Cliente, cliente => cliente.localidad)
    clientes = new Collection<Cliente>(this);

}
//Queda igual