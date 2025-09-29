# System Dyspozycyjności Pracowników - Claude Code

## Opis Projektu

Aplikacja webowa do zarządzania dyspozycyjnością pracowników z panelem administratora, stworzona przy użyciu Next.js, TypeScript, MongoDB i Tailwind CSS.

## Technologie

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Baza danych**: MongoDB Atlas
- **Autentykacja**: JWT tokens, bcrypt
- **Deployment**: Vercel
- **Narzędzia**: Git, GitHub CLI, Vercel CLI

## Struktura Projektu

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Logowanie użytkowników
│   │   │   └── register/route.ts    # Rejestracja użytkowników
│   │   ├── admin/
│   │   │   ├── availability/route.ts # Admin - pobieranie dyspozycyjności
│   │   │   └── employees/route.ts    # Admin - zarządzanie pracownikami
│   │   └── availability/route.ts     # Pracownik - dyspozycyjność
│   ├── employee/
│   │   ├── login/page.tsx           # Logowanie pracownika
│   │   └── dashboard/page.tsx       # Panel pracownika
│   ├── admin/
│   │   ├── login/page.tsx           # Logowanie admina
│   │   └── dashboard/page.tsx       # Panel administratora
│   ├── layout.tsx                   # Layout aplikacji
│   ├── page.tsx                     # Strona główna
│   └── globals.css                  # Style globalne
├── components/
│   ├── Calendar.tsx                 # Komponent kalendarza
│   └── AddEmployeeModal.tsx         # Modal dodawania pracowników
├── lib/
│   ├── mongodb.ts                   # Połączenie z MongoDB
│   └── auth.ts                      # Funkcje autentykacji
└── types/
    └── index.ts                     # Definicje typów TypeScript
```

## Funkcjonalności

### Panel Pracownika
- Logowanie z email/hasło
- Kalendarz miesięczny do zaznaczania dostępnych dni
- Zapis i edycja dyspozycyjności
- Nawigacja między miesiącami
- Bezpieczne wylogowanie

### Panel Administratora
- Logowanie z uprawnieniami administratora
- Przeglądanie dyspozycyjności wszystkich pracowników
- Tabela z dostępnością pracowników w danym miesiącu
- Podsumowanie dostępności w formie kalendarza
- Dodawanie nowych pracowników
- Lista wszystkich pracowników z datą rejestracji
- Zarządzanie miesiącami

## Modele Danych

### User
```typescript
interface User {
  _id?: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  hashedPassword: string;
  createdAt: Date;
}
```

### Availability
```typescript
interface Availability {
  _id?: string;
  userId: string;
  year: number;
  month: number;
  availableDays: number[];
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Autentykacja
- `POST /api/auth/login` - Logowanie użytkownika
- `POST /api/auth/register` - Rejestracja nowego użytkownika

### Pracownik
- `GET /api/availability` - Pobieranie dyspozycyjności
- `POST /api/availability` - Zapisywanie dyspozycyjności

### Administrator
- `GET /api/admin/availability` - Pobieranie dyspozycyjności wszystkich pracowników
- `GET /api/admin/employees` - Lista wszystkich pracowników
- `POST /api/admin/employees` - Tworzenie nowych pracowników

## Bezpieczeństwo

- Hashowanie haseł za pomocą bcrypt
- Tokeny JWT z czasem wygaśnięcia
- Weryfikacja uprawnień na poziomie API
- Walidacja danych wejściowych
- Zabezpieczenie przed duplikatami email

## Konfiguracja

### Zmienne Środowiskowe
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

### MongoDB Collections
- `users` - dane użytkowników
- `availability` - dyspozycyjność pracowników

## Deployment

Aplikacja jest automatycznie deployowana na Vercel przy każdym push do głównej gałęzi GitHub.

**URL Produkcyjny**: https://dyspo-branegais-projects.vercel.app

### Proces Deployment
1. Push do GitHub
2. Vercel automatycznie wykrywa zmiany
3. Build i deploy aplikacji Next.js
4. Aktualizacja zmiennych środowiskowych w Vercel

## Użytkowanie

### Dla Administratorów
1. Logowanie na `/admin/login`
2. Dodawanie pracowników przez przycisk "Dodaj Pracownika"
3. Przeglądanie dyspozycyjności w tabeli i kalendarzu
4. Zarządzanie listą pracowników

### Dla Pracowników
1. Logowanie na `/employee/login`
2. Wybór dostępnych dni w kalendarzu
3. Zapisanie dyspozycyjności przyciskiem "Zapisz"
4. Edycja w dowolnym momencie

## Komendy Deweloperskie

```bash
# Instalacja zależności
npm install

# Uruchomienie lokalnie
npm run dev

# Build produkcyjny
npm run build

# Linting
npm run lint

# Deployment Vercel
vercel --prod

# Dodanie zmiennych środowiskowych
vercel env add MONGODB_URI production
```

## Git Workflow

Wszystkie zmiany commitowane z opisowymi wiadomościami zawierającymi:
- Opis funkcjonalności
- 🤖 Generated with [Claude Code](https://claude.com/claude-code)
- Co-Authored-By: Claude <noreply@anthropic.com>

## Historia Rozwoju

1. **Inicjalizacja projektu** - setup Next.js z TypeScript i Tailwind
2. **Konfiguracja MongoDB** - połączenie i modele danych
3. **System autentykacji** - JWT, hashing, API endpoints
4. **Panel pracownika** - kalendarz, dyspozycyjność
5. **Panel administratora** - przeglądanie danych
6. **Zarządzanie pracownikami** - dodawanie przez admina
7. **Poprawki deployment** - Vercel config, MongoDB lookup

## Przyszłe Rozszerzenia

Potencjalne funkcjonalności do dodania:
- Powiadomienia email
- Export dyspozycyjności do CSV/PDF
- Statystyki i raporty
- Szabłony dyspozycyjności
- Integracja z kalendarzami zewnętrznymi
- Aplikacja mobilna (React Native)

## Autorzy

Projekt stworzony przy współpracy z Claude Code - AI asystentem deweloperskim od Anthropic.