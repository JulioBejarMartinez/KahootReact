import React, { useEffect , useState} from "react";
import { useNavigate} from "react-router-dom";
import axios from "axios";

const generarPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const CrearSala = () => {
    const navega = useNavigate();
    const [cuestionarios, setCuestionarios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [sala, setSala] = useState({
        nombre_de_la_sala: '',
        pin_de_la_sala: generarPin(),
        cuestionario_id: '',
        creador_id: '',
        creador_nombre: ''
    });

    useEffect(() => {
        const buscaCuestionarios = async () => {
            try {
                const resultado = await axios.get("http://localhost:4000/cuestionarios");
                console.log(resultado.data);
                setCuestionarios(resultado.data);
            } catch (error) {
                console.log(error);
            }
        };
        const buscaUsuarios = async () => {
            try {
                const resultado = await axios("http://localhost:4000/usuarios");
                console.log("estoy por aqui");
                setUsuarios(resultado.data);
            } catch (error) {
                console.log(error);
            }
        };
        buscaCuestionarios();
        buscaUsuarios();
    }, []);

    const crearUnaSala = async (e) => {
        e.preventDefault();
        try {
            // Obtener el nombre del creador basado en el creador_id
            const creador = usuarios.find(usuario => usuario.id === parseInt(sala.creador_id));
            const salaConNombreCreador = {
                ...sala,
                creador_nombre: creador ? creador.nombre : ''
            };
            console.log("Datos de la sala a enviar:", salaConNombreCreador);
            await axios.put("http://localhost:4000/partidas", salaConNombreCreador);
            navega(`/SalaPartida/${sala.pin_de_la_sala}`, { state: { jugador: { id: sala.creador_id, nombre: salaConNombreCreador.creador_nombre } } });
        } catch (error) {
            console.log(error);
        }
    };

    const gestionSala = (e) => {
        setSala({
            ...sala,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <h1>Crear Sala</h1>
            <div className="card text-white bg-dark mb-3" style={{maxWidth: "20rem" , display: "inline-block", margin: "10px"}}>
            <form onSubmit={crearUnaSala}>
                <input
                    className="form-control text-white bg-purple border border-light"
                    id="nombre_de_la_sala"
                    type="text"
                    name="nombre_de_la_sala"
                    placeholder="Nombre de la Sala"
                    onChange={gestionSala}
                    value={sala.nombre_de_la_sala}
                />
                <br />
                <select
                    className="form-control text-white bg-purple border border-light"
                    name="creador_id"
                    onChange={gestionSala}
                    value={sala.creador_id}
                >
                    <option value="">Elige un Usuario</option>
                    {usuarios.map((usuario, index) => (
                        <option value={usuario.id} key={index}>
                            {usuario.nombre}
                        </option>
                    ))}
                </select>
                <br />
                <select
                    className="form-control text-white bg-purple border border-light"
                    name="cuestionario_id"
                    onChange={gestionSala}
                    value={sala.cuestionario_id}
                >
                    <option value="">Elige un Cuestionario</option>
                    {cuestionarios.map((resultado, index) => (
                        <option value={resultado.id} key={index}>
                            {resultado.titulo}
                        </option>
                    ))}
                </select>
                <br />
                <button type="submit" className="btn btn-success btn-lg w-100">Crear Sala</button>
            </form>
            </div>
        </>
    );
};

export default CrearSala;