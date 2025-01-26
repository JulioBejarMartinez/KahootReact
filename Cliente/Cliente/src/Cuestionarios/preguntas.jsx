import React, { useEffect, useState } from "react";
import axios from "axios";
import Pregunta from "./pregunta";
import { useParams } from "react-router-dom";

const Preguntas = () => {
    const { id } = useParams();
    const [preguntas, setPreguntas] = useState([]);
    const [nuevoTexto, setNuevoTexto] = useState("");
    const [nuevoTiempoRespuesta, setNuevoTiempoRespuesta] = useState("");

    useEffect(() => {
        const buscaPreguntas = async () => {
            try {
                const resultado = await axios.get(`http://localhost:4000/preguntas/`+id);
                setPreguntas(resultado.data);
            } catch (error) {
                console.log(error);
            }
        };
        buscaPreguntas();
    }, [id]);

    const manejarBorrarPregunta = (idPregunta) => {
        setPreguntas(preguntas.filter(pregunta => pregunta.id !== idPregunta));
    };

    const manejarEditarPregunta = (idPregunta, nuevoTexto, nuevoTiempoRespuesta) => {
        setPreguntas(preguntas.map(pregunta => pregunta.id === idPregunta ? { ...pregunta, texto: nuevoTexto, tiempo_respuesta: nuevoTiempoRespuesta } : pregunta));
    };

    const manejarAnadirPregunta = async () => {
        try {
            const resultado = await axios.post(`http://localhost:4000/preguntas`, { texto: nuevoTexto, tiempo_respuesta: nuevoTiempoRespuesta, cuestionario_id: id });
            setPreguntas([...preguntas, resultado.data]);
            setNuevoTexto("");
            setNuevoTiempoRespuesta("");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <hr />
            <h2>Preguntas del Cuestionario {id}</h2>
            <hr />
            {preguntas.map((pregunta) => (
                <Pregunta key={pregunta.id} id={pregunta.id} texto={pregunta.texto} tiempo_respuesta={pregunta.tiempo_respuesta} onDelete={manejarBorrarPregunta} onEdit={manejarEditarPregunta} />
            ))}
            <input class="form-control text-white bg-purple border border-light" type="text" value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} placeholder="Nueva pregunta" />
            <br />
            <input class="form-control text-white bg-purple border border-light" type="number" value={nuevoTiempoRespuesta} onChange={(e) => setNuevoTiempoRespuesta(e.target.value)} placeholder="Tiempo de respuesta" />
            <br />
            <button onClick={manejarAnadirPregunta} className="btn btn-success btn-lg w-100">Añadir Pregunta</button>
        </div>
    );
};

export default Preguntas;