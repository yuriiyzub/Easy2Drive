import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"

export default function History() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [results, setResults] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      fetchResults()
    }
  }, [session])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results/${session.user.email}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Results loaded:', data)
        setResults(data.results || [])
        setStats(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} min ${secs} sec`
  }

  const getCategoryName = (categoryId) => {
    const categories = {
      'traffic-signs': '🚦 Traffic Signs',
      'traffic-rules': '🚗 Traffic Rules',
      'priority': '🔀 Priority Rules',
      'road-marking': '〰️ Road Markings',
      'first-aid': '⚕️ First Aid',
      'traffic-lights': '🚥 Traffic Lights',
      'parking': '🅿️ Parking & Stopping',
      'safety': '⚠️ Road Safety',
      'exam': '🎓 Practice Exam',
      'mixed': '🎯 Mixed Test'
    }
    return categories[categoryId] || categoryId
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

  return (
    <>
      <Head>
        <title>Test History - Easy2Drive NL</title>
        <meta name="description" content="Your completed test history" />
      </Head>

      <div className="min-h-screen bg-gray-50">
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test History</h1>
            <p className="text-gray-600">View all your completed tests and results</p>
          </div>

          {/* Загальна статистика */}
          {stats && stats.totalTests > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Tests</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalTests}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Passed</p>
                <p className="text-3xl font-bold text-green-600">{stats.passedTests}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.totalTests - stats.passedTests}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Average Score</p>
                <p className="text-3xl font-bold text-purple-600">{Math.round(stats.averageScore)}%</p>
              </div>
            </div>
          )}

          {/* Список результатів */}
          {results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                You haven't taken any tests yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by choosing a category and take your first test!
              </p>
              <Link href="/categories">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Choose Test
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={result.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                    result.passed 
                      ? 'border-green-200 hover:border-green-300' 
                      : 'border-red-200 hover:border-red-300'
                  } transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Заголовок */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getCategoryName(result.categoryId).split(' ')[0]}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getCategoryName(result.categoryId).substring(2)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(result.completedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Статистика тесту */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Result</p>
                          <p className={`text-xl font-bold ${
                            result.passed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.round(result.percentage)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Correct</p>
                          <p className="text-xl font-bold text-green-600">
                            {result.correctAnswers}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Incorrect</p>
                          <p className="text-xl font-bold text-red-600">
                            {result.totalQuestions - result.correctAnswers}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Questions</p>
                          <p className="text-xl font-bold text-gray-900">
                            {result.totalQuestions}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatTime(result.timeSpent)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Статус */}
                    <div className={`ml-4 px-4 py-2 rounded-lg font-medium ${
                      result.passed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.passed ? '✓ Passed' : '✗ Failed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Кнопки дій */}
          {results.length > 0 && (
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/categories">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Take New Test
                </button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

