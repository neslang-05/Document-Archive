import { createClient } from "@/lib/supabase/server"
import { HeaderServer } from "@/components/layout/header-server"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, FileText, BookOpen } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ""
  const supabase = await createClient()

  let resources: Array<{ id: string; title: string; category?: string; courses?: { code: string; name: string } | null }> = []
  let courses: Array<{ id: string; code: string; name: string; semester: number }> = []

  if (query) {
    const [resourcesResult, coursesResult] = await Promise.all([
      supabase
        .from('resources')
        .select('*, courses(code, name)')
        .eq('status', 'approved')
        .ilike('title', `%${query}%`)
        .limit(20),
      supabase
        .from('courses')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .limit(20)
    ])
    
    resources = resourcesResult.data || []
    courses = coursesResult.data || []
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
                                {resource.courses?.code}
                              </span>
                              <span className="capitalize">{resource.category?.replace('_', ' ')}</span>
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
