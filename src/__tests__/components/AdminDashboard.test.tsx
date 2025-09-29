import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminDashboard from '@/app/admin/dashboard/page'

// Mock router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('AdminDashboard - Schedule Builder', () => {
  const mockEmployees = [
    { _id: 'user1', name: 'Jan Kowalski', email: 'jan@example.com', role: 'employee', createdAt: new Date() },
    { _id: 'user2', name: 'Anna Nowak', email: 'anna@example.com', role: 'employee', createdAt: new Date() }
  ]

  const mockAvailability = [
    {
      userId: 'user1',
      availableDays: [1, 2, 3],
      user: { name: 'Jan Kowalski', email: 'jan@example.com' }
    },
    {
      userId: 'user2',
      availableDays: [1, 3, 4],
      user: { name: 'Anna Nowak', email: 'anna@example.com' }
    }
  ]

  const mockSchedule = {
    _id: 'schedule1',
    year: 2025,
    month: 1,
    assignments: [
      {
        day: 1,
        bagiety: { userId: 'user1', name: 'Jan Kowalski', email: 'jan@example.com' },
        widok: { userId: 'user2', name: 'Anna Nowak', email: 'anna@example.com' }
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn()
          .mockReturnValueOnce('fake-token')
          .mockReturnValueOnce(JSON.stringify({ role: 'admin', name: 'Admin User' })),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    // Mock successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ availability: mockAvailability })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ employees: mockEmployees })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ schedule: mockSchedule })
      })
  })

  it('should render schedule builder calendar', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Budowanie Grafiku')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Zapisz Grafik' })).toBeInTheDocument()
    })
  })

  it('should display calendar days with availability counts', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      // Should show day 1 with 2 available employees
      expect(screen.getByText('2 dost.')).toBeInTheDocument()
    })
  })

  it('should show assigned employees on calendar days', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      // Should show assigned employees for day 1
      expect(screen.getByText('Jan Kowalski')).toBeInTheDocument()
      expect(screen.getByText('Anna Nowak')).toBeInTheDocument()
    })
  })

  it('should open assignment modal when clicking on available day', async () => {
    const user = userEvent.setup()
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('2 dost.')).toBeInTheDocument()
    })

    // Find the day 1 cell and click it
    const dayOneCell = screen.getByText('1').closest('div')
    expect(dayOneCell).toBeInTheDocument()

    await user.click(dayOneCell!)

    await waitFor(() => {
      expect(screen.getByText('Przydziel pracowników - 1 (Środa)')).toBeInTheDocument()
      expect(screen.getByLabelText(/Bagiety/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Widok/)).toBeInTheDocument()
    })
  })

  it('should not show Bagiety dropdown on Tuesdays', async () => {
    const user = userEvent.setup()

    // Mock availability for Tuesday (day 7 in January 2025)
    const tuesdayAvailability = [
      {
        userId: 'user1',
        availableDays: [7], // 7th January 2025 is a Tuesday
        user: { name: 'Jan Kowalski', email: 'jan@example.com' }
      }
    ]

    mockFetch.mockClear()
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ availability: tuesdayAvailability })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ employees: mockEmployees })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ schedule: null })
      })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('1 dost.')).toBeInTheDocument()
    })

    // Click on Tuesday (day 7)
    const tuesdayCell = screen.getByText('7').closest('div')
    await user.click(tuesdayCell!)

    await waitFor(() => {
      expect(screen.getByText('Przydziel pracowników - 7 (Wtorek)')).toBeInTheDocument()
      expect(screen.queryByLabelText(/Bagiety/)).not.toBeInTheDocument()
      expect(screen.getByLabelText(/Widok/)).toBeInTheDocument()
    })
  })

  it('should validate against assigning same person to both locations', async () => {
    const user = userEvent.setup()

    // Mock empty schedule
    mockFetch.mockClear()
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ availability: mockAvailability })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ employees: mockEmployees })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ schedule: null })
      })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('2 dost.')).toBeInTheDocument()
    })

    // Open modal for day 1
    const dayOneCell = screen.getByText('1').closest('div')
    await user.click(dayOneCell!)

    await waitFor(() => {
      expect(screen.getByLabelText(/Bagiety/)).toBeInTheDocument()
    })

    // Select same person for both locations
    const bagietsySelect = screen.getByLabelText(/Bagiety/)
    const widokSelect = screen.getByLabelText(/Widok/)

    await user.selectOptions(bagietsySelect, 'user1')
    await user.selectOptions(widokSelect, 'user1')

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('⚠️ Ten sam pracownik nie może być w obu lokalach!')).toBeInTheDocument()
    })

    // Save button should be disabled
    const saveButton = screen.getByRole('button', { name: 'Zapisz' })
    expect(saveButton).toBeDisabled()
  })

  it('should save schedule successfully', async () => {
    const user = userEvent.setup()
    render(<AdminDashboard />)

    // Mock successful save
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Grafik został zapisany' })
    })

    // Mock reload after save
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ schedule: mockSchedule })
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Zapisz Grafik' })).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: 'Zapisz Grafik' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/schedule', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token',
        }),
        body: expect.stringContaining('assignments')
      }))
    })
  })

  it('should clear assignments when clicking Wyczyść', async () => {
    const user = userEvent.setup()
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('2 dost.')).toBeInTheDocument()
    })

    // Open modal
    const dayOneCell = screen.getByText('1').closest('div')
    await user.click(dayOneCell!)

    await waitFor(() => {
      expect(screen.getByLabelText(/Bagiety/)).toBeInTheDocument()
    })

    // Select employees
    const bagietsySelect = screen.getByLabelText(/Bagiety/)
    const widokSelect = screen.getByLabelText(/Widok/)

    await user.selectOptions(bagietsySelect, 'user1')
    await user.selectOptions(widokSelect, 'user2')

    // Click clear button
    const clearButton = screen.getByRole('button', { name: 'Wyczyść' })
    await user.click(clearButton)

    // Selections should be cleared
    expect(bagietsySelect).toHaveValue('')
    expect(widokSelect).toHaveValue('')
  })
})