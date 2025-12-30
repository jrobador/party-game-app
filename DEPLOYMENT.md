# Guía de Deployment - Amigos de Mierda

Este juego usa un servidor personalizado con Socket.io, por lo que **NO puede ser desplegado en Vercel** de manera tradicional. Aquí están las mejores opciones:

## Opción 1: Railway (Recomendado - Más Fácil)

Railway es perfecto para este tipo de aplicaciones con servidor personalizado.

### Pasos:

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app) y crea una cuenta

2. **Conectar repositorio**
   - Click en "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio

3. **Configurar variables de entorno**
   - En el dashboard del proyecto, ve a "Variables"
   - Agrega: `PUBLIC_URL` con el valor de tu dominio Railway (ej: `https://tu-app.railway.app`)
   - Railway configurará automáticamente `PORT`

4. **Deploy**
   - Railway detectará automáticamente Node.js
   - Usará el comando `npm run start` definido en package.json
   - Tu app estará disponible en una URL como `https://tu-app.railway.app`

5. **Dominio personalizado (opcional)**
   - En Settings → Domains, puedes agregar tu propio dominio

**Costo**: Tiene plan gratuito con $5 USD de crédito mensual, suficiente para testear.

---

## Opción 2: Render

Similar a Railway pero con configuración ligeramente diferente.

### Pasos:

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)

2. **Nuevo Web Service**
   - Click "New +" → "Web Service"
   - Conecta tu repositorio GitHub

3. **Configuración**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Node

4. **Variables de entorno**
   - Agrega `PUBLIC_URL` con tu URL de Render (ej: `https://tu-app.onrender.com`)

5. **Deploy**
   - Click "Create Web Service"
   - Render hará el build y deployment automáticamente

**Costo**: Plan gratuito disponible (con algunas limitaciones de sleep).

---

## Opción 3: DigitalOcean App Platform

Más robusto pero requiere más configuración.

### Pasos:

1. **Crear cuenta en DigitalOcean**
   - Ve a [digitalocean.com](https://digitalocean.com)

2. **Crear App**
   - En App Platform, click "Create App"
   - Conecta tu repositorio

3. **Configuración**
   - Detectará Node.js automáticamente
   - Build Command: `npm run build`
   - Run Command: `npm run start`

4. **Variables de entorno**
   - Agrega `PUBLIC_URL` con tu URL de DO

5. **Deploy**
   - DigitalOcean manejará SSL automáticamente

**Costo**: Desde $5 USD/mes.

---

## Opción 4: VPS (Para expertos)

Si prefieres control total, puedes usar un VPS (DigitalOcean Droplet, Linode, AWS EC2, etc.).

### Pasos básicos:

1. Crear servidor Ubuntu
2. Instalar Node.js y npm
3. Clonar repositorio
4. Instalar dependencias: `npm install`
5. Build: `npm run build`
6. Instalar PM2: `npm install -g pm2`
7. Iniciar con PM2: `pm2 start npm --name "party-game" -- start`
8. Configurar Nginx como reverse proxy
9. Configurar SSL con Let's Encrypt

---

## Configuración de Variables de Entorno

Para cualquier plataforma, necesitas configurar:

```bash
PUBLIC_URL=https://tu-dominio.com
PORT=3000  # (usualmente configurado automáticamente)
NODE_ENV=production
```

---

## Testing en Producción

Una vez desplegado:

1. Abre la URL de tu host: `https://tu-dominio.com/host`
2. Los jugadores escanean el QR code o entran a: `https://tu-dominio.com`
3. Todos deben estar conectados a internet (no necesitan estar en la misma red WiFi)

---

## Troubleshooting

### WebSocket no conecta
- Verifica que la plataforma soporte WebSockets (todas las mencionadas lo hacen)
- Asegúrate de que `PUBLIC_URL` esté configurada correctamente

### El QR code no funciona
- Verifica que el dominio sea HTTPS (requerido para la cámara en móviles)
- Asegúrate de que la URL sea accesible públicamente

### Errores de build
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el comando de build sea correcto

---

## Recomendación Final

**Para comenzar rápido**: Usa **Railway**
- Setup más simple
- Detección automática de configuración
- Plan gratuito generoso
- SSL automático

**Para producción seria**: Usa **DigitalOcean** o un **VPS**
- Más control
- Mejor performance
- Costos predecibles
