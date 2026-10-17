# PODEX · Gestión de Solicitudes (Next.js)

Versión en **TypeScript + Next.js + PostgreSQL** de PODEX, para comparar su rendimiento con la versión en Streamlit
([jajerohe/gestion-solicitudes](https://github.com/jajerohe/gestion-solicitudes)). Usa **la misma base de datos de
Supabase** y los mismos usuarios.

## Qué incluye por ahora

| Módulo | Estado |
|---|---|
| Inicio de sesión (Supabase Auth + tabla `USUARIOS`) | ✅ |
| Solicitudes: lista, búsqueda, Gestionar, Ver gestión y Actualizar | ✅ |
| Permisos: Administrador ve todo; Operador solo sus POD | ✅ |
| Usuarios, POD's, Listas de correo, Cargar solicitudes, Reportes | Pendiente (aparecen como «pronto» en el menú) |

Mientras se compara, la versión queda en **solo lectura** (`PODEX_ESCRITURA=0`): se puede consultar todo, pero
Gestionar y Actualizar no guardan. Con `PODEX_ESCRITURA=1` guardan igual que la versión en Streamlit.

## Estructura

| Archivo | Contenido |
|---|---|
| `app/login/` | Pantalla de inicio de sesión |
| `app/(app)/layout.tsx` | Barra superior y menú lateral (exige sesión) |
| `app/(app)/solicitudes/` | Página de Solicitudes |
| `app/acciones.ts` | Acciones del servidor: iniciar/cerrar sesión, ver gestiones, guardar gestión, actualizar solicitud |
| `components/TablaSolicitudes.tsx` | Tabla, búsqueda y las tres ventanas |
| `components/Ventana.tsx` | Ventana superpuesta, ficha y subtítulos |
| `components/MenuLateral.tsx` | Menú lateral contraíble |
| `lib/solicitudes.ts` | Consultas SQL de solicitudes y gestiones |
| `lib/sesion.ts` | Sesión en cookie firmada |
| `lib/db.ts` | Conexión a PostgreSQL |

## Variables de entorno

Copie `.env.example` a `.env.local` (local) o defínalas en Vercel → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Supabase → **Connect** → *Transaction pooler* (puerto 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | Igual a `[supabase] url` de la versión en Streamlit |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Igual a `[supabase] key` (la llave publishable/anon, **no** la service_role) |
| `SESSION_SECRET` | Texto largo y aleatorio (`openssl rand -base64 32`) |
| `PODEX_ESCRITURA` | `0` solo lectura, `1` permite guardar |
| `NOMBRE_SISTEMA`, `DESCRIPCION_SISTEMA` | Opcionales |

## Ejecución local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # versión de producción (la que se debe medir)
```

## Publicar en Vercel

1. En [vercel.com/new](https://vercel.com/new) importe el repositorio `podexweb`.
2. Agregue las variables de entorno de arriba.
3. **Región:** Settings → Functions → *Function Region*: elija la misma región del proyecto de Supabase
   (por ejemplo `iad1` si Supabase está en `us-east-1`). Si quedan lejos, cada consulta tarda más.
4. Deploy.

## Cómo comparar con la versión en Streamlit

Use el mismo usuario, el mismo equipo y la misma red, y repita cada medida 3 a 5 veces:

| Prueba | Qué medir |
|---|---|
| Inicio de sesión | Desde «Ingresar» hasta ver la tabla |
| Abrir Solicitudes | Tiempo hasta ver la tabla completa |
| Buscar | Escribir un ID y ver el resultado |
| Ver gestión | Desde el clic hasta ver las gestiones |
| Cambiar de solicitud seleccionada | Respuesta al hacer clic en otra fila |

Herramientas: cronómetro, la pestaña *Network* de Chrome (DevTools) o *Lighthouse* (DevTools → Lighthouse).
Streamlit Cloud «duerme» la aplicación cuando no se usa: no cuente la primera carga después de un rato sin uso.
