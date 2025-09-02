import { Peluquero, TipoServicio } from "../types/turno.types.ts";

export const getNombrePeluquero = (peluqueros: Peluquero[], codigo: number | null) =>
    peluqueros.find(p => p.codigo_peluquero === codigo)?.nombre ?? "-"

export const getNombreTipoServicio = (tipos: TipoServicio[], codigo: number | null) =>
    tipos.find(ts => ts.codigo_tipo === codigo)?.nombre ?? "-"

export const getPrecioBase = (tipos: TipoServicio[], codigo: number | null) =>
    tipos.find(ts => ts.codigo_tipo === codigo)?.precio_base ?? 0