import { Entity, Property, OneToMany, Collection, PrimaryKey } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";
import { RefreshToken } from "../auth/refresh-token.entity.js";

@Entity()
export class Peluquero{

    @PrimaryKey({type: 'number'})
    codigo_peluquero!:number;

    @Property({type: 'string', nullable: false })
    nombre!: string;

    @Property({type: 'string', columnType: 'varchar(10)', nullable: false })
    fecha_Ingreso!: string;

    @Property({type: 'string', nullable: false })
    tipo!: string;

    @Property({type: 'string', nullable: false, unique: true })
    email!: string;

    @Property({type: 'string', nullable: false })
    password!: string;
    
    @Property({type: 'string', default: 'peluquero' })
    rol!: string;

    @OneToMany(() => Turno, turno => turno.peluquero)
    turnos = new Collection<Turno>(this);

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.peluquero)
    refreshTokens = new Collection<RefreshToken>(this);
};