import { Entity, Property, OneToMany, Collection, PrimaryKey } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";
import { RefreshToken } from "../auth/refresh-token.entity.js";
@Entity()
export class Peluquero{

    @PrimaryKey({type: 'number'})
    codigo_peluquero!:number;

    @Property({type: 'string', nullable: false })
    nombre!: string;

    @Property({type: 'date', nullable: false })
    fecha_Ingreso!: Date;

    @Property({type: 'string', nullable: false })
    tipo!: string;

    @Property({type: 'string', nullable: false, unique: true }) // <- nuevo
    email!: string;

    @Property({type: 'string', nullable: false }) // <- nuevo
    password!: string;
    
    @Property({type: 'string', default: 'peluquero' }) // <- nuevo
    rol!: string;

    @OneToMany(() => Turno, turno => turno.peluquero)
    turnos = new Collection<Turno>(this);

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.peluquero)
    refreshTokens = new Collection<RefreshToken>(this);
}
//Queda igual