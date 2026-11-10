# iPhonix: e-commerce de productos Apple

SPA de e-commerce con dos roles (cliente y administrador), hecha con **React + TypeScript + Vite**,
**Firebase** (Authentication + Firestore), **AWS S3** para las imágenes y **Vercel** para el deploy
y las funciones serverless.

🔗 **Producción:** https://proyecto-m5-mateo-giussano.vercel.app

El código está en la carpeta [`ecommerce-projectM5/`](ecommerce-projectM5).

## Contexto del cliente

iPhonix es una tienda que vende productos Apple (iPhone, iPad, Mac, Apple Watch, AirPods y accesorios).
Necesitaba dos experiencias:

- **Clientes:** navegan el catálogo, buscan y filtran, guardan favoritos, arman un carrito, compran y
  siguen el estado de sus órdenes.
- **Administradores:** gestionan el catálogo (con imágenes) y las órdenes de todos los clientes desde
  un panel protegido.

## Funcionalidades

| Área | Qué hace |
|---|---|
| Autenticación | Registro y login con email o Google, logout, sesión persistente al recargar |
| Catálogo | Listado, detalle, búsqueda en el Header (guardada en la URL) y filtro por categoría |
| Carrito | Context API + `useReducer`, respeta el stock y se guarda en `localStorage` |
| Checkout | Crea la orden en Firestore con una foto (snapshot) de los productos y precios, protegido contra doble envío |
| Mis órdenes | Historial y detalle de cada compra; el estado se actualiza **en tiempo real** (`onSnapshot`) cuando el admin lo cambia |
| Panel admin | CRUD de productos con subida de imágenes a S3; listado de órdenes en tiempo real con filtro por estado y cambio de estado |
| Dashboard (extra credit) | Ingresos, órdenes, ticket promedio, órdenes por estado, productos más vendidos y stock bajo, actualizado en tiempo real |
| UI | Modo claro y oscuro, responsive |

## Stack

React · TypeScript · Vite · Tailwind CSS · React Router · Context API · Firebase Auth · Cloud Firestore ·
AWS S3 · Vercel Functions · Vitest · React Testing Library

## Decisiones de arquitectura

### ¿Por qué Context API + `useReducer`?

- El estado global es chico y concreto: **sesión**, **carrito** y **favoritos**. No justifica sumar
  Redux o Zustand.
- El carrito tiene varias acciones que cambian el mismo estado (agregar, quitar, cambiar cantidad,
  vaciar). Un **reducer** centraliza esas reglas (como no superar el stock) en una función pura,
  fácil de testear sin la interfaz.
- Cada contexto está separado en `contexts/` (el contexto), `providers/` (el estado) y `hooks/`
  (cómo se usa), y el valor de cada Provider se memoriza con `useMemo`.
- Los **productos no van en un contexto**: los usan pocas pantallas y cada una necesita algo distinto,
  así que se piden con hooks (`useProducts`, `useProduct`).

### ¿Por qué S3 para las imágenes?

- Firestore está pensado para datos, no para archivos: el documento del producto guarda solo la
  **URL** de la imagen.
- Con **presigned URLs**, el navegador sube el archivo **directo a S3**. Las credenciales de AWS
  quedan en la función serverless y nunca llegan al frontend.
- S3 sirve las imágenes públicamente, rápido y sin pasar por nuestro servidor.

### Consultas a Firestore: `where`, `onSnapshot` y `limit`

- **`onSnapshot` en las órdenes:** "Mis órdenes" y el panel admin quedan escuchando a Firestore. El cliente
  ve el cambio de estado sin recargar y el admin ve entrar las compras nuevas. Al salir de la página se
  corta la escucha (cleanup del `useEffect`) para no seguir gastando lecturas.
- **`where` + `orderBy`:** las consultas de órdenes por usuario y por estado necesitan índices compuestos
  (ver la configuración de Firebase).
- **`limit` en "Stock bajo":** el Dashboard le pide a Firestore solo los 5 productos con 3 unidades o
  menos (`where` + `orderBy` + `limit`), así que filtra el servidor. Con 31 productos el ahorro es chico,
  porque el panel ya carga el catálogo; con miles, esta consulta seguiría leyendo 5 documentos.
