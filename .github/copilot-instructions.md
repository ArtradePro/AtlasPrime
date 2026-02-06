# Atlas Prime - Development Guidelines

## Project Overview
Atlas Prime is a lead generation and CRM platform built with Next.js, Convex, and Node.js.

## Architecture
- **apps/web**: Next.js 14 frontend with App Router
- **apps/scraper-service**: Express backend for web scraping
- **convex/**: Real-time database schema and functions
- **packages/**: Shared utilities and types

## Code Style
- Use TypeScript for all code
- Follow React best practices with functional components
- Use Tailwind CSS for styling
- Prefer shadcn/ui components
- Keep components small and focused

## Database
- Convex is used for real-time data
- Schema defined in convex/schema.ts
- Use mutations for writes, queries for reads

## AI Integration
- Anthropic Claude API for lead analysis
- AI prompts in packages/ai-prompts/
