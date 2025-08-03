export function validarParametrosFiltrado(mes:string):string[] {
    const errores: string[] = [];

    const formatoValido = /^\d{4}-\d{2}$/.test(mes);
    const [anio, mesNumero] = mes.split("-").map(Number);
    if(!formatoValido || isNaN(anio) || isNaN(mesNumero) || mesNumero < 1 || mesNumero > 12){
        errores.push("Mes invalido. Debe ser 'YYYY-MM'.")
    };
    return errores;
}