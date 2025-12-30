"use client"

import { useState, useEffect } from "react"
import { getSocket } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Socket } from "socket.io-client"

interface Player {
  id: string
  name: string
}

interface GameState {
  phase: "lobby" | "voting" | "results"
  players: Player[]
  currentQuestion: string
}

interface Result {
  playerId: string
  playerName: string
  voteCount: number
}

export default function PlayerPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [playerName, setPlayerName] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const [gamePhase, setGamePhase] = useState<"lobby" | "voting" | "results">("lobby")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [winner, setWinner] = useState<Result | null>(null)

  useEffect(() => {
    const socketInstance = getSocket()
    setSocket(socketInstance)

    // Listen for game state
    socketInstance.on("game-state", (state: GameState) => {
      setGamePhase(state.phase)
      setPlayers(state.players)
      setCurrentQuestion(state.currentQuestion)
    })

    // Listen for players update
    socketInstance.on("players-update", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers)
    })

    // Listen for game start
    socketInstance.on("game-started", (data: { question: string; players: Player[] }) => {
      setGamePhase("voting")
      setCurrentQuestion(data.question)
      setPlayers(data.players)
      setHasVoted(false)
    })

    // Listen for vote confirmation
    socketInstance.on("vote-confirmed", () => {
      setHasVoted(true)
    })

    // Listen for results
    socketInstance.on("results-ready", (results: Result[]) => {
      setGamePhase("results")
      if (results.length > 0) {
        setWinner(results[0])
      }
    })

    return () => {
      socketInstance.off("game-state")
      socketInstance.off("players-update")
      socketInstance.off("game-started")
      socketInstance.off("vote-confirmed")
      socketInstance.off("results-ready")
    }
  }, [])

  const handleJoinGame = () => {
    if (playerName.trim() && socket) {
      socket.emit("join-game", playerName.trim())
      setHasJoined(true)
    }
  }

  const handleVote = (targetId: string) => {
    if (socket && !hasVoted) {
      socket.emit("submit-vote", targetId)
    }
  }

  // LOBBY STATE - Not joined yet
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-white">
              Amigos de
              <br />
              <span className="text-red-500">Mierda</span>
            </h1>
            <p className="text-gray-400 text-xl">Party Game</p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Tu nombre o apodo"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
              className="h-16 text-2xl bg-[#222] border-2 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
              maxLength={20}
            />

            <Button
              onClick={handleJoinGame}
              disabled={!playerName.trim()}
              className="w-full h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-black disabled:bg-gray-700 disabled:text-gray-500"
            >
              ENTRAR
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // LOBBY STATE - Waiting for host
  if (gamePhase === "lobby") {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <p className="text-3xl text-gray-400">Hola,</p>
            <h1 className="text-5xl font-bold text-white">{playerName}</h1>
          </div>

          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-4"></div>
            </div>
            <p className="text-2xl text-gray-400">Esperando al Host...</p>
            <p className="text-lg text-gray-600">{players.length} jugadores conectados</p>
          </div>
        </div>
      </div>
    )
  }

  // VOTING STATE
  if (gamePhase === "voting") {
    return (
      <div className="min-h-screen bg-[#111] p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white leading-tight">{currentQuestion}</h2>
          </div>

          {hasVoted ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-green-500">VOTO ENVIADO</p>
              <p className="text-xl text-gray-400">Esperando a los demás...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {players
                .filter((p) => p.id !== socket?.id)
                .map((player) => (
                  <Button
                    key={player.id}
                    onClick={() => handleVote(player.id)}
                    className="h-20 text-2xl font-bold bg-[#222] hover:bg-red-500 text-white border-2 border-gray-700 hover:border-red-500 transition-all"
                  >
                    {player.name}
                  </Button>
                ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // RESULTS STATE
  if (gamePhase === "results" && winner) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <p className="text-2xl text-gray-400">El ganador es...</p>
            <h1 className="text-6xl font-bold text-red-500 animate-pulse">{winner.playerName}</h1>
            <div className="flex items-center justify-center gap-2">
              <p className="text-4xl font-bold text-yellow-500">{winner.voteCount}</p>
              <p className="text-2xl text-gray-400">votos</p>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-xl text-gray-500">Esperando próxima ronda...</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
