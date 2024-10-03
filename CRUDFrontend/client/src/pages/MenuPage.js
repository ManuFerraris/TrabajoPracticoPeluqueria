import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './MenuPage.css';
const MenuPage = () => {
    const navigate = useNavigate();

    return (
        <Container className="menu-container d-flex flex-column justify-content-center align-items-center min-vh-100">
            <h1 className="text-white mb-4">Bienvenido al Sistema de Gestión de Peluqueria</h1>
            <Row className="justify-content-center">

                <Col xs={12} sm={6} md={4} className="mb-4">
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Registro de Peluquero</Card.Title>
                            <Card.Text>Gestiona la información de los peluqueros.</Card.Text>
                            <Button variant="primary" onClick={() => navigate('/peluquero')}>Ir al Registro</Button>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col xs={12} sm={6} md={4} className="mb-4">
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Alta de Localidad</Card.Title>
                            <Card.Text>Administra las localidades disponibles.</Card.Text>
                            <Button variant="primary" onClick={() => navigate('/localidad')}>Ir al Alta de Localidad</Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} md={4} className="mb-4">
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Alta Tipo de Servicio</Card.Title>
                            <Card.Text>Administra los tipos de servicios disponibles.</Card.Text>
                            <Button variant="primary" onClick={() => navigate('/tiposervicio')}>Ir al Alta Tipo de servicio</Button>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>
        </Container>
    );
};

export default MenuPage;