- **El catálogo filtra en el navegador:** la búsqueda de texto ("pro" dentro de "iPhone 17 Pro") no la
  resuelve Firestore, y con un catálogo chico filtrar en memoria es instantáneo.

### Estructura de carpetas (por capas)

```
ecommerce-projectM5/
├── api/                 # Vercel Functions (presign.ts)
├── tests/api/           # tests de las funciones (fuera de api/ para que Vercel no los publique)
├── firestore.rules      # copia versionada de las reglas de seguridad
├── vercel.json          # rewrite de la SPA
└── src/
    ├── components/      # UI reutilizable (common, admin, layouts, ui)
    ├── pages/           # una por ruta (admin/ para el panel)
    ├── contexts/        # createContext de auth, carrito, favoritos, productos admin
    ├── providers/       # el estado de cada contexto
    ├── hooks/           # useAuth, useCart, useProducts, useAdminOrders…
    ├── reducers/        # cartReducer (+ sus tests)
    ├── services/        # acceso a Firebase y a /api (authService, productService, orderService, uploadService)
    ├── routes/          # AppRoutes, ProtectedRoute, AdminRoute
    ├── types/           # interfaces de dominio (Product, Order, User…)
    ├── utils/           # funciones puras (formato, validaciones, estadísticas del dashboard)
    ├── styles/          # theme.css: variables de color de los dos modos
    └── test/            # setup de Vitest, fixtures y renderWithProviders
```

Elegí capas (y no features) porque el proyecto tiene un alcance acotado y cada carpeta responde a
"¿qué tipo de cosa es este archivo?".

## Flujo de subida de imágenes (presigned URLs)

```
 Navegador (admin)          Vercel Function /api/presign          Firestore          AWS S3
       │                              │                               │                 │
 1.    │── POST {filename, type} ────▶│                               │                 │
       │   Authorization: Bearer <ID token de Firebase>               │                 │
 2.    │                              │── lee users/{uid} con ese ───▶│                 │
       │                              │   token (aplica las reglas)   │                 │
       │                              │◀── role: "admin" ─────────────│                 │
 3.    │                              │── firma un PUT (10 min, solo ese archivo y tipo) │
       │◀── { url, publicUrl } ───────│                               │                 │
 4.    │── PUT archivo a la url firmada ─────────────────────────────────────────────▶│
 5.    │── guarda el producto con image = publicUrl ─────────────────▶│                 │
```

1. El formulario pide una URL firmada y manda el **ID token** del admin.
2. La función **no confía en el token**: lee el perfil del usuario en la API REST de Firestore *con ese
   token*. Firestore valida la firma y aplica las reglas. Si el rol no es `admin` → **403**; sin token → **401**.
3. Valida el tipo de archivo (JPG, PNG o WebP), limpia el nombre y firma un `PUT` que vence en
   **10 minutos** y que exige ese `Content-Type` exacto.
4. El navegador sube el archivo **directo a S3**: el archivo no pasa por Vercel.
5. Se guarda en Firestore solo la URL pública.

**Por qué es seguro:** las claves de AWS viven solo en la función; la URL firmada sirve para **un**
archivo, **un** tipo y por poco tiempo; y el usuario IAM solo tiene permiso `s3:PutObject` dentro de
`products/`.

## Seguridad

- **Reglas de Firestore** ([`firestore.rules`](ecommerce-projectM5/firestore.rules)): cada cliente lee
  solo sus órdenes y solo las crea a su nombre, en estado `pending` y con la fecha del servidor. Solo el
  admin crea, edita o borra productos. El admin solo puede cambiar `status` y `updatedAt` de una orden,
  siguiendo la máquina de estados: `pending → processing → completed`, y `pending/processing → cancelled`
  (`completed` y `cancelled` son finales). Nadie puede cambiarse el rol desde la app.
- **Rutas protegidas:** `ProtectedRoute` (sesión) y `AdminRoute` (rol admin). Son para la experiencia
  de usuario; la seguridad real está en las reglas y en la función.
- **Variables:** las de Firebase llevan prefijo `VITE_` porque las usa el navegador (identifican el
  proyecto, no son secretas: los datos los protegen las reglas). Las de AWS no llevan prefijo y solo
  existen en Vercel Functions. `.env` está en `.gitignore`.

## Instalación local

**Requisitos:** Node.js 20 o superior, una cuenta de Firebase, una de AWS y una de Vercel.

