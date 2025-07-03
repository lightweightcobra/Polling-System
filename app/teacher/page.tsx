"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Clock, BarChart3, Plus, Send, UserX, Settings, CheckCircle, Trash2, Download } from "lucide-react"
import { usePolling } from "@/hooks/use-polling"
import { ChatPopup } from "@/components/chat-popup"

export default function TeacherPage() {
  const {
    currentPoll,
    students,
    pollHistory,
    timeRemaining,
    createPoll,
    endPoll,
    canCreateNewPoll,
    kickStudent,
    clearAllData,
    exportData,
  } = usePolling()

  const [newQuestion, setNewQuestion] = useState("")
  const [newOptions, setNewOptions] = useState(["", "", "", ""])
  const [pollDuration, setPollDuration] = useState("60")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [teacherId] = useState("teacher-" + Date.now())

  const handleCreatePoll = () => {
    if (!newQuestion.trim() || newOptions.filter((opt) => opt.trim()).length < 2) {
      alert("Please provide a question and at least 2 options")
      return
    }

    const filteredOptions = newOptions.filter((opt) => opt.trim())
    const duration = Number.parseInt(pollDuration) || 60

    // Validate correct answer if provided
    if (correctAnswer && !filteredOptions.includes(correctAnswer)) {
      alert("Please select a correct answer from the available options")
      return
    }

    createPoll(newQuestion, filteredOptions, duration, correctAnswer || undefined)
    setNewQuestion("")
    setNewOptions(["", "", "", ""])
    setCorrectAnswer("")
  }

  const updateOption = (index: number, value: string) => {
    const updated = [...newOptions]
    updated[index] = value
    setNewOptions(updated)

    // Clear correct answer if it no longer matches any option
    if (correctAnswer && !updated.includes(correctAnswer)) {
      setCorrectAnswer("")
    }
  }

  const handleKickStudent = (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to kick ${studentName} from the session?`)) {
      kickStudent(studentId)
    }
  }

  const handleClearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This will remove all polls, students, and chat history. This action cannot be undone.",
      )
    ) {
      clearAllData()
    }
  }

  const handleExportData = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `polling-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const onlineStudents = students.filter((s) => s.isOnline)
  const availableOptions = newOptions.filter((opt) => opt.trim())

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{onlineStudents.length} students online</span>
                </div>
                {timeRemaining > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{timeRemaining}s remaining</span>
                  </div>
                )}
              </div>
            </div>

            {/* Data Management Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleExportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </Button>
              <Button onClick={handleClearAllData} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All Data
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Poll Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Poll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your poll question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  disabled={!canCreateNewPoll()}
                />
              </div>

              <div>
                <Label>Options</Label>
                {newOptions.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="mt-2"
                    disabled={!canCreateNewPoll()}
                  />
                ))}
              </div>

              {/* Correct Answer Selection */}
              {availableOptions.length >= 2 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Correct Answer (Optional)
                  </Label>
                  <RadioGroup
                    value={correctAnswer}
                    onValueChange={setCorrectAnswer}
                    disabled={!canCreateNewPoll()}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="no-correct" />
                      <Label htmlFor="no-correct" className="text-sm text-gray-600">
                        No correct answer
                      </Label>
                    </div>
                    {availableOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`correct-${index}`} />
                        <Label htmlFor={`correct-${index}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div>
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Poll Duration
                </Label>
                <Select value={pollDuration} onValueChange={setPollDuration} disabled={!canCreateNewPoll()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="180">3 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreatePoll} className="w-full" disabled={!canCreateNewPoll()}>
                <Send className="w-4 h-4 mr-2" />
                {canCreateNewPoll() ? `Create Poll (${pollDuration}s)` : "Wait for all students to answer"}
              </Button>
            </CardContent>
          </Card>

          {/* Current Poll Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {currentPoll ? "Live Results" : "No Active Poll"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPoll ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{currentPoll.question}</h3>
                    <p className="text-sm text-gray-600">
                      {currentPoll.studentsAnswered.length} of {onlineStudents.length} students answered
                    </p>
                    {currentPoll.correctAnswer && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">
                          Correct Answer: <strong>{currentPoll.correctAnswer}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {currentPoll.options.map((option, index) => {
                      const count = currentPoll.responses[option] || 0
                      const percentage = currentPoll.totalResponses > 0 ? (count / currentPoll.totalResponses) * 100 : 0
                      const isCorrect = currentPoll.correctAnswer === option

                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span
                              className={`flex items-center gap-2 ${isCorrect ? "text-green-700 font-medium" : ""}`}
                            >
                              {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {option}
                            </span>
                            <span>
                              {count} votes ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className={`h-2 ${isCorrect ? "bg-green-100" : ""}`} />
                        </div>
                      )
                    })}
                  </div>

                  {currentPoll.isActive && (
                    <Button onClick={endPoll} variant="destructive" className="w-full">
                      End Poll
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Create a poll to see live results here</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Connected Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${student.isOnline ? "bg-green-400" : "bg-gray-400"}`} />
                    <span className="font-medium">{student.name}</span>
                    {currentPoll && currentPoll.studentsAnswered.includes(student.id) && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Answered
                      </Badge>
                    )}
                    {!student.isOnline && (
                      <Badge variant="outline" className="text-xs">
                        Offline
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleKickStudent(student.id, student.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Kick
                  </Button>
                </div>
              ))}
              {students.length === 0 && <p className="text-gray-500 text-center py-4">No students connected</p>}
            </div>
          </CardContent>
        </Card>

        {/* Poll History */}
        {pollHistory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Poll History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pollHistory.slice(0, 5).map((poll) => (
                  <div key={poll.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{poll.question}</h4>
                    {poll.correctAnswer && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Correct Answer: {poll.correctAnswer}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {poll.options.map((option, index) => (
                        <div key={index} className="flex justify-between">
                          <span className={poll.correctAnswer === option ? "text-green-700 font-medium" : ""}>
                            {poll.correctAnswer === option && "✓ "}
                            {option}
                          </span>
                          <span>{poll.responses[option] || 0} votes</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Total responses: {poll.totalResponses} • Duration:{" "}
                      {Math.floor((poll.endTime!.getTime() - poll.createdAt.getTime()) / 1000)}s
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <ChatPopup userId={teacherId} userName="Teacher" userType="teacher" />
      </div>
    </div>
  )
}
