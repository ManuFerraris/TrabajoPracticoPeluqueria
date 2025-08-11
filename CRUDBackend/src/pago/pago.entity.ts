import { Entity, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";
// Mantenemos 'import type' porque solo lo necesitamos para la 'forma' de Turno.
import type { Turno } from "../turno/turno.entity.js";

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

  // --- CAMBIO FINAL AQUÍ ---
  // Le pasamos el nombre de la entidad como un string 'Turno'.
  // 'inversedBy' apunta a la propiedad 'pago' en la entidad Turno.
  @OneToOne({
    entity: 'Turno',
    inversedBy: 'pago', // La propiedad en la entidad Turno que nos mapea
    owner: true,
    nullable: true,
    unique: true
  })
  turno!: Turno;
}
