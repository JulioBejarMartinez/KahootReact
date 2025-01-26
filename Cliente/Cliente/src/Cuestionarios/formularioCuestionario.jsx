import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FormularioCuestionario = () => {
    const navega = useNavigate()
    const [formulario,setFormulario]=useState({
        "titulo":"",
        "creador_id":"1"
    })

    const [usuarios,setUsuarios]=useState([])

    useEffect(()=>{
        const buscaUsuarios = async () => {
       try{
          const resultado = await axios("http://localhost:4000/usuarios")  
          setUsuarios(resultado.data)
       }catch(error){
        console.log(error)
            }
       } 
       buscaUsuarios()
    },[])


    const gestionFormulario = (e) => {
        setFormulario((anterior)=>({...anterior,[e.target.name]:e.target.value}))
    }


    /*const gestionTitulo = (e) => {
        setFormulario((anterior)=>({...anterior,[e.target.name]:e.target.value}))
    }

    const gestionId = (e) => {
        setFormulario((anterior)=>({...anterior,[e.target.name]:e.target.value}))
    }*/


    // En vez de funcionar como un submit y recargar la pagina se queda en la misma pagina y hacemos lo que queramos luego, como redirigirla
    const enviarCuestionario = async (e) => {
        e.preventDefault();
        try{
            await axios.put("http://localhost:4000/cuestionarios",formulario)
        }catch(error){
            console.log(error)
        }
        navega("/")
    }

    return (
        <>
        
        <div className="card text-white bg-dark mb-3" style={{maxWidth: "200rem" , display: "inline-block", margin: "10px"}}>
        <div className="card-header">¡Crea tu propio cuestionario!</div>
        <br />
        <input class="form-control text-white bg-purple border border-light" type="text" onChange={gestionFormulario} id="titulo" name="titulo" placeholder="Pon un titulo de cuestionario"/>
        <br />
        <select className="form-control text-white bg-purple border border-light" id="creador_id" name="creador_id" onChange={gestionFormulario} value={formulario.creador_id}>
            <option value="0">Elige un Usuario</option>
            {
                usuarios.map((usuario,index)=>{
                    return (
                        <option value={usuario.id} key={index}>{usuario.nombre}</option>
                    )
                })
            }
        </select>
        <br />
        <button onClick={enviarCuestionario} className="btn btn-success btn-lg w-100">Enviar Cuestionario</button>
        </div>
        </>
    )
}

export default FormularioCuestionario