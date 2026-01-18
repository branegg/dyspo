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
  noAvailabilityData: string;
  employee: string;
  availableDays: string;
  numberOfDays: string;
  saveSchedule: string;
  noAvailableEmployees: string;
  registrationDate: string;
  noRegisteredEmployees: string;

  // Schedule
  scheduleForMonth: string;
  noScheduleYet: string;
  yourSchedule: string;
  bagiety: string;
  widok: string;
  noAssignment: string;
  day: string;
  myAvailability: string;
  workSchedule: string;
  othersWorking: string;
  yourShifts: string;
  othersShifts: string;
  tuesdaysOnlyWidok: string;

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

  // Edit employee
  editEmployee: string;
  newPassword: string;
  leaveBlankToKeepPassword: string;
  actions: string;

  // Delete employee
  confirmDelete: string;
  employeeDeleted: string;
  deleteError: string;

  // My Schedule
  mySchedule: string;
  noAssignmentsThisMonth: string;

  // Panel Switching
  switchToAdminPanel: string;
  switchToEmployeePanel: string;

  // Availability Reminder
  availabilityReminderTitle: string;
  availabilityReminderMessage: string;
  setAvailabilityNow: string;

  // View Mode
  tableView: string;
  calendarView: string;
  listView: string;
  viewMode: string;
  availableEmployees: string;
  location: string;
  noShiftsAssigned: string;

  // Schedule Location
  bothLocations: string;

  // Assignment Statistics
  assignedDays: string;
  assignedHours: string;
  hoursUnit: string;

  // View as employee (admin feature)
  viewAsEmployee: string;
  selectEmployee: string;
  viewingAs: string;
  myself: string;

  // Availability locking
  availabilityLocked: string;
  availabilityLockedMessage: string;
  unlockAvailability: string;
  lockAvailability: string;
  unlockSuccess: string;
  lockSuccess: string;
  unlockError: string;
  lockError: string;
  cannotEditLocked: string;
  locked: string;
  unlocked: string;
  availabilitySavedAndLocked: string;

  // Color legend
  colorLegend: string;
  you: string;

  // Employee list sections
  administrators: string;
  employees: string;

  // Hour logging
  hourLogging: string;
  logHours: string;
  hoursWorked: string;
  addHourLog: string;
  editHourLog: string;
  deleteHourLog: string;
  hourLogSaved: string;
  hourLogDeleted: string;
  hourLogError: string;
  noHourLogs: string;
  selectDate: string;
  selectLocation: string;
  enterHours: string;
  notesOptional: string;
  totalHoursMonth: string;
  hoursPerLocation: string;
  dateColumn: string;
  hoursColumn: string;
  locationColumn: string;
  notesColumn: string;
  hourLogHistory: string;
  addNewHourLog: string;
  hoursMustBePositive: string;
  dateRequired: string;
  locationRequired: string;
  hourLogUpdated: string;
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
    noAvailabilityData: 'Brak danych o dyspozycyjności w tym miesiącu',
    employee: 'Pracownik',
    availableDays: 'Dostępne dni',
    numberOfDays: 'Liczba dni',
    saveSchedule: 'Zapisz Grafik',
    noAvailableEmployees: 'Brak dostępnych pracowników',
    registrationDate: 'Data Rejestracji',
    noRegisteredEmployees: 'Brak zarejestrowanych pracowników',

    // Schedule
    scheduleForMonth: 'Grafik na',
    noScheduleYet: 'Brak grafiku na ten miesiąc',
    yourSchedule: 'Twój grafik na',
    bagiety: 'Bagiety',
    widok: 'Widok',
    noAssignment: 'Brak przydziału',
    day: 'Dzień',
    myAvailability: 'Moja Dyspozycyjność',
    workSchedule: 'Grafik Pracy',
    othersWorking: 'Pracują inni',
    yourShifts: 'Twoje dyżury',
    othersShifts: 'Dyżury innych',
    tuesdaysOnlyWidok: 'Wtorki: tylko Widok',

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
    repeatPassword: 'Powtórz hasło',

    // Edit employee
    editEmployee: 'Edytuj Pracownika',
    newPassword: 'Nowe hasło',
    leaveBlankToKeepPassword: 'Zostaw puste aby zachować obecne hasło',
    actions: 'Akcje',

    // Delete employee
    confirmDelete: 'Czy na pewno chcesz usunąć pracownika',
    employeeDeleted: 'Pracownik został usunięty',
    deleteError: 'Błąd podczas usuwania pracownika',

    // My Schedule
    mySchedule: 'Mój Grafik',
    noAssignmentsThisMonth: 'Brak przydziałów w tym miesiącu',

    // Panel Switching
    switchToAdminPanel: 'Przejdź do Panelu Administratora',
    switchToEmployeePanel: 'Przejdź do Panelu Pracownika',

    // Availability Reminder
    availabilityReminderTitle: 'Przypomnienie o dyspozycyjności',
    availabilityReminderMessage: 'Nie dodałeś jeszcze swojej dyspozycyjności na następny miesiąc. Prosimy o uzupełnienie jak najszybciej.',
    setAvailabilityNow: 'Ustaw dyspozycyjność teraz',

    // View Mode
    tableView: 'Tabela',
    calendarView: 'Kalendarz',
    listView: 'Lista',
    viewMode: 'Tryb widoku',
    availableEmployees: 'Dostępni pracownicy',
    location: 'Lokalizacja',
    noShiftsAssigned: 'Brak przydzielonych dyżurów',

    // Schedule Location
    bothLocations: 'Oba',

    // Assignment Statistics
    assignedDays: 'Przydzielone dni',
    assignedHours: 'Godziny',
    hoursUnit: 'godz.',

    // View as employee (admin feature)
    viewAsEmployee: 'Wyświetl jako pracownik',
    selectEmployee: 'Wybierz pracownika',
    viewingAs: 'Wyświetlasz jako',
    myself: 'Ja (moja dyspozycyjność)',

    // Availability locking
    availabilityLocked: 'Dyspozycyjność zablokowana',
    availabilityLockedMessage: 'Twoja dyspozycyjność na ten miesiąc jest zablokowana. Skontaktuj się z administratorem, aby wprowadzić zmiany.',
    unlockAvailability: 'Odblokuj dyspozycyjność',
    lockAvailability: 'Zablokuj dyspozycyjność',
    unlockSuccess: 'Dyspozycyjność została odblokowana',
    lockSuccess: 'Dyspozycyjność została zablokowana',
    unlockError: 'Błąd podczas odblokowywania dyspozycyjności',
    lockError: 'Błąd podczas blokowania dyspozycyjności',
    cannotEditLocked: 'Nie można edytować zablokowanej dyspozycyjności',
    locked: 'Zablokowana',
    unlocked: 'Odblokowana',
    availabilitySavedAndLocked: 'Dyspozycyjność została zapisana i zablokowana!',

    // Color legend
    colorLegend: 'Legenda kolorów',
    you: 'Ty',

    // Employee list sections
    administrators: 'Administratorzy',
    employees: 'Pracownicy',

    // Hour logging
    hourLogging: 'Godziny pracy',
    logHours: 'Dodaj godziny',
    hoursWorked: 'Przepracowane godziny',
    addHourLog: 'Dodaj wpis',
    editHourLog: 'Edytuj wpis',
    deleteHourLog: 'Usuń wpis',
    hourLogSaved: 'Godziny zostały zapisane!',
    hourLogDeleted: 'Wpis został usunięty',
    hourLogError: 'Błąd podczas zapisywania godzin',
    noHourLogs: 'Brak wpisów godzin w tym miesiącu',
    selectDate: 'Wybierz datę',
    selectLocation: 'Wybierz lokalizację',
    enterHours: 'Wpisz godziny',
    notesOptional: 'Notatki (opcjonalnie)',
    totalHoursMonth: 'Suma godzin w miesiącu',
    hoursPerLocation: 'Godziny wg lokalizacji',
    dateColumn: 'Data',
    hoursColumn: 'Godziny',
    locationColumn: 'Lokalizacja',
    notesColumn: 'Notatki',
    hourLogHistory: 'Historia godzin',
    addNewHourLog: 'Dodaj nowy wpis',
    hoursMustBePositive: 'Godziny muszą być większe od 0',
    dateRequired: 'Data jest wymagana',
    locationRequired: 'Lokalizacja jest wymagana',
    hourLogUpdated: 'Wpis został zaktualizowany!'
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
    noAvailabilityData: 'No availability data for this month',
    employee: 'Employee',
    availableDays: 'Available days',
    numberOfDays: 'Number of days',
    saveSchedule: 'Save Schedule',
    noAvailableEmployees: 'No available employees',
    registrationDate: 'Registration Date',
    noRegisteredEmployees: 'No registered employees',

    // Schedule
    scheduleForMonth: 'Schedule for',
    noScheduleYet: 'No schedule for this month',
    yourSchedule: 'Your schedule for',
    bagiety: 'Bagiety',
    widok: 'Widok',
    noAssignment: 'No assignment',
    day: 'Day',
    myAvailability: 'My Availability',
    workSchedule: 'Work Schedule',
    othersWorking: 'Others working',
    yourShifts: 'Your shifts',
    othersShifts: 'Others\' shifts',
    tuesdaysOnlyWidok: 'Tuesdays: Widok only',

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
    repeatPassword: 'Repeat password',

    // Edit employee
    editEmployee: 'Edit Employee',
    newPassword: 'New password',
    leaveBlankToKeepPassword: 'Leave blank to keep current password',
    actions: 'Actions',

    // Delete employee
    confirmDelete: 'Are you sure you want to delete employee',
    employeeDeleted: 'Employee has been deleted',
    deleteError: 'Error deleting employee',

    // My Schedule
    mySchedule: 'My Schedule',
    noAssignmentsThisMonth: 'No assignments this month',

    // Panel Switching
    switchToAdminPanel: 'Switch to Admin Panel',
    switchToEmployeePanel: 'Switch to Employee Panel',

    // Availability Reminder
    availabilityReminderTitle: 'Availability Reminder',
    availabilityReminderMessage: 'You haven\'t added your availability for next month yet. Please complete it as soon as possible.',
    setAvailabilityNow: 'Set availability now',

    // View Mode
    tableView: 'Table View',
    calendarView: 'Calendar View',
    listView: 'List View',
    viewMode: 'View Mode',
    availableEmployees: 'Available employees',
    location: 'Location',
    noShiftsAssigned: 'No shifts assigned yet',

    // Schedule Location
    bothLocations: 'Both',

    // Assignment Statistics
    assignedDays: 'Assigned Days',
    assignedHours: 'Hours',
    hoursUnit: 'hrs',

    // View as employee (admin feature)
    viewAsEmployee: 'View as employee',
    selectEmployee: 'Select employee',
    viewingAs: 'Viewing as',
    myself: 'Myself (my availability)',

    // Availability locking
    availabilityLocked: 'Availability locked',
    availabilityLockedMessage: 'Your availability for this month is locked. Contact admin to make changes.',
    unlockAvailability: 'Unlock Availability',
    lockAvailability: 'Lock Availability',
    unlockSuccess: 'Availability unlocked successfully',
    lockSuccess: 'Availability locked successfully',
    unlockError: 'Error unlocking availability',
    lockError: 'Error locking availability',
    cannotEditLocked: 'Cannot edit locked availability',
    locked: 'Locked',
    unlocked: 'Unlocked',
    availabilitySavedAndLocked: 'Availability has been saved and locked!',

    // Color legend
    colorLegend: 'Color Legend',
    you: 'You',

    // Employee list sections
    administrators: 'Administrators',
    employees: 'Employees',

    // Hour logging
    hourLogging: 'Work Hours',
    logHours: 'Log Hours',
    hoursWorked: 'Hours Worked',
    addHourLog: 'Add Entry',
    editHourLog: 'Edit Entry',
    deleteHourLog: 'Delete Entry',
    hourLogSaved: 'Hours have been saved!',
    hourLogDeleted: 'Entry has been deleted',
    hourLogError: 'Error saving hours',
    noHourLogs: 'No hour entries for this month',
    selectDate: 'Select date',
    selectLocation: 'Select location',
    enterHours: 'Enter hours',
    notesOptional: 'Notes (optional)',
    totalHoursMonth: 'Total hours this month',
    hoursPerLocation: 'Hours by location',
    dateColumn: 'Date',
    hoursColumn: 'Hours',
    locationColumn: 'Location',
    notesColumn: 'Notes',
    hourLogHistory: 'Hour History',
    addNewHourLog: 'Add New Entry',
    hoursMustBePositive: 'Hours must be greater than 0',
    dateRequired: 'Date is required',
    locationRequired: 'Location is required',
    hourLogUpdated: 'Entry has been updated!'
  }
};