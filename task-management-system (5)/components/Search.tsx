"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export default function Search() {
  const [searchResults, setSearchResults] = useState<string[]>([])

  const handleSearch = (query: string) => {
    // Implement search logic here
    // For now, we'll just set some dummy results
    if (query.trim() !== "") {
      setSearchResults(["Result 1 for " + query, "Result 2 for " + query, "Result 3 for " + query])
    } else {
      setSearchResults([])
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <SearchIcon className="w-6 h-6 mr-2" />
        Search
      </h2>
      <Input
        type="text"
        placeholder="Search courses, tasks, etc."
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4"
      />
      <ul className="space-y-2">
        {searchResults.map((result, index) => (
          <li key={index} className="p-2 bg-secondary rounded-lg">
            {result}
          </li>
        ))}
      </ul>
    </div>
  )
}

