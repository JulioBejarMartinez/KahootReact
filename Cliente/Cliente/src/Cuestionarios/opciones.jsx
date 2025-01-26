import axios from "axios";
import React from "react";
import { useState , useEffect} from "react";
import { useParams, useLocation } from "react-router-dom";
import Opcion from "./opcion";


const Opciones = () => {  

    const { id } = useParams();
    const location = useLocation();
    const [opciones, setOpciones] = useState([]);
    const [nuevoTexto, setNuevoTexto] = useState("");
    const [nuevoEsCorrecta, setNuevoEsCorrecta] = useState("");

    useEffect(() => {
        const buscaOpciones = async () => {
            try {
                const resultado = await axios.get(`http://localhost:4000/opciones/${id}`);
                console.log(resultado.data)
                setOpciones(resultado.data);
            } catch (error) {
                console.log(error);
            }
        };
        buscaOpciones();
    }, [id]);

    const handleDelete = async (idOpcion) => {
        try {
            await axios.delete(`http://localhost:4000/opciones/${idOpcion}`);
            setOpciones(opciones.filter(opcion => opcion.id !== idOpcion));
        } catch (error) {
            console.log(error);
        }
    };

    const handleEdit = async (idOpcion, nuevoTexto, nuevoEsCorrecta) => {
        try {
            await axios.put(`http://localhost:4000/opciones/${idOpcion}`, { texto: nuevoTexto, es_correcta: nuevoEsCorrecta });
            setOpciones(opciones.map(opcion => opcion.id === idOpcion ? { ...opcion, texto: nuevoTexto, es_correcta: nuevoEsCorrecta } : opcion));
        } catch (error) {
            console.log(error);
        }
    };

    const handleAdd = async () => {
        try {
            const resultado = await axios.post(`http://localhost:4000/opciones`, { texto: nuevoTexto, es_correcta: nuevoEsCorrecta, pregunta_id: id });
            setOpciones([...opciones, resultado.data]);
            setNuevoTexto("");
            setNuevoEsCorrecta("");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        
        <div>
        <div className="card text-white bg-dark mb-3" style={{maxWidth: "200rem" , display: "inline-block", margin: "10px"}}>
        <h2>Opciones de la pregunta: {location.state?.texto}</h2>
        <hr/>
        {Array.isArray(opciones) && opciones.map((opcion) => (
                <Opcion
                key={opcion.id}
                id={opcion.id}
                texto={opcion.texto}
                es_correcta={opcion.es_correcta}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
            ))}
            <input class="form-control text-white bg-purple border border-light" type="text" value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} placeholder="Nueva opción" />
            <br />
            <input class="form-control text-white bg-purple border border-light" type="number" value={nuevoEsCorrecta} onChange={(e) => setNuevoEsCorrecta(e.target.value)} placeholder="Es correcta" />
            <br />
            <button onClick={handleAdd} className="btn btn-success btn-lg w-100">Añadir Opción</button>
            </div>
        </div>
       
    );
}

export default Opciones;