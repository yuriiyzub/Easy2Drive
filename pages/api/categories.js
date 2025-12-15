import { getCategories } from '../../lib/questions'

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = getCategories()
      res.status(200).json(categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      res.status(500).json({ error: 'Failed to fetch categories' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}



