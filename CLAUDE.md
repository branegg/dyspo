# Employee Availability System - Claude Code

## Project Description

Web application for managing employee availability with an admin panel, built using Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Technologies

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens, bcrypt
- **Deployment**: Vercel
- **Tools**: Git, GitHub CLI, Vercel CLI

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # User login
│   │   │   └── register/route.ts    # User registration
│   │   ├── admin/
│   │   │   ├── availability/route.ts # Admin - fetch availability
│   │   │   ├── employees/route.ts    # Admin - manage employees
│   │   │   └── schedule/route.ts     # Admin - build schedule
│   │   └── availability/route.ts     # Employee - availability
│   ├── employee/
│   │   ├── login/page.tsx           # Employee login
│   │   ├── register/page.tsx        # Employee registration
│   │   └── dashboard/page.tsx       # Employee panel
│   ├── admin/
│   │   ├── login/page.tsx           # Admin login
│   │   └── dashboard/page.tsx       # Admin panel
│   ├── layout.tsx                   # App layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
├── components/
│   ├── Calendar.tsx                 # Calendar component
│   ├── AddEmployeeModal.tsx         # Add employee modal
│   └── ScheduleBuilder.tsx          # Schedule builder modal
├── lib/
│   ├── mongodb.ts                   # MongoDB connection
│   └── auth.ts                      # Authentication functions
└── types/
    └── index.ts                     # TypeScript type definitions
```

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

### Schedule
```typescript
interface Schedule {
  _id?: string;
  year: number;
  month: number;
  assignments: DayAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

interface DayAssignment {
  day: number;
  bagiety?: string; // userId - null for Tuesdays
  widok?: string;   // userId
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user

### Employee
- `GET /api/availability` - Fetch availability
- `POST /api/availability` - Save availability

### Administrator
- `GET /api/admin/availability` - Fetch all employee availability
- `GET /api/admin/employees` - List all employees
- `POST /api/admin/employees` - Create new employees
- `GET /api/admin/schedule` - Fetch work schedule with user data
- `POST /api/admin/schedule` - Save/update work schedule

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

# Run locally
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Vercel deployment
vercel --prod

# Add environment variables
vercel env add MONGODB_URI production
```

## Git Workflow

All changes committed with descriptive messages containing:
- Feature description
- 🤖 Generated with [Claude Code](https://claude.com/claude-code)
- Co-Authored-By: Claude <noreply@anthropic.com>

## Development History

1. **Project initialization** - Next.js setup with TypeScript and Tailwind
2. **MongoDB configuration** - connection and data models
3. **Authentication system** - JWT, hashing, API endpoints
4. **Employee panel** - calendar, availability
5. **Admin panel** - data viewing
6. **Employee management** - adding by admin
7. **Deployment fixes** - Vercel config, MongoDB lookup

## Future Extensions

Potential features to add:
- Email notifications
- Export availability to CSV/PDF
- Statistics and reports
- Availability templates
- Integration with external calendars
- Mobile app (React Native)

## Authors

Project created in collaboration with Claude Code - AI development assistant from Anthropic.
- always commit and push the changes
- always use i18n, never hardcoded copy
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.