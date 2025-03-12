export default function BCAPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bachelor of Computer Applications (BCA)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <YearBox year="BCA-I Year" />
        <YearBox year="BCA-II Year" />
        <YearBox year="BCA-III Year" />
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

