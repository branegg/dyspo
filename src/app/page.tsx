'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Shield } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end mb-6 sm:mb-8">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            {t.appTitle}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.appSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">{t.forEmployees}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {t.employeeDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full"
                size="lg"
              >
                <Link href="/employee/login">{t.loginButton}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Link href="/employee/register">{t.createAccount}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 border-emerald-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl">{t.adminPanel}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {t.adminDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                <Link href="/admin/login">{t.adminPanelButton}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}