//Pagina principal que maneja la vista general de los peluqueros.
import React, { useState, useEffect } from "react";
import { getAllPeluqueros, deletePeluquero } from "./Peluquero.service";
import PeluqueroList from "./components/PeluqueroList";


const PeluqueroPage = () => {
    const [peluqueros, setPeluqueros] = useState([]);

    useEffect(() => {
        fetchPeluqueros();
    }, []);

    const fetchPeluqueros = async () => {
        const data = await getAllPeluqueros();
        setPeluqueros(data);
    };

    const handleDelete = async (codigo_peluquero) => {
        await deletePeluquero(codigo_peluquero);
        fetchPeluqueros(); // Refresca la lista después de eliminar
    };

    return (
        <div>
            <PeluqueroList peluqueros={peluqueros} onDelete={handleDelete} />
        </div>
    );
};

export default PeluqueroPage;