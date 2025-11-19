# Backend (Node.js + PostgreSQL)

API sencilla en Express para autenticación y sincronización de datos del gestor de ahorros usando PostgreSQL.

## Configuración

1. Copia `.env.example` a `.env` y ajusta las credenciales de PostgreSQL y CORS.
2. Instala dependencias:

```bash
cd backend
npm install
```

3. Crea las tablas ejecutando `schema.sql` en tu base de datos (host por defecto `15.237.178.217`).
4. Arranca el servidor:

```bash
npm run dev
# o
npm start
```

## Endpoints principales
- `POST /api/auth/register` – crear usuario y sesión inicial.
- `POST /api/auth/login` – iniciar sesión y obtener token.
- `POST /api/auth/sync-code` – regenerar código de sincronización (requiere `Authorization: Bearer <token>`).
- `GET /api/records` – obtener datos financieros del usuario autenticado.
- `PUT /api/records` – guardar datos financieros del usuario autenticado.

Los endpoints protegidos requieren el header `Authorization: Bearer <token>`.
