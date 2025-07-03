"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react"
import { usePolling } from "@/hooks/use-polling"

interface ChatPopupProps {
  userId: string
  userName: string
  userType: "teacher" | "student"
}

export function ChatPopup({ userId, userName, userType }: ChatPopupProps) {
  const { chatMessages, sendChatMessage } = usePolling()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  // Track unread messages
  useEffect(() => {
    if (!isOpen || isMinimized) {
      const newMessageCount = chatMessages.length - lastMessageCountRef.current
      if (newMessageCount > 0) {
        setUnreadCount((prev) => prev + newMessageCount)
      }
    }
    lastMessageCountRef.current = chatMessages.length
  }, [chatMessages, isOpen, isMinimized])

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0)
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendChatMessage(userId, userName, userType, newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-14 h-14 shadow-lg relative" size="lg">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-200 ${isMinimized ? "h-14" : "h-96"}`}>
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat ({userType === "teacher" ? "Teacher" : "Student"})
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-blue-700 p-1 h-auto"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">No messages yet. Start the conversation!</div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-2 text-sm ${
                        msg.senderId === userId
                          ? "bg-blue-600 text-white"
                          : msg.senderType === "teacher"
                            ? "bg-purple-100 text-purple-900"
                            : "bg-white text-gray-900 border"
                      }`}
                    >
                      {msg.senderId !== userId && (
                        <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                          <Badge
                            variant={msg.senderType === "teacher" ? "default" : "secondary"}
                            className="text-xs px-1 py-0"
                          >
                            {msg.senderType === "teacher" ? "👨‍🏫" : "👨‍🎓"}
                          </Badge>
                          {msg.senderName}
                        </div>
                      )}
                      <div>{msg.message}</div>
                      <div className={`text-xs mt-1 ${msg.senderId === userId ? "text-blue-200" : "text-gray-500"}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
