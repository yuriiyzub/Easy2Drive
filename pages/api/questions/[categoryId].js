import { getQuestionsByCategory, getCategoryById } from '../../../lib/questions'

export default function handler(req, res) {
  const { categoryId } = req.query
  
  if (req.method === 'GET') {
    try {
      const category = getCategoryById(categoryId)
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }
      
      const questions = getQuestionsByCategory(categoryId)
      
      res.status(200).json({
        category,
        questions,
        total: questions.length
      })
    } catch (error) {
      console.error('Error fetching questions:', error)
      res.status(500).json({ error: 'Failed to fetch questions' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}



