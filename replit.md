# Overview

This is a full-stack web application for a Korean dermatology clinic called "Seoul Anti-Aging Dermatology Clinic." The application features a public landing page with clinic information, services, and a contact form, plus an admin dashboard for managing inquiries. The system uses React with TypeScript for the frontend, Express.js for the backend, and integrates with Replit's authentication system for admin access.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, using **Vite** as the build tool. The architecture follows a component-based approach with:

- **Routing**: Uses `wouter` for client-side routing with conditional rendering based on authentication status
- **State Management**: Leverages React Query (`@tanstack/react-query`) for server state management and caching
- **UI Components**: Built with shadcn/ui components (Radix UI primitives) and styled with Tailwind CSS
- **Styling**: Tailwind CSS with custom CSS variables for theming, including Korean font support (Noto Sans KR)
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The application structure separates concerns with dedicated directories for components, pages, hooks, and utilities. The design implements a mobile-first responsive approach with dark/light theme support.

## Backend Architecture
The backend uses **Express.js** with TypeScript in an ESM configuration:

- **API Routes**: RESTful API design with routes for authentication, user management, and inquiry handling
- **Middleware**: Custom logging middleware, JSON parsing, and error handling
- **Session Management**: Express sessions with PostgreSQL storage using `connect-pg-simple`
- **Request Handling**: Structured error responses with proper HTTP status codes

The server implements a clean separation between route definitions, business logic, and data access layers.

## Authentication & Authorization
The system integrates with **Replit's OpenID Connect (OIDC)** authentication:

- **Admin Authentication**: Passport.js with OpenID Connect strategy for secure admin login
- **Session Storage**: PostgreSQL-backed sessions with automatic cleanup and TTL management
- **Authorization**: Route-level protection with middleware-based authentication checks
- **User Management**: Automatic user profile creation/updates from OIDC claims

This approach provides secure, hassle-free authentication without requiring separate user registration flows.

## Data Storage & Management
**PostgreSQL** database with **Drizzle ORM**:

- **Schema Design**: Type-safe database schema definitions with automatic TypeScript type generation
- **Tables**: Users, sessions, and inquiries tables with proper indexing and constraints
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling for scalability
- **Migrations**: Drizzle Kit for database schema migrations and version control
- **Data Access**: Repository pattern implementation with proper error handling and type safety

The database design supports the core functionality while maintaining data integrity and performance.

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with automatic TypeScript generation
- **Replit Deployment**: Hosted on Replit with integrated development tools

## Authentication Services
- **Replit Auth**: OpenID Connect provider for admin authentication
- **Passport.js**: Authentication middleware with OIDC strategy support

## Frontend Libraries
- **React Query**: Server state management and caching with automatic background updates
- **shadcn/ui**: Component library built on Radix UI primitives for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Wouter**: Lightweight client-side router for React applications

## Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Type safety across frontend and backend
- **Zod**: Runtime type validation and schema generation
- **ESLint/Prettier**: Code formatting and linting (implied by structure)

## Communication & Integrations
- **Font Integration**: Google Fonts API for Korean typography (Noto Sans KR)
- **Image Assets**: Unsplash for placeholder images in gallery sections
- **KakaoTalk**: Planned integration for customer communication (placeholder implementation)