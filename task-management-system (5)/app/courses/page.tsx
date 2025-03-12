"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"

type Course = {
  id: string
  title: string
  duration: number
  years: {
    year: number
    divisions: string[]
  }[]
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDivisionDialogOpen, setIsDivisionDialogOpen] = useState(false)
  const [divisionCourseId, setDivisionCourseId] = useState<string>("")
  const [divisionYear, setDivisionYear] = useState<number>(0)
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" })

  useEffect(() => {
    const savedCourses = getFromLocalStorage("courses")
    if (savedCourses) {
      setCourses(savedCourses)
    }
    const savedCredentials = getFromLocalStorage("adminCredentials")
    if (savedCredentials) {
      setAdminCredentials(savedCredentials)
    }
  }, [])

  const updateCourses = (newCourses: Course[]) => {
    setCourses(newCourses)
    saveToLocalStorage("courses", newCourses)
  }

  const handleAddCourse = (newCourse: Course) => {
    updateCourses([...courses, newCourse])
    setIsAddDialogOpen(false)

    // Create empty timetable structure for each year and division
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const emptyTimetable = {}

    days.forEach((day) => {
      emptyTimetable[day] = []
    })

    newCourse.years.forEach((year) => {
      if (year.divisions.length > 1) {
        year.divisions.forEach((division) => {
          saveToLocalStorage(`timetable_${newCourse.id}_year${year.year}_${division}`, emptyTimetable)
        })
      } else {
        saveToLocalStorage(`timetable_${newCourse.id}_year${year.year}`, emptyTimetable)
      }
    })
  }

  const handleUpdateCourse = (updatedCourse: Course) => {
    const updatedCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
    updateCourses(updatedCourses)
    setIsUpdateDialogOpen(false)
    setSelectedCourse(null)
  }

  const openDivisionDialog = (courseId: string, year: number) => {
    setDivisionCourseId(courseId)
    setDivisionYear(year)
    setIsDivisionDialogOpen(true)
  }

  const addDivision = (username: string, password: string) => {
    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      alert("Invalid admin credentials")
      return
    }

    const updatedCourses = courses.map((course) => {
      if (course.id === divisionCourseId) {
        const updatedYears = course.years.map((y) => {
          if (y.year === divisionYear) {
            // Only add Division B if it doesn't already exist
            if (y.divisions.length === 1) {
              return { ...y, divisions: ["Division A", "Division B"] }
            }
          }
          return y
        })
        return { ...course, years: updatedYears }
      }
      return course
    })
    updateCourses(updatedCourses)
    setIsDivisionDialogOpen(false)

    // Create empty timetable for Division B
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const emptyTimetable = {}
    days.forEach((day) => {
      emptyTimetable[day] = []
    })

    const course = updatedCourses.find((c) => c.id === divisionCourseId)
    if (course) {
      const year = course.years.find((y) => y.year === divisionYear)
      if (year && year.divisions.length > 1) {
        saveToLocalStorage(`timetable_${divisionCourseId}_year${divisionYear}_Division B`, emptyTimetable)

        // Rename original timetable to include Division A
        const originalTimetable = getFromLocalStorage(`timetable_${divisionCourseId}_year${divisionYear}`)
        if (originalTimetable) {
          saveToLocalStorage(`timetable_${divisionCourseId}_year${divisionYear}_Division A`, originalTimetable)
        }
      }
    }
  }

  const removeDivision = (courseId: string, year: number) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const updatedYears = course.years.map((y) => {
          if (y.year === year) {
            return { ...y, divisions: ["Division A"] }
          }
          return y
        })
        return { ...course, years: updatedYears }
      }
      return course
    })
    updateCourses(updatedCourses)

    // Remove timetable for Division B
    localStorage.removeItem(`timetable_${courseId}_year${year}_Division B`)

    // Rename Division A timetable to the generic year timetable
    const divisionATimetable = getFromLocalStorage(`timetable_${courseId}_year${year}_Division A`)
    if (divisionATimetable) {
      saveToLocalStorage(`timetable_${courseId}_year${year}`, divisionATimetable)
      localStorage.removeItem(`timetable_${courseId}_year${year}_Division A`)
    }
  }

  const viewTimetable = (courseId: string, year: number, division?: string) => {
    if (division) {
      router.push(`/timetable/${courseId}/year${year}/${division}/view`)
    } else {
      router.push(`/timetable/${courseId}/year${year}/view`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Courses</h1>
      <Button onClick={() => setIsAddDialogOpen(true)} className="mb-4">
        Add Course
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="mb-4">Duration: {course.duration} years</p>
            <div className="space-y-2">
              {course.years.map((year) => (
                <div key={year.year} className="border-t pt-2">
                  <h3 className="font-medium">Year {year.year}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {year.divisions.length > 1 ? (
                      // Show individual divisions if there are multiple
                      year.divisions.map((division) => (
                        <Button
                          key={division}
                          variant="outline"
                          size="sm"
                          onClick={() => viewTimetable(course.id, year.year, division)}
                        >
                          {division}
                        </Button>
                      ))
                    ) : (
                      // Show as a whole year if there's only one division
                      <Button variant="outline" size="sm" onClick={() => viewTimetable(course.id, year.year)}>
                        View Year {year.year}
                      </Button>
                    )}
                    {year.divisions.length === 1 && (
                      <Button variant="outline" size="sm" onClick={() => openDivisionDialog(course.id, year.year)}>
                        Make Divisions
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                setSelectedCourse(course)
                setIsUpdateDialogOpen(true)
              }}
              className="mt-4"
            >
              Update Course
            </Button>
          </div>
        ))}
      </div>
      <AddCourseDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddCourse}
        adminCredentials={adminCredentials}
      />
      <UpdateCourseDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        onUpdate={handleUpdateCourse}
        course={selectedCourse}
        adminCredentials={adminCredentials}
        removeDivision={removeDivision}
      />
      <DivisionDialog
        isOpen={isDivisionDialogOpen}
        onClose={() => setIsDivisionDialogOpen(false)}
        onAdd={addDivision}
      />
    </div>
  )
}

