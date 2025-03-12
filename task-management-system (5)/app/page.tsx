"use client"

import { useEffect, useState, useCallback } from "react"
import TaskTracker from "@/components/TaskTracker"
import Notifications from "@/components/Notifications"
import Search from "@/components/Search"
import Analytics from "@/components/Analytics"
import Feedback from "@/components/Feedback"
import Navbar from "@/components/Navbar"
import ThemeToggle from "@/components/ThemeToggle"
import BackToTop from "@/components/BackToTop"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"

export default function Home() {
  const [homeData, setHomeData] = useState({
    tasks: [],
    notifications: [],
    analytics: {},
    feedback: [],
  })

  useEffect(() => {
    const savedData = getFromLocalStorage("homeData")
    if (savedData) {
      setHomeData(savedData)
    }
  }, [])

  const updateHomeData = useCallback((newData: Partial<typeof homeData>) => {
    setHomeData((prevData) => {
      const updatedData = { ...prevData, ...newData }
      saveToLocalStorage("homeData", updatedData)
      return updatedData
    })
  }, [])

  const updateTasks = useCallback(
    (tasks: any[]) => {
      updateHomeData({ tasks })
    },
    [updateHomeData],
  )

  const updateNotifications = useCallback(
    (notifications: any[]) => {
      updateHomeData({ notifications })
    },
    [updateHomeData],
  )

  const updateAnalytics = useCallback(
    (analytics: any) => {
      updateHomeData({ analytics })
    },
    [updateHomeData],
  )

  const updateFeedback = useCallback(
    (feedback: any[]) => {
      updateHomeData({ feedback })
    },
    [updateHomeData],
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to the Task Management System</h1>
        <TaskTracker tasks={homeData.tasks} updateTasks={updateTasks} />
        <Notifications notifications={homeData.notifications} updateNotifications={updateNotifications} />
        <Search />
        <Analytics data={homeData.analytics} updateData={updateAnalytics} />
        <Feedback feedback={homeData.feedback} updateFeedback={updateFeedback} />
      </main>
      <ThemeToggle />
      <BackToTop />
    </div>
  )
}

