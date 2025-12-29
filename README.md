# MTU Archive - Academic Resource Platform

A community-driven academic archiving and resource platform for B.Tech CSE students at Manipur Technical University (MTU). Built with Next.js 16, Supabase, and shadcn/ui with a GitHub-inspired design.

## 🚀 Features

- **📚 Course Catalog**: Browse all MTU B.Tech CSE courses across 8 semesters
- **📄 Resource Library**: Question papers, notes, lab manuals, and project reports
- **🔐 Authentication**: Email/password and GitHub OAuth via Supabase Auth
- **⬆️ Upload System**: Multi-step form for submitting academic resources
- **👮 Moderation Queue**: Dedicated dashboard for moderators to approve/reject submissions
- **⭐ Ratings & Reviews**: Community-driven ratings for quality assurance
- **🔖 Bookmarks**: Save resources for quick access later
- **📱 PWA Support**: Install as a progressive web app on mobile devices
- **🌙 Dark Mode**: System-aware theme switching

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Backend**: [Supabase](https://supabase.com/)
  - PostgreSQL database with RLS policies
  - Authentication (Email + OAuth)
  - Storage for file uploads
- **Deployment**: [Vercel](https://vercel.com/)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Authentication pages
│   ├── courses/            # Course catalog and detail pages
│   ├── moderation/         # Moderator dashboard
│   ├── profile/            # User profile and dashboard
│   ├── resources/          # Resource detail pages
│   ├── submit/             # Resource submission form
│   └── offline/            # Offline fallback page
├── components/
│   ├── layout/             # Header, Footer, Sidebar, Breadcrumbs
│   ├── providers/          # Theme and PWA providers
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── supabase/           # Supabase client configurations
│   └── utils.ts            # Utility functions
├── types/                  # TypeScript type definitions
└── middleware.ts           # Auth middleware for protected routes

public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── icons/                  # PWA icons

supabase/
└── schema.sql              # Database schema with RLS policies
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Set up the database
# 1. Create a new Supabase project
# 2. Run the schema from supabase/schema.sql in the SQL editor
# 3. Enable GitHub OAuth in Authentication settings

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🗄️ Database Schema

The database includes the following main tables:

- **profiles** - User profiles with roles (student, moderator, admin)
- **departments** - Academic departments
- **courses** - All MTU B.Tech CSE courses with semester/credits info
- **resources** - Uploaded academic resources
- **ratings** - User ratings and reviews
- **bookmarks** - User bookmarks
- **activity_log** - User activity tracking

All tables have Row Level Security (RLS) policies for proper access control.

## 📱 PWA Configuration

The app is configured as a Progressive Web App with:

- Service worker for offline support
- Web app manifest for installation
- Caching strategies for static assets

## 🎨 Design System

The UI follows GitHub's design language:

- **Primary Color**: #238636 (GitHub green)
- **Header**: Dark (#0d1117)
- **Background**: Light gray (#f6f8fa)
- **Typography**: Geist Sans + Geist Mono

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Nilambar Elangbam** - [@neslang-05](https://github.com/neslang-05)
