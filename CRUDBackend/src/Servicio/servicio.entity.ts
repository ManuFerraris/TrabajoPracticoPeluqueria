import { Entity, Property, OneToOne, ManyToOne, Rel, PrimaryKey, Collection } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";
import { TipoServicio } from "../TipoServicio/tiposervicio.entity.js";

@Entity()
export class Servicio {
    @PrimaryKey({type: 'number'})
    codigo!: number;

    @Property({type:'number', nullable: false })
    monto!: number;

    @Property({type:'string', nullable: false })
    estado!: string;

    @Property({type:'number', nullable: true })
    adicional_adom!: number;

    @Property({type:'string', nullable: true })
    ausencia_cliente!: string;

    @Property({type:'string', nullable: false })
    medio_pago!: string;

    @Property({type:'number', nullable: true})
    total!: number;

    @OneToOne(() => Turno, {nullable: false})
    turno!: Rel<Turno>;

    //@OneToMany(() => TipoServicio, tipoServicio => tipoServicio.servicio)
    //tiposServicios = new Collection<TipoServicio>(this); 

    @ManyToOne(() => TipoServicio, { nullable: true })
    tipoServicio!: Rel<TipoServicio>;
}
