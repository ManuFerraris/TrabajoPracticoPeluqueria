import { Entity, PrimaryKey, Property, ManyToOne, Rel, OneToOne } from "@mikro-orm/core";
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

  @Property({ type: 'date' })
  fecha: Date = new Date();

  @OneToOne(() => Turno)
  turno!: Turno;
}
