"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash } from "lucide-react"

interface Task {
  id: number
  text: string
  dueDate: string
  completed: boolean
}

export default function TaskTracker({
  tasks,
  updateTasks,
}: {
  tasks: Task[]
  updateTasks: (tasks: Task[]) => void
}) {
  const [taskInput, setTaskInput] = useState("")
  const [taskDate, setTaskDate] = useState("")

  const addTask = () => {
    if (taskInput.trim() && taskDate) {
      const newTask: Task = {
        id: Date.now(),
        text: taskInput.trim(),
        dueDate: taskDate,
        completed: false,
      }
      updateTasks([...tasks, newTask])
      setTaskInput("")
      setTaskDate("")
    }
  }

  const toggleTaskCompletion = (id: number) => {
    updateTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: number) => {
    updateTasks(tasks.filter((task) => task.id !== id))
  }

  const editTask = (id: number) => {
    const taskToEdit = tasks.find((task) => task.id === id)
    if (taskToEdit) {
      const newText = prompt("Edit task:", taskToEdit.text)
      if (newText !== null && newText.trim() !== "") {
        updateTasks(tasks.map((task) => (task.id === id ? { ...task, text: newText.trim() } : task)))
      }
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Task Tracker</h2>
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Add a new task"
        />
        <Input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox checked={task.completed} onCheckedChange={() => toggleTaskCompletion(task.id)} />
              <span className={task.completed ? "line-through" : ""}>{task.text}</span>
              <span className="text-sm text-muted-foreground">{task.dueDate}</span>
            </div>
            <div>
              <Button variant="ghost" size="icon" onClick={() => editTask(task.id)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