function DivisionDialog({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (username: string, password: string) => void
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(username, password)
    setUsername("")
    setPassword("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin Authentication Required</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please enter admin credentials to create divisions for this year.
          </p>
          <Input placeholder="Admin Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Create Divisions</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddCourseDialog({
  isOpen,
  onClose,
  onAdd,
  adminCredentials,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (course: Course) => void
  adminCredentials: { username: string; password: string }
}) {
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      alert("Invalid admin credentials")
      return
    }
    const newCourse: Course = {
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      duration: Number.parseInt(duration, 10),
      years: Array.from({ length: Number.parseInt(duration, 10) }, (_, i) => ({
        year: i + 1,
        divisions: ["Division A"],
      })),
    }
    onAdd(newCourse)
    setTitle("")
    setDuration("")
    setUsername("")
    setPassword("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input
            type="number"
            placeholder="Duration (in years)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <Input placeholder="Admin Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Add Course</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UpdateCourseDialog({
  isOpen,
  onClose,
  onUpdate,
  course,
  adminCredentials,
  removeDivision,
}: {
  isOpen: boolean
  onClose: () => void
  onUpdate: (course: Course) => void
  course: Course | null
  adminCredentials: { username: string; password: string }
  removeDivision: (courseId: string, year: number) => void
}) {
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (course) {
      setTitle(course.title)
      setDuration(course.duration.toString())
    }
  }, [course])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      alert("Invalid admin credentials")
      return
    }
    if (course) {
      const updatedCourse: Course = {
        ...course,
        title,
        duration: Number.parseInt(duration, 10),
        years: Array.from({ length: Number.parseInt(duration, 10) }, (_, i) => {
          const existingYear = course.years.find((y) => y.year === i + 1)
          return existingYear || { year: i + 1, divisions: ["Division A"] }
        }),
      }
      onUpdate(updatedCourse)
      setUsername("")
      setPassword("")
    }
  }

  const handleRemoveDivision = (year: number) => {
    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      alert("Invalid admin credentials")
      return
    }
    if (course) {
      removeDivision(course.id, year)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input
            type="number"
            placeholder="Duration (in years)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />

          {course && (
            <div className="space-y-2 border-t pt-2">
              <h3 className="text-sm font-medium">Division Management</h3>
              <div className="space-y-2">
                {course.years.map((year) => (
                  <div key={year.year} className="flex items-center justify-between">
                    <span>Year {year.year}</span>
                    {year.divisions.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveDivision(year.year)}>
                        Remove Divisions
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Input placeholder="Admin Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Update Course</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

