# Cempa.ai • Design System & Auth Reference Backup

Este documento sirve como respaldo de los estándares visuales, paleta de colores y especificaciones de componentes implementados en la interfaz para mantener la consistencia en futuras iteraciones.

---

## 🎨 1. Paleta de Colores Oficial (Tema Naranja)
Basada en tonos cálidos y oscuros para un estilo moderno tipo SaaS de IA.

* **Fondo Principal App:** `#0b0f19` (Slate oscuro profundo)
* **Contenedores / Tarjetas (Modales):** `bg-slate-900` con bordes `border-slate-800`
* **Color Primario (Gradiente de Acción):** 
  * Gradiente: `from-orange-500 to-amber-500`
  * Hover: `hover:from-orange-600 hover:to-amber-600`
  * Sombra / Glow: `shadow-lg shadow-orange-500/20`
* **Textos Destacados y Enlaces:** `text-orange-400` (Hover: `text-orange-300`)
* **Campos de Texto (Inputs):** 
  * Fondo: `bg-slate-800/80`
  * Borde base: `border-slate-700`
  * Borde Focus / Anillo: `focus:border-orange-500 focus:ring-1 focus:ring-orange-500`
* **Mensajes de Error:** 
  * Fondo: `bg-red-500/10`
  * Borde: `border-red-500/50`
  * Texto: `text-red-400`

---

## 📏 2. Espaciados y Geometría (UI Tokens)
* **Radios de Borde (Border Radius):**
  * Modales contenedores: `rounded-2xl`
  * Botones e Inputs: `rounded-xl`
  * Badges / Insignias: `rounded-full` (o `rounded-lg` según el contexto)
* **Efectos Backdrop:** 
  * Modales de autenticación: `backdrop-blur-md bg-black/60`
  * Modales secundarios: `backdrop-blur-sm bg-black/50`
* **Z-Index Hierarchy:**
  * Modales principales y de Auth: `z-50`

---

## 🔐 3. Características Clave de Autenticación
* **Endpoints Backend (Puerto 3030):**
  * Registro: `POST /api/auth/register` (Valida contraseñas coincidentes y longitud mínima de 6 caracteres).
  * Login: `POST /api/auth/login` (Autentica mediante `bcryptjs` en MongoDB Atlas).
* **Persistencia de Sesión:**
  * Almacenamiento local mediante `localStorage` utilizando la clave `cempa_user_session`.
  * Contexto global administrado por `AuthContext.tsx`.
* **OAuth (Google):**
  * Botón integrado con icono vectorial oficial y estructura preparada para conectar el flujo de Google Provider.
