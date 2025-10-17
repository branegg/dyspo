# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Description

Web application for managing employee availability with an admin panel, built using Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Technologies

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens, bcrypt
- **Deployment**: Vercel
- **Tools**: Git, GitHub CLI, Vercel CLI

## Core Architecture

### Internationalization (i18n)
The app uses a custom i18n system with React Context:
- **LanguageContext** (`src/contexts/LanguageContext.tsx`): Provides language state and translations
- **Translations** (`src/lib/translations.ts`): Contains all UI strings in Polish and English
- **Usage**: Always use `const { t } = useLanguage()` and reference strings via `t.keyName`
- **CRITICAL**: Never hardcode user-facing text - always use i18n keys

### Authentication Flow
- JWT-based authentication with tokens stored in localStorage
- Tokens contain: `userId`, `email`, `role`
- `src/lib/auth.ts` provides: `hashPassword`, `comparePassword`, `generateToken`, `verifyToken`
- Role-based access: `employee` | `admin`
- Admin routes check role on both client and API level

### Database Access
- MongoDB connection managed via `src/lib/mongodb.ts`
- Uses singleton pattern in development to prevent connection exhaustion
- Database name: `dyspo`
- Collections: `users`, `availability`, `schedules`
- Always use `getDatabase()` function to access the database

## Features

### Employee Panel
- **Self-registration** - Employees can create their own accounts
- **Email/password login** - Secure JWT authentication
- **Monthly calendar** - Intuitive selection of available days
- **Save and edit availability** - Immediate database persistence
- **Navigate between months** - Planning for future periods
- **Secure logout** - Session management

### Admin Panel
- **Admin login** - Separate admin account
- **View availability** - All employees in one place
- **Availability table** - Clear view for each month
- **Calendar summary** - Visualization of available employee count
- **Add employees** - Modal for creating new accounts
- **Employee list** - Team management with registration dates
- **Build work schedule** - Assign employees to locations
- **Two location support** - Bagiety and Widok with business rules
- **Special rules** - No work on Tuesdays at Bagiety
- **Month management** - Planning for different periods

## Data Models

All types defined in `src/types/index.ts`

### User
- `_id`: MongoDB ObjectId (optional)
- `email`: Unique email address
- `name`: Full name
- `role`: `'employee' | 'admin'`
- `hashedPassword`: bcrypt hashed password
- `createdAt`: Registration timestamp

### Availability
- `userId`: Reference to User._id (string format)
- `year`, `month`: Period identifier
- `availableDays`: Array of day numbers (1-31)
- **AvailabilityWithUser**: Extended with `user: { name, email }` for admin views

### Schedule
- `year`, `month`: Period identifier
- `assignments`: Array of DayAssignment
  - `day`: Day number (1-31)
  - `bagiety`: userId or null (null on Tuesdays - business rule)
  - `widok`: userId or undefined
- **ScheduleWithUsers**: Extended with full user objects `{ userId, name, email }` instead of just userIds

## API Endpoints

### Authentication (`src/app/api/auth/`)
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - Register new user (creates employee by default, admin via role param)

### Employee (`src/app/api/`)
- `GET /api/availability?year=YYYY&month=M` - Fetch user's availability (requires JWT)
- `POST /api/availability` - Save availability (requires JWT, body: `{ year, month, availableDays }`)
- `GET /api/schedule?year=YYYY&month=M` - Fetch user's schedule assignments (requires JWT)

### Administrator (`src/app/api/admin/`)
All admin endpoints require JWT with `role: 'admin'`
- `GET /api/admin/availability?year=YYYY&month=M` - Fetch all employees' availability
- `GET /api/admin/employees` - List all employees with registration dates
- `POST /api/admin/employees` - Create new employee (body: `{ name, email, password }`)
- `PUT /api/admin/employees` - Update employee (body: `{ id, name, email, password? }`)
- `DELETE /api/admin/employees?id=USER_ID` - Delete employee
- `GET /api/admin/schedule?year=YYYY&month=M` - Fetch work schedule with full user data
- `POST /api/admin/schedule` - Save/update schedule (body: `{ year, month, assignments }`)

### Common Patterns
- Authentication: Include `Authorization: Bearer <token>` header
- Error responses: `{ error: 'message' }` with appropriate HTTP status
- Success responses: `{ success: true, ... }` or data object

## Security

- Password hashing with bcrypt
- JWT tokens with expiration
- Permission verification at API level
- Input data validation
- Email duplicate protection

## Configuration

### Environment Variables
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

### MongoDB Collections
- `users` - user data (employees and administrators)
- `availability` - employee availability for specific months
- `schedules` - work schedules with location assignments

## Deployment

Application is automatically deployed to Vercel on every push to the main GitHub branch.

**Production URL**: https://dyspo-branegais-projects.vercel.app

### Deployment Process
1. Push to GitHub
2. Vercel automatically detects changes
3. Build and deploy Next.js app
4. Update environment variables in Vercel

## Usage

### For Administrators
1. **Login** at `/admin/login`
2. **Add employees** via "Add Employee" button
3. **View availability** in table and calendar
4. **Build schedule** via "Build Schedule" button
5. **Assign to locations** - Bagiety and Widok for each day
6. **Manage employee list** with registration dates

### For Employees
1. **Register** at `/employee/register` (optional)
2. **Login** at `/employee/login`
3. **Select available days** in monthly calendar
4. **Save availability** with "Save" button
5. **Edit anytime** - update existing availability

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Creating First Admin User
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

## Important Development Rules

1. **Always use i18n**: Never hardcode user-facing text. All UI strings must use the translation system via `useLanguage()` hook and `t.keyName` references.

2. **Always commit and push changes**: After completing tasks, commit with descriptive messages and push to remote.

3. **File creation**: Only create new files when absolutely necessary. Always prefer editing existing files.

4. **Commit message format**:
   ```
   Feature description

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

## Common Tasks

### Adding a new translation key
1. Add key to `Translations` interface in `src/lib/translations.ts`
2. Add Polish translation in `translations.pl`
3. Add English translation in `translations.en`
4. Use in component: `const { t } = useLanguage()` then `{t.newKey}`

### Working with user data
- User IDs are stored as strings (MongoDB ObjectId converted to string)
- Always verify JWT token on protected API routes
- Check role for admin-only operations: `decoded.role === 'admin'`

### Schedule business rules
- Bagiety location: No assignments on Tuesdays (day of week check required)
- Widok location: Can be assigned any day
- Only assign employees who marked themselves available for that day