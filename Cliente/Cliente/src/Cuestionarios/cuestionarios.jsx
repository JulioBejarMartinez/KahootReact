import React, { useEffect , useState} from "react"
import axios from "axios"
import Cuestionario from "./cuestionario"
import { useNavigate} from "react-router-dom"

const Cuestionarios = () => {

    const navega = useNavigate()
    const [cuestionarios,setCuestionarios]=useState([])

    useEffect(()=>{
        const buscaCuestionarios = async () =>{
            try {
                const resultado = await axios.get("http://localhost:4000/cuestionarios")
                console.log(resultado.data)
                setCuestionarios(resultado.data)
            } catch (error) {
                console.log(error)
            }
        }
        buscaCuestionarios()
    },[])

    const anadeCuestionario = async () => { 
        navega("/formularioCuestionario")
    }

    return (
        <>
        <div class="alert alert-dismissible alert-primary d-flex justify-content-center align-items-center ">
        <strong className="position-absolute top-50 start-50 translate-middle">CUESTIONARIOS</strong> 
        <button onClick={anadeCuestionario} name="anadeCuestionario" className="btn btn-success btn-lg ms-auto" data-bs-dismiss="alert" >Añadir un Cuestionario</button>
        </div>
            <div>
            {cuestionarios.map((cuestionario)=>{
                return (
                    <Cuestionario 
                    titulo={cuestionario.titulo} 
                    id={cuestionario.id} 
                    key={cuestionario.id}/>
                )
            })}
            <div className="mt-auto">
            </div>
            </div>
        </>
    )
}

/*return (
    <Container>
        <h2 className="my-4">Cuestionarios</h2>
        <Row>
            {cuestionarios.map((cuestionario) => (
                <Col key={cuestionario.id} sm={12} md={6} lg={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>{cuestionario.titulo}</Card.Title>
                            <Button variant="primary" onClick={() => navega(`/formularioCuestionarioEditar/${cuestionario.id}`)}>Editar</Button>
                            <Button variant="danger" className="ml-2" onClick={() => navega(`/cuestionarios/${cuestionario.id}`)}>Borrar</Button>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
        <Button variant="success" onClick={anadeCuestionario} name="anadeCuestionario">Añadir un Cuestionario</Button>
    </Container>
);
};*/

export default Cuestionarios