# Backend de práctica — Cursos y Aprendices

API REST con **Node + Express + MongoDB (Mongoose)**, construida con la misma
arquitectura del proyecto `repfora` (rama `backend`), pero reducida a 2 modelos
para que sea fácil de entender.

---

## 1. Estructura de carpetas

```
backend prueba/
├── app.js                  <- punto de entrada: crea el Server y lo arranca
├── server.js               <- clase Server: middlewares + rutas + conexión BD
├── database.js             <- conexión a MongoDB
├── .env                    <- variables de entorno (NO se sube a git)
├── models/                 <- esquemas de Mongoose (cómo se ve el dato)
│   ├── Curso.js
│   ├── Aprendiz.js
│   └── Usuario.js
├── helpers/                <- consultas de apoyo para validar (¿existe?, ¿repetido?)
│   ├── curso.helper.js
│   ├── aprendiz.helper.js
│   ├── usuario.helper.js
│   └── generarJWT.js       <- firma el token al iniciar sesión
├── validations/            <- cadenas de express-validator por ruta
│   ├── curso.validation.js
│   ├── aprendiz.validation.js
│   └── usuario.validation.js
├── middlewares/            <- middlewares reutilizables
│   ├── validateFields.js
│   └── validateJWT.js      <- protege las rutas privadas
├── controller/             <- lógica: recibe req, habla con el modelo, responde
│   ├── curso.controller.js
│   ├── aprendiz.controller.js
│   └── usuario.controller.js
└── routes/                 <- define URL + validación + controlador
    ├── cursos.routes.js
    ├── aprendices.routes.js
    └── usuarios.routes.js
```

### El flujo de una petición (esto es lo importante)

```
Cliente (Vue)
   │  POST /api/aprendices/register  { documento, nombre, email, curso }
   ▼
server.js        ── middlewares globales: json(), cors(), morgan()
   ▼
routes/aprendices.routes.js  ── ¿qué URL y qué método?
   ▼
validations/aprendiz.validation.js  ── ¿los datos son válidos?
   │      └── helpers/aprendiz.helper.js  ── consulta la BD (¿el curso existe?)
   │      └── middlewares/validateFields.js ── si hubo errores → 400 y corta aquí
   ▼
controller/aprendiz.controller.js   ── guarda usando el modelo
   ▼
models/Aprendiz.js  ── Mongoose → MongoDB
   ▼
res.json({ msg: "Aprendiz registrado correctamente" })
```

**Regla mental:** la ruta *no* valida y *no* consulta la BD. El controlador *no*
valida. Cada carpeta hace una sola cosa.

---

## 2. Instalación

```bash
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
npm run seed                # datos de ejemplo + usuario administrador
npm run dev
```

El `seed` es obligatorio la primera vez: la API pide token y sin un usuario en
la base de datos no habría con qué iniciar sesión. Deja creado
`admin@sena.edu.co` / `123456`.

Necesitas MongoDB corriendo en local (`mongodb://127.0.0.1:27017`) o una URL de
MongoDB Atlas en `MONGO_URL`.

Si todo va bien:

```
Servidor en http://localhost:4500
Conectado a la base de datos
```

Prueba rápida: <http://localhost:4500/life>

---

## 3. Modelos

### Curso
| Campo    | Tipo   | Notas                        |
|----------|--------|------------------------------|
| codigo   | String | obligatorio, único           |
| nombre   | String | obligatorio                  |
| duracion | Number | obligatorio, horas (> 0)     |
| status   | Number | 0 = activo, 1 = inactivo     |

### Aprendiz
| Campo     | Tipo     | Notas                                  |
|-----------|----------|----------------------------------------|
| documento | String   | obligatorio, único                     |
| nombre    | String   | obligatorio                            |
| email     | String   | obligatorio, formato email             |
| curso     | ObjectId | **relación** → `ref: "Curso"`          |
| status    | Number   | 0 = activo, 1 = inactivo               |

