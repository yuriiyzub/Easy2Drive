import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"

export default function Quiz() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { categoryId } = router.query
  
  const [category, setCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (categoryId) {
      loadQuiz()
    }
  }, [categoryId])

  // Таймер
  useEffect(() => {
    if (quizStarted && currentQuestionIndex < questions.length) {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [quizStarted, currentQuestionIndex, questions.length])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      
      // Визначаємо тип тесту
      let quizType = 'category'
      let endpoint = '/api/quiz/create'
      let body = {
        type: 'category',
        categoryId: categoryId,
        count: 10
      }
      
      if (categoryId === 'exam') {
        quizType = 'exam'
        body = { type: 'exam', count: 20 }
      } else if (categoryId === 'mixed') {
        quizType = 'mixed'
        body = { type: 'mixed', count: 15 }
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
        
        // Отримуємо інформацію про категорію
        if (categoryId !== 'exam' && categoryId !== 'mixed') {
          const catResponse = await fetch(`/api/questions/${categoryId}`)
          const catData = await catResponse.json()
          setCategory(catData.category)
        } else {
          setCategory({
            id: categoryId,
            name: categoryId === 'exam' ? 'Practice Exam' : 'Mixed Test',
            icon: categoryId === 'exam' ? '🎓' : '🎯',
            description: categoryId === 'exam' 
              ? 'Simulation of the real driving exam' 
              : 'Questions from different categories'
          })
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setQuestionStartTime(Date.now())
  }

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return
    
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000)
    
    // Зберігаємо відповідь
    setAnswers([...answers, {
      selectedAnswer,
      timeSpent: questionTime
    }])
    
    // Переходимо до наступного питання
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setQuestionStartTime(Date.now())
    } else {
      // Завершуємо тест
      submitQuiz([...answers, {
        selectedAnswer,
        timeSpent: questionTime
      }])
    }
  }

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true)
    
    try {
      const payload = {
        categoryId: category.id,
        quizType: categoryId === 'exam' ? 'exam' : 'category',
        answers: finalAnswers,
        questionIds: questions.map(q => q.id),
        timeSpent: timeSpent
      }
      
      console.log('=== SUBMITTING QUIZ ===')
      console.log('Payload:', payload)
      console.log('Questions:', questions)
      console.log('Final Answers:', finalAnswers)
      
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      console.log('API Response:', result)
      
      // Зберігаємо результат в sessionStorage для швидкого відображення
      const resultToSave = {
        ...result,
        categoryId: category.id,
        quizType: categoryId === 'exam' ? 'exam' : 'category',
        timeSpent: timeSpent
      }
      
      console.log('Saving to sessionStorage:', resultToSave)
      sessionStorage.setItem('quizResult', JSON.stringify(resultToSave))
      
      // Перенаправляємо на сторінку результатів
      router.push({
        pathname: '/quiz/result',
        query: { resultId: result.resultId }
      })
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Error saving results. Please try again.')
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading test...</div>
      </div>
    )
  }

  if (!session || !category || questions.length === 0) {
    return null
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Екран перед початком тесту
  if (!quizStarted) {
    return (
      <>
        <Head>
          <title>{category.name} - Easy2Drive</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600 mb-8">
                {category.description}
              </p>

              {/* Інформація про тест */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">
                    {categoryId === 'exam' ? '3' : '5'}
                  </div>
                  <div className="text-sm text-gray-600">Max. mistakes</div>
                </div>
              </div>

              {/* Правила */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Passing Rules:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>
                      {categoryId === 'exam' 
                        ? 'Exam: to pass you must give no more than 3 incorrect answers out of 20 questions'
                        : 'Test: to pass you must give no more than 5 incorrect answers'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>Choose one correct answer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>Time is unlimited but tracked in statistics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>After answering a question you cannot go back</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Link href="/categories" className="flex-1">
                  <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Back
                  </button>
                </Link>
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Екран проходження тесту
  return (
    <>
      <Head>
        <title>Question {currentQuestionIndex + 1} of {questions.length} - Easy2Drive NL</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Заголовок з прогресом */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h2 className="font-semibold text-gray-900">{category.name}</h2>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-xs text-gray-600">Time Taken</div>
              </div>
            </div>
            
            {/* Прогрес бар */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Текст питання */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {currentQuestion.question}
                  </h3>
                  {currentQuestion.image && (
                    <div className="mt-6 mb-4 flex justify-center">
                      <img 
                        src={currentQuestion.image} 
                        alt="Question illustration"
                        className="rounded-lg shadow-lg max-w-sm w-full object-contain"
                        style={{ maxHeight: '300px' }}
                        onError={(e) => {
                          console.error('Image failed to load:', currentQuestion.image)
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Варіанти відповідей */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-lg ${
                      selectedAnswer === index ? 'text-indigo-900 font-medium' : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Кнопка далі */}
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || submitting}
                className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedAnswer === null || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <>
                    Finish Test
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Підказка */}
          {selectedAnswer === null && (
            <div className="mt-4 text-center text-gray-600">
              <p className="text-sm">Choose one of the answer options</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

