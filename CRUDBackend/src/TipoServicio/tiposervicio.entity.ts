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
    @ManyToOne(() => Servicio, { nullable: true })
    servicio!: Rel<Servicio>;
}
