import { Entity, Property, ManyToOne, Rel, PrimaryKey, OneToOne } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
import { Servicio } from "../Servicio/servicio.entity.js";
// Mantenemos 'import type' para la definición de tipo de Pago.
import type { Pago } from "../pago/pago.entity.js";

@Entity()
export class Turno {

    @PrimaryKey({type:'number'})
    codigo_turno!: number;

    // ... (otras propiedades se mantienen igual)
    @Property({type:'string', nullable: false })
    fecha_hora!: Date;

    @Property({type:'string', nullable: false })
    tipo_turno!: string;

    @Property({type:'number', nullable: true })
    porcentaje!: number;

    @Property({type:'string', nullable: false })
    estado!: string;

    @ManyToOne(() => Cliente, { nullable: false })
    cliente!: Rel<Cliente>;

    @ManyToOne(() => Peluquero, { nullable: false })
    peluquero!: Rel<Peluquero>;

    @OneToOne(() => Servicio, servicio => servicio.turno, { nullable: true, orphanRemoval: true })
    servicio!: Rel<Servicio>;
    
    // --- CAMBIO FINAL AQUÍ ---
    // Hacemos lo mismo: pasamos el nombre 'Pago' como string.
    // 'mappedBy' apunta a la propiedad 'turno' en la entidad Pago.
    @OneToOne({
      entity: 'Pago',
      mappedBy: 'turno', // La propiedad en la entidad Pago que nos mapea
      nullable: true
    })
    pago?: Pago;
}