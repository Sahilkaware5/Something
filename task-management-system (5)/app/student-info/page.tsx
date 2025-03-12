"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"

type Student = {
  id: string
  rollNo: string
  name: string
  prnNumber: string
  course: string
  year: number
  division: string
  attendance: Record<string, boolean>
}

type Course = {
  id: string
  title: string
  duration: number
  years: {
    year: number
    divisions: string[]
  }[]
}

function AddStudentDialog({
  isOpen,
  onClose,
  onAdd,
  courses,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (student: Omit<Student, "id" | "attendance">) => void
  courses: Course[]
}) {
  const [rollNo, setRollNo] = useState("")
  const [name, setName] = useState("")
  const [prnNumber, setPrnNumber] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!selectedCourse || !selectedYear || !selectedDivision) {
      alert("Please select a course, year, and division")
      return
    }
    onAdd({
      rollNo,
      name,
      prnNumber,
      course: selectedCourse,
      year: selectedYear,
      division: selectedDivision,
    })
    // Reset form
    setRollNo("")
    setName("")
    setPrnNumber("")
    setSelectedCourse(null)
    setSelectedYear(null)
    setSelectedDivision(null)
  }

  const selectedCourseObj = courses.find((c) => c.id === selectedCourse)
  const selectedYearObj = selectedCourseObj?.years.find((y) => y.year === selectedYear)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-4">
        <DialogTitle>Add Student</DialogTitle>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
          />
          <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            type="text"
            placeholder="PRN Number"
            value={prnNumber}
            onChange={(e) => setPrnNumber(e.target.value)}
            required
          />
          <Select onValueChange={setSelectedCourse} value={selectedCourse || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCourseObj && (
            <Select
              onValueChange={(value) => setSelectedYear(Number(value))}
              value={selectedYear?.toString() || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {selectedCourseObj.years.map((year) => (
                  <SelectItem key={year.year} value={year.year.toString()}>
                    Year {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedYearObj && (
            <Select onValueChange={setSelectedDivision} value={selectedDivision || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {selectedYearObj.divisions.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function StudentInfoPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<string>("current")

  useEffect(() => {
    const savedStudents = getFromLocalStorage("students")
    if (savedStudents) {
      setStudents(savedStudents)
    }

    const savedCourses = getFromLocalStorage("courses")
    if (savedCourses) {
      setCourses(savedCourses)
    }
  }, [])

  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents)
    saveToLocalStorage("students", newStudents)
  }

  const handleAddStudent = (newStudent: Omit<Student, "id" | "attendance">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const student: Student = {
      ...newStudent,
      id,
      attendance: {},
    }
    updateStudents([...students, student])
    setIsAddDialogOpen(false)
  }

  const filteredStudents = students
    .filter(
      (student) =>
        (!selectedCourse || student.course === selectedCourse) &&
        (!selectedYear || student.year === selectedYear) &&
        (!selectedDivision || student.division === selectedDivision),
    )
    .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name

  // Generate weeks for the dropdown
  const getWeeks = () => {
    const weeks = []
    const today = new Date()
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay()) // Start of current week (Sunday)

    // Current week
    weeks.push({
      id: "current",
      label: `Current Week (${currentWeekStart.toLocaleDateString()} - ${new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()})`,
    })

    // Previous weeks
    for (let i = 1; i <= 3; i++) {
      const weekStart = new Date(currentWeekStart)
      weekStart.setDate(currentWeekStart.getDate() - 7 * i)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      weeks.push({
        id: `week-${i}`,
        label: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
      })
    }

    return weeks
  }

  // Calculate attendance percentage for a student
  const calculateAttendance = (student: Student) => {
    const attendanceEntries = Object.entries(student.attendance)
    if (attendanceEntries.length === 0) return "N/A"

    const presentCount = attendanceEntries.filter(([_, isPresent]) => isPresent).length
    const percentage = (presentCount / attendanceEntries.length) * 100

    return `${percentage.toFixed(1)}% (${presentCount}/${attendanceEntries.length})`
  }

  // Get course title from ID
  const getCourseTitle = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    return course ? course.title : courseId
  }

  const selectedCourseObj = courses.find((c) => c.id === selectedCourse)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Information</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4 items-center">
          <Select
            onValueChange={(value) => {
              setSelectedCourse(value === "all" ? null : value)
              setSelectedYear(null)
              setSelectedDivision(null)
            }}
            value={selectedCourse || "all"}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCourseObj && (
            <Select
              onValueChange={(value) => {
                setSelectedYear(value === "all" ? null : Number(value))
                setSelectedDivision(null)
              }}
              value={selectedYear?.toString() || "all"}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {selectedCourseObj.years.map((year) => (
                  <SelectItem key={year.year} value={year.year.toString()}>
                    Year {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedCourseObj && selectedYear && (
            <Select
              onValueChange={(value) => setSelectedDivision(value === "all" ? null : value)}
              value={selectedDivision || "all"}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {selectedCourseObj.years
                  .find((y) => y.year === selectedYear)
                  ?.divisions.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          <Select onValueChange={(value) => setSelectedWeek(value)} value={selectedWeek}>
            <SelectTrigger className="w-[350px]">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {getWeeks().map((week) => (
                <SelectItem key={week.id} value={week.id}>
                  {week.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Student</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>PRN Number</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.rollNo}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.prnNumber}</TableCell>
                  <TableCell>{getCourseTitle(student.course)}</TableCell>
                  <TableCell>Year {student.year}</TableCell>
                  <TableCell>{student.division}</TableCell>
                  <TableCell>{calculateAttendance(student)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No students found. Add students using the "Add Student" button.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddStudentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddStudent}
        courses={courses}
      />
    </div>
  )
}

