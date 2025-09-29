export interface Translations {
  // Common
  email: string;
  password: string;
  login: string;
  logout: string;
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  back: string;

  // Home page
  appTitle: string;
  appSubtitle: string;
  forEmployees: string;
  employeeDescription: string;
  loginButton: string;
  createAccount: string;
  adminPanel: string;
  adminDescription: string;
  adminPanelButton: string;

  // Authentication
  employeeLogin: string;
  employeeLoginSubtitle: string;
  adminLogin: string;
  adminLoginSubtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  adminEmailPlaceholder: string;
  adminPasswordPlaceholder: string;
  loggingIn: string;
  dontHaveAccount: string;
  register: string;
  backToHome: string;
  accountCreated: string;
  loginError: string;
  connectionError: string;
  adminRightsError: string;

  // Registration
  employeeRegister: string;
  employeeRegisterSubtitle: string;
  name: string;
  namePlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  registering: string;
  alreadyHaveAccount: string;
  passwordMismatch: string;

  // Dashboard
  employeePanel: string;
  adminDashboard: string;
  welcome: string;
  previousMonth: string;
  nextMonth: string;
  selectedDays: string;
  noSelectedDays: string;
  saveAvailability: string;
  saving: string;
  availabilitySaved: string;
  saveError: string;

  // Calendar
  clickAvailableDays: string;
  months: string[];
  dayNames: string[];

  // Admin specific
  employeeAvailability: string;
  allEmployees: string;
  addEmployee: string;
  employeeList: string;
  buildSchedule: string;
  scheduleBuilder: string;
  availability: string;
  schedule: string;

  // Schedule
  scheduleForMonth: string;
  noScheduleYet: string;
  yourSchedule: string;
  bagiety: string;
  widok: string;
  noAssignment: string;
  day: string;

  // Modal
  close: string;
  addNewEmployee: string;
  employeeName: string;
  employeeEmail: string;
  employeePassword: string;
  create: string;
  creating: string;
  employeeCreated: string;
  createError: string;

  // Registration specific
  registrationComplete: string;
  accountCreatedRedirect: string;
  minimumCharacters: string;
  minimumPasswordError: string;
  namePlaceholderExample: string;
  repeatPassword: string;
}

