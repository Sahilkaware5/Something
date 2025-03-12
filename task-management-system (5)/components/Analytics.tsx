"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration } from "chart.js/auto"
import { BarChart } from "lucide-react"

export default function Analytics() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        const config: ChartConfiguration = {
          type: "doughnut",
          data: {
            labels: ["Completed", "Pending"],
            datasets: [
              {
                data: [3, 7],
                backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 99, 132, 0.7)"],
                borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Task Status",
              },
            },
          },
        }

        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        chartInstance.current = new Chart(ctx, config)
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <BarChart className="w-6 h-6 mr-2" />
        Analytics
      </h2>
      <div className="w-full max-w-md mx-auto">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  )
}

