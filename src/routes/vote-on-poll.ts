import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { randomUUID } from "node:crypto"

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
      if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId != pollOptionId) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
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

    return reply.status(201).send({ message: "Vote computed" })
  })
}
