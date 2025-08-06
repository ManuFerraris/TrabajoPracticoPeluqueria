export function validarEstadoTurno(estado:string):string | null {
    if(!estado){
        return `El estado ${estado} esta ausente`;
    } else if (estado !== "Activo" && estado!== "Cancelado" && estado !== "Sancionado"){
        return `El tipo de estado ${estado} es invalido, debe ser Activo, Cancelado o Sancionado`;
    };
    return null;
}