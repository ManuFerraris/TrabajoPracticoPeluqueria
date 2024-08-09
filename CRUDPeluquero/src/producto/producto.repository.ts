import { repository } from "../shared/repository.js";
import { Producto } from "./productos.entity.js";

const productos: Producto[] = [
    new Producto(
        55,
        'Aceite de Coco',
        17
    ),
]

export class ProductoRepository implements repository<Producto>{

    public findAll(): Producto[] | undefined {
        return productos
    }

    public getOne(item: { codigo: number; }): Producto | undefined {
        return productos.find((producto)=> producto.codigo === item.codigo)
    }

    public add(item: Producto): Producto | undefined {
        productos.push(item)
        return item
    }

    public update(item: Producto): Producto | undefined {
        const productoCodx = productos.findIndex((producto) => producto.codigo === item.codigo)
        
        if(productoCodx !== -1){
            productos[productoCodx] = {...productos[productoCodx], ...item}
            return productos[productoCodx]
    }return undefined;
    }

    public delete(item: { codigo: number; }): Producto | undefined {
        const productoCodx = productos.findIndex(producto => producto.codigo === item.codigo)

        if(productoCodx !== -1){
            const deletedproductos = productos[productoCodx]
            productos.splice(productoCodx, 1)
            return deletedproductos
        }
    }
}