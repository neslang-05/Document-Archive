import Link from "next/link"
import { BookOpen, Github, Mail, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    resources: [
      { name: "Question Papers", href: "/resources?category=question_paper" },
      { name: "Notes", href: "/resources?category=notes" },
      { name: "Lab Manuals", href: "/resources?category=lab_manual" },
      { name: "Project Reports", href: "/resources?category=project_report" },
    ],
    semesters: [
      { name: "Semester 1-2", href: "/courses?semester=1" },
      { name: "Semester 3-4", href: "/courses?semester=3" },
      { name: "Semester 5-6", href: "/courses?semester=5" },
      { name: "Semester 7-8", href: "/courses?semester=7" },
    ],
    support: [
      { name: "How to Contribute", href: "/docs/contribute" },
      { name: "Submission Guidelines", href: "/docs/guidelines" },
      { name: "FAQ", href: "/docs/faq" },
      { name: "Contact Us", href: "/contact" },
    ],
  }

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">MTU Archive</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A community-driven academic archiving platform for B.Tech CSE students 
              at Manipur Technical University.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/neslang-05/Document-Archive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="mailto:nilambar_e22@mtu.ac.in"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Semesters */}
          <div>
            <h3 className="font-semibold mb-4">Browse by Semester</h3>
            <ul className="space-y-2">
              {footerLinks.semesters.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MTU Archive. Built for students, by students.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <a
              href="https://mtu.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              MTU Website
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
