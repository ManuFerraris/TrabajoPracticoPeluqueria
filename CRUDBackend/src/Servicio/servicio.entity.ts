import { Entity, Property, OneToOne, ManyToOne, Rel, PrimaryKey, Collection } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";
import { TipoServicio } from "../TipoServicio/tiposervicio.entity.js";

@Entity()
export class Servicio {
    @PrimaryKey()
    codigo!: number;

    @Property({ nullable: false })
    monto!: number;

    @Property({ nullable: false })
    estado!: string;

    @Property({ nullable: true })
    adicional_adom!: number;

    @Property({ nullable: true })
    ausencia_cliente!: string;

    @Property({ nullable: false })
    medio_pago!: string;

    @OneToOne(() => Turno, {nullable: false})
    turno!: Rel<Turno>;

    //@OneToMany(() => TipoServicio, tipoServicio => tipoServicio.servicio)
    //tiposServicios = new Collection<TipoServicio>(this); 

    @ManyToOne(() => TipoServicio, { nullable: true })
    tipoServicio!: Rel<TipoServicio>;
}
