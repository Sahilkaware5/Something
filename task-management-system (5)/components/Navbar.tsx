import type React from "react"
import Link from "next/link"
import {
  Home,
  Book,
  Calendar,
  FileText,
  UserIcon as UserGraduate,
  ClapperboardIcon as ChalkboardTeacher,
} from "lucide-react"

export default function Navbar() {
  return (
    <nav className="w-64 min-h-screen bg-primary text-primary-foreground p-6">
      <ul className="space-y-4">
        <NavItem href="/" icon={<Home className="w-5 h-5" />} label="Home" />
        <NavItem href="/courses" icon={<Book className="w-5 h-5" />} label="Courses" />
        <NavItem href="/timetable" icon={<Calendar className="w-5 h-5" />} label="Timetable" />
        <NavItem href="/syllabus" icon={<FileText className="w-5 h-5" />} label="Syllabus" />
        <NavItem href="/student-info" icon={<UserGraduate className="w-5 h-5" />} label="Student Information" />
        <NavItem href="/faculty" icon={<ChalkboardTeacher className="w-5 h-5" />} label="Faculty" />
      </ul>
    </nav>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  )
}

