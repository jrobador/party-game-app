# Amigos de Mierda - Party Game

Un juego de fiesta para red local (LAN) donde los jugadores votan anónimamente sobre preguntas divertidas y polémicas.

## Características

- **Vista HOST**: Pantalla principal para TV/proyector con código QR, seguimiento de votos y resultados
- **Vista PLAYER**: Control remoto en el celular para unirse y votar
- **Tiempo Real**: Comunicación instantánea con Socket.io
- **20 Preguntas**: Preguntas divertidas y picantes para animar la fiesta
- **Diseño Dark Mode**: Interfaz minimalista con textos grandes y colores neón

## Requisitos

- Node.js 18+ instalado
- Todos los dispositivos conectados a la misma red WiFi

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

3. El servidor mostrará la IP local en la consola:
```
🎮 Amigos de Mierda - Party Game Server 🎮

> Ready on http://192.168.1.100:3000
> Local: http://localhost:3000
> Network: http://192.168.1.100:3000

📱 Players can scan QR code on the HOST screen to join!
```

## Cómo Jugar

### Paso 1: Configurar el Host
1. Abre un navegador en la TV/Laptop
2. Ve a `http://localhost:3000/host`
3. Aparecerá un código QR y el contador de jugadores

### Paso 2: Unirse al Juego
1. Los jugadores escanean el código QR con sus celulares
2. O ingresan manualmente a la IP mostrada (ej: `http://192.168.1.100:3000`)
3. Cada jugador ingresa su nombre y presiona "ENTRAR"

### Paso 3: Jugar
1. Cuando todos estén listos, el Host presiona "COMENZAR"
2. Aparece una pregunta polémica
3. Cada jugador vota desde su celular
4. El Host ve el progreso de votación en tiempo real
5. Cuando todos voten, el Host presiona "VER RESULTADOS"
6. Se muestra un ranking con el "ganador"
7. Presiona "SIGUIENTE RONDA" para continuar

## Tecnologías

- **Next.js 16**: Framework React con App Router
- **Socket.io**: Comunicación en tiempo real
- **Tailwind CSS v4**: Estilos con diseño dark mode
- **qrcode.react**: Generación de códigos QR
- **TypeScript**: Tipado estático

## Estructura del Proyecto

```
├── app/
│   ├── page.tsx          # Vista de jugador (control remoto)
│   ├── host/
│   │   └── page.tsx      # Vista de host (pantalla principal)
│   ├── layout.tsx        # Layout principal
│   └── globals.css       # Estilos globales
├── lib/
│   └── socket.ts         # Cliente Socket.io
├── utils/
│   └── questions.ts      # Lista de preguntas
├── server.ts             # Servidor custom con Socket.io
└── package.json          # Dependencias y scripts
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor en modo producción
- `npm run lint` - Ejecuta el linter

## Solución de Problemas

### Los celulares no pueden conectarse
- Verifica que todos los dispositivos estén en la misma red WiFi
- Desactiva el firewall temporalmente o permite el puerto 3000
- Usa la IP que aparece en la consola, no "localhost"

### El servidor no inicia
- Verifica que el puerto 3000 esté libre
- Instala las dependencias: `npm install`
- Verifica que tengas Node.js 18 o superior

### Los votos no se registran
- Refresca la página del host y de los jugadores
- Verifica la consola del navegador para errores
- Asegúrate de que Socket.io esté conectado (mensaje en consola del servidor)

## Personalización

### Agregar más preguntas
Edita el archivo `utils/questions.ts` y agrega más strings al array.

### Cambiar colores
Edita `app/globals.css` para modificar el tema de colores.

### Cambiar el puerto
Modifica la variable `PORT` en `server.ts` o usa una variable de entorno:
```bash
PORT=8080 npm run dev
```

## Licencia

Este proyecto fue creado con v0.app para uso personal en fiestas.

---

Hecho con ❤️ para las mejores fiestas con los peores amigos
