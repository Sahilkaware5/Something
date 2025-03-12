"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

export default function Feedback() {
  const [feedback, setFeedback] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedback.trim()) {
      // In a real app, this would send data to a server
      console.log("Feedback submitted:", feedback)
      alert("Thank you for your feedback!")
      setFeedback("")
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <MessageSquare className="w-6 h-6 mr-2" />
        Feedback
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your feedback..."
          className="w-full"
        />
        <Button type="submit">Submit Feedback</Button>
      </form>
    </div>
  )
}

