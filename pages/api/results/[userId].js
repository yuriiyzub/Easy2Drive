import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions)
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      // Знаходимо користувача
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      // Отримуємо результати
      const results = await prisma.quizResult.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: 'desc' },
        take: 50 // Останні 50 результатів
      })
      
      // Статистика
      const totalTests = results.length
      const passedTests = results.filter(r => r.passed).length
      const averageScore = totalTests > 0
        ? results.reduce((sum, r) => sum + r.percentage, 0) / totalTests
        : 0
      
      // Статистика по категоріях
      const categoryStats = {}
      results.forEach(result => {
        if (!categoryStats[result.categoryId]) {
          categoryStats[result.categoryId] = {
            total: 0,
            passed: 0,
            averageScore: 0,
            totalScore: 0
          }
        }
        categoryStats[result.categoryId].total++
        if (result.passed) categoryStats[result.categoryId].passed++
        categoryStats[result.categoryId].totalScore += result.percentage
      })
      
      Object.keys(categoryStats).forEach(catId => {
        const stats = categoryStats[catId]
        stats.averageScore = stats.totalScore / stats.total
      })
      
      res.status(200).json({
        results,
        statistics: {
          totalTests,
          passedTests,
          averageScore: Math.round(averageScore * 10) / 10,
          categoryStats
        }
      })
    } catch (error) {
      console.error('Error fetching results:', error)
      res.status(500).json({ error: 'Failed to fetch results' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

