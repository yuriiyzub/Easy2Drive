import fs from 'fs'
import path from 'path'

// Шлях до папки з даними
const DATA_DIR = path.join(process.cwd(), 'data')
const QUESTIONS_DIR = path.join(DATA_DIR, 'questions')

/**
 * Отримати всі категорії
 */
export function getCategories() {
  const categoriesPath = path.join(DATA_DIR, 'categories.json')
  const data = fs.readFileSync(categoriesPath, 'utf8')
  return JSON.parse(data)
}

/**
 * Отримати категорію за ID
 */
export function getCategoryById(categoryId) {
  const categories = getCategories()
  return categories.find(cat => cat.id === categoryId)
}

/**
 * Отримати всі питання для категорії
 */
export function getQuestionsByCategory(categoryId) {
  const questionsPath = path.join(QUESTIONS_DIR, `${categoryId}.json`)
  
  if (!fs.existsSync(questionsPath)) {
    return []
  }
  
  const data = fs.readFileSync(questionsPath, 'utf8')
  return JSON.parse(data)
}

/**
 * Отримати конкретне питання за ID
 */
export function getQuestionById(questionId, categoryId) {
  const questions = getQuestionsByCategory(categoryId)
  const found = questions.find(q => q.id === questionId)
  
  if (!found) {
    console.warn(`Question ${questionId} not found in category ${categoryId}`)
    console.log('Available questions in category:', questions.map(q => q.id))
  }
  
  return found
}

/**
 * Отримати всі питання з усіх категорій
 */
export function getAllQuestions() {
  const categories = getCategories()
  let allQuestions = []
  
  categories.forEach(category => {
    const questions = getQuestionsByCategory(category.id)
    allQuestions = allQuestions.concat(questions)
  })
  
  return allQuestions
}

/**
 * Отримати випадкові питання
 */
export function getRandomQuestions(count, categoryId = null) {
  let questions = categoryId 
    ? getQuestionsByCategory(categoryId)
    : getAllQuestions()
  
  // Перемішуємо масив
  const shuffled = questions.sort(() => 0.5 - Math.random())
  
  // Повертаємо вказану кількість
  return shuffled.slice(0, Math.min(count, questions.length))
}

/**
 * Отримати питання за рівнем складності
 */
export function getQuestionsByDifficulty(difficulty, categoryId = null) {
  let questions = categoryId 
    ? getQuestionsByCategory(categoryId)
    : getAllQuestions()
  
  return questions.filter(q => q.difficulty === difficulty)
}

/**
 * Створити тест (набір питань)
 */
export function createQuiz(options) {
  const {
    type = 'category', // 'category', 'mixed', 'exam'
    categoryId = null,
    count = 10,
    difficulty = null
  } = options
  
  let questions = []
  
  switch (type) {
    case 'category':
      // Тест по конкретній категорії
      if (!categoryId) {
        throw new Error('Category ID is required for category quiz')
      }
      questions = getRandomQuestions(count, categoryId)
      break
      
    case 'mixed':
      // Змішаний тест з усіх категорій
      questions = getRandomQuestions(count)
      break
      
    case 'exam':
      // Іспитовий тест: 20 питань, різні категорії, різна складність
      const categories = getCategories()
      const questionsPerCategory = Math.ceil(20 / categories.length)
      
      categories.forEach(category => {
        const catQuestions = getRandomQuestions(questionsPerCategory, category.id)
        questions = questions.concat(catQuestions)
      })
      
      // Перемішуємо та беремо 20
      questions = questions.sort(() => 0.5 - Math.random()).slice(0, 20)
      break
      
    default:
      questions = getRandomQuestions(count, categoryId)
  }
  
  // Якщо вказана складність, фільтруємо
  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty)
  }
  
  return questions
}

/**
 * Перевірити відповідь на питання
 */
export function checkAnswer(questionId, categoryId, selectedAnswer) {
  const question = getQuestionById(questionId, categoryId)
  
  if (!question) {
    return { valid: false, error: 'Question not found' }
  }
  
  const isCorrect = question.correctAnswer === selectedAnswer
  
  return {
    valid: true,
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    points: isCorrect ? question.points : 0
  }
}

/**
 * Підрахувати результат тесту
 */
export function calculateQuizResult(answers, questions, quizType = 'category') {
  let correctAnswers = 0
  let wrongAnswers = 0
  let totalPoints = 0
  let earnedPoints = 0
  
  const detailedAnswers = answers.map((answer, index) => {
    const question = questions[index]
    const isCorrect = question.correctAnswer === answer.selectedAnswer
    
    totalPoints += question.points
    
    if (isCorrect) {
      correctAnswers++
      earnedPoints += question.points
    } else {
      wrongAnswers++
    }
    
    return {
      questionId: question.id,
      questionText: question.question,
      categoryId: question.categoryId,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeSpent: answer.timeSpent || 0,
      explanation: question.explanation,
      options: question.options
    }
  })
  
  const percentage = (correctAnswers / questions.length) * 100
  
  // Логіка перевірки проходження
  let passed = false
  let failReason = null
  let recommendation = null
  
  if (quizType === 'exam') {
    // Іспит: максимум 3 помилки з 20 питань
    if (wrongAnswers <= 3) {
      passed = true
    } else {
      passed = false
      failReason = 'exam_failed'
      recommendation = 'Don\'t be discouraged! You\'re on the right track. We recommend reviewing topics where you had difficulties and trying again. Each attempt brings you closer to success! 💪'
    }
  } else {
    // Тести по темах: максимум 5 помилок
    if (wrongAnswers <= 5) {
      passed = true
    } else {
      passed = false
      failReason = 'category_failed'
      recommendation = 'We recommend reviewing this topic again. Pay attention to the questions where you made mistakes. Practice makes perfect! 📚'
    }
  }
  
  return {
    correctAnswers,
    wrongAnswers,
    totalQuestions: questions.length,
    score: earnedPoints,
    maxScore: totalPoints,
    percentage: Math.round(percentage * 10) / 10,
    passed,
    failReason,
    recommendation,
    answers: detailedAnswers
  }
}

