"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    const handleOnline = () => {
      setIsOnline(true)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowAlert(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showAlert) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 w-72">
      <Alert variant={isOnline ? "default" : "destructive"} className="flex items-center">
        {isOnline ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
        <AlertDescription>
          {isOnline ? "You're back online! Changes will be saved." : "You're offline. Changes will be saved locally."}
        </AlertDescription>
      </Alert>
    </div>
  )
}

