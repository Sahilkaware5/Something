// This utility enables data synchronization across devices without external dependencies

// Generate a unique device ID if not already set
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("device_id")
  if (!deviceId) {
    deviceId = "device_" + Math.random().toString(36).substring(2, 15)
    localStorage.setItem("device_id", deviceId)
  }
  return deviceId
}

// Export all data as JSON
export const exportAllData = (): string => {
  try {
    const exportData: Record<string, any> = {
      timestamp: Date.now(),
      deviceId: getDeviceId(),
      data: {},
    }

    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !key.startsWith("__") && key !== "device_id") {
        try {
          exportData.data[key] = JSON.parse(localStorage.getItem(key) || "null")
        } catch {
          exportData.data[key] = localStorage.getItem(key)
        }
      }
    }

    return JSON.stringify(exportData)
  } catch (error) {
    console.error("Error exporting data:", error)
    return JSON.stringify({ error: "Failed to export data" })
  }
}

// Import data from JSON
export const importAllData = (jsonData: string): boolean => {
  try {
    const importData = JSON.parse(jsonData)

    if (!importData.data || !importData.timestamp) {
      throw new Error("Invalid import data format")
    }

    // Check if import data is newer than current data
    const lastSyncTime = localStorage.getItem("last_sync_timestamp")
    if (lastSyncTime && Number.parseInt(lastSyncTime) >= importData.timestamp) {
      return false // Current data is newer or same age
    }

    // Import all data
    Object.entries(importData.data).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value))
    })

    // Update last sync timestamp
    localStorage.setItem("last_sync_timestamp", importData.timestamp.toString())
    localStorage.setItem("last_sync_device", importData.deviceId || "unknown")

    return true
  } catch (error) {
    console.error("Error importing data:", error)
    return false
  }
}

// Generate a QR code data URL for the exported data
export const generateQRCodeData = async (): Promise<string> => {
  try {
    // This is a simplified version - in a real app, you'd use a QR code library
    // For now, we'll just return a placeholder
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`
  } catch (error) {
    console.error("Error generating QR code:", error)
    return ""
  }
}

// Check if sync is available (always true for this implementation)
export const isCloudSyncAvailable = (): boolean => true

