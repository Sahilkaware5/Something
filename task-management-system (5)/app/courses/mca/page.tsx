export default function MCAPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Master of Computer Applications (MCA)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YearBox year="MCA-I Year" />
        <YearBox year="MCA-II Year" />
      </div>
    </div>
  )
}

function YearBox({ year }: { year: string }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-primary">{year}</h2>
    </div>
  )
}

