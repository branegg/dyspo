'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4 sm:mb-6">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t.appTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            {t.appSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
              {t.forEmployees}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {t.employeeDescription}
            </p>
            <div className="space-y-3">
              <a
                href="/employee/login"
                className="block w-full bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm sm:text-base"
              >
                {t.loginButton}
              </a>
              <a
                href="/employee/register"
                className="block w-full bg-white text-blue-600 border-2 border-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-50 transition-colors text-center text-sm sm:text-base"
              >
                {t.createAccount}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
              {t.adminPanel}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {t.adminDescription}
            </p>
            <a
              href="/admin/login"
              className="inline-block w-full sm:w-auto text-center bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              {t.adminPanelButton}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}