# ⚽ Academia HE-5 — Sistema de Gestión Deportiva, Finanzas y Portal de Tutores

Plataforma web integral desarrollada a medida para la **Academia de Fútbol HE-5** (Zacatecas, México). El sistema centraliza y automatiza toda la operación del club: administración de jugadores, categorías, roles de juego, cobro de colegiaturas con tarjeta mediante Stripe, liquidación de arbitrajes y un portal de autoservicio para padres de familia.

---

## 📌 Contexto y Objetivo del Sistema

Las escuelas y academias deportivas comúnmente enfrentan problemas de control administrativo al gestionar listas de asistencia en papel, cobranza manual en efectivo y falta de transparencia en los estados de cuenta de los alumnos.

Este software fue diseñado para resolver esa problemática de extremo a extremo, dotando a la directiva del club y al cuerpo técnico de una herramienta centralizada y accesible desde cualquier dispositivo, al tiempo que brinda a los padres de familia certeza sobre los pagos, calendarios y estadísticas de sus hijos.

---

## 🚀 Módulos y Funcionalidades Principales

### 1. Panel de Administración y Control Deportivo
* **Expediente de Alumnos:** Registro detallado con datos generales, fecha de nacimiento, categoría principal y secundaria (refuerzos), información médica y contacto de emergencia.
* **Procesamiento de Fotografías:** Recorte y ajuste automático de imágenes a proporción estándar (5:6) para la expedición de credenciales oficiales del club.
* **Categorías y Plantillas:** Organización dinámica por año de nacimiento para coordinar torneos locales e intercolegiales.
* **Control de Partidos y Torneos:**
  * Programación de partidos: fecha, hora, cancha/sede y rival.
  * Captura de resultados en tiempo real y registro de goles individuales por alumno.
  * Control logístico de arbitrajes: registro del costo por encuentro y cálculo del balance pagado/pendiente a los colegiados.

### 2. Módulo Financiero y Pasarela de Pagos Stripe
* **Asignación de Cargos:** Generación automática de conceptos periódicos (inscripción anual, apoyo de material, uniformes y colegiaturas mensuales).
* **Cobros en Línea con Stripe:**
  * Integración con **Stripe Checkout** para pagos seguros con tarjetas de débito y crédito.
  * Conciliación automática de pagos mediante **Webhooks** que actualizan inmediatamente el estatus de la deuda en la base de datos.
  * Cálculo dinámico de importes brutos para absorber la comisión bancaria de Stripe de manera transparente.
* **Caja y Monedero Digital:** Registro de pagos en efectivo o transferencia directa, y abono a un monedero digital para saldos a favor.
* **Reportes y Auditoría:** Descarga de reportes financieros en Excel y PDF con filtros por categoría, mes y concepto.

### 3. Portal de Autoservicio para Padres de Familia (Tutores)
* **Acceso Seguro por Tutor:** Cada padre de familia accede a un portal personalizado donde visualiza únicamente a los jugadores vinculados a su tutoría.
* **Estado de Cuenta Transparente:** Resumen visual de cuotas cubiertas, saldos pendientes y botón de pago directo con tarjeta.
* **Próximos Partidos:** Agenda de juegos programados con sede, horario y mapa de ubicación.
* **Descarga de Credenciales Oficiales:** Generación automática en PDF de la credencial deportiva del alumno lista para imprimir.

### 4. Notificaciones y Comunicación
* Generación de enlaces directos a WhatsApp para avisos de partidos, recordatorios de cuotas y confirmación de asistencia.

---

## 🛠️ Stack Tecnológico y Arquitectura

* **Backend:** [Laravel 11](https://laravel.com/) (PHP 8.2+) con Eloquent ORM.
* **Frontend:** [Inertia.js](https://inertiajs.com/) con [Vue 3](https://vuejs.org/) y [Tailwind CSS](https://tailwindcss.com/) para una experiencia de usuario fluida estilo Single Page Application (SPA).
* **Base de Datos:** MySQL / MariaDB con claves foráneas, índices de búsqueda y transacciones ACID.
* **Pasarela de Pago:** Stripe PHP SDK (`stripe/stripe-php`) con validación de firmas Webhook.
* **Generación de Documentos:**
  * [DomPDF](https://github.com/barryvdh/laravel-dompdf) para credenciales y estados de cuenta oficiales.
  * [PhpSpreadsheet](https://github.com/PHPOffice/PhpSpreadsheet) para exportación de balances a Excel.

---

## 💻 Requisitos del Entorno

* PHP >= 8.2 (con extensiones `pdo_mysql`, `mbstring`, `openssl`, `gd`, `zip`, `curl`).
* Composer 2.x
* Node.js >= 18.x y npm
* Servidor MySQL 8.x o MariaDB 10.4+

---

## ⚙️ Instalación y Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ShadowCreat18/academia-he5.git
   cd academia-he5
   ```

2. **Instalar dependencias de PHP y JavaScript:**
   ```bash
   composer install
   npm install
   ```

3. **Configurar las variables de entorno:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configurar los accesos en `.env`:**
   ```env
   APP_NAME="Academia HE-5"
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=academia_he5
   DB_USERNAME=tu_usuario
   DB_PASSWORD=tu_password

   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Ejecutar migraciones y sembrado inicial:**
   ```bash
   php artisan migrate --seed
   ```

6. **Compilar recursos de interfaz y servir la aplicación:**
   ```bash
   npm run build
   php artisan serve
   ```

---

## 🔒 Seguridad y Buenas Prácticas

* **Control de Acceso Basado en Roles (RBAC):** Middleware para restringir accesos entre Administrador, Entrenador y Padre de Familia.
* **Protección de Datos Personales:** Rutas de eliminación de datos conforme a políticas de privacidad y protección de menores.
* **Validación de Webhooks:** Verificación criptográfica de las peticiones de Stripe mediante el secreto del Webhook para prevenir alteraciones de saldo.

---

## 👤 Autor

* **Christian Esparza** — Diseño, desarrollo e implementación integral.
