import { Entity, Property, OneToMany, Collection, PrimaryKey, ManyToOne,Rel } from "@mikro-orm/core"
import { Turno } from "../turno/turno.entity.js"
import { Localidad } from "../localidad/localidad.entity.js";
import { RefreshToken } from "../auth/refresh-token.entity.js";

@Entity()
export class Cliente{

    @PrimaryKey({type: 'number'})
    codigo_cliente!:number;

    @Property({type: 'string', nullable: false})
    dni!: string;

    @Property({type: 'string', nullable: false})
    NomyApe!: string;

    @Property({type: 'string', nullable: true})
    email?: string;

    @Property({type: 'string', nullable: false})
    direccion!: string;

    @Property({type: 'string', nullable: true})
    telefono?: string;

    @Property({type: 'string', default: "Activo"})
    estado!: string;

    @Property({type: 'string', nullable: false, length: 100})
    password!: string;

    @Property({type: 'string', default: 'cliente' })
    rol!: string;

    @OneToMany(() => Turno, turno => turno.cliente)
    turnos = new Collection<Turno>(this);

    @ManyToOne(() => Localidad, { nullable: true })
    localidad!: Rel<Localidad>;

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.cliente)
    refreshTokens = new Collection<RefreshToken>(this);
}
//Queda igual