# ContentHub - Digital Asset Management Platform

## Overview

ContentHub is a full-stack digital asset management platform built with React, Express, and PostgreSQL. The application allows users to browse, manage, and download digital content organized by categories, with an integrated news system and comprehensive admin panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- January 30, 2025: Fixed server startup issue with ESM imports and type validation errors
- January 30, 2025: Implemented complete content management platform with posts, categories, news, and admin panel
- January 30, 2025: Added file upload system with drag-and-drop support for images and downloadable files
- January 30, 2025: Fixed price validation issue in post creation API

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Uploads**: Multer middleware for multipart form handling
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite integration in development mode

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM with schema-first approach
- **File Storage**: Local filesystem with static file serving
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Database Schema
- **Categories**: Content organization with name and slug fields
- **Posts**: Main content items with title, description, pricing, images, and downloadable files
- **News Articles**: Content management for platform updates and announcements
- **File Metadata**: JSON fields storing image arrays and download file information

### API Structure
- **RESTful API**: Standard HTTP methods for CRUD operations
- **File Upload Endpoints**: Dedicated routes for image and file uploads
- **Category Management**: CRUD operations for content categorization
- **Post Management**: Full content lifecycle management
- **News System**: Article creation and retrieval
- **Download Tracking**: Analytics for content download counts

### Frontend Pages
- **Home Page**: Content browsing with search, filtering, and categorization
- **Admin Panel**: Content management interface with tabbed navigation
- **News Page**: Article listing and reading interface
- **404 Page**: User-friendly error handling

### UI Components
- **Post Cards**: Content display with download functionality
- **News Cards**: Article preview components
- **File Upload**: Drag-and-drop file handling with progress feedback
- **Header**: Navigation and search functionality
- **Form Components**: Comprehensive form handling with validation

## Data Flow

### Content Management Flow
1. **Admin Creates Content**: Forms submit to Express API endpoints
2. **File Processing**: Multer handles file uploads to local storage
3. **Database Storage**: Drizzle ORM persists metadata to PostgreSQL
4. **Content Serving**: Static files served through Express middleware
5. **Client Updates**: React Query invalidates and refetches data

### User Interaction Flow
1. **Content Discovery**: Users browse categories and search content
2. **Download Process**: Download buttons trigger API calls to increment counters
3. **File Delivery**: Direct file links initiate browser downloads
4. **Analytics**: Download counts updated in real-time

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **drizzle-orm**: Type-safe database ORM
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **multer**: File upload handling
- **wouter**: Lightweight routing

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling
- **PostCSS**: CSS processing pipeline

## Deployment Strategy

### Build Process
- **Client Build**: Vite compiles React application to static assets
- **Server Build**: ESBuild bundles Node.js server code
- **Output Structure**: Client assets to `dist/public`, server to `dist/index.js`

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **File Storage**: Local uploads directory with configurable path
- **Development Mode**: Vite dev server integration with HMR support
- **Production Mode**: Static file serving with Express

### Database Management
- **Schema Migrations**: Drizzle Kit handles schema changes
- **Connection Pooling**: Neon Database provides serverless scaling
- **Development Setup**: Local PostgreSQL or Neon Database connection

The application follows a traditional full-stack architecture with modern tooling, emphasizing developer experience through TypeScript, comprehensive validation, and hot reload capabilities during development.