import { exportAllData, importAllData } from "./cloudSync"

// Enhanced storage with sync capabilities
export const saveData = async (key: string, data: any): Promise<boolean> => {
  try {
    // Save to localStorage
    const storageData = {
      data,
      timestamp: Date.now(),
      deviceId: localStorage.getItem("device_id") || "unknown",
    }
    localStorage.setItem(key, JSON.stringify(storageData))
    return true
  } catch (error) {
    console.error("Error saving data:", error)
    return false
  }
}

export const getData = async (key: string): Promise<any> => {
  try {
    // Get from localStorage
    const localDataStr = localStorage.getItem(key)
    if (!localDataStr) return null

    try {
      const parsed = JSON.parse(localDataStr)
      if (parsed.data !== undefined) {
        return parsed.data
      }
      // Legacy format
      return parsed
    } catch {
      // If parsing fails, treat as legacy string data
      return localDataStr
    }
  } catch (error) {
    console.error("Error getting data:", error)
    return null
  }
}

// Function to check if we're running on a mobile device
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth < 640
}

// Function to check if we're running on a tablet device
export const isTabletDevice = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 640 && window.innerWidth < 1024
}

// Function to check if we're running on a desktop device
export const isDesktopDevice = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 1024
}

// Create a backup of all data
export const createDataBackup = (): string => {
  return exportAllData()
}

// Restore from a backup
export const restoreFromBackup = (backupData: string): boolean => {
  return importAllData(backupData)
}

