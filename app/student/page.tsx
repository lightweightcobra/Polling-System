"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { User, Clock, BarChart3, Send, CheckCircle, XCircle } from "lucide-react"
import { usePolling } from "@/hooks/use-polling"
import { ChatPopup } from "@/components/chat-popup"

export default function StudentPage() {
  const { currentPoll, timeRemaining, addStudent, submitAnswer, students } = usePolling()

  const [studentName, setStudentName] = useState("")
  const [isNameSet, setIsNameSet] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [selectedOption, setSelectedOption] = useState("")
  const [hasAnswered, setHasAnswered] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    // Check if name is stored in sessionStorage (per tab)
    const storedName = sessionStorage.getItem("studentName")
    const storedId = sessionStorage.getItem("studentId")
    if (storedName && storedId) {
      setStudentName(storedName)
      setStudentId(storedId)
      setIsNameSet(true)
      // Re-add student to store
      addStudent(storedName)
    }
  }, [addStudent])

  useEffect(() => {
    // Reset answer state when new poll starts
    if (currentPoll && !hasAnswered) {
      setSelectedOption("")
      setShowResults(false)
    }
  }, [currentPoll, hasAnswered])

  useEffect(() => {
    // Show results when time runs out
    if (timeRemaining === 0 && currentPoll && !hasAnswered) {
      setShowResults(true)
    }
  }, [timeRemaining, currentPoll, hasAnswered])

  useEffect(() => {
    // Check if student was kicked out
    if (isNameSet && studentId) {
      const currentStudent = students.find((s) => s.id === studentId)
      if (!currentStudent) {
        // Student was kicked out, reset the session
        sessionStorage.removeItem("studentName")
        sessionStorage.removeItem("studentId")
        setIsNameSet(false)
        setStudentName("")
        setStudentId("")
        alert("You have been removed from the session by the teacher.")
      }
    }
  }, [students, isNameSet, studentId])

  const handleSetName = () => {
    if (studentName.trim()) {
      const student = addStudent(studentName.trim())
      sessionStorage.setItem("studentName", studentName.trim())
      sessionStorage.setItem("studentId", student.id)
      setStudentId(student.id)
      setIsNameSet(true)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedOption && currentPoll && studentId) {
      const success = submitAnswer(studentId, selectedOption)
      if (success) {
        setHasAnswered(true)
        setShowResults(true)
      }
    }
  }

  const isAnswerCorrect = (option: string) => {
    return currentPoll?.correctAnswer === option
  }

  const isAnswerWrong = (option: string) => {
    return currentPoll?.correctAnswer && currentPoll.correctAnswer !== option
  }

  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome Student!</CardTitle>
            <p className="text-gray-600">Enter your name to join the polling session</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSetName()}
              />
            </div>
            <Button onClick={handleSetName} className="w-full" disabled={!studentName.trim()}>
              Join Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Welcome, {studentName}</span>
            </div>
            {timeRemaining > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{timeRemaining}s remaining</span>
              </div>
            )}
          </div>
        </div>

        {currentPoll ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {showResults ? (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    Poll Results
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Active Poll
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-4">{currentPoll.question}</h3>

                {!showResults && !hasAnswered && timeRemaining > 0 && currentPoll.isActive ? (
                  // Answer Phase
                  <div className="space-y-3">
                    {currentPoll.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedOption === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="poll-option"
                          value={option}
                          checked={selectedOption === option}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}

                    <Button onClick={handleSubmitAnswer} className="w-full mt-4" disabled={!selectedOption}>
                      Submit Answer
                    </Button>
                  </div>
                ) : (
                  // Results Phase
                  <div className="space-y-4">
                    {hasAnswered && (
                      <div
                        className={`border rounded-lg p-3 mb-4 ${
                          currentPoll.correctAnswer
                            ? isAnswerCorrect(selectedOption)
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {currentPoll.correctAnswer ? (
                            isAnswerCorrect(selectedOption) ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-green-800 text-sm">
                                  <strong>Correct!</strong> Your answer: <strong>{selectedOption}</strong>
                                </p>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-600" />
                                <div className="text-red-800 text-sm">
                                  <p>
                                    <strong>Incorrect.</strong> Your answer: <strong>{selectedOption}</strong>
                                  </p>
                                  <p>
                                    Correct answer: <strong>{currentPoll.correctAnswer}</strong>
                                  </p>
                                </div>
                              </>
                            )
                          ) : (
                            <p className="text-blue-800 text-sm">
                              ✓ Your answer has been submitted: <strong>{selectedOption}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {currentPoll.options.map((option, index) => {
                        const count = currentPoll.responses[option] || 0
                        const percentage =
                          currentPoll.totalResponses > 0 ? (count / currentPoll.totalResponses) * 100 : 0
                        const isCorrect = isAnswerCorrect(option)
                        const isWrong = isAnswerWrong(option)
                        const isMyAnswer = selectedOption === option

                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span
                                className={`flex items-center gap-2 ${
                                  isMyAnswer ? "font-semibold text-blue-600" : ""
                                } ${isCorrect ? "text-green-700" : isWrong ? "text-red-600" : ""}`}
                              >
                                {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                {isWrong && <XCircle className="w-4 h-4 text-red-600" />}
                                {option}
                                {isMyAnswer && " (Your answer)"}
                              </span>
                              <span>
                                {count} votes ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress
                              value={percentage}
                              className={`h-3 ${isCorrect ? "bg-green-100" : isWrong ? "bg-red-100" : ""}`}
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="text-center text-sm text-gray-600 mt-4">
                      Total responses: {currentPoll.totalResponses}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for Poll</h3>
              <p className="text-gray-600">Your teacher hasn't started a poll yet. Please wait...</p>
            </CardContent>
          </Card>
        )}

        {/* Add Chat Popup */}
        {isNameSet && <ChatPopup userId={studentId} userName={studentName} userType="student" />}
      </div>
    </div>
  )
}
