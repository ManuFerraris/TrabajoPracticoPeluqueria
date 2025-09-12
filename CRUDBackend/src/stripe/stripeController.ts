import { Request, Response } from "express";
import Stripe from "stripe";
import { MikroORM } from "@mikro-orm/core";
import { ProcesarEventoStripe } from "../application/casos-uso/casosUsoPago/procesarEventoStripe.js";
import { PagoRepositoryORM } from "../shared/db/PagoRepositoryORM.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function handleStripeWebhook(req:Request, res:Response):Promise<void> {
    try{
        console.log("✅ Webhook recibido");
        const orm = (req.app.locals as {orm: MikroORM}).orm
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const casouso = new ProcesarEventoStripe(repo);

        const sig = req.headers['stripe-signature'] as string;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
        let event: Stripe.Event;
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log(`Webhook recibido: ${event.type}`);

        const resultado = await casouso.ejecutar(event);
        if(Array.isArray(resultado)){
            res.status(404).json({ message: resultado });
            return;
        };

        res.status(200).send();
        return;
    }catch(error:any){
        console.error(`Webhook Error: ${error.message}`);
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    };
};