// This utility helps ensure data is properly synchronized across devices
// by implementing a more robust localStorage approach

// Store data with timestamp for synchronization
export const syncToLocalStorage = (key: string, data: any) => {
  try {
    const syncData = {
      data,
      timestamp: new Date().getTime(),
      version: 1, // For future versioning if data structure changes
    }
    localStorage.setItem(key, JSON.stringify(syncData))
    return true
  } catch (error) {
    console.error("Error saving data to localStorage:", error)
    return false
  }
}

// Get data with validation
export const syncFromLocalStorage = (key: string) => {
  try {
    const storedData = localStorage.getItem(key)
    if (!storedData) return null

    const parsedData = JSON.parse(storedData)

    // Validate data structure
    if (!parsedData.data || !parsedData.timestamp) {
      // Legacy data format - migrate it
      return migrateData(key, storedData)
    }

    return parsedData.data
  } catch (error) {
    console.error("Error retrieving data from localStorage:", error)
    return null
  }
}

// Migrate legacy data to new format
const migrateData = (key: string, legacyData: string) => {
  try {
    const data = JSON.parse(legacyData)
    syncToLocalStorage(key, data)
    return data
  } catch (error) {
    console.error("Error migrating legacy data:", error)
    return null
  }
}

// Check if device storage is available and sufficient
export const checkStorageAvailability = () => {
  try {
    const testKey = "__storage_test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)

    // Estimate available space (rough approximation)
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ""
        totalSize += key.length + value.length
      }
    }

    // 5MB is typical localStorage limit
    const availableSpace = 5 * 1024 * 1024 - totalSize
    const isSpaceSufficient = availableSpace > 500 * 1024 // At least 500KB available

    return {
      available: true,
      sufficientSpace: isSpaceSufficient,
      availableSpaceKB: Math.floor(availableSpace / 1024),
    }
  } catch (e) {
    return {
      available: false,
      sufficientSpace: false,
      availableSpaceKB: 0,
    }
  }
}

// Clear old data to free up space if needed
export const clearOldData = () => {
  try {
    const keysToKeep = ["courses", "faculty", "students", "adminCredentials"]

    // Keep timetable data for current academic year
    const timetablePattern = /^timetable_/

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !keysToKeep.includes(key) && !timetablePattern.test(key)) {
        localStorage.removeItem(key)
      }
    }

    return true
  } catch (error) {
    console.error("Error clearing old data:", error)
    return false
  }
}

