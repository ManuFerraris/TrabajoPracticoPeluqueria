Proyecto - Desarrollo de Software 2024 / 2025
Integrantes

* 51482 – De Carlos David

* 50385 – Ferramondo Pedro

* 51937 – Ferraris Manuel

Tema: Sistema de gestión para peluquería – “Colman's hairstyle”

Propósito del proyecto

  El objetivo principal es desarrollar una plataforma web que permita a los clientes gestionar sus turnos en la peluquería de forma autónoma y eficiente. El sistema busca profesionalizar la experiencia tanto para el cliente como para el equipo de trabajo, ofreciendo funcionalidades clave como:

* Registro y autenticación de clientes

* Solicitud de turnos según disponibilidad, servicio y peluquero

* Selección del medio de pago (Stripe o efectivo)

* Visualización de historial de turnos y pagos

* Generación de comprobantes en PDF para cada pago

* Envío automático de recibos por mail en pagos en efectivo

* Panel administrativo para gestión de servicios, turnos y auditoría

Funcionalidades destacadas
* Gestión de turnos: los clientes pueden elegir fecha, horario, peluquero y servicio.

* Pagos integrados: integración con Stripe para pagos online y soporte para pagos en efectivo (en sucursal).

* Comprobantes PDF: generación automática de recibos descargables y trazables.

* Envío por mail: los comprobantes se envían por correo en pagos en con stripe y efectivo.

* Historial y auditoría: tanto clientes como admins pueden consultar registros detallados.

* Backend robusto: validaciones, trazabilidad, seguridad y lógica escalable.

Tecnologias utilizadas

Backend:

* Node.js + Express: Motor principal del servidor y manejo de rutas HTTP
* TypeScript: Tipado estático para mayor robustez y mantenibilidad
* MikroORM + MySQL:	ORM para modelado de entidades y persistencia en base de datos relacional
* JWT (jsonwebtoken):	Autenticación segura basada en tokens
* Stripe API:	Integración de pagos online con tarjetas
* pdfkit:	Generación de comprobantes PDF en el backend
* nodemailer:	Envío de correos electrónicos con comprobantes adjuntos
* Redis + ioredis:	Cache y almacenamiento temporal para sesiones o tokens
* dayjs + date-fns-tz:	Manejo de fechas y zonas horarias con precisión
* validator:	Validación de emails, tokens y datos sensibles
* Jest + ts-jest:	Testing unitario y de integración

Frontend:

* React + TypeScript:	Interfaz dinámica y tipada para el cliente
* React Router DOM:	Navegación entre vistas y rutas protegidas
* Axios:	Comunicación con el backend vía HTTP
* Stripe.js:	Checkout seguro y embebido para pagos con tarjeta
* Bootstrap + Icons:	Estilos visuales y componentes responsivos
* SweetAlert2:	Alertas visuales para feedback del usuario




Instalacion y ejecucion del proyecto


Backend - API REST

Requisitos previos:


* Node.js v18+

* MySQL o MariaDB corriendo localmente

* Redis (opcional, si se usa para cache o sesiones)

* Stripe cuenta de prueba (para pagos)

Archivo .env con las siguientes variables:

* ACCESS_TOKEN_SECRET=tuClave 

* REFRESH_TOKEN_SECRET=tuClave

* DATABASE_URL=rutaBaseDatos

* EMAIL_USER =tuemail@gmail.com

* EMAIL_PASS=claveGeneradaEnGmail

* JWT_SECRET=claveJWT

* FRONTEND_ORIGIN="http://localhost:3001"

* STRIPE_SECRET_KEY=sk_test...

* STRIPE_WEBHOOK_SECRET=whsec_a...



Correr el codigo con: npm run start:dev



Frontend – Cliente React

Requisitos previos:


* Node.js v18+

Archivo .env con:

* REACT_APP_STRIPE_PUBLIC_KEY=pk_test_

Correr el codigo con: npm run start:dev
