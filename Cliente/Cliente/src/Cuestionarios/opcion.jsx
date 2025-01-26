import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate, } from "react-router-dom";

const Opcion = ({id, texto, es_correcta, onDelete, onEdit}) => {

    const navegacion = useNavigate()
    const [editTexto, setEditTexto] = useState(texto);
    const [editEsCorrecta, setEditEsCorrecta] = useState(es_correcta);
    
    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:4000/opciones/${id}`);
            onDelete(id);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:4000/opciones/${id}`, { texto: editTexto, es_correcta: editEsCorrecta });
            onEdit(id, editTexto, editEsCorrecta);
        } catch (error) {
            console.log(error);
        }
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
            <select
                class="form-control text-white bg-purple border border-light"
                value={editEsCorrecta}
                onChange={(e) => setEditEsCorrecta(e.target.value)}
            >
                <option value={1}>Sí</option>
                <option value={0}>No</option>
            </select>
            <br />
            <div class="btn-group" role="group" aria-label="Basic example" style={{display: "flex", justifyContent: "center"}}>
            <button class="btn btn-success" onClick={handleSave}>Guardar</button>
            <button class="btn btn-danger"  onClick={handleDelete}>Borrar</button>
            </div>
        </div>
        <br />
        </>
    );
}

export default Opcion;