"use client"

import { useState, useEffect, type ReactNode } from "react"

type DeviceType = "mobile" | "tablet" | "desktop"

interface ResponsiveWrapperProps {
  children: (deviceType: DeviceType) => ReactNode
}

export default function ResponsiveWrapper({ children }: ResponsiveWrapperProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop")

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setDeviceType("mobile")
      } else if (width < 1024) {
        setDeviceType("tablet")
      } else {
        setDeviceType("desktop")
      }
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <>{children(deviceType)}</>
}

// Helper hook for responsive design
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop")

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setDeviceType("mobile")
      } else if (width < 1024) {
        setDeviceType("tablet")
      } else {
        setDeviceType("desktop")
      }
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return deviceType
}

