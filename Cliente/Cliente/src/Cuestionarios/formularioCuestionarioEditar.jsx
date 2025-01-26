import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Preguntas from "./preguntas";

const FormularioCuestionarioEditar = () => {
    const {id} = useParams()
    const navega = useNavigate()
    const [formulario,setFormulario]=useState({
        "titulo":"",
        "creador_id":"1",
        // esto es nuevo
        //"preguntas":[]
    })

    const [usuarios,setUsuarios]=useState([])
    // esto es nuevo
    //const [preguntas,setPreguntas]=useState([])

    useEffect(()=>{
        console.log("estoy por aqui 1")
        const buscaUsuarios = async () => {
       try{
          const resultado = await axios("http://localhost:4000/usuarios")  
          console.log("estoy por aqui")
          setUsuarios(resultado.data)
       }catch(error){
        console.log(error)
            }
       } 
       /*const buscaPreguntas = async () => {
        try{
            const resultado = await axios("http://localhost:4000/preguntas")
            setPreguntas(resultado.data)
        }catch(error){
            console.log(error)
        }
       }*/
       const buscaCuestionario = async () => { 
        try{
            const resultado = await axios("http://localhost:4000/cuestionarios/"+id)
            setFormulario({"titulo":resultado.data[0].titulo,"creador_id":resultado.data[0].creador_id,"preguntas":resultado.data[0].preguntas})
       }catch(error){
        console.log(error)
            }
        }
       //el buscar preguntas es nuevo
       //buscaPreguntas()
       buscaCuestionario()
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
            await axios.put("http://localhost:4000/cuestionarios/"+id,formulario)
        }catch(error){
            console.log(error)
        }
        navega("/")
    }

    return (
        <>
        <div className="card text-white bg-dark mb-3" style={{maxWidth: "200rem" , display: "inline-block", margin: "10px"}}>
        <input class="form-control text-white bg-purple border border-light" type="text" onChange={gestionFormulario} id="titulo" name="titulo" value={formulario.titulo}/>
        <br />
        <select className="form-control text-white bg-purple border border-light" id="creador_id" name="creador_id" onChange={gestionFormulario} value={formulario.creador_id}>
            {
                usuarios.map((usuario,index)=>{
                    return (
                        <option value={usuario.id} key={index}>{usuario.nombre}</option>
                    )
                })
            }
        </select>
        <br />
        <button onClick={enviarCuestionario} className="btn btn-success btn-lg w-100">Enviar Cambios</button>

        <Preguntas/>
        </div>
        </>
    )
}

export default FormularioCuestionarioEditar