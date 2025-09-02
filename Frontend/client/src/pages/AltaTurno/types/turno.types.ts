export interface Peluquero {
    codigo_peluquero: number;
    nombre: string;
};

export interface TipoServicio {
    codigo_tipo:number;
    nombre:string;
    precio_base:number;
};

export interface Payload {
    turno: {
        tipo_turno: "Sucursal" | "A Domicilio";
        codigo_cliente: number | undefined;
        codigo_peluquero: number | null;
        fecha_hora: string;
    };
    servicio: {
        medio_pago: "Stripe" | "Efectivo";
        tipo_servicio_codigo: number;
    };
};

// Con Partial errors solo tiene los campos que fallan.
export type FormErrors = Partial<{
    fecha_hora: string;
    medio_pago: string;
    tipo_turno: string;
    codigo_cliente: string;
    codigo_peluquero: string;
    tipo_servicio_codigo: string;
}>;