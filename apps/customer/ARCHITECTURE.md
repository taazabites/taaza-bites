# Taaza Bites Engineering Blueprint

## 1. Architecture Overview
The platform follows a **Modular Full-Stack Architecture** using React (Vite) for the frontend and Express for the backend (API Proxy & SSR), with Firebase providing the data and auth layer.

## 2. Folder Structure
```text
/src
  /api              # Server-side API handlers (Express)
  /assets           # Static assets (images, fonts)
  /components       # Reusable UI components
    /ui             # Primitives (buttons, inputs) - shadcn/ui
    /layout         # Shell components (Header, Footer, Sidebar)
    /shared         # Domain-agnostic shared components
    /features       # Domain-specific components (e.g., /features/health-assessment)
  /context          # React Context providers (Auth, Theme, Cart)
  /firebase         # Firebase config, services, and hooks
  /hooks            # Custom React hooks (logic reuse)
  /lib              # Third-party library initializations (Razorpay, GenAI)
  /pages            # View components (Routing targets)
  /services         # Pure business logic & API abstraction
  /types            # TypeScript interfaces & Enums
  /utils            # Helper functions (formatting, validation)
```

## 3. Component Standards (Atomic Design-ish)
- **Atoms**: Primitive components in `/components/ui`.
- **Molecules**: Combinations of atoms in `/components/shared`.
- **Features**: Complex organisms in `/components/features`.
- **Pages**: Layout wrappers in `/pages`.

## 4. State Management Strategy
- **Auth/User**: `AuthContext` (global).
- **UI State**: Local `useState` or `useReducer`.
- **Server Data**: `onSnapshot` for real-time (subscriptions/wallet) and `getDocs` for static data.
- **Complex UI**: `@tanstack/react-query` for caching and optimistic updates.

## 5. Firestore Data Access Pattern
- **Services**: All Firestore logic resides in `src/firebase/services.ts`.
- **Hooks**: Reactive data access via `src/firebase/hooks.ts`.
- **Sanitization**: All writes must pass through Zod schemas for validation.

## 6. Authentication Strategy
- **Provider**: Firebase Authentication.
- **Methods**: Phone OTP (Primary for India), Google Login (Secondary).
- **Security**: Protected routes via `ProtectedRoute.tsx` and custom `useAuth` hook.

## 7. Error Handling & Logging
- **Frontend**: Global Error Boundary for UI crashes.
- **API**: Standardized JSON error responses.
- **Logging**: Console logging in dev; telemetry to Firestore/Sentry in prod (currently limited due to quota).

## 8. Form Validation
- **Library**: `react-hook-form`.
- **Schema**: `zod`.
- **Consistency**: Centralized schemas in `src/types.ts` or feature-specific folders.

## 9. Performance Budget
- **Lighthouse**: Target 90+ across all metrics.
- **Hydration**: Minimal JS on landing pages.
- **Assets**: WebP images, lazy loading for off-screen components.

## 10. Coding Standards
- **Naming**: PascalCase for components, camelCase for variables/functions.
- **Typing**: Strict TypeScript. No `any` unless absolutely necessary.
- **Consistency**: Functional components + Hooks only.
