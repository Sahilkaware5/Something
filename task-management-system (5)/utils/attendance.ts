// Calculate attendance percentage for a student
export const calculateAttendancePercentage = (attendance: Record<string, boolean>) => {
  const entries = Object.entries(attendance)
  if (entries.length === 0) return { percentage: 0, present: 0, total: 0 }

  const presentCount = entries.filter(([_, isPresent]) => isPresent).length
  const percentage = (presentCount / entries.length) * 100

  return {
    percentage,
    present: presentCount,
    total: entries.length,
  }
}

// Get attendance for a specific week
export const getWeekAttendance = (attendance: Record<string, boolean>, weekStart: Date) => {
  // Create an array of dates for the week
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    weekDates.push(date.toISOString().split("T")[0])
  }

  // Filter attendance records for this week
  const weekAttendance = Object.entries(attendance).filter(([key]) => {
    // Extract date from the key (format: "Day_lectureId")
    const parts = key.split("_")
    if (parts.length < 2) return false

    // Check if this lecture's date falls within the week
    return weekDates.some((date) => key.includes(date))
  })

  return Object.fromEntries(weekAttendance)
}

// Get current week start date
export const getCurrentWeekStart = () => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const diff = today.getDate() - dayOfWeek

  const weekStart = new Date(today)
  weekStart.setDate(diff)
  weekStart.setHours(0, 0, 0, 0)

  return weekStart
}

// Get week start date for a specific week offset
export const getWeekStart = (weekOffset: number) => {
  const currentWeekStart = getCurrentWeekStart()
  const targetWeekStart = new Date(currentWeekStart)
  targetWeekStart.setDate(currentWeekStart.getDate() - 7 * weekOffset)

  return targetWeekStart
}

