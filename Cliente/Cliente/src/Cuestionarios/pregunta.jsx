import React, { useState } from "react";
import { useNavigate, } from "react-router-dom";
import axios from "axios";

const Pregunta = ({ id, texto, tiempo_respuesta, onDelete, onEdit }) => {

    const navega=useNavigate()
    const [editTexto, setEditTexto] = useState(texto);
    const [editTiempoRespuesta, setEditTiempoRespuesta] = useState(tiempo_respuesta);

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:4000/preguntas/${id}`);
            onDelete(id);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:4000/preguntas/${id}`, { texto: editTexto, tiempo_respuesta: editTiempoRespuesta });
            onEdit(id, editTexto, editTiempoRespuesta);
        } catch (error) {
            console.log(error);
        }
    };

    const iraOpciones = () => {
        navega("/opciones/"+id, { state: { texto: editTexto } })
    };

    return (
        <>
        <div>
            <input
                class="form-control text-white bg-purple border border-light"
                type="text"
                value={editTexto}
                onChange={(e) => setEditTexto(e.target.value)}
            />
            <br />
            <input
            class="form-control text-white bg-purple border border-light"
                type="number"
                value={editTiempoRespuesta}
                onChange={(e) => setEditTiempoRespuesta(e.target.value)}
            />
            <br />
            <div class="btn-group" role="group" aria-label="Basic example" style={{display: "flex", justifyContent: "center"}}>
            <button class="btn btn-warning" onClick={iraOpciones}>Opciones</button>
            <button class="btn btn-success" onClick={handleSave}>Guardar</button>
            <button class="btn btn-danger" onClick={handleDelete}>Borrar</button> 
            </div>   
        </div>
        <br/>
        </>
    );
};

export default Pregunta;