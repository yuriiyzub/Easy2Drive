import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"

export default function QuizResult() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { resultId } = router.query
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    // Отримуємо результат з sessionStorage (тимчасово, доки не зроблю API endpoint)
    const savedResult = sessionStorage.getItem('quizResult')
    if (savedResult) {
      const parsedResult = JSON.parse(savedResult)
      console.log('Loaded result from sessionStorage:', parsedResult)
      setResult(parsedResult)
      setLoading(false)
    } else if (resultId) {
      // TODO: Завантажити з API за resultId
      console.log('No result in sessionStorage, resultId:', resultId)
      setLoading(false)
    }
  }, [resultId])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading results...</div>
      </div>
    )
  }

  if (!session || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Results not found</p>
          <Link href="/categories">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Return to Categories
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const isExam = result.quizType === 'exam'
  const maxErrors = isExam ? 3 : 5
  
  // Виправляємо відсутні поля (якщо вони не прийшли з API)
  const correctAnswers = result.correctAnswers || 0
  const wrongAnswers = result.wrongAnswers || (result.totalQuestions - correctAnswers) || 0
  const totalQuestions = result.totalQuestions || 0
  const percentage = result.percentage || 0
  const passed = result.passed !== undefined ? result.passed : false
  const timeSpent = result.timeSpent || 0

  // Мотиваційні повідомлення
  const getMotivationalMessage = () => {
    if (passed) {
      if (wrongAnswers === 0) {
        return {
          title: '🌟 Perfect!',
          message: 'All answers correct! You know the material perfectly!',
          color: 'from-yellow-400 to-orange-500'
        }
      } else if (percentage >= 90) {
        return {
          title: '🎉 Excellent!',
          message: 'Great result! You\'re ready for the exam!',
          color: 'from-green-400 to-emerald-500'
        }
      } else {
        return {
          title: '✅ Test Passed!',
          message: isExam 
            ? 'Congratulations! You successfully passed the practice exam!' 
            : 'Great work! Keep up the good work!',
          color: 'from-blue-400 to-indigo-500'
        }
      }
    } else {
      if (isExam) {
        return {
          title: '📚 Exam Not Passed',
          message: result.recommendation || 'Don\'t be discouraged! You\'re on the right track. We recommend reviewing topics where you had difficulties and trying again. Each attempt brings you closer to success! 💪',
          color: 'from-orange-400 to-red-500',
          icon: '💪'
        }
      } else {
        return {
          title: '📖 Need Practice',
          message: result.recommendation || 'We recommend reviewing this topic again. Pay attention to the questions where you made mistakes. Practice makes perfect! 📚',
          color: 'from-yellow-400 to-orange-400',
          icon: '📚'
        }
      }
    }
  }

  const motivational = getMotivationalMessage()

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} min ${secs} sec`
  }

  return (
    <>
      <Head>
        <title>Test Results - Easy2Drive NL</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Основна картка результату */}
          <div className={`bg-gradient-to-r ${motivational.color} rounded-2xl shadow-2xl p-8 text-white mb-8`}>
            <div className="text-center">
              <div className="text-7xl mb-4">
                {result.passed ? '🎉' : motivational.icon || '😊'}
              </div>
              <h1 className="text-4xl font-bold mb-3">
                {motivational.title}
              </h1>
              <p className="text-xl mb-6 opacity-90">
                {motivational.message}
              </p>
              
              {/* Великий відсоток */}
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-12 py-6 mb-4">
                <div className="text-7xl font-bold">
                  {Math.round(percentage)}%
                </div>
                <div className="text-lg opacity-90">Correct Answers</div>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {wrongAnswers}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>

          {/* Аналіз помилок */}
          {wrongAnswers > 0 && (
            <div className={`rounded-xl shadow-md p-6 mb-8 ${
              passed ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <svg className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                  passed ? 'text-yellow-600' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    passed ? 'text-yellow-900' : 'text-red-900'
                  }`}>
                    Results Analysis
                  </h3>
                  <p className={`text-sm ${
                    passed ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {isExam ? (
                      <>
                        You made <strong>{wrongAnswers}</strong> {wrongAnswers === 1 ? 'mistake' : 'mistakes'} out of maximum allowed <strong>{maxErrors}</strong>.
                        {!passed && ' You need to improve your result to pass the exam.'}
                      </>
                    ) : (
                      <>
                        You made <strong>{wrongAnswers}</strong> {wrongAnswers === 1 ? 'mistake' : 'mistakes'} out of maximum allowed <strong>{maxErrors}</strong>.
                        {!passed && ' We recommend reviewing the material of this topic.'}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Детальні відповіді */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">
                Detailed Answer Review
              </span>
              <svg 
                className={`h-6 w-6 text-gray-600 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDetails && (
              <div className="border-t border-gray-200 p-6 space-y-6">
                {result.answers && result.answers.map((answer, index) => (
                  <div 
                    key={index}
                    className={`rounded-lg border-2 p-4 ${
                      answer.isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    {/* Номер питання та статус */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          answer.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <span className={`text-sm font-semibold ${
                          answer.isCorrect ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {answer.timeSpent} sec
                      </span>
                    </div>

                    {/* Питання */}
                    <h4 className="font-medium text-gray-900 mb-3">
                      {answer.questionText || 'Question'}
                    </h4>

                    {/* Відповіді */}
                    <div className="space-y-2">
                      {answer.options && answer.options.map((option, optIndex) => {
                        const isSelected = optIndex === answer.selectedAnswer
                        const isCorrect = optIndex === answer.correctAnswer
                        
                        let bgColor = 'bg-white'
                        let borderColor = 'border-gray-300'
                        let textColor = 'text-gray-700'
                        
                        if (isCorrect) {
                          bgColor = 'bg-green-100'
                          borderColor = 'border-green-400'
                          textColor = 'text-green-900'
                        } else if (isSelected && !isCorrect) {
                          bgColor = 'bg-red-100'
                          borderColor = 'border-red-400'
                          textColor = 'text-red-900'
                        }
                        
                        return (
                          <div 
                            key={optIndex}
                            className={`p-3 rounded border-2 ${bgColor} ${borderColor}`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrect && (
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isSelected && !isCorrect && (
                                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              <span className={`${textColor} ${isCorrect || isSelected ? 'font-medium' : ''}`}>
                                {option}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {!answer.isCorrect && answer.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex gap-2">
                          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                            <p className="text-sm text-blue-800">{answer.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Дії */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/categories" className="flex-1">
              <button className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Choose Another Topic
              </button>
            </Link>
            
            {!passed && (
              <Link href={`/quiz/${result.categoryId || 'traffic-signs'}`} className="flex-1">
                <button className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                  Try Again
                </button>
              </Link>
            )}
            
            <Link href="/dashboard" className="flex-1">
              <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                To Main
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