```bash
git clone https://github.com/MateoGiussano/ProyectoM5_MateoGiussano.git
cd ProyectoM5_MateoGiussano/ecommerce-projectM5
npm install
cp .env.example .env   # y completar los valores (ver abajo)
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Solo el frontend (Vite). **La subida de imágenes no funciona**, porque no levanta `/api` |
| `vercel dev` | Frontend + funciones. Se corre desde la **raíz del repo** (`ProyectoM5_MateoGiussano/`) después de `vercel link` |
| `npm run test` | Corre los tests (Vitest) |
| `npm run build` | Build de producción |

> En Windows, `vercel dev` necesita el **Modo de desarrollador** activado (Configuración → Sistema → Para programadores), porque crea enlaces simbólicos.

## Variables de entorno

| Variable | Dónde se usa | De dónde sale |
|---|---|---|
| `VITE_FIREBASE_API_KEY` … `VITE_FIREBASE_APP_ID` (6 variables) | Navegador | Firebase → Configuración del proyecto → Tus apps → app web |
| `AWS_REGION` | Vercel Function | Región del bucket (ej. `us-east-1`) |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Vercel Function | Clave de acceso del usuario IAM |
| `S3_BUCKET` | Vercel Function | Nombre del bucket |

La función también usa `VITE_FIREBASE_PROJECT_ID` para consultar Firestore. La lista completa está en
[`.env.example`](ecommerce-projectM5/.env.example).

## Configuración paso a paso

### 1. Firebase

1. Crear un proyecto en [console.firebase.google.com](https://console.firebase.google.com) y registrar una **app web**: de ahí salen las 6 variables `VITE_FIREBASE_*`.
2. **Authentication** → habilitar **Correo/contraseña** y **Google**. En *Configuración → Dominios autorizados*, agregar el dominio de Vercel.
3. **Firestore Database** → crear la base y, en **Reglas**, pegar el contenido de `firestore.rules` y publicar.
4. **Índices compuestos** (colección `orders`). Firestore también ofrece crearlos desde el link del error la primera vez que corre cada consulta:
   - `userId` ascendente + `createdAt` descendente (Mis órdenes)
   - `status` ascendente + `createdAt` descendente (filtro del panel admin)
5. **Primer admin:** registrarse en la app (queda como `customer`) y, en Firestore → `users/{uid}`, cambiar `role` a `"admin"` a mano. Desde la app nadie puede cambiar su rol.

### 2. AWS S3

1. Crear un bucket (ej. en `us-east-1`).
2. **Lectura pública de las imágenes:** desactivar "Bloquear todo el acceso público" y agregar esta política de bucket:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::NOMBRE-DEL-BUCKET/products/*"
     }]
   }
   ```
3. **CORS** (Permisos → CORS). El dominio de producción tiene que estar escrito exacto, sin barra final:
   ```json
   [{
     "AllowedHeaders": ["content-type"],
     "AllowedMethods": ["PUT"],
     "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000", "https://TU-APP.vercel.app"],
     "ExposeHeaders": ["ETag"],
     "MaxAgeSeconds": 3000
   }]
   ```
