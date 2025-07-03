"use client"

import { useState, useEffect, useCallback } from "react"
import { pollingStore } from "@/lib/polling-store"

export function usePolling() {
  // dummy object to force a rerender when the store notifies
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const unsubscribe = pollingStore.subscribe(() => forceUpdate({}))
    return unsubscribe
  }, [])

  /* ----------  STABLE WRAPPERS  ---------- */
  const addStudent = useCallback((name: string) => pollingStore.addStudent(name), [])

  const createPoll = useCallback(
    (q: string, opts: string[], dur?: number, correctAnswer?: string) =>
      pollingStore.createPoll(q, opts, dur, correctAnswer),
    [],
  )

  const submitAnswer = useCallback(
    (studentId: string, answer: string) => pollingStore.submitAnswer(studentId, answer),
    [],
  )

  const endPoll = useCallback(() => pollingStore.endPoll(), [])

  const canCreateNewPoll = useCallback(() => pollingStore.canCreateNewPoll(), [])

  const kickStudent = useCallback((studentId: string) => pollingStore.kickStudent(studentId), [])

  const sendChatMessage = useCallback(
    (senderId: string, senderName: string, senderType: "teacher" | "student", message: string) =>
      pollingStore.sendChatMessage(senderId, senderName, senderType, message),
    [],
  )

  const clearAllData = useCallback(() => pollingStore.clearAllData(), [])

  const exportData = useCallback(() => pollingStore.exportData(), [])
  /* --------------------------------------- */

  return {
    currentPoll: pollingStore.getCurrentPoll(),
    students: pollingStore.getStudents(),
    pollHistory: pollingStore.getPollHistory(),
    timeRemaining: pollingStore.getTimeRemaining(),
    chatMessages: pollingStore.getChatMessages(),
    addStudent,
    createPoll,
    submitAnswer,
    endPoll,
    canCreateNewPoll,
    kickStudent,
    sendChatMessage,
    clearAllData,
    exportData,
  }
}
