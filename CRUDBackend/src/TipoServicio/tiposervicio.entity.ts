import { Entity, PrimaryKey, Property, OneToMany, Rel, Collection } from "@mikro-orm/core";
import { Servicio } from "../Servicio/servicio.entity.js";

@Entity()
export class TipoServicio {

    @PrimaryKey()
    codigo_tipo!: number;

    @Property()
    nombre!: string;

    @Property({ nullable: true })
    descripcion?: string;

    @Property({ nullable: true })
    duracion_estimada?: number;

    @Property({ nullable: true })
    precio_base?: number;

    // Relación ManyToOne con Servicio

    //@ManyToOne(() => Servicio, { nullable: true })
    //servicio!: Rel<Servicio>;

    @OneToMany(() => Servicio, servicio => servicio.tipoServicio)
    servicio = new Collection<Servicio>(this); 
}
