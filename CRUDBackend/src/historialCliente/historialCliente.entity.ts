import { Entity, PrimaryKey, Property, ManyToOne, Rel } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class historialCliente {

  @PrimaryKey({type: 'number'})
  id!: number;

  @Property({type: 'date'})
  fecha!: Date;

  @Property({type: 'string'})
  descripcion!: string;

  @ManyToOne(() => Cliente)
  cliente!: Rel<Cliente>;

  @ManyToOne(() => Turno)
  turno!: Rel<Turno>;
}
