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

    public async findAll(): Promise<Producto[] | undefined> {
        return await productos
    }

    public async getOne(item: { codigo: number; }): Promise<Producto | undefined> {
        return await productos.find((producto)=> producto.codigo === item.codigo)
    }

    public async add(item: Producto): Promise<Producto | undefined> {
        await productos.push(item)
        return item
    }

    public async update(item: Producto): Promise<Producto | undefined> {
        const productoCodx = await productos.findIndex((producto) => producto.codigo === item.codigo)
        
        if(productoCodx !== -1){
            productos[productoCodx] = {...productos[productoCodx], ...item}
            return productos[productoCodx]
    }return undefined;
    }

    public async delete(item: { codigo: number; }): Promise<Producto | undefined> {
        const productoCodx = await productos.findIndex(producto => producto.codigo === item.codigo)

        if(productoCodx !== -1){
            const deletedproductos = productos[productoCodx]
            productos.splice(productoCodx, 1)
            return deletedproductos
        }
    }
}