4. **IAM:** crear un usuario solo para la app, con una política que permita **únicamente** subir a `products/`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": "s3:PutObject",
       "Resource": "arn:aws:s3:::NOMBRE-DEL-BUCKET/products/*"
     }]
   }
   ```
   Generar una clave de acceso: de ahí salen `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`.

### 3. Vercel

1. Importar el repo de GitHub en Vercel y, en **Root Directory**, elegir `ecommerce-projectM5`.
2. En **Settings → Environment Variables**, cargar las 10 variables de la tabla (las de AWS, como *Sensitive*).
3. Deployar. Cada push a `main` vuelve a deployar solo.

## Testing

38 tests con **Vitest + React Testing Library**, priorizados por riesgo. **No hacen llamadas reales**:
Firebase, Firestore y el SDK de AWS están mockeados.

| Nivel | Qué cubre |
|---|---|
| Unitario | `cartReducer`: cada acción y casos límite (stock, cantidad 0, no mutar el estado) · `computeDashboardStats`: las canceladas no suman, sin órdenes no divide por 0 |
| Hooks (`renderHook`) | `useCart` (acumular, quitar, vaciar, persistir) y `useAuth` (sin sesión, admin, falla al leer el rol, sesión vencida) |
| Componente | `AdminRoute`: sin sesión → login, customer → tienda, admin → panel |
| Flujo completo | Producto → carrito → checkout: un doble clic crea **una sola** orden; si falla, el carrito queda intacto |
| Función serverless | `/api/presign`: 405, 401, 403 (customer y token inválido), 400 y 200 |

El wrapper `renderWithProviders` monta los providers reales con un estado inicial (usuario, rol y carrito)
para cada escenario.

## Limitaciones conocidas

- El **total de la orden** lo calcula el navegador. Las reglas validan la forma de la orden, no el monto;
  la solución completa sería calcularlo en el servidor.
- **No se descuenta stock** al comprar.
- Al **borrar o reemplazar** la imagen de un producto, el archivo anterior queda en S3.
- Un carrito guardado puede mostrar **precios viejos** si el admin los cambió después.
- Las órdenes viejas guardan la imagen que tenía el producto al comprarlo (es el snapshot), aunque
  después haya cambiado.

## Bitácora de uso de IA

| Etapa | Tema | Prompt o pregunta real | Aprendizaje obtenido | Decisión o resultado |
|---|---|---|---|---|
| Setup y arquitectura | Organización de carpetas | "Necesito una arquitectura de carpeta por capas que separe: tipos, servicio de datos, estado global (contexto), UI y páginas. Sugerime la estructura y explicame de qué va cada capa." Luego: "Dame una breve explicación de los tipos de arquitecturas: cómo funciona, cuándo usarla, ventajas." | Entendí la diferencia entre organizar por tipo de archivo (capas) y por parte del negocio (features). Las capas son más fáciles de seguir y separan bien responsabilidades; las features escalan mejor en proyectos grandes. Aprendí que la carpeta `api/` va en la raíz porque Vercel busca ahí las funciones serverless, y que Git no registra carpetas vacías, por eso usé archivos `.gitkeep`. | **Decisión:** elegí arquitectura por capas porque el proyecto tiene un alcance acotado y, con mi nivel junior, me resulta más fácil entender el código agrupado por tipo de archivo. Además coincide con los módulos que pide el entregable. **Resultado:** estructura de carpetas creada en el proyecto: `api/` en la raíz y `types/`, `services/`, `contexts/`, `hooks/`, `components/` y `pages/` dentro de `src/`. |
| Setup | Convención de commits | "También quiero que me ayudes a nomenclar mis commits, ¿cómo los puedo nombrar?" | Aprendí qué son los commits semánticos (Conventional Commits): el formato `tipo(scope): descripción`, los tipos principales (`feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`) y que cada commit debe tener un solo cambio. | **Decisión:** usar Conventional Commits con scope, tipo en inglés y descripción en español con verbo en infinitivo. **Resultado:** aplicado desde los primeros commits del proyecto (`chore(seguridad): agregar .env al .gitignore`). |
| Diseño / UI | Contraste del color de marca en modo oscuro | "Dentro de theme.css va a estar todo mi sistema base de diseño, con dos modos principales, :root y .dark (brand, feedback, border, radius, spacing y shadow son iguales para el tema claro como para el oscuro)." Luego, ante el problema detectado: "Solucionalo con algún otro color que se asemeje a la paleta pero que sea óptimo para el modo oscuro." | Al revisar el sistema de diseño, la IA detectó que si el color de marca era igual en ambos modos, en oscuro el botón principal quedaba del mismo color que la card y casi invisible. Aprendí qué es el contraste entre colores y que se recomienda un mínimo de 4.5 para texto y 3 para botones. | **Decisión:** cambié mi idea inicial de mantener el brand igual en ambos modos. En modo oscuro uso `#A3CEF1` (celeste de la misma familia de la paleta) con texto `#274C77`. **Resultado:** el botón principal se distingue de las cards en modo oscuro. Más adelante, al probar el panel de órdenes en producción, detecté que el badge "En preparación" no se veía en modo oscuro: el color de feedback era el mismo para los dos modos y tenía un contraste de **1.21:1** con la card. Calculamos el contraste de los cuatro estados y les di versiones claras en modo oscuro: "En preparación" pasó a **5.21:1** y los otros quedaron cerca de 4.5:1. Commit `fix(theme): mejorar el contraste de los colores de estado en modo oscuro`. |
| Diseño / UI | Visibilidad de cards y botones | "En modo claro las cards donde está el producto, le agregaría poco más de sombra, porque no se diferencia nada del fondo. En modo dark donde está el corazoncito no tiene ningún fondo y no se hace evidente que ese corazón tiene una interacción, lo mismo para el botón del sol y la luna." | Entendí que los botones no se veían porque en modo oscuro `--surface` y `--card` tenían el mismo color: el botón quedaba igual que la card donde estaba apoyado. También aprendí que usar un color de fondo en el hover puede hacer desaparecer el botón si coincide con el fondo de atrás, y que `opacity` funciona en cualquier tema. | **Decisión:** agregué `--shadow-md` para las cards, le di a `--surface` un color propio en modo oscuro (`#1E3A5C`) y cambié el hover de los botones a `opacity: 0.8`. **Resultado:** verificado en el navegador en los dos modos: las cards se distinguen del fondo y los botones se ven. Commit `fix(ui): mejorar sombra de cards y visibilidad de botones en modo oscuro`. |
| Tipos (TypeScript) | Code review de las interfaces | "¿Y para admin no creamos ningún tipado?" Luego le pasé mis interfaces `Product`, `CartItem` y `Order` para que las revisara: "Por mi lado hice otro tipado, que es el cartItem.ts…" y "Yo en product no tipé como si fuese un array, ¿está bien?" | Entendí que una interfaz describe **un** solo elemento y que el array se indica donde se usa (`Product[]`), así el mismo tipo sirve para el catálogo y para el detalle. Aprendí que no hace falta un tipo `Admin`, porque el rol es un dato del usuario y no un tipo de persona distinto. En la revisión de `Order` entendí que `products: CartItem` guardaba un solo ítem y tenía que ser `CartItem[]`, que los nombres deben indicar qué guardan (`userId` en vez de `user`, `OrderStatus` en vez de `Status`) y que un `Date` guardado en Firestore vuelve como `Timestamp`, por eso conviene guardar la fecha como texto ISO. | **Decisión:** un solo tipo `User` con `role: 'customer' \| 'admin'`; `ProductCategory` como unión para evitar errores de tipeo en el filtro; corregí `total` sin tipo y `products` que no era array, y renombré a `OrderStatus`, `userId`, `items` y `createdAt`. **Resultado:** tipos aplicados en `ProductList` (`Product[]`) y commit `feat(types): definir interfaces de usuario, producto, carrito y orden`. |
| Autenticación | Separar context, provider y hook | "Si la mejor práctica es tener una carpeta de hooks, otra de provider, otra de contexts, porque el sistema puede llegar a escalar y va a ser más difícil de controlar si está todo en un mismo archivo" | La IA me había propuesto todo junto en `AuthContext.tsx`. Al cuestionarlo, entendí que separar le da a cada archivo una sola responsabilidad y además elimina el aviso de ESLint `react-refresh/only-export-components`. También aprendí que en un proyecto de este tamaño el argumento de "escalar" pesa poco y que conviene justificarlo por claridad. | **Decisión:** separé en `contexts/AuthContext.ts`, `providers/AuthProvider.tsx` y `hooks/useAuth.ts`, y voy a usar la misma estructura para el carrito. **Resultado:** funcionando; probé login, logout y recarga de página con los dos roles (`admin` y `customer`). |
| Autenticación | Reglas de Firestore y error en el simulador | Le mandé la captura del error *"Null value error"* (línea 13, función `isAdmin`) del simulador de reglas de Firestore. | El UID que cargué tenía un espacio adelante, entonces no coincidía con el dueño del documento y la regla pasaba a evaluar `isAdmin()` sobre un documento que no existe. Aprendí que un error dentro de una regla siempre **deniega**, nunca da permiso, y que las reglas son la seguridad real porque `AdminRoute` solo esconde pantallas en el frontend. | **Resultado:** corregí el UID y la lectura del propio perfil quedó autorizada en el simulador. Después simulamos dos ataques autenticados como un customer real: cambiar su propio `role` a `"admin"` (`update` en `users/{uid}`) y crear un producto (`create` en `products`). Firestore **rechazó los dos**. El primero, porque `allow update` en `users` es siempre `false`. El segundo, porque `isAdmin()` lee el perfil del usuario y su rol es `customer`, así que la regla corta antes de revisar los datos del producto. |
| Catálogo | Filtrar en el navegador vs. con consultas a Firestore | La IA me planteó una pregunta de diseño antes de programar (*"¿cómo se guarda la categoría para que el filtro sea eficiente?"*) con dos opciones, y respondí: *"La opción A, filtrar en navegador"*. | Entendí que Firestore puede filtrar por categoría con `where`, pero **no sabe buscar texto "que contenga"** (como encontrar "pro" dentro de "iPhone 16 Pro"), y que combinar filtros obliga a crear índices. Filtrar en el navegador es más simple y el filtro es instantáneo, pero no escalaría con miles de productos. | **Decisión:** traer los productos una sola vez y filtrar en memoria, porque el catálogo es chico (32 productos). Si creciera mucho, pasaría a consultas con paginación. **Resultado:** probé en el navegador que al cambiar de categoría la lista se actualiza sin recargar la página, y que la categoría se combina correctamente con un texto de búsqueda. |
| Catálogo | ¿Contexto o hook para los productos? | "¿Conviene manejar los productos con Context API, como hicimos con la autenticación? ¿En qué casos se justifica usar un contexto, por ejemplo para el carrito de compras?" | Entendí que un contexto conviene cuando **muchos componentes de distintas partes** necesitan **el mismo dato** y ese dato **cambia mientras se usa la app**. Los productos los usan pocas páginas y cada una necesita algo distinto (la lista o un solo producto), y el detalle tiene que poder buscar su producto aunque se entre directo por el link. El carrito sí cumple las condiciones para un contexto. | **Decisión:** usar hooks (`useProducts` y `useProduct`) para los productos y reservar el contexto para la sesión y el carrito. **Resultado:** el catálogo y la página de detalle funcionan, cada una pidiendo sus propios datos a Firestore. |
| Catálogo / UI | Buscador en el Header guardado en la URL | "¿Qué ventajas y desventajas tendría ubicar el buscador centrado en el Header, en lugar de dentro de la página del catálogo?" | Entendí que `Header` y `HomePage` son componentes "hermanos" que no pueden pasarse props, y que la **URL** puede funcionar como lugar compartido (`/?search=...`) con `useSearchParams`. Aprendí a usar `replace` en `navigate` para no llenar el historial con una entrada por cada letra, y que el debounce se mantiene en la página que filtra. | **Decisión:** aunque la recomendación fue dejarlo para el final, decidí implementarlo en ese momento para aprender el concepto, usando la URL como única fuente de verdad de la búsqueda en lugar de un contexto. **Resultado:** probé que al recargar (F5) la búsqueda se mantiene, que al buscar desde otra página (Mis órdenes) me lleva al inicio con los resultados, y que el botón "atrás" no recorre la búsqueda letra por letra. |
| Carrito | `useMemo` en los Providers | "¿Por qué no usamos `useMemo` en el `AuthProvider`? ¿Es una buena práctica memorizar el valor que expone un Provider?" | Entendí que `useMemo` memoriza el objeto que transmite el Provider, para que los componentes que lo usan no se redibujen si los datos no cambiaron. Al revisar un código de referencia encontré un error: usaba `useMemo` con el array de dependencias **vacío**, así que el valor quedaba congelado con `user: null` para siempre. Aprendí que una optimización mal escrita puede romper la aplicación. | **Decisión:** usar `useMemo` en todos los Providers, siempre con todas sus dependencias (`[user, role, loading]` en auth, `[state.items]` en el carrito y `[favoriteIds]` en favoritos). **Resultado:** repetí las pruebas de login, recarga y logout con los dos roles y todo siguió funcionando. |
| Carrito / Testing | Tests del reducer y casos límite | "¿Qué casos de prueba debería cubrir el reducer del carrito para validar cada acción y sus casos límite antes de conectarlo a la interfaz?" | Entendí que un reducer es una **función pura** (con el mismo estado y la misma acción siempre devuelve lo mismo) y por eso es fácil de testear de forma aislada. Identificamos casos límite: no superar el stock, no agregar productos sin stock, que la cantidad 0 elimine el producto y que nunca se modifique el estado original. | **Decisión:** testear la lógica del carrito con Vitest antes de construir la interfaz, para que un error en pantalla no pueda venir de la lógica. **Resultado:** 13 tests pasan con `npm run test`. |
| Checkout / Seguridad | Validación de órdenes con reglas de Firestore | "¿Las reglas de Firestore son suficientes para impedir que un usuario manipule los datos desde la consola del navegador? ¿Qué partes de una orden podrían alterarse?" | Entendí que todo lo que arma el navegador se puede manipular, y que las reglas pueden validar la **forma** de una orden (`keys().hasOnly`, `items.size() > 0`, `total > 0`, `status == "pending"`, `createdAt == request.time`) pero **no** pueden comprobar que el total sea el correcto. Para eso habría que calcularlo en el servidor. | **Decisión:** agregar esas validaciones a las reglas de `orders` y documentar el cálculo del total como limitación conocida. **Resultado:** cambié temporalmente el estado a `"completed"` al crear una orden: Firestore la rechazó con *"Missing or insufficient permissions"* y la app mostró el error sin vaciar el carrito. |
| Panel admin / Seguridad | Proteger la función que genera presigned URLs | "Proteger `/api/presign` para que solo un admin logueado pueda pedir URLs (hoy cualquiera que conozca la URL podría). Proponé la opción más simple y explicámela." | Entendí que esconder el formulario con `AdminRoute` no protege la función: cualquiera puede llamarla directo. Aprendí qué es el **ID token** de Firebase (un JWT firmado por Google), cómo se manda en el header `Authorization: Bearer`, y la diferencia entre **401** (no sé quién sos) y **403** (sé quién sos, pero no tenés permiso). La IA me planteó dos opciones: verificar el token con `firebase-admin`, que necesita una service account y una clave privada en Vercel, o leer el perfil en la API REST de Firestore **con el token del usuario**, de forma que Firestore valida la firma y aplica mis propias reglas. | **Decisión:** elegí la segunda opción porque no suma dependencias ni secretos y reutiliza las reglas que ya tenía. Me aseguré de poder explicar por qué es segura: la función no confía en el token, se lo pasa a Firestore. **Resultado:** sin token responde 401; con un token inventado o de un customer, 403. Lo probé con el formulario como admin, desde la consola como customer, y con 6 tests automáticos del handler. |
| Deploy | Subida de imágenes que fallaba solo en producción | Le mandé la captura del error *"Se cortó la conexión mientras subíamos la imagen"* en la URL de Vercel y pregunté: "¿Esto es porque ya había cargado la imagen?" | No era eso. La IA comprobó con `curl` el *preflight* (el pedido `OPTIONS` que el navegador hace antes del `PUT`): S3 respondía 200 a `localhost:3000` y **403** al dominio de Vercel. Entendí que **CORS** es la lista de sitios que el bucket deja subir desde el navegador, que el origen tiene que estar escrito exacto (sin barra final, con `https`), y que cuando el preflight falla, `fetch` lo muestra como un error de red. También vi que la protección del paso anterior sí funcionaba, porque la URL firmada se generó bien. | **Decisión:** corregí el CORS del bucket en la consola de AWS con el dominio exacto de producción. **Resultado:** el preflight pasó a dar 200 y la subida de imágenes funcionó en producción. Aprendí que algo que anda en local no garantiza que ande en producción. |
| Panel admin | Filtrar órdenes por estado con un índice compuesto | "Cuando filtro por completada yo tengo una en ese estado pero no la filtra." | La primera hipótesis de la IA fue que el valor de `status` estaba mal escrito, pero le mostré el documento en Firestore y estaba bien: **la hipótesis era incorrecta**. Con el error de la consola (*"The query requires an index"*) y la pestaña Índices encontramos la causa real: solo existía el índice de "Mis órdenes" (`userId` + `createdAt`). Entendí que combinar `where` sobre un campo con `orderBy` sobre otro exige un **índice compuesto**, y que sin él la consulta falla aunque el código esté bien. | **Decisión:** filtrar con una consulta a Firestore (`where("status")` + `orderBy("createdAt")`) en vez de filtrar en el navegador, y crear el índice desde el link del error. **Resultado:** después de que el índice quedó "Habilitado", los cuatro filtros funcionaron sin cambiar una línea de código. |

## Autor

Mateo Giussano: proyecto integrador del Módulo 5, Henry.