### Usuario
| Campo    | Tipo   | Notas                                        |
|----------|--------|----------------------------------------------|
| nombre   | String | obligatorio                                  |
| email    | String | obligatorio, único, con el que inicia sesión |
| password | String | obligatorio, mínimo 6, guardado **hasheado** |
| rol      | String | `"ADMIN"` o `"USER"` (por defecto `USER`)    |
| status   | Number | 0 = activo, 1 = inactivo                     |

> **La contraseña nunca se guarda en texto plano.** Se hashea con `bcryptjs`
> antes de `save()`. El hash va en un solo sentido: al iniciar sesión no se
> "desencripta" nada, se compara hash contra hash con `bcrypt.compareSync`.

> **El modelo tiene un `toJSON`** que elimina `password` y `__v` de toda
> respuesta. Sin él, el login le devolvería el hash al frontend y se vería en la
> pestaña Network del navegador.

> **No borramos registros.** Se usa `status` (borrado lógico), igual que en repfora.
> Por eso hay rutas `active` / `inactive` en lugar de `DELETE`.

> **`populate("curso")`**: en la BD el aprendiz guarda solo el id del curso.
> `populate` le pide a Mongoose que reemplace ese id por el objeto completo del
> curso en la respuesta. Así el frontend puede mostrar `aprendiz.curso.nombre`.

---

## 4. Endpoints

Base: `http://localhost:4500`

### Autenticación — qué es público y qué no

| Ruta                       | ¿Necesita token? |
|----------------------------|------------------|
| `POST /api/usuarios/login` | **No** — es la única puerta pública |
| `POST /api/usuarios/register` | **Sí** — crear cuentas es una tarea interna |
| `GET/PUT /api/usuarios/...` (CRUD) | **Sí** |
| `/api/cursos`              | **Sí**           |
| `/api/aprendices`          | **Sí**           |

Los recursos completos se protegen en `server.js`, en una línea por recurso:

```js
this.app.use("/api/usuarios", routerUsuario);                  // adentro decide ruta por ruta
this.app.use("/api/cursos", validateJWT, routerCurso);         // requiere token
this.app.use("/api/aprendices", validateJWT, routerAprendiz);  // requiere token
```

Y como en usuarios conviven una ruta pública y el CRUD privado, ahí el
middleware va por ruta (`routes/usuarios.routes.js`):

```js
routerUsuario.post("/login", validateLogin, loginUsuario);                    // publico
routerUsuario.post("/register", validateJWT, validateRegisterUsuario, ...);   // requiere token
routerUsuario.get("/", validateJWT, getUsuarios);                             // requiere token
```

> **¿Y el primer usuario, entonces?** Lo crea el `seed`, que escribe directo en
> la base de datos sin pasar por la API. De ahí en adelante, cada cuenta nueva la
> crea alguien que ya inició sesión.

El token viaja en la cabecera **`x-token`** (no en el body ni en la URL):

```
x-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2NmYw...
```

Si falta, está vencido (dura 4 h) o fue alterado, la respuesta es `401`:

```json
{ "msg": "No hay token en la peticion" }
{ "msg": "Token no valido" }
```

> `401` = "no sé quién eres". Es el código que el frontend usa para cerrar la
> sesión y mandar al login. No confundir con `400` (datos inválidos).

### Usuarios — `/api/usuarios`
| Método | Ruta                         | Token | Descripción                        |
|--------|------------------------------|-------|------------------------------------|
| POST   | `/api/usuarios/login`        | No    | Iniciar sesión y recibir el token  |
| POST   | `/api/usuarios/register`     | Sí    | Crear cuenta (tarea interna)       |
| GET    | `/api/usuarios`              | Sí    | Lista todos (`?status=0` filtra)   |
| GET    | `/api/usuarios/:id`          | Sí    | Uno por id                         |
| PUT    | `/api/usuarios/update/:id`   | Sí    | Actualizar                         |
| PUT    | `/api/usuarios/active/:id`   | Sí    | Activar                            |
| PUT    | `/api/usuarios/inactive/:id` | Sí    | Desactivar (no la propia cuenta)   |

Body de registro (recuerde mandar la cabecera `x-token`):
```json
{ "nombre": "Docente Prueba", "email": "docente@sena.edu.co", "password": "123456", "rol": "USER" }
```

