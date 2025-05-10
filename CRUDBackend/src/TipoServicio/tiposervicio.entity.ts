import { Entity, PrimaryKey, Property, OneToMany, Rel, Collection } from "@mikro-orm/core";
import { Servicio } from "../Servicio/servicio.entity.js";

@Entity()
export class TipoServicio {

    @PrimaryKey({type:'number'})
    codigo_tipo!: number;

    @Property({type:'string',})
    nombre!: string;

    @Property({type:'string', nullable: true })
    descripcion?: string;

    @Property({type:'number', nullable: true })
    duracion_estimada?: number;

    @Property({type:'number', nullable: true })
    precio_base?: number;

    // Relación ManyToOne con Servicio

    //@ManyToOne(() => Servicio, { nullable: true })
    //servicio!: Rel<Servicio>;

    @OneToMany(() => Servicio, servicio => servicio.tipoServicio)
    servicio = new Collection<Servicio>(this); 
}
