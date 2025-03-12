"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star } from "lucide-react"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"

type FacultyMember = {
  id: number
  name: string
  department: string
  degree: string
  dateOfBirth: string
  isAdmin: boolean
  email: string
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null)
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" })

  useEffect(() => {
    const savedFaculty = getFromLocalStorage("faculty")
    if (savedFaculty) {
      setFaculty(savedFaculty)
    } else {
      // Use mock data if no saved data exists
      const mockFaculty: FacultyMember[] = [
        {
          id: 1,
          name: "Dr. Smith",
          department: "Mathematics",
          degree: "Ph.D.",
          dateOfBirth: "1975-05-15",
          isAdmin: true,
          email: "dr.smith@example.com",
        },
        {
          id: 2,
          name: "Prof. Johnson",
          department: "Physics",
          degree: "Ph.D.",
          dateOfBirth: "1980-09-22",
          isAdmin: false,
          email: "prof.johnson@example.com",
        },
        {
          id: 3,
          name: "Ms. Brown",
          department: "English",
          degree: "M.A.",
          dateOfBirth: "1985-03-10",
          isAdmin: false,
          email: "ms.brown@example.com",
        },
      ]
      setFaculty(mockFaculty)
      saveToLocalStorage("faculty", mockFaculty)
    }
  }, []) // Empty dependency array - only runs once on mount

  // Separate useEffect for updating admin credentials
  useEffect(() => {
    // Only update admin credentials if faculty has been loaded (length > 0)
    if (faculty.length > 0) {
      const adminMember = faculty.find((member) => member.isAdmin)
      if (adminMember) {
        const credentials = { username: adminMember.name, password: adminMember.department }
        setAdminCredentials(credentials)
        saveToLocalStorage("adminCredentials", credentials)
      }
    }
  }, [faculty]) // This is fine now because we're not setting faculty state in this hook

  const updateFaculty = (newFaculty: FacultyMember[]) => {
    setFaculty(newFaculty)
    saveToLocalStorage("faculty", newFaculty)
  }

  const handleAddFaculty = (newFaculty: Omit<FacultyMember, "id" | "isAdmin">) => {
    const id = Math.max(...faculty.map((f) => f.id), 0) + 1
    const updatedFaculty = [...faculty, { ...newFaculty, id, isAdmin: false }]
    updateFaculty(updatedFaculty)
    setIsAddDialogOpen(false)
  }

  const handleUpdateFaculty = (updatedFacultyMember: FacultyMember) => {
    const updatedFaculty = faculty.map((f) => (f.id === updatedFacultyMember.id ? updatedFacultyMember : f))
    updateFaculty(updatedFaculty)
    setIsUpdateDialogOpen(false)
    setSelectedFaculty(null)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Faculty</h1>
      <Button onClick={() => setIsAddDialogOpen(true)} className="mb-4">
        Add Faculty Member
      </Button>
      <div className="space-y-4">
        {faculty.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                {member.name}
                {member.isAdmin && <Star className="ml-2 w-5 h-5 text-yellow-500" />}
              </h2>
              <p>Department: {member.department}</p>
              <p>Degree: {member.degree}</p>
              <p>Age: {calculateAge(member.dateOfBirth)}</p>
              <p>Email: {member.email}</p>
            </div>
            <Button
              onClick={() => {
                setSelectedFaculty(member)
                setIsUpdateDialogOpen(true)
              }}
            >
              Update Information
            </Button>
          </div>
        ))}
      </div>
      <AddFacultyDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddFaculty}
        adminCredentials={adminCredentials}
      />
      <UpdateFacultyDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => {
          setIsUpdateDialogOpen(false)
          setSelectedFaculty(null)
        }}
        onUpdate={handleUpdateFaculty}
        faculty={selectedFaculty}
        adminCredentials={adminCredentials}
      />
    </div>
  )
}

function AddFacultyDialog({
  isOpen,
  onClose,
  onAdd,
  adminCredentials,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (faculty: Omit<FacultyMember, "id" | "isAdmin">) => void
  adminCredentials: { username: string; password: string }
}) {
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [degree, setDegree] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check admin credentials
    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      alert("Invalid admin credentials")
      return
    }

    onAdd({ name, department, degree, dateOfBirth, email })
    // Reset form
    setName("")
    setDepartment("")
    setDegree("")
    setDateOfBirth("")
    setEmail("")
    setUsername("")
    setPassword("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Faculty Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
          <Input placeholder="Degree" value={degree} onChange={(e) => setDegree(e.target.value)} required />
          <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <hr className="my-2" />
          <p className="text-sm text-gray-500">Admin authentication required</p>
          <Input placeholder="Admin Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Add Faculty Member</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UpdateFacultyDialog({
  isOpen,
  onClose,
  onUpdate,
  faculty,
  adminCredentials,
}: {
  isOpen: boolean
  onClose: () => void
  onUpdate: (faculty: FacultyMember) => void
  faculty: FacultyMember | null
  adminCredentials: { username: string; password: string }
}) {
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [degree, setDegree] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [email, setEmail] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (faculty) {
      setName(faculty.name)
      setDepartment(faculty.department)
      setDegree(faculty.degree)
      setDateOfBirth(faculty.dateOfBirth)
      setEmail(faculty.email)
      setIsAdmin(faculty.isAdmin)
    }
  }, [faculty])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check admin credentials
    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      alert("Invalid admin credentials")
      return
    }

    if (faculty) {
      onUpdate({ ...faculty, name, department, degree, dateOfBirth, email, isAdmin })
      setUsername("")
      setPassword("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Faculty Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
          <Input placeholder="Degree" value={degree} onChange={(e) => setDegree(e.target.value)} required />
          <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isAdmin" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            <label htmlFor="isAdmin">Is Admin</label>
          </div>
          <hr className="my-2" />
          <p className="text-sm text-gray-500">Admin authentication required</p>
          <Input placeholder="Admin Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Update Faculty Information</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

