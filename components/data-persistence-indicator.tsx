"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Save, Wifi, WifiOff } from "lucide-react"

export function DataPersistenceIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    // Listen for localStorage changes to update last saved time
    const handleStorageChange = () => {
      setLastSaved(new Date())
    }

    window.addEventListener("storage", handleStorageChange)

    // Set initial last saved time
    setLastSaved(new Date())

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? "Online" : "Offline"}
      </Badge>

      {lastSaved && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Save className="w-3 h-3" />
          Data Saved
        </Badge>
      )}
    </div>
  )
}
