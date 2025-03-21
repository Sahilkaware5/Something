"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, UserCheck, UserX, Users, Trash2 } from "lucide-react"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"

type LectureType = {
  id: string
  subject: string
  time: string
  teacher: string
  isPresent: boolean
  substituteTeacher?: string
}

type TimetableType = {
  [key: string]: LectureType[]
}

type Student = {
  id: string
  name: string
  rollNo: string
  prnNumber: string
  course: string
  year: number
  division: string
  attendance: {
    [lectureId: string]: boolean
  }
}

type FacultyMember = {
  id: number
  name: string
  department: string
  degree: string
  dateOfBirth: string
  isAdmin: boolean
  email: string
}

export default function TimetableYearViewPage() {
  const params = useParams()
  const [timetable, setTimetable] = useState<TimetableType>({})
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [selectedLecture, setSelectedLecture] = useState<LectureType | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false)
  const [currentLectureIndex, setCurrentLectureIndex] = useState<number | null>(null)
  const [courses, setCourses] = useState<any[]>([])

  // Form state for adding new lectures
  const [newSubject, setNewSubject] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newTeacher, setNewTeacher] = useState("")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  useEffect(() => {
    // Load courses
    const savedCourses = getFromLocalStorage("courses")
    if (savedCourses) {
      setCourses(savedCourses)
    }

    // Load faculty
    const savedFaculty = getFromLocalStorage("faculty")
    if (savedFaculty) {
      setFaculty(savedFaculty)
    }

    // Load timetable
    const timetableKey = `timetable_${params.course}_year${params.year}`
    const savedTimetable = getFromLocalStorage(timetableKey)
    if (savedTimetable) {
      setTimetable(savedTimetable)
    } else {
      // Create empty timetable structure if none exists
      const emptyTimetable: TimetableType = {}
      days.forEach((day) => {
        emptyTimetable[day] = []
      })
      setTimetable(emptyTimetable)
      saveToLocalStorage(timetableKey, emptyTimetable)
    }

    // Load students
    const savedStudents = getFromLocalStorage("students")
    if (savedStudents) {
      const filteredStudents = savedStudents.filter(
        (s: Student) => s.course === params.course && s.year.toString() === params.year,
      )
      setStudents(filteredStudents)
    }
  }, [params.course, params.year])

  const handleAddLecture = () => {
    if (!newSubject || !newTime || !newTeacher) {
      alert("Please fill in all fields")
      return
    }

    const newLecture: LectureType = {
      id: Date.now().toString(),
      subject: newSubject,
      time: newTime,
      teacher: newTeacher,
      isPresent: true,
    }

    const updatedTimetable = { ...timetable }
    updatedTimetable[selectedDay] = [...(updatedTimetable[selectedDay] || []), newLecture]
    setTimetable(updatedTimetable)
    saveToLocalStorage(`timetable_${params.course}_year${params.year}`, updatedTimetable)

    // Reset form
    setNewSubject("")
    setNewTime("")
    setNewTeacher("")
  }

  const handleTeacherPresence = (index: number, isPresent: boolean) => {
    const updatedTimetable = { ...timetable }
    updatedTimetable[selectedDay][index].isPresent = isPresent

    // Clear substitute teacher if marked as present
    if (isPresent && updatedTimetable[selectedDay][index].substituteTeacher) {
      delete updatedTimetable[selectedDay][index].substituteTeacher
    }

    setTimetable(updatedTimetable)
    saveToLocalStorage(`timetable_${params.course}_year${params.year}`, updatedTimetable)
  }

  const openAssignTeacherDialog = (index: number) => {
    setCurrentLectureIndex(index)
    setIsAssignTeacherOpen(true)
  }

  const assignSubstituteTeacher = (substituteTeacher: string) => {
    if (currentLectureIndex === null) return

    const updatedTimetable = { ...timetable }
    updatedTimetable[selectedDay][currentLectureIndex].substituteTeacher = substituteTeacher
    setTimetable(updatedTimetable)
    saveToLocalStorage(`timetable_${params.course}_year${params.year}`, updatedTimetable)
    setIsAssignTeacherOpen(false)
    setCurrentLectureIndex(null)
  }

  const openAttendanceDialog = (lecture: LectureType) => {
    setSelectedLecture(lecture)
    setIsAttendanceDialogOpen(true)
  }

  const markAttendance = (studentId: string, isPresent: boolean) => {
    if (!selectedLecture) return

    const lectureId = `${selectedDay}_${selectedLecture.id}`
    const updatedStudents = students.map((student) => {
      if (student.id === studentId) {
        return {
          ...student,
          attendance: {
            ...student.attendance,
            [lectureId]: isPresent,
          },
        }
      }
      return student
    })

    setStudents(updatedStudents)

    // Update all students in storage
    const allStudents = getFromLocalStorage("students") || []
    const updatedAllStudents = allStudents.map((student: Student) => {
      if (student.id === studentId) {
        return {
          ...student,
          attendance: {
            ...student.attendance,
            [lectureId]: isPresent,
          },
        }
      }
      return student
    })

    saveToLocalStorage("students", updatedAllStudents)
  }

  const handleDeleteLecture = (index: number) => {
    const updatedTimetable = { ...timetable }
    updatedTimetable[selectedDay] = updatedTimetable[selectedDay].filter((_, i) => i !== index)
    setTimetable(updatedTimetable)
    saveToLocalStorage(`timetable_${params.course}_year${params.year}`, updatedTimetable)
  }

  // Find current course
  const currentCourse = courses.find((c) => c.id === params.course)
  const courseTitle = currentCourse ? currentCourse.title : params.course

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Timetable for {courseTitle} - Year {params.year}
          </h1>
          <p className="text-muted-foreground mt-1">{students.length} students enrolled</p>
        </div>
        <Button onClick={() => setIsUpdateDialogOpen(true)}>Update Timetable</Button>
      </div>

      <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="mb-4 flex overflow-auto">
          {days.map((day) => (
            <TabsTrigger key={day} value={day} className="flex-1">
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => (
          <TabsContent key={day} value={day} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {day}'s Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add New Lecture Form */}
                <div className="mb-8 p-4 border rounded-lg bg-muted/20">
                  <h3 className="text-lg font-medium mb-4">Add New Lecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <Input
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time</label>
                      <Input
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        placeholder="e.g. 9:00 AM - 10:00 AM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Teacher</label>
                      <Select value={newTeacher} onValueChange={setNewTeacher}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculty.map((member) => (
                            <SelectItem key={member.id} value={member.name}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddLecture} className="w-full">
                        Add Lecture
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Timetable */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetable[day]?.length > 0 ? (
                        timetable[day].map((lecture, index) => (
                          <TableRow key={lecture.id}>
                            <TableCell className="font-medium">{lecture.subject}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                {lecture.time}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                {lecture.isPresent ? (
                                  lecture.teacher
                                ) : (
                                  <div>
                                    <span className="text-red-500">{lecture.teacher}</span>
                                    {lecture.substituteTeacher && (
                                      <div className="text-green-600 text-sm flex items-center mt-1">
                                        <UserCheck className="h-3 w-3 mr-1" />
                                        Substitute: {lecture.substituteTeacher}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant={lecture.isPresent ? "default" : "outline"}
                                  onClick={() => handleTeacherPresence(index, true)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant={!lecture.isPresent ? "destructive" : "outline"}
                                  onClick={() => handleTeacherPresence(index, false)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Absent
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {!lecture.isPresent && (
                                  <Button size="sm" variant="outline" onClick={() => openAssignTeacherDialog(index)}>
                                    <User className="h-4 w-4 mr-2" />
                                    Assign
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => openAttendanceDialog(lecture)}>
                                  <Users className="h-4 w-4 mr-2" />
                                  Attendance
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteLecture(index)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No lectures scheduled for {day}. Add a lecture using the form above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <UpdateTimetableDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        course={params.course}
        year={params.year}
      />

      <AttendanceDialog
        isOpen={isAttendanceDialogOpen}
        onClose={() => {
          setIsAttendanceDialogOpen(false)
          setSelectedLecture(null)
        }}
        students={students}
        lecture={selectedLecture}
        day={selectedDay}
        markAttendance={markAttendance}
      />

      <AssignTeacherDialog
        isOpen={isAssignTeacherOpen}
        onClose={() => {
          setIsAssignTeacherOpen(false)
          setCurrentLectureIndex(null)
        }}
        faculty={faculty}
        onAssign={assignSubstituteTeacher}
      />
    </div>
  )
}

function UpdateTimetableDialog({
  isOpen,
  onClose,
  course,
  year,
}: {
  isOpen: boolean
  onClose: () => void
  course: string
  year: string
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Get admin credentials from faculty
    const faculty = getFromLocalStorage("faculty") || []
    const admin = faculty.find((f: any) => f.isAdmin)

    if (!admin) {
      alert("No admin found in faculty")
      return
    }

    if (username === admin.name && password === admin.department) {
      // Redirect to update page
      window.location.href = `/timetable/${course}/${year}/update`
    } else {
      alert("Invalid admin credentials")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin Authentication Required</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Admin Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Authenticate</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AttendanceDialog({
  isOpen,
  onClose,
  students,
  lecture,
  day,
  markAttendance,
}: {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  lecture: LectureType | null
  day: string
  markAttendance: (studentId: string, isPresent: boolean) => void
}) {
  if (!lecture) return null

  const lectureId = `${day}_${lecture.id}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Student Attendance - {lecture.subject} ({lecture.time})
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>PRN Number</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.rollNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.prnNumber}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={student.attendance?.[lectureId] === true ? "default" : "outline"}
                          onClick={() => markAttendance(student.id, true)}
                        >
                          P
                        </Button>
                        <Button
                          size="sm"
                          variant={student.attendance?.[lectureId] === false ? "destructive" : "outline"}
                          onClick={() => markAttendance(student.id, false)}
                        >
                          A
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No students found for this course and year
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AssignTeacherDialog({
  isOpen,
  onClose,
  faculty,
  onAssign,
}: {
  isOpen: boolean
  onClose: () => void
  faculty: FacultyMember[]
  onAssign: (teacherName: string) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Substitute Teacher</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {faculty.map((member) => (
              <div
                key={member.id}
                className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => onAssign(member.name)}
              >
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.department}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

