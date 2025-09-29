import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/schedule/route'

// Mock dependencies
jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}))

const mockGetDatabase = require('@/lib/mongodb').getDatabase
const mockVerifyToken = require('@/lib/auth').verifyToken

describe('/api/admin/schedule', () => {
  let mockDb: any
  let mockCollection: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockCollection = {
      findOne: jest.fn(),
      aggregate: jest.fn(),
      updateOne: jest.fn(),
      insertOne: jest.fn(),
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    }

    mockGetDatabase.mockResolvedValue(mockDb)
  })

  describe('GET', () => {
    it('should return 403 for invalid admin token', async () => {
      mockVerifyToken.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/schedule?year=2025&month=1', {
        headers: { Authorization: 'Bearer invalid-token' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Brak uprawnień administratora')
    })

    it('should return 403 for non-admin user', async () => {
      mockVerifyToken.mockReturnValue({ role: 'employee', userId: '123' })

      const request = new NextRequest('http://localhost:3000/api/admin/schedule?year=2025&month=1', {
        headers: { Authorization: 'Bearer employee-token' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Brak uprawnień administratora')
    })

    it('should return null schedule when no schedule exists', async () => {
      mockVerifyToken.mockReturnValue({ role: 'admin', userId: '123' })
      mockCollection.findOne.mockResolvedValue(null)
      mockCollection.aggregate.mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) })

      const request = new NextRequest('http://localhost:3000/api/admin/schedule?year=2025&month=1', {
        headers: { Authorization: 'Bearer admin-token' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schedule).toBe(null)
    })

    it('should return schedule with user data when schedule exists', async () => {
      mockVerifyToken.mockReturnValue({ role: 'admin', userId: '123' })

      const mockSchedule = {
        _id: 'schedule123',
        year: 2025,
        month: 1,
        assignments: [
          { day: 1, bagiety: 'user1', widok: 'user2' },
          { day: 2, bagiety: null, widok: 'user1' }
        ]
      }

      const mockScheduleWithUsers = [{
        _id: 'schedule123',
        year: 2025,
        month: 1,
        assignments: [
          {
            day: 1,
            bagiety: { userId: 'user1', name: 'Jan Kowalski', email: 'jan@example.com' },
            widok: { userId: 'user2', name: 'Anna Nowak', email: 'anna@example.com' }
          },
          {
            day: 2,
            bagiety: null,
            widok: { userId: 'user1', name: 'Jan Kowalski', email: 'jan@example.com' }
          }
        ]
      }]

      mockCollection.findOne.mockResolvedValue(mockSchedule)
      mockCollection.aggregate.mockReturnValue({ toArray: jest.fn().mockResolvedValue(mockScheduleWithUsers) })

      const request = new NextRequest('http://localhost:3000/api/admin/schedule?year=2025&month=1', {
        headers: { Authorization: 'Bearer admin-token' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schedule).toEqual(mockScheduleWithUsers[0])
      expect(data.schedule.assignments).toHaveLength(2)
      expect(data.schedule.assignments[0].bagiety.name).toBe('Jan Kowalski')
    })
  })

  describe('POST', () => {
    it('should return 403 for invalid admin token', async () => {
      mockVerifyToken.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/schedule', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer invalid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: 2025,
          month: 1,
          assignments: [{ day: 1, bagiety: 'user1', widok: 'user2' }]
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Brak uprawnień administratora')
    })

    it('should create new schedule when none exists', async () => {
      mockVerifyToken.mockReturnValue({ role: 'admin', userId: '123' })
      mockCollection.findOne.mockResolvedValue(null)
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'newScheduleId' })

      const assignments = [
        { day: 1, bagiety: 'user1', widok: 'user2' },
        { day: 2, bagiety: undefined, widok: 'user1' }
      ]

      const request = new NextRequest('http://localhost:3000/api/admin/schedule', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: 2025,
          month: 1,
          assignments
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Grafik został zapisany')
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        year: 2025,
        month: 1,
        assignments: [
          { day: 1, bagiety: 'user1', widok: 'user2' },
          { day: 2, bagiety: null, widok: 'user1' }
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should update existing schedule', async () => {
      mockVerifyToken.mockReturnValue({ role: 'admin', userId: '123' })
      mockCollection.findOne.mockResolvedValue({ _id: 'existingId' })
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })

      const assignments = [
        { day: 1, bagiety: 'user1', widok: 'user2' }
      ]

      const request = new NextRequest('http://localhost:3000/api/admin/schedule', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: 2025,
          month: 1,
          assignments
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Grafik został zaktualizowany')
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { year: 2025, month: 1 },
        {
          $set: {
            assignments: [{ day: 1, bagiety: 'user1', widok: 'user2' }],
            updatedAt: expect.any(Date)
          }
        }
      )
    })

    it('should handle validation - same person on both locations', async () => {
      mockVerifyToken.mockReturnValue({ role: 'admin', userId: '123' })

      const assignments = [
        { day: 1, bagiety: 'user1', widok: 'user1' } // Same person!
      ]

      const request = new NextRequest('http://localhost:3000/api/admin/schedule', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: 2025,
          month: 1,
          assignments
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Ten sam pracownik nie może być w obu lokalach')
    })

    it('should handle Tuesday validation - no Bagiety on Tuesdays', async () => {
      mockVerifyToken.mockReturnValue({ role: 'admin', userId: '123' })

      // Day 3 of January 2025 is a Friday, but let's test Tuesday logic
      // We need to calculate what day of the month would be a Tuesday
      const tuesdayDate = new Date(2025, 0, 7).getDate() // 7th January 2025 is a Tuesday

      const assignments = [
        { day: tuesdayDate, bagiety: 'user1', widok: 'user2' } // Bagiety on Tuesday!
      ]

      const request = new NextRequest('http://localhost:3000/api/admin/schedule', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: 2025,
          month: 1,
          assignments
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('We wtorki nie można przydzielać pracowników do Bagiety')
    })
  })
})