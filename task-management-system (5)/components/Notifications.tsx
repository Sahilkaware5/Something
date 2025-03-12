"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

interface Notification {
  id: number
  message: string
  date: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Initialize with a welcome notification
    setNotifications([{ id: 1, message: "Welcome to the Task Management System!", date: new Date().toISOString() }])
  }, [])

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Bell className="w-6 h-6 mr-2" />
        Notifications
      </h2>
      <ul className="space-y-2">
        {notifications.map((notification) => (
          <li key={notification.id} className="p-2 bg-secondary rounded-lg">
            <p>{notification.message}</p>
            <p className="text-sm text-muted-foreground">{new Date(notification.date).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