Body de actualización (`password` y `rol` son opcionales: si llegan vacíos no
se modifican):
```json
{ "nombre": "Docente Prueba", "email": "docente@sena.edu.co", "password": "", "rol": "ADMIN" }
```

Body de login y su respuesta:
```json
{ "email": "admin@sena.edu.co", "password": "123456" }
```
```json
{
  "usuario": { "_id": "...", "nombre": "ADMINISTRADOR", "email": "admin@sena.edu.co", "rol": "ADMIN", "status": 0 },
  "token": "eyJhbGciOi..."
}
```

> **Usuario de prueba:** `npm run seed` crea `admin@sena.edu.co` / `123456`.

### Cursos — `/api/cursos`
| Método | Ruta                        | Descripción                    |
|--------|-----------------------------|--------------------------------|
| GET    | `/api/cursos`               | Lista todos (`?status=0` filtra)|
| GET    | `/api/cursos/:id`           | Uno por id                     |
| POST   | `/api/cursos/register`      | Crear                          |
| PUT    | `/api/cursos/update/:id`    | Actualizar                     |
| PUT    | `/api/cursos/active/:id`    | Activar                        |
| PUT    | `/api/cursos/inactive/:id`  | Desactivar                     |

Body de creación/actualización:
```json
{ "codigo": "ADSO-01", "nombre": "Analisis y desarrollo de software", "duracion": 2640 }
```

### Aprendices — `/api/aprendices`
| Método | Ruta                             | Descripción                    |
|--------|----------------------------------|--------------------------------|
| GET    | `/api/aprendices`                | Lista todos (con curso poblado)|
| GET    | `/api/aprendices/curso/:curso`   | Aprendices de un curso         |
| GET    | `/api/aprendices/:id`            | Uno por id                     |
| POST   | `/api/aprendices/register`       | Crear                          |
| PUT    | `/api/aprendices/update/:id`     | Actualizar                     |
| PUT    | `/api/aprendices/active/:id`     | Activar                        |
| PUT    | `/api/aprendices/inactive/:id`   | Desactivar                     |

Body de creación/actualización:
```json
{
  "documento": "1098765432",
  "nombre": "Ana Gomez",
  "email": "ana@sena.edu.co",
  "curso": "66f0a1b2c3d4e5f6a7b8c9d0"
}
```

### Formato de respuestas (consistente, como en repfora)
- Éxito de escritura: `{ "msg": "Curso registrado correctamente" }`
- Éxito de lectura: el objeto o el array directo
- Error de validación (400): `{ "msg": "Error en la validacion", "errors": ["El codigo es obligatorio"] }`
- Error genérico (400): `{ "msg": "No fue posible terminar la operacion" }`
- Sin sesión (401): `{ "msg": "No hay token en la peticion" }`

### Probar la API protegida desde la terminal

```bash
# 1) Sin token -> 401
curl http://localhost:4500/api/cursos

# 2) Iniciar sesion y copiar el token de la respuesta
curl -X POST http://localhost:4500/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@sena.edu.co\",\"password\":\"123456\"}"

# 3) Repetir el GET mandando el token
curl http://localhost:4500/api/cursos -H "x-token: PEGA_AQUI_EL_TOKEN"
```

En Postman o Thunder Client, el token va en la pestaña **Headers**, con la
clave `x-token`.

---

## 5. Cómo agregar un tercer modelo (receta)

1. `models/Nuevo.js` — el esquema.
2. `helpers/nuevo.helper.js` — funciones que consultan la BD y lanzan `Error`.
3. `validations/nuevo.validation.js` — arrays de `check(...)` + `validateFields`.
4. `controller/nuevo.controller.js` — un objeto con las funciones CRUD.
5. `routes/nuevos.routes.js` — `router.metodo(ruta, validacion, controlador)`.
6. Registrarlo en `server.js`: `this.app.use("/api/nuevos", routerNuevo);`

Siempre en ese orden. Nada más.

---

## 6. Siguiente paso

Ver [GUIA-FRONTEND.md](GUIA-FRONTEND.md) para conectar este backend con Vue.
