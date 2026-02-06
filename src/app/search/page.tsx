import { getD1 } from "@/lib/db/d1"
import { HeaderServer } from "@/components/layout/header-server"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, FileText, BookOpen } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ""
  const db = getD1()

  let resources: any[] = []
  let courses: any[] = []

  if (query) {
    const [resourcesResult, coursesResult] = await Promise.all([
      db.prepare(`
        SELECT r.id, r.title, r.category, c.code as course_code, c.name as course_name
        FROM resources r
        LEFT JOIN courses c ON r.course_id = c.id
        WHERE r.status = 'approved' AND r.title LIKE ?
        LIMIT 20
      `).bind(`%${query}%`).all(),
      db.prepare(`
        SELECT * FROM courses WHERE name LIKE ? OR code LIKE ? LIMIT 20
      `).bind(`%${query}%`, `%${query}%`).all(),
    ])

    resources = resourcesResult.results || []
    courses = coursesResult.results || []
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <form className="relative flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                name="q" 
                defaultValue={query} 
                placeholder="Search resources, courses..." 
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {query && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Courses ({courses.length})
              </h2>
              {courses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map(course => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <Card className="h-full hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{course.name}</CardTitle>
                            <Badge variant="outline">{course.code}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Semester {course.semester}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No courses found matching &quot;{query}&quot;</p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resources ({resources.length})
              </h2>
              {resources.length > 0 ? (
                <div className="grid gap-4">
                  {resources.map(resource => (
                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <Card className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{resource.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span className="font-mono bg-muted px-1 rounded text-xs">
                                {resource.course_code as string}
                              </span>
                              <span className="capitalize">{(resource.category as string)?.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No resources found matching &quot;{query}&quot;</p>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
