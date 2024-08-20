import { Entity, PrimaryKey, Property, ManyToOne, Rel } from "@mikro-orm/core";
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
    @ManyToOne(() => Servicio, { nullable: false })
    servicio!: Rel<Servicio>;
}