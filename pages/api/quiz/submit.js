import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import { calculateQuizResult, getQuestionById } from '../../../lib/questions'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions)
      
      console.log('Session check:', session ? 'authenticated' : 'not authenticated')
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized - Please login' })
      }
      
      const { categoryId, quizType, answers, questionIds, timeSpent } = req.body
      
      console.log('=== SUBMIT QUIZ DEBUG ===')
      console.log('categoryId:', categoryId)
      console.log('quizType:', quizType)
      console.log('answers:', answers)
      console.log('questionIds:', questionIds)
      console.log('timeSpent:', timeSpent)
      
      // Отримуємо повні дані питань
      const questions = questionIds.map(qId => {
        const [catId] = qId.split('_')
        // Визначаємо категорію з ID питання (наприклад, ts_001 -> traffic-signs)
        const categoryMap = {
          'ts': 'traffic-signs',
          'tr': 'traffic-rules',
          'pr': 'priority',
          'rm': 'road-marking',
          'fa': 'first-aid',
          'tl': 'traffic-lights',
          'pk': 'parking',
          'sf': 'safety'
        }
        const category = categoryMap[catId] || categoryId
        const question = getQuestionById(qId, category)
        console.log(`Getting question ${qId} from category ${category}:`, question ? 'found' : 'NOT FOUND')
        return question
      }).filter(q => q !== undefined)
      
      console.log('Total questions loaded:', questions.length)
      console.log('Questions:', questions)
      
      // Підраховуємо результат
      const result = calculateQuizResult(answers, questions, quizType)
      
      console.log('Calculated result:', result)
      console.log('=== END DEBUG ===')
      
      // Знаходимо або створюємо користувача
      let user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image
          }
        })
      }
      
      // Зберігаємо результат тесту
      const quizResult = await prisma.quizResult.create({
        data: {
          userId: user.id,
          categoryId: categoryId || 'mixed',
          quizType: quizType || 'category',
          answers: JSON.stringify(result.answers),
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          percentage: result.percentage,
          timeSpent: timeSpent || 0,
          passed: result.passed
        }
      })
      
      // Зберігаємо помилки для роботи над помилками
      const mistakes = result.answers.filter(a => !a.isCorrect)
      
      for (const mistake of mistakes) {
        await prisma.mistakeQuestion.upsert({
          where: {
            userId_questionId: {
              userId: user.id,
              questionId: mistake.questionId
            }
          },
          update: {
            wrongAttempts: { increment: 1 },
            lastAttempt: new Date()
          },
          create: {
            userId: user.id,
            questionId: mistake.questionId,
            categoryId: categoryId || 'mixed',
            wrongAttempts: 1
          }
        })
      }
      
      res.status(200).json({
        resultId: quizResult.id,
        ...result
      })
    } catch (error) {
      console.error('Error submitting quiz:', error)
      res.status(500).json({ error: 'Failed to submit quiz', details: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

