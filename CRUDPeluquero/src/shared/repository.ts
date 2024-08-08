//Hace referencia al acceso de la base de datos
//Esta interfaz nos permite que todos los repositorios usen estos elementos
export interface repository<T>{
    findAll(): T[] | undefined;
    getOne(item: {codigo: number}): T | undefined;
    add(item: T): T | undefined;
    update(item: T): T | undefined;
    delete(item: {codigo: number}): T |undefined;
}