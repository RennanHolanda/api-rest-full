import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from "./lib/prisma"

export async function appRoutes(app: FastifyInstance) {
    app.post('/habits', async (req) =>{
     const createHabitBody = z.object({
        title: z.string(),
        weekDays: z.array(z.number().min(0).max(6))
     })


        const { title, weekDays} = createHabitBody.parse(req.body)  

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                 title,
                 created_at: today,
                 weekDays: {
                    create: weekDays.map(weekDays => {
                        return {
                            week_day: weekDays,
                        }
                    })
                 }
            }
        })
    })

    app.get('/day', async (req)=> {
        const getDayParams = z.object({
            date: z.coerce.date()
        })

        const { date } = getDayParams.parse(req.query)

        const parseDate = dayjs(date).startOf('day')
        const weekDay = parseDate.get('day')

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay,
                    }
                }
            }
        })
        return {
            possibleHabits,
        }
    })
}


