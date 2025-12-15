import { createQuiz } from '../../../lib/questions'

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { type, categoryId, count, difficulty } = req.body
      
      const questions = createQuiz({
        type: type || 'category',
        categoryId,
        count: count || 10,
        difficulty
      })
      
      // Видаляємо правильні відповіді та пояснення з питань
      const questionsForQuiz = questions.map(q => ({
        id: q.id,
        categoryId: q.categoryId,
        question: q.question,
        image: q.image,
        options: q.options,
        difficulty: q.difficulty,
        points: q.points
      }))
      
      res.status(200).json({
        questions: questionsForQuiz,
        total: questionsForQuiz.length
      })
    } catch (error) {
      console.error('Error creating quiz:', error)
      res.status(400).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}



