import { Entity, PrimaryKey, Property, ManyToOne, Rel } from "@mikro-orm/core";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class historialPeluquero {

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Peluquero)
  peluquero!: Rel<Peluquero>;

  @ManyToOne(() => Turno)
  turno!: Rel<Turno>;

  @Property()
  fecha!: Date;

  @Property()
  descripcion!: string;
}
