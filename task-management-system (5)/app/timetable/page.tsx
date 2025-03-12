"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, BookOpen, Users, School } from "lucide-react"
import { getFromLocalStorage } from "@/utils/localStorage"

type Course = {
  id: string
  title: string
  duration: number
  years: {
    year: number
    divisions: string[]
  }[]
}

export default function TimetablePage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    const savedCourses = getFromLocalStorage("courses")
    if (savedCourses) {
      setCourses(savedCourses)
    }
  }, [])

  const viewTimetable = (courseId: string, year: number, division?: string) => {
    if (division) {
      router.push(`/timetable/${courseId}/year${year}/${division}`)
    } else {
      router.push(`/timetable/${courseId}/year${year}`)
    }
  }

  // Group courses by type (e.g., BCA, MCA, BBA, MBA)
  const courseGroups = courses.reduce(
    (groups, course) => {
      const type = course.id.substring(0, 3).toUpperCase()
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(course)
      return groups
    },
    {} as Record<string, Course[]>,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Timetable Management</h1>
          <p className="text-muted-foreground mt-1">View and manage course timetables</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/courses")}>
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Courses
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/student-info")}>
            <Users className="h-4 w-4 mr-2" />
            Student Info
          </Button>
        </div>
      </div>

      {Object.keys(courseGroups).length > 0 ? (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex overflow-auto">
            <TabsTrigger value="all" className="flex-1">
              All Courses
            </TabsTrigger>
            {Object.keys(courseGroups).map((type) => (
              <TabsTrigger key={type} value={type} className="flex-1">
                {type} Programs
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} onViewTimetable={viewTimetable} />
              ))}
            </div>
          </TabsContent>

          {Object.entries(courseGroups).map(([type, groupCourses]) => (
            <TabsContent key={type} value={type} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupCourses.map((course) => (
                  <CourseCard key={course.id} course={course} onViewTimetable={viewTimetable} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <School className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Courses Found</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You need to add courses before you can create and manage timetables.
          </p>
          <Button onClick={() => router.push("/courses")}>
            <BookOpen className="h-4 w-4 mr-2" />
            Add Courses
          </Button>
        </div>
      )}
    </div>
  )
}

function CourseCard({
  course,
  onViewTimetable,
}: {
  course: Course
  onViewTimetable: (courseId: string, year: number, division?: string) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {course.years.map((yearData) => (
            <div key={yearData.year} className="p-4">
              <h3 className="font-medium text-lg mb-3">Year {yearData.year}</h3>

              {yearData.divisions.length > 1 ? (
                <div className="grid grid-cols-2 gap-2">
                  {yearData.divisions.map((division) => (
                    <Button
                      key={division}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onViewTimetable(course.id, yearData.year, division)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {division}
                    </Button>
                  ))}
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => onViewTimetable(course.id, yearData.year)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View Timetable
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

