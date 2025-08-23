import { AltaTurno } from "../AltaTurno/AltaTurno";
import { TurnoRepository } from "../application/interfaces/TurnoRepository";
import { ServicioRepository } from "../application/interfaces/ServicioRepository";
import { AltaTurnoDTO, AltaServicioDTO } from "../AltaTurno/AltaTurno";
import { EntityManager } from "@mikro-orm/core";

import * as turnoHelper from "../../src/AltaTurno/crearTurnoDesdeDTO";
import * as servicioHelper from "../../src/AltaTurno/crearServicioDesdeDTO";

describe("AltaTurno", () => {
    let turnoRepo: TurnoRepository;
    let servicioRepo: ServicioRepository;
    let em: EntityManager;
    let casoUso: AltaTurno;

    beforeEach(() => {
        turnoRepo = { guardar: jest.fn() } as any;
        servicioRepo = { guardar: jest.fn() } as any;
        em = {} as EntityManager; 
        casoUso = new AltaTurno(turnoRepo, servicioRepo);
    });

    it("debería crear turno y servicio correctamente", async () => {
        const turnoDTO: AltaTurnoDTO = {
            fecha_hora: new Date(Date.now() + 86400000), // mañana
            tipo_turno: "Sucursal",
            porcentaje: 10,
            estado: "Activo",
            codigo_cliente: 1,
            codigo_peluquero: 1
        };

        const servicioDTO: AltaServicioDTO = {
        monto: 1000,
        estado: "Pendiente",
        ausencia_cliente: "Se presento",
        medio_pago: "Efectivo",
        turno_codigo_turno: 1,
        tipo_servicio_codigo: 1
        };

        // Mockear helpers si querés aislar el test
        jest.spyOn(turnoHelper, "crearTurnoDesdeDTO")
            .mockResolvedValue({ codigo_turno: 1 } as any);

        jest.spyOn(servicioHelper, "crearServicioDesdeDTO")
            .mockResolvedValue({ codigo_servicio: 99 } as any);

        const resultado = await casoUso.ejecutar(turnoDTO, servicioDTO, em);

        expect(resultado).toEqual({
            turno: { codigo_turno: 1 },
            servicio: { codigo_servicio: 99 }
        });

    expect(turnoRepo.guardar).toHaveBeenCalled();
    expect(servicioRepo.guardar).toHaveBeenCalled();
    });
});