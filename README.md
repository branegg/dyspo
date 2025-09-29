# System Dyspozycyjności Pracowników

Aplikacja do zarządzania dyspozycyjnością pracowników z panelem administratora.

## Funkcjonalności

- **Panel Pracownika**: Logowanie i ustawianie dostępności w kalendarzu miesięcznym
- **Panel Administratora**: Przeglądanie dyspozycyjności wszystkich pracowników
- **Bezpieczne logowanie**: JWT tokens i hashowane hasła
- **Responsywny interfejs**: Tailwind CSS

## Technologie

- Next.js 14 z App Router
- TypeScript
- MongoDB
- Tailwind CSS
- JWT Authentication

## Konfiguracja

### 1. MongoDB Atlas (darmowy)

1. Załóż konto na [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Utwórz nowy klaster (wybierz darmowy M0)
3. Utwórz bazę danych o nazwie `dyspo`
4. Skopiuj connection string

### 2. Zmienne środowiskowe

Utwórz plik `.env.local`:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
JWT_SECRET=your-very-secure-random-string-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-very-secure-random-string
```

### 3. Instalacja i uruchomienie

```bash
npm install
npm run dev
```

### 4. Utworzenie pierwszego administratora

Użyj API endpoint do rejestracji:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "name": "Administrator",
    "role": "admin"
  }'
```

### 5. Deployment na Vercel (darmowy)

1. Pushaj kod do GitHub
2. Połącz z [Vercel](https://vercel.com)
3. Dodaj zmienne środowiskowe w ustawieniach Vercel
4. Deploy automatycznie się wykona

## Użytkowanie

### Pracownicy
1. Wejdź na `/employee/login`
2. Zaloguj się swoimi danymi
3. Wybierz dostępne dni w kalendarzu
4. Zapisz dyspozycyjność

### Administrator
1. Wejdź na `/admin/login`
2. Zaloguj się jako administrator
3. Przeglądaj dyspozycyjność wszystkich pracowników
4. Zmieniaj miesiące aby zobaczyć różne okresy

## Struktura projektu

```
src/
├── app/
│   ├── api/          # API endpoints
│   ├── employee/     # Panel pracownika
│   ├── admin/        # Panel administratora
│   └── globals.css   # Style globalne
├── components/       # Komponenty React
├── lib/             # Utilities (MongoDB, Auth)
└── types/           # Typy TypeScript
```