export const translations: Record<string, Translations> = {
  pl: {
    // Common
    email: 'Email',
    password: 'Hasło',
    login: 'Zaloguj się',
    logout: 'Wyloguj się',
    loading: 'Ładowanie...',
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    edit: 'Edytuj',
    add: 'Dodaj',
    back: 'Powrót',

    // Home page
    appTitle: 'System Dyspozycyjności Pracowników',
    appSubtitle: 'Zarządzaj dostępnością swojego zespołu w prosty sposób',
    forEmployees: 'Dla Pracowników',
    employeeDescription: 'Zaloguj się aby podać swoją dyspozycyjność na nadchodzący miesiąc',
    loginButton: 'Zaloguj się',
    createAccount: 'Załóż konto',
    adminPanel: 'Panel Administratora',
    adminDescription: 'Przeglądaj dyspozycyjność wszystkich pracowników',
    adminPanelButton: 'Panel Administratora',

    // Authentication
    employeeLogin: 'Logowanie Pracownika',
    employeeLoginSubtitle: 'Zaloguj się aby podać swoją dyspozycyjność',
    adminLogin: 'Panel Administratora',
    adminLoginSubtitle: 'Zaloguj się aby zarządzać dyspozycyjnością',
    emailPlaceholder: 'twoj@email.com',
    passwordPlaceholder: 'Twoje hasło',
    adminEmailPlaceholder: 'admin@email.com',
    adminPasswordPlaceholder: 'Twoje hasło',
    loggingIn: 'Logowanie...',
    dontHaveAccount: 'Nie masz jeszcze konta?',
    register: 'Zarejestruj się',
    backToHome: 'Powrót do strony głównej',
    accountCreated: 'Konto zostało utworzone! Możesz się teraz zalogować.',
    loginError: 'Błąd podczas logowania',
    connectionError: 'Błąd połączenia z serwerem',
    adminRightsError: 'Brak uprawnień administratora',

    // Registration
    employeeRegister: 'Rejestracja Pracownika',
    employeeRegisterSubtitle: 'Załóż konto aby podawać swoją dyspozycyjność',
    name: 'Imię i nazwisko',
    namePlaceholder: 'Twoje imię i nazwisko',
    confirmPassword: 'Potwierdź hasło',
    confirmPasswordPlaceholder: 'Potwierdź swoje hasło',
    registering: 'Rejestrowanie...',
    alreadyHaveAccount: 'Masz już konto?',
    passwordMismatch: 'Hasła nie są identyczne',

    // Dashboard
    employeePanel: 'Panel Pracownika',
    adminDashboard: 'Panel Administratora',
    welcome: 'Witaj',
    previousMonth: '← Poprzedni miesiąc',
    nextMonth: 'Następny miesiąc →',
    selectedDays: 'Wybrane dni',
    noSelectedDays: 'Brak wybranych dni',
    saveAvailability: 'Zapisz dyspozycyjność',
    saving: 'Zapisywanie...',
    availabilitySaved: 'Dyspozycyjność została zapisana!',
    saveError: 'Błąd podczas zapisywania',

    // Calendar
    clickAvailableDays: 'Kliknij na dni, w które jesteś dostępny/a',
    months: [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ],
    dayNames: ['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'],

    // Admin specific
    employeeAvailability: 'Dyspozycyjność Pracowników',
    allEmployees: 'Wszyscy Pracownicy',
    addEmployee: 'Dodaj Pracownika',
    employeeList: 'Lista Pracowników',
    buildSchedule: 'Buduj Grafik',
    scheduleBuilder: 'Konstruktor Grafiku',
    availability: 'Dyspozycyjność',
    schedule: 'Grafik',

    // Schedule
    scheduleForMonth: 'Grafik na',
    noScheduleYet: 'Brak grafiku na ten miesiąc',
    yourSchedule: 'Twój grafik na',
    bagiety: 'Bagiety',
    widok: 'Widok',
    noAssignment: 'Brak przydziału',
    day: 'Dzień',

    // Modal
    close: 'Zamknij',
    addNewEmployee: 'Dodaj Nowego Pracownika',
    employeeName: 'Imię i nazwisko',
    employeeEmail: 'Email pracownika',
    employeePassword: 'Hasło',
    create: 'Utwórz',
    creating: 'Tworzenie...',
    employeeCreated: 'Pracownik został utworzony!',
    createError: 'Błąd podczas tworzenia pracownika',

    // Registration specific
    registrationComplete: 'Rejestracja zakończona!',
    accountCreatedRedirect: 'Twoje konto zostało utworzone. Za chwilę zostaniesz przekierowany do logowania.',
    minimumCharacters: 'Minimum 6 znaków',
    minimumPasswordError: 'Hasło musi mieć co najmniej 6 znaków',
    namePlaceholderExample: 'Jan Kowalski',
    repeatPassword: 'Powtórz hasło'
  },

  en: {
    // Common
    email: 'Email',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',

    // Home page
    appTitle: 'Employee Availability System',
    appSubtitle: 'Manage your team\'s availability in a simple way',
    forEmployees: 'For Employees',
    employeeDescription: 'Log in to provide your availability for the upcoming month',
    loginButton: 'Login',
    createAccount: 'Create Account',
    adminPanel: 'Admin Panel',
    adminDescription: 'View availability of all employees',
    adminPanelButton: 'Admin Panel',

    // Authentication
    employeeLogin: 'Employee Login',
    employeeLoginSubtitle: 'Log in to provide your availability',
    adminLogin: 'Admin Panel',
    adminLoginSubtitle: 'Log in to manage availability',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'Your password',
    adminEmailPlaceholder: 'admin@email.com',
    adminPasswordPlaceholder: 'Your password',
    loggingIn: 'Logging in...',
    dontHaveAccount: 'Don\'t have an account yet?',
    register: 'Register',
    backToHome: 'Back to home page',
    accountCreated: 'Account has been created! You can now log in.',
    loginError: 'Login error',
    connectionError: 'Server connection error',
    adminRightsError: 'No administrator privileges',

    // Registration
    employeeRegister: 'Employee Registration',
    employeeRegisterSubtitle: 'Create an account to provide your availability',
    name: 'Full name',
    namePlaceholder: 'Your full name',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Confirm your password',
    registering: 'Registering...',
    alreadyHaveAccount: 'Already have an account?',
    passwordMismatch: 'Passwords do not match',

    // Dashboard
    employeePanel: 'Employee Panel',
    adminDashboard: 'Admin Dashboard',
    welcome: 'Welcome',
    previousMonth: '← Previous month',
    nextMonth: 'Next month →',
    selectedDays: 'Selected days',
    noSelectedDays: 'No selected days',
    saveAvailability: 'Save availability',
    saving: 'Saving...',
    availabilitySaved: 'Availability has been saved!',
    saveError: 'Error while saving',

    // Calendar
    clickAvailableDays: 'Click on days when you are available',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    // Admin specific
    employeeAvailability: 'Employee Availability',
    allEmployees: 'All Employees',
    addEmployee: 'Add Employee',
    employeeList: 'Employee List',
    buildSchedule: 'Build Schedule',
    scheduleBuilder: 'Schedule Builder',
    availability: 'Availability',
    schedule: 'Schedule',

    // Schedule
    scheduleForMonth: 'Schedule for',
    noScheduleYet: 'No schedule for this month',
    yourSchedule: 'Your schedule for',
    bagiety: 'Bagiety',
    widok: 'Widok',
    noAssignment: 'No assignment',
    day: 'Day',

    // Modal
    close: 'Close',
    addNewEmployee: 'Add New Employee',
    employeeName: 'Full name',
    employeeEmail: 'Employee email',
    employeePassword: 'Password',
    create: 'Create',
    creating: 'Creating...',
    employeeCreated: 'Employee has been created!',
    createError: 'Error creating employee',

    // Registration specific
    registrationComplete: 'Registration complete!',
    accountCreatedRedirect: 'Your account has been created. You will be redirected to login shortly.',
    minimumCharacters: 'Minimum 6 characters',
    minimumPasswordError: 'Password must be at least 6 characters',
    namePlaceholderExample: 'John Smith',
    repeatPassword: 'Repeat password'
  }
};