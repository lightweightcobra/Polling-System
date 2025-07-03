"use client"

interface Poll {
  id: string
  question: string
  options: string[]
  correctAnswer?: string
  isActive: boolean
  responses: { [key: string]: number }
  totalResponses: number
  studentsAnswered: string[]
  createdAt: Date
  endTime?: Date
}

interface Student {
  id: string
  name: string
  isOnline: boolean
  lastSeen: Date
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderType: "teacher" | "student"
  message: string
  timestamp: Date
}

interface PersistedData {
  currentPoll: Poll | null
  students: Student[]
  pollHistory: Poll[]
  chatMessages: ChatMessage[]
  timeRemaining: number
}

class PollingStore {
  private currentPoll: Poll | null = null
  private students: Student[] = []
  private pollHistory: Poll[] = []
  private chatMessages: ChatMessage[] = []
  private listeners: Set<() => void> = new Set()
  private pollTimer: NodeJS.Timeout | null = null
  private timeRemaining = 0
  private isInitialized = false

  constructor() {
    // Initialize from localStorage when the store is created
    if (typeof window !== "undefined") {
      this.loadFromStorage()
      this.isInitialized = true
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("polling-system-data")
      if (stored) {
        const data: PersistedData = JSON.parse(stored)

        // Restore current poll
        if (data.currentPoll) {
          this.currentPoll = {
            ...data.currentPoll,
            createdAt: new Date(data.currentPoll.createdAt),
            endTime: data.currentPoll.endTime ? new Date(data.currentPoll.endTime) : undefined,
          }

          // If poll was active, resume timer
          if (this.currentPoll.isActive && data.timeRemaining > 0) {
            this.timeRemaining = data.timeRemaining
            this.resumePollTimer()
          }
        }

        // Restore students
        this.students = data.students.map((student) => ({
          ...student,
          lastSeen: new Date(student.lastSeen),
        }))

        // Restore poll history
        this.pollHistory = data.pollHistory.map((poll) => ({
          ...poll,
          createdAt: new Date(poll.createdAt),
          endTime: poll.endTime ? new Date(poll.endTime) : undefined,
        }))

        // Restore chat messages
        this.chatMessages = data.chatMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))

        this.timeRemaining = data.timeRemaining || 0
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error)
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined" || !this.isInitialized) return

    try {
      const data: PersistedData = {
        currentPoll: this.currentPoll,
        students: this.students,
        pollHistory: this.pollHistory,
        chatMessages: this.chatMessages,
        timeRemaining: this.timeRemaining,
      }
      localStorage.setItem("polling-system-data", JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save data to localStorage:", error)
    }
  }

  private resumePollTimer() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
    }

    this.pollTimer = setInterval(() => {
      this.timeRemaining--
      if (this.timeRemaining <= 0) {
        this.endPoll()
      }
      this.notify()
      this.saveToStorage()
    }, 1000)
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach((callback) => callback())
  }

  getCurrentPoll() {
    return this.currentPoll
  }

  getStudents() {
    return this.students
  }

  getPollHistory() {
    return this.pollHistory
  }

  getTimeRemaining() {
    return this.timeRemaining
  }

  getChatMessages() {
    return this.chatMessages
  }

  addStudent(name: string) {
    const existingStudent = this.students.find((s) => s.name === name)
    if (existingStudent) {
      existingStudent.isOnline = true
      existingStudent.lastSeen = new Date()
    } else {
      const newStudent: Student = {
        id: Date.now().toString() + Math.random(),
        name,
        isOnline: true,
        lastSeen: new Date(),
      }
      this.students.push(newStudent)
    }
    this.notify()
    this.saveToStorage()
    return this.students.find((s) => s.name === name)!
  }

  createPoll(question: string, options: string[], duration = 60, correctAnswer?: string) {
    if (this.currentPoll?.isActive) {
      return null
    }

    this.currentPoll = {
      id: Date.now().toString(),
      question,
      options,
      correctAnswer,
      isActive: true,
      responses: {},
      totalResponses: 0,
      studentsAnswered: [],
      createdAt: new Date(),
      endTime: new Date(Date.now() + duration * 1000),
    }

    // Initialize response counts
    options.forEach((option) => {
      this.currentPoll!.responses[option] = 0
    })

    // Start timer
    this.timeRemaining = duration
    this.resumePollTimer()

    this.notify()
    this.saveToStorage()
    return this.currentPoll
  }

  submitAnswer(studentId: string, answer: string) {
    if (!this.currentPoll?.isActive || this.currentPoll.studentsAnswered.includes(studentId)) {
      return false
    }

    this.currentPoll.responses[answer] = (this.currentPoll.responses[answer] || 0) + 1
    this.currentPoll.totalResponses++
    this.currentPoll.studentsAnswered.push(studentId)

    // Check if all online students have answered
    const onlineStudents = this.students.filter((s) => s.isOnline)
    if (this.currentPoll.studentsAnswered.length >= onlineStudents.length) {
      this.endPoll()
    }

    this.notify()
    this.saveToStorage()
    return true
  }

  endPoll() {
    if (this.currentPoll) {
      this.currentPoll.isActive = false
      this.pollHistory.unshift({ ...this.currentPoll })

      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }

      this.timeRemaining = 0
      this.notify()
      this.saveToStorage()
    }
  }

  canCreateNewPoll() {
    if (!this.currentPoll) return true

    const onlineStudents = this.students.filter((s) => s.isOnline)
    return !this.currentPoll.isActive || this.currentPoll.studentsAnswered.length >= onlineStudents.length
  }

  kickStudent(studentId: string) {
    const studentIndex = this.students.findIndex((s) => s.id === studentId)
    if (studentIndex !== -1) {
      this.students.splice(studentIndex, 1)
      this.notify()
      this.saveToStorage()
      return true
    }
    return false
  }

  sendChatMessage(senderId: string, senderName: string, senderType: "teacher" | "student", message: string) {
    const chatMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      senderId,
      senderName,
      senderType,
      message: message.trim(),
      timestamp: new Date(),
    }

    this.chatMessages.push(chatMessage)

    // Keep only last 100 messages
    if (this.chatMessages.length > 100) {
      this.chatMessages = this.chatMessages.slice(-100)
    }

    this.notify()
    this.saveToStorage()
    return chatMessage
  }

  // Method to clear all data (useful for testing or reset)
  clearAllData() {
    this.currentPoll = null
    this.students = []
    this.pollHistory = []
    this.chatMessages = []
    this.timeRemaining = 0

    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("polling-system-data")
    }

    this.notify()
  }

  // Method to export data (useful for backup)
  exportData() {
    return {
      currentPoll: this.currentPoll,
      students: this.students,
      pollHistory: this.pollHistory,
      chatMessages: this.chatMessages,
      timeRemaining: this.timeRemaining,
      exportedAt: new Date(),
    }
  }
}

export const pollingStore = new PollingStore()
