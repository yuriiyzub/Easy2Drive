import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"

export default function Categories() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const difficultyColors = {
    easy: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    hard: 'text-red-600 bg-red-100'
  }

  const difficultyText = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  }

  return (
    <>
      <Head>
        <title>Categories - Easy2Drive NL</title>
        <meta name="description" content="Choose a category for testing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Навігаційна панель */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Easy2Drive</span>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    ← Back
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Основний контент */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose a category to test
            </h1>
            <p className="text-xl text-gray-600">
              Prepare for your driving theory exam by topic
            </p>
          </div>

          {/* Сітка категорій */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link href={`/quiz/${category.id}`} key={category.id}>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden">
                  {/* Кольорова шапка */}
                  <div className={`h-2 ${category.color}`}></div>
                  
                  <div className="p-6">
                    {/* Іконка та назва */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{category.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {category.name}
                          </h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[category.difficulty]}`}>
                            {difficultyText[category.difficulty]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Опис */}
                    <p className="text-gray-600 mb-4 min-h-[48px]">
                      {category.description}
                    </p>

                    {/* Статистика */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">{category.totalQuestions} questions</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-indigo-600 font-medium">
                        <span>Start</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Спеціальні режими */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Special Modes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Іспит */}
              <Link href="/quiz/exam">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">🎓</div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      20 questions
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Practice Exam</h3>
                  <p className="text-purple-100 mb-4">
                    20 random questions from all categories. Real exam simulation.
                  </p>
                  <div className="flex items-center gap-2 font-medium">
                    <span>Start Exam</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Review Mistakes */}
              <Link href="/quiz/mistakes">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">🎯</div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      Personalized
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Review Mistakes</h3>
                  <p className="text-orange-100 mb-4">
                    Review questions you previously answered incorrectly.
                  </p>
                  <div className="flex items-center gap-2 font-medium">
                    <span>Start Practice</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

