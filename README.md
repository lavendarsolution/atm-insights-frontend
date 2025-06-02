# 🏪 ATM Insights Frontend

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-green.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-blue.svg)](https://tailwindcss.com/)
[![Shadcn/ui](https://img.shields.io/badge/Shadcn%2Fui-Latest-black.svg)](https://ui.shadcn.com/)

**Modern React Dashboard for Real-time ATM Monitoring & Analytics**

A responsive, real-time web dashboard for monitoring and managing ATM networks. Built with React 18, TypeScript, and modern UI components for superior user experience.

## 🎯 Key Features

- 🔄 **Real-time Updates**: WebSocket-powered live data updates
- 📊 **Interactive Dashboard**: Comprehensive ATM network overview
- 📈 **Advanced Analytics**: Rich charts and visualizations with Recharts
- 🏧 **ATM Management**: Complete CRUD operations for ATM registry
- 🚨 **Live Alerts**: Real-time alert system with notifications
- 📱 **Responsive Design**: Mobile-first approach with modern UI
- 🌙 **Dark Mode**: Built-in theme switching
- ⚡ **High Performance**: Optimized with React Query and efficient state management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- ATM Insights Backend running (see backend README)

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd atm-insights-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

Create a `.env.local` file in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000

# Development settings
VITE_ENV=development
VITE_DEBUG=true
```

### Access the Application

- 🌐 **Frontend Dashboard**: http://localhost:8080
- 📱 **Mobile View**: Responsive design works on all devices
- 🔗 **Backend API**: http://localhost:8000 (ensure backend is running)

## 🛠️ Technology Stack

### Core Framework

- **React 18** - Modern React with Hooks and Concurrent Features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server

### UI & Styling

- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful & consistent icon library

### State Management & Data

- **TanStack Query (React Query)** - Powerful data synchronization
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Axios** - Promise-based HTTP client

### Charts & Visualization

- **Recharts** - Composable charting library for React
- **Date-fns** - Modern JavaScript date utility library

### Real-time Features

- **WebSocket API** - Live data updates
- **Custom React Hooks** - Real-time state management
- **React Context** - Global state for real-time data

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui base components
│   ├── layouts/         # Layout components (sidebar, header)
│   ├── modals/          # Modal dialogs
│   ├── table/           # Data table components
│   └── common/          # Shared components
├── features/            # Feature-based modules
│   ├── auth/            # Authentication feature
│   └── atms/            # ATM management feature
├── pages/               # Page components
│   ├── auth/            # Login, auth pages
│   ├── atms/            # ATM list, detail pages
│   ├── PageDashboard.tsx
│   ├── PageAnalytics.tsx
│   └── Alerts.tsx
├── providers/           # React Context providers
│   ├── AppProvider.tsx
│   ├── RealtimeDashboardProvider.tsx
│   ├── RealtimeATMProvider.tsx
│   └── RealtimeATMsProvider.tsx
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
├── apis/                # API layer
└── styles/              # Global styles and themes
```

## 🔄 Real-time Features

### WebSocket Integration

The application features comprehensive real-time updates powered by WebSocket connections:

```typescript
// Real-time dashboard provider
<RealtimeDashboardProvider>
  <Dashboard />
</RealtimeDashboardProvider>

// Real-time ATM status updates
<RealtimeATMsProvider>
  <ATMsList />
</RealtimeATMsProvider>

// Individual ATM live telemetry
<RealtimeATMProvider atmId={atmId}>
  <ATMDetail />
</RealtimeATMProvider>
```

### Live Data Updates

- **Dashboard Statistics**: Auto-refreshing every 15 seconds
- **ATM Status**: Real-time status changes with visual indicators
- **Telemetry Data**: Live sensor data (temperature, cash levels, etc.)
- **Alert System**: Instant notifications for critical events
- **Connection Status**: Visual indicators for WebSocket connectivity

## 📊 Dashboard Features

### Main Dashboard

- **Network Overview**: Total ATMs, online/offline status, critical alerts
- **Real-time Statistics**: Transaction counts, average cash levels, operational rates
- **Recent Alerts**: Latest 5 alerts with severity indicators
- **Live Status Updates**: WebSocket-powered real-time data refresh

### ATM Management

- **ATM Registry**: Complete list with search, filter, and pagination
- **CRUD Operations**: Add, edit, delete ATMs with validation
- **Real-time Status**: Live status updates with visual indicators
- **Detailed View**: Individual ATM telemetry and performance metrics

### Analytics & Charts

- **Status Distribution**: Pie charts showing ATM status breakdown
- **Cash Level Analysis**: Distribution charts for cash levels
- **Location Analytics**: Regional ATM performance
- **Trend Analysis**: Time-series charts for various metrics

### ATM Detail View

- **Live Telemetry**: Real-time sensor data display
- **Performance Charts**: Interactive time-series visualizations
- **Health Monitoring**: System health score and indicators
- **Maintenance History**: Service records and schedules

## 🎨 UI Components & Design

### Component Library

Built on **Shadcn/ui** with custom enhancements:

- **Data Tables**: Sortable, filterable, paginated tables
- **Forms**: Validated forms with React Hook Form + Zod
- **Charts**: Interactive charts with Recharts
- **Modals**: Accessible modal dialogs
- **Navigation**: Responsive sidebar with collapsible menu

### Design System

- **Typography**: Consistent font hierarchy
- **Colors**: Professional color palette with dark mode
- **Spacing**: Systematic spacing scale
- **Animations**: Subtle micro-interactions
- **Icons**: Lucide React icon library

### Responsive Design

- **Mobile-first**: Optimized for all screen sizes
- **Touch-friendly**: Large tap targets for mobile
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: WCAG 2.1 compliant components

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build with development settings
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Code Quality
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

### Development Server

- **Hot Reload**: Instant updates on file changes
- **TypeScript**: Real-time type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Automatic code formatting

### Build & Deployment

```bash
# Production build
npm run build

# Preview production build locally
npm run preview

# Deploy (example with Vercel)
npm install -g vercel
vercel --prod
```

### Environment Variables

| Variable            | Description     | Default                 | Production      |
| ------------------- | --------------- | ----------------------- | --------------- |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` | Your API domain |
| `VITE_WS_BASE_URL`  | WebSocket URL   | `ws://localhost:8000`   | Your WS domain  |
| `VITE_ENV`          | Environment     | `development`           | `production`    |
| `VITE_DEBUG`        | Debug mode      | `true`                  | `false`         |

## 🔌 API Integration

### HTTP Client Configuration

```typescript
// lib/HttpClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### API Endpoints Used

- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/atms` - ATM list with filtering
- `GET /api/v1/atms/{id}` - Individual ATM details
- `POST /api/v1/atms` - Create new ATM
- `PUT /api/v1/atms/{id}` - Update ATM
- `DELETE /api/v1/atms/{id}` - Delete ATM
- `GET /api/v1/atms/{id}/telemetry` - ATM telemetry data
- `WebSocket /ws/dashboard` - Real-time dashboard updates
- `WebSocket /ws/atms` - Real-time ATM status updates
- `WebSocket /ws/atms/{id}` - Individual ATM telemetry

### Data Fetching Strategy

- **React Query**: Caching, background updates, optimistic updates
- **WebSocket**: Real-time data overlay on cached data
- **Error Handling**: Comprehensive error boundaries and retry logic
- **Loading States**: Skeleton loaders and progressive enhancement

## 🚨 Alert System

### Real-time Notifications

- **Toast Notifications**: Non-intrusive success/error messages
- **Alert Dashboard**: Centralized alert management
- **Severity Levels**: Critical, High, Medium, Low with color coding
- **Auto-dismiss**: Configurable auto-dismiss timers
- **Sound Notifications**: Optional audio alerts for critical issues

### Alert Types

- **System Errors**: ATM malfunctions and technical issues
- **Cash Levels**: Low cash warnings and refill alerts
- **Temperature**: Overheating warnings
- **Network**: Connectivity issues
- **Maintenance**: Scheduled maintenance reminders

## 🔒 Security & Performance

### Security Features

- **Input Validation**: Client-side validation with Zod schemas
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Token-based CSRF prevention
- **Secure Headers**: Security headers for production deployment

### Performance Optimization

- **Code Splitting**: Route-based lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Image Optimization**: Optimized image loading
- **Caching**: Aggressive caching with React Query
- **Tree Shaking**: Unused code elimination

### Monitoring & Analytics

- **Error Tracking**: Built-in error boundary system
- **Performance Metrics**: Web Vitals monitoring
- **User Analytics**: Usage tracking and heatmaps
- **Real-time Monitoring**: Connection status and health checks

## 🧪 Testing Strategy

### Testing Framework

```bash
# Add testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D vitest jsdom

# Run tests
npm run test
npm run test:coverage
```

### Testing Approach

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Feature-level testing
- **E2E Tests**: Full user journey testing
- **Accessibility Tests**: WCAG compliance testing

## 🔄 State Management

### Global State

- **App Context**: User preferences, theme, global settings
- **Real-time Providers**: WebSocket state management
- **React Query**: Server state synchronization
- **Local Storage**: Persistent user preferences

### Real-time State Patterns

```typescript
// Real-time provider pattern
const useRealtimeATM = (atmId: string) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/atms/${atmId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setState((prev) => ({ ...prev, ...data }));
    };
    return () => ws.close();
  }, [atmId]);

  return { state, actions };
};
```

## 📱 Mobile Experience

### Responsive Features

- **Touch Navigation**: Swipe gestures and touch-friendly controls
- **Mobile Menu**: Collapsible sidebar navigation
- **Optimized Charts**: Touch-interactive charts
- **Fast Loading**: Optimized for mobile networks
- **Offline Support**: Progressive Web App features

### PWA Features

- **Service Worker**: Offline functionality
- **App Manifest**: Install as native app
- **Push Notifications**: Background alert notifications
- **App Icons**: Platform-specific icons

## 🌐 Browser Support

### Supported Browsers

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 10+

### Polyfills & Fallbacks

- **ES6+ Features**: Babel transpilation
- **CSS Grid**: Flexbox fallbacks
- **WebSocket**: Polling fallback for older browsers

## 🤝 Contributing

### Development Setup

```bash
# Clone and install
git clone <repository-url>
cd atm-insights-frontend
npm install

# Create feature branch
git checkout -b feature/amazing-feature

# Start development
npm run dev
```

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with React rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Pull Request Process

1. **Feature Branch**: Create from `main` branch
2. **Code Quality**: Pass all linting and type checks
3. **Testing**: Add tests for new features
4. **Documentation**: Update relevant documentation
5. **Review**: Request review from maintainers

## 🐛 Troubleshooting

### Common Issues

#### WebSocket Connection Failed

```bash
# Check backend WebSocket server
curl -I http://localhost:8000/ws/dashboard

# Verify environment variables
echo $VITE_WS_BASE_URL

# Fallback to polling mode
VITE_DISABLE_WEBSOCKET=true npm run dev
```

#### Build Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### Performance Issues

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Enable development profiling
npm run dev --mode=profiling
```

#### API Connection Issues

```bash
# Test API connectivity
curl http://localhost:8000/health

# Check CORS configuration
# Verify VITE_API_BASE_URL in .env.local
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
VITE_DEBUG=true npm run dev
```

### Network Debugging

```bash
# Monitor WebSocket connections
# Open browser DevTools > Network > WS tab

# Test API endpoints
# Use browser DevTools > Network > XHR tab
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React ecosystem
- **Shadcn** - For the beautiful UI component system
- **TanStack** - For React Query and Table libraries
- **Recharts** - For excellent charting capabilities
- **Radix UI** - For accessible UI primitives
- **Tailwind CSS** - For the utility-first CSS framework

---

## 🎯 Getting Started Now

**Ready to monitor your ATM network?**

```bash
git clone <repository-url>
cd atm-insights-frontend
npm install && npm run dev
```

**🌐 Access Points:**

- Dashboard: http://localhost:8080
- Login: http://localhost:8080/login
- ATM Management: http://localhost:8080/atms
- Analytics: http://localhost:8080/analytics

**Need help?** Check the [Troubleshooting](#-troubleshooting) section or open an issue!

---

**⭐ Star this repository if you found it helpful!**
