# Atlas Prime

> AI-Powered Lead Generation & Business Intelligence Platform

Atlas Prime is an enterprise-grade lead generation platform that combines intelligent web scraping, AI-powered analytics, and comprehensive CRM capabilities.

## 🚀 Features

- **Smart Lead Scraping** - Google Maps, LinkedIn, and public records integration
- **AI-Powered Analysis** - Claude-powered lead scoring and insights
- **Pipeline Management** - Pre-onboarding to operations workflow
- **Email Discovery** - Automated contact finding and verification
- **Ad Intelligence** - Track competitor advertising activity
- **CEI Tracking** - Customer Experience Index monitoring
- **Real-time Analytics** - Sales, campaigns, and growth metrics

## 📁 Project Structure

```
atlas-prime/
├── apps/
│   ├── web/                    # Next.js Frontend (Vercel)
│   └── scraper-service/        # Node.js Backend (Railway)
├── convex/                     # Convex Database
├── packages/
│   ├── shared/                 # Shared types & utilities
│   └── ai-prompts/             # AI analysis templates
└── package.json
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, BullMQ, Puppeteer
- **Database**: Convex (real-time)
- **AI**: Anthropic Claude API
- **Deployment**: Vercel (web), Railway (scraper)

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account
- Anthropic API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local

# Start Convex development server
npm run convex:dev

# Start development servers
npm run dev
```

### Environment Variables

Create `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_deploy_key
ANTHROPIC_API_KEY=your_anthropic_key
SCRAPER_SERVICE_URL=http://localhost:3001
```

## 🚀 Deployment

### Vercel (Frontend)

```bash
cd apps/web
vercel deploy
```

### Railway (Scraper Service)

```bash
cd apps/scraper-service
railway deploy
```

## 📄 License

MIT License - see LICENSE for details.
