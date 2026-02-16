# CareHub - Healthcare Provider Dashboard

A comprehensive, full-stack healthcare dashboard application built with Next.js 14+, TypeScript, and React Query. CareHub empowers healthcare providers to efficiently manage their daily workflow, including patient records, appointments, vital signs tracking, and clinical notes.

## � Demo

> **Note**: Demo video is available in the `demo/` folder (68.48 MB). For GitHub viewing, please download and watch locally

<!-- Uncomment after uploading to YouTube/Vimeo:
[![Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
-->

## �🚀 Features

### ✅ Patient Management
- **Advanced Filtering System**: Filter patients by status, provider, risk level, and upcoming appointments
- **URL-based State**: All filters are reflected in the URL for shareable links
- **Debounced Search**: Real-time search across patient name, MRN, and date of birth
- **Sortable Columns**: Click any column header to sort ascending/descending
- **Pagination**: Configurable page sizes (10, 25, 50, 100 records per page)
- **Bulk Actions**: Select multiple patients for export or messaging
- **Loading Skeletons**: Smooth loading experience with skeleton screens

### 📋 Patient Detail Pages
- **Multiple Tabs**: Overview, Appointments, Vitals, and Notes sections
- **Parallel Data Fetching**: All data loads simultaneously for optimal performance
- **Interactive Charts**: Visualize vital signs trends with Recharts
- **Optimistic Updates**: Notes appear instantly before server confirmation
- **Error Boundaries**: Section-level error handling prevents complete page failures
- **Edit Patient Modal**: Quick edit functionality for patient information

### 📅 Appointment Scheduler
- **Weekly Calendar View**: Visual representation of scheduled appointments
- **Provider Filtering**: View appointments by specific provider
- **Time Slot Selection**: Click any time slot to create new appointments
- **Appointment Details Panel**: Side panel with full appointment information
- **Conflict Detection**: Visual warnings for scheduling conflicts
- **Today Indicator**: Highlighted current day and time
- **Status Color Coding**: Visual status indicators (confirmed, scheduled, in-progress, etc.)

### 🔔 Real-time Notifications
- **Notification Bell**: Unread count badge on navigation
- **Dropdown Interface**: Quick access to recent notifications
- **Mark as Read**: Individual or bulk marking
- **Auto-refresh**: Polls for new notifications every 30 seconds
- **Priority Levels**: Color-coded by importance (high, medium, low)

## 🛠 Tech Stack

### Frontend
- **Next.js 16.1.6** - App Router with React Server Components
- **React 19** - Latest React features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **React Query** - Server state management with caching
- **Zod** - Schema validation
- **date-fns** - Date manipulation
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Mock Data** - Realistic healthcare data generation
- **Simulated Latency** - 200-500ms delays for realistic testing
- **Error Simulation** - 5% error rate on one endpoint for testing

### Testing
- **Playwright** - End-to-end testing
- **Jest** - Unit and integration testing
- **Testing Library** - React component testing

## 📁 Project Structure

```
carehub/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Dashboard homepage
│   ├── providers.tsx           # React Query provider setup
│   ├── error.tsx               # Global error boundary
│   ├── loading.tsx             # Global loading state
│   ├── not-found.tsx           # 404 page
│   ├── patients/
│   │   ├── page.tsx            # Patient list with filtering
│   │   └── [id]/
│   │       └── page.tsx        # Patient detail page
│   ├── schedule/
│   │   └── page.tsx            # Appointment scheduler
│   └── api/
│       ├── patients/           # Patient CRUD endpoints
│       ├── appointments/       # Appointment management
│       ├── providers/          # Provider data
│       └── notifications/      # Notification system
├── src/
│   ├── components/
│   │   ├── Navigation.tsx      # Main navigation bar
│   │   ├── NotificationBell.tsx
│   │   ├── ErrorBoundary.tsx   # Error boundary components
│   │   └── LoadingStates.tsx   # Loading skeleton components
│   ├── hooks/
│   │   └── useApi.ts           # React Query hooks
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── types/
│   │   └── index.ts            # TypeScript types & Zod schemas
│   └── mocks/
│       └── data.ts             # Mock data generators
├── tests/
│   ├── e2e/
│   │   └── app.spec.ts         # Playwright E2E tests
│   └── api/
│       └── routes.test.ts      # API endpoint tests
├── playwright.config.ts        # Playwright configuration
└── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
```bash
cd /Users/yrt12378/Desktop/MEDFORALL/carehub
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Playwright tests
npm run test:ui      # Run tests with Playwright UI
npm run test:headed  # Run tests in headed mode
```

## 🧪 Testing

### End-to-End Tests
```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed
```

### Test Coverage
- ✅ Patient list display and filtering
- ✅ Patient search functionality
- ✅ Navigation to patient detail pages
- ✅ Tab switching on patient details
- ✅ Schedule display and provider filtering
- ✅ Appointment details panel
- ✅ Navigation between pages
- ✅ Notification dropdown

## 📊 API Endpoints

### Patients
```
GET    /api/patients              # List with filtering & pagination
GET    /api/patients/:id          # Get single patient
PUT    /api/patients/:id          # Update patient
GET    /api/patients/:id/appointments
GET    /api/patients/:id/vitals
GET    /api/patients/:id/notes
POST   /api/patients/:id/notes
```

### Appointments
```
GET    /api/appointments          # List with date/provider filters
POST   /api/appointments          # Create appointment
PUT    /api/appointments/:id      # Update appointment
DELETE /api/appointments/:id      # Delete appointment
```

### Providers
```
GET    /api/providers             # List all providers
GET    /api/providers/:id/schedule
```

### Notifications
```
GET    /api/notifications         # List all notifications
PUT    /api/notifications/:id/read
POST   /api/notifications         # Mark all as read
```

## 🎨 Design Patterns

### State Management
- **React Query** for server state with automatic caching and refetching
- **URL state** for filters and pagination (shareable URLs)
- **Local state** for UI interactions

### Error Handling
- **Global error boundary** for application-level errors
- **Section error boundaries** for isolated failures
- **API error handling** with retry logic
- **User-friendly error messages**

### Performance Optimization
- **Parallel data fetching** prevents waterfall requests
- **Debounced search** reduces unnecessary API calls
- **Memoization** for expensive computations
- **Loading skeletons** for perceived performance
- **Optimistic updates** for better UX

### Code Organization
- **Modular components** with single responsibility
- **Custom hooks** for reusable logic
- **Type-safe** with TypeScript and Zod
- **Consistent naming** conventions

## 🔧 Configuration

### Environment Variables
Currently using mock data, so no environment variables are required. For production:

```env
NEXT_PUBLIC_API_URL=your-api-url
DATABASE_URL=your-database-url
```

### Tailwind Configuration
Custom Tailwind CSS setup in `postcss.config.mjs` with Tailwind CSS 4.

## 📝 Mock Data

The application includes realistic mock data:
- **50 patients** with varied demographics and health statuses
- **100+ appointments** spread across 2 weeks
- **5 providers** with different specialties
- **Multiple vital signs** records per patient
- **Provider notes** with various types

Mock data includes:
- Simulated network latency (200-500ms)
- Occasional errors (5% rate on appointments endpoint)
- Realistic names, addresses, and medical data

## 🚢 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
The easiest deployment option:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/carehub)

## 🤝 Contributing

This is an assignment project. For production use, consider:
- Adding authentication (NextAuth.js)
- Implementing real database (PostgreSQL, MongoDB)
- Adding authorization/RBAC
- Implementing actual API integrations
- Adding comprehensive test coverage
- Setting up CI/CD pipeline

## 📄 License

This project is for educational purposes.

## 👥 Author

Built as Assignment 2: Full-Stack Healthcare Dashboard

---

**Note**: This application uses mock data and is intended for demonstration purposes only. Do not use with real patient data without proper security measures, HIPAA compliance, and authentication.
