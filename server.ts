import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { Server } from "socket.io"
import { networkInterfaces } from "os"

const dev = process.env.NODE_ENV !== "production"
const hostname = "0.0.0.0"
const port = Number.parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Get public URL
function getPublicURL(): string {
  // In production, use the environment variable
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL
  }

  // In development, get local IP
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    const netInfo = nets[name]
    if (!netInfo) continue

    for (const net of netInfo) {
      if (net.family === "IPv4" && !net.internal) {
        return `http://${net.address}:${port}`
      }
    }
  }
  return `http://localhost:${port}`
}

// Game state
interface Player {
  id: string
  name: string
}

interface Vote {
  voterId: string
  targetId: string
}

interface GameState {
  phase: "lobby" | "voting" | "results"
  players: Player[]
  currentQuestion: string
  votes: Vote[]
  results: { playerId: string; playerName: string; voteCount: number }[]
}

const gameState: GameState = {
  phase: "lobby",
  players: [],
  currentQuestion: "",
  votes: [],
  results: [],
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  // Socket.io connection handler
  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`)

    // Send current game state to newly connected client
    socket.emit("game-state", gameState)
    socket.emit("public-url", getPublicURL())

    // Player joins the game
    socket.on("join-game", (playerName: string) => {
      const player: Player = {
        id: socket.id,
        name: playerName,
      }

      gameState.players.push(player)
      console.log(`[Game] Player joined: ${playerName} (${socket.id})`)

      // Notify all clients
      io.emit("player-joined", player)
      io.emit("players-update", gameState.players)
    })

    // Host starts the game
    socket.on("start-game", (question: string) => {
      gameState.phase = "voting"
      gameState.currentQuestion = question
      gameState.votes = []
      gameState.results = []

      console.log(`[Game] Game started with question: ${question}`)

      io.emit("game-started", {
        question,
        players: gameState.players,
      })
    })

    // Player votes
    socket.on("submit-vote", (targetId: string) => {
      // Check if player already voted
      const existingVote = gameState.votes.find((v) => v.voterId === socket.id)
      if (existingVote) {
        console.log(`[Game] Player ${socket.id} already voted`)
        return
      }

      const vote: Vote = {
        voterId: socket.id,
        targetId,
      }

      gameState.votes.push(vote)
      console.log(`[Game] Vote recorded: ${socket.id} voted for ${targetId}`)

      // Notify host of vote count update
      io.emit("vote-count-update", {
        current: gameState.votes.length,
        total: gameState.players.length,
      })

      // Confirm vote to the voter
      socket.emit("vote-confirmed")
    })

    // Host requests results
    socket.on("show-results", () => {
      gameState.phase = "results"

      // Calculate results
      const voteCount: { [key: string]: number } = {}

      gameState.players.forEach((player) => {
        voteCount[player.id] = 0
      })

      gameState.votes.forEach((vote) => {
        if (voteCount[vote.targetId] !== undefined) {
          voteCount[vote.targetId]++
        }
      })

      gameState.results = gameState.players
        .map((player) => ({
          playerId: player.id,
          playerName: player.name,
          voteCount: voteCount[player.id] || 0,
        }))
        .sort((a, b) => b.voteCount - a.voteCount)

      console.log(`[Game] Results calculated:`, gameState.results)

      io.emit("results-ready", gameState.results)
    })

    // Host starts next round
    socket.on("next-round", (question: string) => {
      gameState.phase = "voting"
      gameState.currentQuestion = question
      gameState.votes = []
      gameState.results = []

      console.log(`[Game] Next round started with question: ${question}`)

      io.emit("game-started", {
        question,
        players: gameState.players,
      })
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      const playerIndex = gameState.players.findIndex((p) => p.id === socket.id)

      if (playerIndex !== -1) {
        const player = gameState.players[playerIndex]
        gameState.players.splice(playerIndex, 1)

        console.log(`[Game] Player disconnected: ${player.name} (${socket.id})`)

        io.emit("player-left", socket.id)
        io.emit("players-update", gameState.players)
      } else {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`)
      }
    })
  })

  httpServer.listen(port, hostname, () => {
    const publicURL = getPublicURL()
    console.log(`\n🎮 Amigos de Mierda - Party Game Server 🎮`)
    console.log(`\n> Ready on ${publicURL}`)
    console.log(`> Local: http://localhost:${port}`)
    console.log(`\n📱 Players can scan QR code on the HOST screen to join!\n`)
  })
})
