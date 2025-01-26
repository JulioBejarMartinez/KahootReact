import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";

const cuestionario = (datos) => { 
    const navega=useNavigate()

    const irAFormularioCuestionarioEditar = (dato) => {
        navega("/formularioCuestionarioEditar/"+dato)
    }

    const borrarCuestionario = async (dato) => {
           await axios.delete("http://localhost:4000/cuestionarios/"+dato)
           location.reload()
    }

    return (
        <div className="card text-white bg-dark mb-3" style={{maxWidth: "20rem" , display: "inline-block", margin: "10px"}}>          
            <div className="card-header">Cuestionario Num: {datos.id}</div>
            <div className="card-body">
            <br/>
            <h4 className="card-title" >{datos.titulo}</h4>
            <br/>
            <div className="btn-group" role="group">
            <button onClick={()=>{irAFormularioCuestionarioEditar(datos.id)}} className="btn btn-warning btn-lg">Editar</button>
            <button onClick={()=>{borrarCuestionario(datos.id)}} className="btn btn-danger btn-lg">Borrar</button>
            </div>
            </div>
        </div>
    )
}

export default cuestionario