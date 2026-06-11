# WC 2026! ⚽🏆

Polla del **Mundial 2026** para 4 amigos en Colombia (Daniel, Camilo, Luis H y Miguel).
Web app gratis, **mobile-first**, partido por partido.

- **Stack:** Next.js 16 (App Router) · TypeScript estricto · Tailwind CSS v4 · Supabase (Postgres) · Vercel.
- **Zona horaria:** todas las horas en `America/Bogota`.
- **Interfaz:** español colombiano.

---

## 🎯 Cómo se juega

Cada quien pronostica el marcador **antes de que inicie cada partido**. Cuando Daniel (admin) carga el resultado real, la app calcula los puntos automáticamente.

### Puntuación (NO acumulativa — solo la mejor categoría aplica)

| Categoría | Puntos | Significado |
|---|---|---|
| 🎯 Marcador exacto | **4** | Acertaste el marcador completo (ej. real 2-1, predijiste 2-1) |
| ✅ Resultado acertado | **3** | Acertaste ganador o empate (ej. real 2-1, predijiste 1-0 o 3-1) |
| ½ Marcador parcial | **1** | Acertaste los goles de un solo equipo, sin acertar el resultado |
| — Sin puntos | **0** | No acertaste nada |

> **Regla clave:** si aciertas el resultado **y** los goles de un equipo, recibes **3** (no 4 ni 1). Solo recibes **4** si el marcador completo es exacto.

La lógica vive centralizada en [`src/lib/scoring.ts`](src/lib/scoring.ts) y está cubierta por tests en [`src/lib/scoring.test.ts`](src/lib/scoring.test.ts).

### Desempate en la tabla
1. Más marcadores exactos → 2. Más resultados acertados → 3. Más partidos pronosticados → 4. Orden alfabético.

---

## 🚀 Instalación local

```bash
npm install
cp .env.local.example .env.local   # y completa los valores (ver abajo)
npm run dev                        # http://localhost:3000
```

### Tests de puntuación
```bash
npm test
```

---

## 🗄️ Configurar Supabase (gratis)

1. Crea una cuenta en [supabase.com](https://supabase.com) y un **proyecto nuevo** (plan Free).
2. Ve a **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**. Esto crea las tablas `users`, `matches`, `predictions` y la vista `standings`.
3. En otra query, pega [`supabase/seed.sql`](supabase/seed.sql) y **Run**. Esto crea los 4 usuarios con sus PIN.
4. Ve a **Settings → API** y copia a tu `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...           # anon public
   SUPABASE_SERVICE_ROLE_KEY=eyJ...               # service_role (SOLO servidor)
   SESSION_SECRET=...                             # genera con: openssl rand -base64 32
   ```

### PINs por defecto (¡cámbialos!)

| Usuario | Rol | PIN |
|---|---|---|
| Daniel | admin 👑 | `1234` |
| Camilo | player | `1111` |
| Luis H | player | `2222` |
| Miguel | player | `3333` |

Para cambiar un PIN: corre `npm run hash:pins -- 5678` (genera el hash bcrypt), y actualiza el `pin_hash` del usuario en Supabase (Table editor → users) o re-edita `seed.sql`.

---

## ⚽ Cargar los partidos

El calendario sale de `calendario_mundial_2026_grupos.xlsx` (72 partidos de fase de grupos).
Ya está convertido a [`data/matches.json`](data/matches.json). Para cargarlo a Supabase:

```bash
npm run import:matches
```

> El script es **idempotente** (upsert por `match_number`): puedes correrlo varias veces sin duplicar.

### ¿Regenerar el JSON desde el Excel?
Coloca el `.xlsx` en la raíz del proyecto y corre:
```bash
npm run gen:matches
```

---

## ☁️ Desplegar gratis en Vercel

1. Sube este proyecto a un repo de GitHub.
2. Entra a [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. En **Environment Variables**, agrega las mismas 4 variables del `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`).
4. **Deploy.** Vercel te da una URL pública tipo `https://wc2026.vercel.app`.
5. Comparte la URL por WhatsApp con los amigos. Cada uno entra desde el celular, elige su nombre y pone su PIN.

> Para “instalar” en el celular: abre la URL en el navegador → menú → **Agregar a pantalla de inicio** (PWA).

---

## 👑 Cómo usar la app como administrador (Daniel)

1. Entra y elige **Daniel** + tu PIN. Verás una pestaña extra **Admin ⚙️**.
2. En **Admin**, la vista **Por cargar** muestra los partidos que ya se jugaron y esperan resultado.
3. Escribe el marcador real y toca **Guardar y calcular**. La app:
   - guarda el marcador, marca el partido como finalizado,
   - calcula los puntos de cada predicción y actualiza la tabla.
4. ¿Te equivocaste? Vuelve a escribir el marcador correcto y toca **Corregir y recalcular**, o usa **Recalcular puntos** si solo quieres re-aplicar la fórmula.

Solo Daniel puede cargar resultados: las rutas `/admin` están protegidas por sesión + rol, y las acciones de servidor revalidan el rol.

---

## 🙋 Cómo jugar como participante

1. Entra con tu nombre + PIN.
2. **Inicio:** ves tus puntos, tu posición y los próximos partidos.
3. **Pronósticos 🎯:** filtra (Todos / Próximos / Pendientes / Finalizados), escribe goles local y visitante, y **Guardar**.
   - Puedes editar tu predicción **hasta la hora de inicio**. Después queda **bloqueada**.
   - Los pronósticos de los demás se revelan recién cuando empieza el partido (anti-copia).
4. **Tabla 🏆:** ranking en vivo. Puedes **compartir por WhatsApp**.
5. Toca cualquier partido para ver el **detalle**: resultado real, pronósticos de todos y puntos obtenidos.

---

## 🔐 Seguridad y reglas (reforzadas en el servidor)

- Autenticación simple: nombre + PIN (bcrypt). Sesión en cookie `httpOnly` firmada con JWT (`jose`).
- La `service_role` key **solo** se usa en el servidor (Server Actions). RLS activado como defensa extra.
- No se permiten predicciones duplicadas (`unique(match_id, user_id)`), ni después del inicio (revalidado en el servidor), ni que jugadores carguen resultados.

---

## 📁 Estructura

```
src/
  lib/
    scoring.ts         # calculatePoints (función pura) + tests
    session.ts         # JWT de sesión (jose)
    supabase.ts        # cliente service_role (solo servidor)
    queries.ts         # lecturas de datos
    format.ts          # fechas/horas Bogotá + estado de partidos
    teams.ts           # banderas
  app/
    actions/           # server actions: auth, predictions, admin
    login/             # pantalla de login
    (app)/             # zona autenticada: dashboard, predicciones, tabla, partido, admin
  components/          # UI reutilizable (mobile-first)
supabase/
  schema.sql           # tablas + vista standings + RLS
  seed.sql             # 4 usuarios
scripts/
  excel-to-json.ts     # Excel -> data/matches.json
  import-matches.ts    # data/matches.json -> Supabase
  hash-pins.ts         # genera hashes bcrypt de PIN
data/matches.json      # 72 partidos
```

---

¡Que gane el mejor! 🇨🇴⚽
