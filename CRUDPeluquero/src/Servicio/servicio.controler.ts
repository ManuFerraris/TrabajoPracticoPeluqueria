import { Request, Response } from "express";
import { Servicio } from "./servicio.entity.js";


async function findAll(req:Request, res:Response){
    res.json({message: 'Not implemented'})
};

async function getOne(req: Request, res:Response ){
    res.json({message: 'Not implemented'})
};

async function add(req: Request, res:Response){
    res.json({message: 'Not implemented'})
};

async function update(req: Request, res: Response){
    res.json({message: 'Not implemented'})
};

async function remove(req: Request, res: Response){
    res.json({message: 'Not implemented'})
};

export {findAll, getOne, add, update, remove}