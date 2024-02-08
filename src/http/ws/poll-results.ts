import { FastifyInstance } from "fastify"
import { z } from "zod"
import { voting } from "../utils/voting-pub-sub"

export async function pollResults(app: FastifyInstance) {
  // Ao acessar a rota, é mantido uma conexão aberta em tempo real, onde é retornado o resultado para da enquete fornecida
  app.get("/polls/:pollId/results", { websocket: true }, (connection, req) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    })

    const { pollId } = getPollParams.parse(req.params)

    // Se inscreve apenas nas mensagens publicadas no canal com o id da enquete "pollId"
    voting.subscribe(pollId, (message) => {
      connection.socket.send(JSON.stringify(message))
    })
  })
}
