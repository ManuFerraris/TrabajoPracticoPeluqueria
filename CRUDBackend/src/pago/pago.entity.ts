import { Entity, PrimaryKey, Property, OneToOne, Rel } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class Pago {

  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string' })
  metodo!: string;

  @Property({ type: 'number' })
  monto!: number;

  @Property({ type: 'string' })
  estado!: string;

  @Property({ type: 'Date' })
  fecha_hora: Date = new Date();

  @Property({ type: 'boolean' })
  recibo_enviado: boolean = false;

  @Property({ type: 'Date', nullable: true })
  fecha_envio!: Date;

  @OneToOne(() => Turno)
  turno!: Rel<Turno>;
}
