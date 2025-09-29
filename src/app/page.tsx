export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            System Dyspozycyjności Pracowników
          </h1>
          <p className="text-xl text-gray-600">
            Zarządzaj dostępnością swojego zespołu w prosty sposób
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Dla Pracowników
            </h2>
            <p className="text-gray-600 mb-6">
              Zaloguj się aby podać swoją dyspozycyjność na nadchodzący miesiąc
            </p>
            <div className="space-y-3">
              <a
                href="/employee/login"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Zaloguj się
              </a>
              <a
                href="/employee/register"
                className="block w-full bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-center"
              >
                Załóż konto
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Panel Administratora
            </h2>
            <p className="text-gray-600 mb-6">
              Przeglądaj dyspozycyjność wszystkich pracowników
            </p>
            <a
              href="/admin/login"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Panel Administratora
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}