"use client"

import { useState, useEffect } from "react"
import { getSocket } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { questions } from "@/utils/questions"
import type { Socket } from "socket.io-client"

interface Player {
  id: string
  name: string
}

interface Result {
  playerId: string
  playerName: string
  voteCount: number
}

export default function HostPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [publicURL, setPublicURL] = useState<string>("")
  const [gamePhase, setGamePhase] = useState<"lobby" | "voting" | "results">("lobby")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [voteCount, setVoteCount] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState<Result[]>([])
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    const socketInstance = getSocket()
    setSocket(socketInstance)

    socketInstance.on("public-url", (url: string) => {
      setPublicURL(url)
    })

    socketInstance.on("game-state", (state: any) => {
      setGamePhase(state.phase)
      setPlayers(state.players)
      setCurrentQuestion(state.currentQuestion)
    })

    socketInstance.on("players-update", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers)
      if (gamePhase === "voting") {
        setVoteCount((prev) => ({ ...prev, total: updatedPlayers.length }))
      }
    })

    socketInstance.on("player-joined", (player: Player) => {
      console.log("Player joined:", player)
    })

    socketInstance.on("vote-count-update", (count: { current: number; total: number }) => {
      setVoteCount(count)
    })

    socketInstance.on("results-ready", (resultsData: Result[]) => {
      setGamePhase("results")
      setResults(resultsData)
    })

    return () => {
      socketInstance.off("public-url")
      socketInstance.off("game-state")
      socketInstance.off("players-update")
      socketInstance.off("player-joined")
      socketInstance.off("vote-count-update")
      socketInstance.off("results-ready")
    }
  }, [gamePhase])

  const getRandomQuestion = (): string => {
    const availableIndices = questions.map((_, index) => index).filter((index) => !usedQuestions.has(index))

    if (availableIndices.length === 0) {
      setUsedQuestions(new Set())
      return questions[Math.floor(Math.random() * questions.length)]
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    setUsedQuestions((prev) => new Set(prev).add(randomIndex))
    return questions[randomIndex]
  }

  const handleStartGame = () => {
    if (players.length < 2) {
      alert("Necesitas al menos 2 jugadores para comenzar")
      return
    }

    const question = getRandomQuestion()
    setCurrentQuestion(question)
    setVoteCount({ current: 0, total: players.length })

    if (socket) {
      socket.emit("start-game", question)
    }
  }

  const handleShowResults = () => {
    if (socket) {
      socket.emit("show-results")
    }
  }

  const handleNextRound = () => {
    const question = getRandomQuestion()
    setCurrentQuestion(question)
    setVoteCount({ current: 0, total: players.length })
    setResults([])

    if (socket) {
      socket.emit("next-round", question)
    }
  }

  const qrUrl = publicURL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

  if (gamePhase === "lobby") {
    return (
      <div className="min-h-screen bg-[#111] p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-7xl font-bold text-white">
              Amigos de <span className="text-red-500">Mierda</span>
            </h1>
            <p className="text-3xl text-gray-400">Party Game - HOST</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-3xl p-12 border-4 border-gray-800">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="text-center md:text-left space-y-4">
                  <h2 className="text-4xl font-bold text-white">Escanea para unirte</h2>
                  <p className="text-2xl text-gray-400">Abre la cámara de tu celular</p>
                  <div className="text-lg text-green-500 font-mono break-all">{qrUrl}</div>
                </div>

                <div className="bg-[#111] p-8 rounded-2xl border-2 border-gray-700">
                  <div className="text-center space-y-4">
                    <p className="text-3xl text-gray-400">Jugadores conectados</p>
                    <p className="text-7xl font-bold text-green-500">{players.length}</p>
                  </div>

                  {players.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {players.map((player) => (
                        <div key={player.id} className="text-xl text-gray-400 text-center">
                          {player.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-8 rounded-3xl">
                  <QRCodeSVG value={qrUrl} size={320} level="H" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleStartGame}
              disabled={players.length < 2}
              className="h-24 px-16 text-4xl font-bold bg-green-500 hover:bg-green-600 text-black disabled:bg-gray-700 disabled:text-gray-500"
            >
              COMENZAR
            </Button>
            {players.length < 2 && <p className="mt-4 text-xl text-gray-500">Necesitas al menos 2 jugadores</p>}
          </div>
        </div>
      </div>
    )
  }

  if (gamePhase === "voting") {
    return (
      <div className="min-h-screen bg-[#111] p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-6xl font-bold text-white leading-tight px-12">{currentQuestion}</h2>
          </div>

          <div className="bg-[#1a1a1a] rounded-3xl p-12 border-4 border-yellow-500">
            <div className="text-center space-y-6">
              <div className="animate-pulse">
                <p className="text-4xl text-yellow-500 font-bold">VOTACIÓN EN CURSO</p>
              </div>

              <div className="space-y-2">
                <p className="text-3xl text-gray-400">Votos recibidos</p>
                <p className="text-8xl font-bold text-white">
                  {voteCount.current} / {voteCount.total}
                </p>
              </div>

              <div className="pt-6">
                <div className="w-full bg-[#111] rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ width: `${(voteCount.current / voteCount.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleShowResults}
              disabled={voteCount.current < voteCount.total}
              className="h-24 px-16 text-4xl font-bold bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-700 disabled:text-gray-500"
            >
              VER RESULTADOS
            </Button>
            {voteCount.current < voteCount.total && (
              <p className="mt-4 text-xl text-gray-500">Esperando a que todos voten...</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (gamePhase === "results") {
    const maxVotes = results[0]?.voteCount || 0

    return (
      <div className="min-h-screen bg-[#111] p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-bold text-white">RESULTADOS</h2>
            <p className="text-3xl text-gray-400">{currentQuestion}</p>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => {
              const percentage = maxVotes > 0 ? (result.voteCount / maxVotes) * 100 : 0
              const isWinner = index === 0 && result.voteCount > 0

              return (
                <div
                  key={result.playerId}
                  className={`relative bg-[#1a1a1a] rounded-2xl p-6 border-4 overflow-hidden ${
                    isWinner ? "border-red-500 animate-pulse" : "border-gray-800"
                  }`}
                >
                  <div
                    className={`absolute inset-0 transition-all duration-1000 ${
                      isWinner ? "bg-red-500/20" : "bg-gray-800/50"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`text-4xl font-bold ${isWinner ? "text-red-500" : "text-gray-500"}`}>
                        #{index + 1}
                      </div>
                      <div className={`text-3xl font-bold ${isWinner ? "text-white" : "text-gray-400"}`}>
                        {result.playerName}
                      </div>
                    </div>

                    <div className={`text-5xl font-bold ${isWinner ? "text-red-500" : "text-gray-400"}`}>
                      {result.voteCount} votos
                    </div>
                  </div>

                  {isWinner && (
                    <div className="absolute top-2 right-2">
                      <span className="text-6xl">🔥</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <Button
              onClick={handleNextRound}
              className="h-24 px-16 text-4xl font-bold bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              SIGUIENTE RONDA
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
