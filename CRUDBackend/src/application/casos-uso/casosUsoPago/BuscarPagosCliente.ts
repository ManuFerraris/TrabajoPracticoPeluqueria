import { Pago } from "../../../pago/pago.entity.js";
import { PagoRepository } from "../../interfaces/PagoRepository.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";

export class BuscarPagosCliente {
    constructor(
        private readonly pagoRepo: PagoRepository,
        private readonly clienteRepo: ClienteRepository,
    ) {};

    async ejecutar(codigoCliente: number): Promise<Pago[] | string> {
        if(!codigoCliente){
            return 'Código de cliente inválido.';
        };

        const cliente = await this.clienteRepo.getOne(codigoCliente);
        if(!cliente){
            return `No se encontró un cliente con el código ${codigoCliente}.`;
        };

        const pagosCliente = await this.pagoRepo.buscarMisPagos(cliente);
        if(!pagosCliente || pagosCliente.length === 0){
            return pagosCliente; // Retorna array vacío si no hay pagos.
        };
        return pagosCliente;
    };
};