import './App.css';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

//import React from 'react';
//import CrudPeluquero from './pages/peluquero/CRUDpeluquero.jsx';
//import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  const [nombre, setNombre] = useState("");
  const [fecha_Ingreso, setFechaIngreso] = useState("");
  const [tipo, setTipo] = useState("");

  const [peluquerolist, setPeluquero] = useState([]); //lista de peluqueros

  const [editar, setEditar] = useState(false);
  const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState(null);


  //AGREGAR
  const add = () => {
    const FechaFormateada = new Date(fecha_Ingreso).toISOString().split('T')[0];
    Axios.post('http://localhost:3000/api/peluqueros', {
    nombre: nombre,
    fecha_Ingreso: FechaFormateada,
    tipo: tipo
    }).then(() => {
      getPeluqueros();
      alert('Peluquero Registrado');
    }).catch(error => {
    console.error('Error al registrar el peluquero:', error);
    alert('Error al registrar el peluquero');
    });
}

//Para que la lista aparezca automaticamente (usamos el Hook 'useEffect')
//Usar useEffect para cargar los peluqueros al montar el componente nos evita un bucle de renderizado y peticiones
useEffect(() => {
  getPeluqueros();
}, []); // El array vacío [] significa que solo se ejecuta cuando se monta el componente

//OBTENER PELUQUEROS
const getPeluqueros = ()=> {
    Axios.get('http://localhost:3000/api/peluqueros').then((response) => {
      const peluqueros = response.data.data; // Acceder a la propiedad 'data'
      if (Array.isArray(peluqueros)) {
        setPeluquero(peluqueros);
      }
    }).catch((error) => {
      console.error('Error al obtener los peluqueros:', error);
      setPeluquero([]);
    });
  }

//CARGAMOS DATOS PARA ACTUALIZAR
const cargarDatos = () => {
  if (peluqueroSeleccionado) {
    setEditar(true);
    setFechaIngreso(peluqueroSeleccionado.fecha_Ingreso || "");
    setNombre(peluqueroSeleccionado.nombre || "");
    setTipo(peluqueroSeleccionado.tipo || "");
  }
}
const actualizarPeluquero = () => {
  if (peluqueroSeleccionado) {
    const fechaValida = new Date(fecha_Ingreso);
    if (!isNaN(fechaValida.getTime())) {
      const FechaFormateada = fechaValida.toISOString().split('T')[0];
      Axios.put(`http://localhost:3000/api/peluqueros/${peluqueroSeleccionado.codigo_peluquero}`, {
        nombre: nombre,
        fecha_Ingreso: FechaFormateada,
        tipo: tipo
      }).then(() => {
        getPeluqueros();
        setEditar(false);
        alert('Peluquero Actualizado');
      }).catch(error => {
        console.error('Error al actualizar el peluquero:', error);
        alert('Error al actualizar el peluquero');
      });
    } else {
      alert('Fecha de ingreso inválida');
    }
  }
}

const eliminarPeluquero = (codigo_peluquero) => {
  console.log('Eliminando peluquero con código:', codigo_peluquero); // Ver en terminal

  Axios.delete(`http://localhost:3000/api/peluqueros/${codigo_peluquero}`)
    .then(() => {
      getPeluqueros(); // Actualiza la lista después de eliminar
      alert('Peluquero Eliminado');
    })
    .catch(error => {
      console.error('Error al eliminar el peluquero:', error);
      alert('Error al eliminar el peluquero');
    });
};

return (
  <div className = "container">
      <div className="card">
  <div className="card-header">
    GESTION DE PELUQUEROS
  </div>
    <div className="card-body">

        <div className="input-group mb-3">
        <span className="input-group-text" id="basic-addon1">Nombre y Apellido:</span>
      <input type="text" 
        onChange={(event) => {
          setNombre(event.target.value);
          }} 
      className="form-control" value={nombre || ""} placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" /> </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Fecha de Ingreso:</span>
            <input type="date" 
              onChange={(event) => {
                setFechaIngreso(event.target.value);
                }} 
            className="form-control" value={fecha_Ingreso || ""} placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"/>
          </div>

        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">Tipo:</span>
          <input type="text" 
            onChange={(event) => {
              setTipo(event.target.value);
              }} 
          className="form-control" value={tipo || ""} placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"/>
        </div>
      <div/>

      <div className = "card-footer text-muted"></div>
      {
        editar?
        <div>
        <button className='btn btn-warning m-2' onClick={actualizarPeluquero}>Actulizar</button>
        <button className='btn btn-info m-2' onClick={()=> setEditar(false)}>Cancelar</button>
        </div>
        :<button className='btn btn-success' onClick={add}>Registrar</button>
      }
      </div>
    </div>

    <table className="table table-striped">
      <thead>
        <tr>
          <th scope="col">Codigo</th>
          <th scope="col">Nombre y Apellido</th>
          <th scope="col">Fecha de Ingreso</th>
          <th scope="col">Tipo</th>
          <th scope="col">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {
          peluquerolist.map((val, key) => {
          return <tr key = {val.codigo_peluquero}>
                  <th>{val.codigo_peluquero}</th>
                  <td>{val.nombre}</td>
                  <td>{val.fecha_Ingreso}</td>
                  <td>{val.tipo}</td>
                  <td>
                    <div className="btn-group" role = "group" arial-label= "Basic example">
                      <button type="button" onClick = {() => { setPeluqueroSeleccionado(val); cargarDatos(); }} className="btn btn-info">Editar</button>
                      <button type="button" onClick = {() => eliminarPeluquero(val.codigo_peluquero)} className="btn btn-danger">Eliminar</button>
                    </div>
                  </td>
                </tr>
          })
        }
      </tbody>
    </table>
  </div>
);
}

export default App;