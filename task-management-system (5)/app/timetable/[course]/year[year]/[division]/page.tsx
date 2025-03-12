"use client"

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
import { saveData, getData } from "@/utils/enhancedStorage"
import { useDeviceType } from "@/components/ResponsiveWrapper"
import UpdateTimetableDialog from "@/components/UpdateTimetableDialog"
import AttendanceDialog from "@/components/AttendanceDialog"
import AssignTeacherDialog from "@/components/AssignTeacherDialog"

type TimetableType = {
  [day: string]: LectureType[]
}

type LectureType = {
  id: string
  subject: string
  time: string
  teacher: string
  isPresent: boolean
  substituteTeacher?: string
}

type Student = {
  id: string
  name: string
  course: string
  year: number
  division: string
  attendance: {
    [lectureId: string]: boolean
  }
}

type FacultyMember = {
  id: string
  name: string
}

export default function TimetableDivisionViewPage() {
  const params = useParams()
  const deviceType = useDeviceType()
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Form state for adding new lectures
  const [newSubject, setNewSubject] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newTeacher, setNewTeacher] = useState("")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  useEffect(() => {
    // Load data using the enhanced storage
    const loadData = async () => {
      // Load courses
      const savedCourses = await getData("courses")
      if (savedCourses) {
        setCourses(savedCourses)
      }

      // Load faculty
      const savedFaculty = await getData("faculty")
      if (savedFaculty) {
        setFaculty(savedFaculty)
      }

      // Load timetable
      const timetableKey = `timetable_${params.course}_year${params.year}_${params.division}`
      const savedTimetable = await getData(timetableKey)
      if (savedTimetable) {
        setTimetable(savedTimetable)
      } else {
        // Create empty timetable structure if none exists
        const emptyTimetable: TimetableType = {}
        days.forEach((day) => {
          emptyTimetable[day] = []
        })
        setTimetable(emptyTimetable)
        saveData(timetableKey, emptyTimetable)
      }

      // Load students
      const savedStudents = await getData("students")
      if (savedStudents) {
        const filteredStudents = savedStudents.filter(
          (s: Student) =>
            s.course === params.course && s.year.toString() === params.year && s.division === params.division,
        )
        setStudents(filteredStudents)
      }
    }

    loadData()
  }, [params.course, params.year, params.division])

  const handleAddLecture = async () => {
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
    await saveData(`timetable_${params.course}_year${params.year}_${params.division}`, updatedTimetable)

    // Reset form
    setNewSubject("")
    setNewTime("")
    setNewTeacher("")
  }

  const handleTeacherPresence = async (index: number, isPresent: boolean) => {
    const updatedTimetable = { ...timetable }
    updatedTimetable[selectedDay][index].isPresent = isPresent

    // Clear substitute teacher if marked as present
    if (isPresent && updatedTimetable[selectedDay][index].substituteTeacher) {
      delete updatedTimetable[selectedDay][index].substituteTeacher
    }

    setTimetable(updatedTimetable)
    await saveData(`timetable_${params.course}_year${params.year}_${params.division}`, updatedTimetable)
  }

  const openAssignTeacherDialog = (index: number) => {
    setCurrentLectureIndex(index)
    setIsAssignTeacherOpen(true)
  }

  const assignSubstituteTeacher = async (substituteTeacher: string) => {
    if (currentLectureIndex === null) return

    const updatedTimetable = { ...timetable }
    updatedTimetable[selectedDay][currentLectureIndex].substituteTeacher = substituteTeacher
    setTimetable(updatedTimetable)
    await saveData(`timetable_${params.course}_year${params.year}_${params.division}`, updatedTimetable)
    setIsAssignTeacherOpen(false)
    setCurrentLectureIndex(null)
  }

  const openAttendanceDialog = (lecture: LectureType) => {
    setSelectedLecture(lecture)
    setIsAttendanceDialogOpen(true)
  }

  const markAttendance = async (studentId: string, isPresent: boolean) => {
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
    const allStudents = (await getData("students")) || []
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

    await saveData("students", updatedAllStudents)
  }

  const handleDeleteLecture = async (index: number) => {
    const updatedTimetable = { ...timetable }
    updatedTimetable[selectedDay] = updatedTimetable[selectedDay].filter((_, i) => i !== index)
    setTimetable(updatedTimetable)
    await saveData(`timetable_${params.course}_year${params.year}_${params.division}`, updatedTimetable)
  }

  // Find current course
  const currentCourse = courses.find((c) => c.id === params.course)
  const courseTitle = currentCourse ? currentCourse.title : params.course

  // Render different layouts based on device type
  const renderMobileView = () => (
    <div className="container mx-auto px-2 py-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">
            {courseTitle} - Y{params.year} - {params.division}
          </h1>
          <p className="text-xs text-muted-foreground">{students.length} students</p>
        </div>
        <Button size="sm" onClick={() => setIsUpdateDialogOpen(true)}>
          Update
        </Button>
      </div>

      <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="mb-4 grid grid-cols-3 h-auto">
          {days.map((day) => (
            <TabsTrigger key={day} value={day} className="text-xs py-1">
              {day.substring(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => (
          <TabsContent key={day} value={day} className="space-y-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {/* Simplified Add Form for Mobile */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-2"
                  onClick={() => {
                    setNewSubject("")
                    setNewTime("")
                    setNewTeacher("")
                    setIsMobileMenuOpen(true)
                  }}
                >
                  + Add New Lecture
                </Button>

                {/* Mobile Timetable */}
                <div className="space-y-2">
                  {timetable[day]?.length > 0 ? (
                    timetable[day].map((lecture, index) => (
                      <Card key={lecture.id} className="p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{lecture.subject}</h3>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {lecture.time}
                            </p>
                            <p className="text-xs flex items-center mt-1">
                              <User className="h-3 w-3 mr-1" />
                              {lecture.isPresent ? (
                                lecture.teacher
                              ) : (
                                <span className="text-red-500">{lecture.teacher}</span>
                              )}
                            </p>
                            {!lecture.isPresent && lecture.substituteTeacher && (
                              <p className="text-xs text-green-600 flex items-center">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Sub: {lecture.substituteTeacher}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant={lecture.isPresent ? "default" : "outline"}
                              className="h-7 text-xs px-2"
                              onClick={() => handleTeacherPresence(index, true)}
                            >
                              <UserCheck className="h-3 w-3 mr-1" />P
                            </Button>
                            <Button
                              size="sm"
                              variant={!lecture.isPresent ? "destructive" : "outline"}
                              className="h-7 text-xs px-2"
                              onClick={() => handleTeacherPresence(index, false)}
                            >
                              <UserX className="h-3 w-3 mr-1" />A
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 gap-1">
                          {!lecture.isPresent && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 flex-1"
                              onClick={() => openAssignTeacherDialog(index)}
                            >
                              Assign
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 flex-1"
                            onClick={() => openAttendanceDialog(lecture)}
                          >
                            Attendance
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs h-7 w-7 p-0"
                            onClick={() => handleDeleteLecture(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No lectures scheduled for {day}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Mobile Add Lecture Dialog */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lecture for {selectedDay}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Enter subject" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Time</label>
              <Input
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 9:00 AM - 10:00 AM"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Teacher</label>
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
            <Button
              onClick={() => {
                handleAddLecture()
                setIsMobileMenuOpen(false)
              }}
            >
              Add Lecture
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UpdateTimetableDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        course={params.course}
        year={params.year}
        division={params.division}
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

  const renderTabletView = () => (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Timetable for {courseTitle} - Year {params.year} - {params.division}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{students.length} students enrolled</p>
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
                <div className="mb-6 p-3 border rounded-lg bg-muted/20">
                  <h3 className="text-lg font-medium mb-3">Add New Lecture</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
        division={params.division}
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

  const renderDesktopView = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Timetable for {courseTitle} - Year {params.year} - {params.division}
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
        division={params.division}
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

  // Render based on device type
  if (deviceType === "mobile") {
    return renderMobileView()
  } else if (deviceType === "tablet") {
    return renderTabletView()
  } else {
    return renderDesktopView()
  }
}

