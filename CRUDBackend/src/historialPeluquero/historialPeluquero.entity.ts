import { Entity, PrimaryKey, Property, ManyToOne, Rel } from "@mikro-orm/core";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class historialPeluquero {

  @PrimaryKey({type: 'number'})
  id!: number;

  @Property({type: 'date'})
  fecha!: Date;

  @Property({type: 'string'})
  descripcion!: string;

  @ManyToOne(() => Peluquero)
  peluquero!: Rel<Peluquero>;

  @ManyToOne(() => Turno)
  turno!: Rel<Turno>;
}
