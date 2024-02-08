import { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "node:crypto"
import { redis } from "../../lib/redis"
import { prisma } from "../../lib/prisma"
import { voting } from "../utils/voting-pub-sub"

export async function voteOnPoll(app: FastifyInstance) {
  app.post("/polls/:pollId/votes", async (req, reply) => {
    const voteOnPollParams = z.object({
      pollId: z.string().uuid(),
    })
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    })

    const { pollId } = voteOnPollParams.parse(req.params)
    const { pollOptionId } = voteOnPollBody.parse(req.body)

    let { sessionId } = req.cookies

    // Não é a primeira vez que o usuário tentar votar / o usuário já votou nesta enquete
    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      })
      // Valida se o usuário já votou e se o voto de agora é diferente do anterior.
      // Se sim, deleta o voto anterior.
      if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId != pollOptionId) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
        })

        const votes = await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId)

        voting.publish(pollId, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes),
        })
      } else if (userPreviousVoteOnPoll) {
        // Votou na mesma opção
        return reply.status(400).send({ message: "You already voted on this poll." })
      }
    }

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true,
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    })

    // Enquete (chave), valor a ser incrementado, opção que irá receber esse valor
    // Aumenta o rank em 1 a opção "pollOptionId" da enquete "pollId"
    const votes = await redis.zincrby(pollId, 1, pollOptionId)

    // Publica uma mensagem avisando que houve um novo voto.
    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes),
    })

    return reply.status(201).send({ message: "Vote computed" })
  })
}
