import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin

    socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    })
  }
  return socket
}
