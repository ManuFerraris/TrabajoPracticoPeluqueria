import { Entity, PrimaryKey, Property, ManyToOne, Rel } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class historialCliente {

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Cliente)
  cliente!: Rel<Cliente>;

  @ManyToOne(() => Turno)
  turno!: Rel<Turno>;

  @Property()
  fecha!: Date;

  @Property()
  descripcion!: string;
}
