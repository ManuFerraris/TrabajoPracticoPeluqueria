import { Entity, Property, OneToOne, Rel, PrimaryKey } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class Servicio{
    @PrimaryKey()
    codigo!: number;

    @Property({nullable:false})
    monto!:number;

    @Property({nullable:false})
    estado!: string;

    @Property({nullable:true})
    adicional_adom!: number;

    @Property({nullable:true})
    ausencia_cliente!: string;

    @Property({nullable:false})
    medio_pago!: string

    @OneToOne(() => Turno, turno => turno.servicio, { owner: true, nullable:true })
    turno!: Rel<Turno>;
    
}