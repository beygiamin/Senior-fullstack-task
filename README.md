# RequestFlow Frontend

This frontend is a React + TypeScript implementation for the request approval workflow. It is designed to work with the existing ASP.NET Core API and keep the client-side responsibilities separated from the backend business rules.

## Frontend setup

```bash
cd RequestFlow.Web
npm install
npm run dev -- --host 0.0.0.0
```

The app is served by Vite and is typically available at http://localhost:5173.

## Environment variables

Create a `.env` file in the frontend folder if you want to override the default API URL:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

If not provided, the app falls back to `http://localhost:5001/api`.

## Architecture

The frontend follows a feature-oriented structure:

- `src/app` — router and providers
- `src/features/auth` — login/register flow and auth state
- `src/features/requests` — request list, create form, review actions
- `src/lib` — centralized HTTP client, token storage, utility helpers
- `src/components/ui` — shadcn/ui components built on Base UI and Tailwind CSS

## UI design

The frontend uses the dark cinematic palette defined in `RequestFlow.Web/src/assets/DESIGN.md`, with cyan primary actions, layered slate surfaces, Persian RTL layout, and the locally supplied Vazirmatn font. Tables, fields, inputs, buttons, badges, cards, alerts, loading placeholders, and rejection confirmation use shadcn/ui components.

## State management

The app uses TanStack Query for server state and local React state for UI state. This separation keeps request fetching, invalidation, and mutation flows consistent without pushing server data into broad global state. The app stays simple while still being predictable and testable.

## Dynamic JSON-schema form

The request form is rendered from `RequestFlow.Web/public/config/request-form-schema.json`. Role display labels are loaded from `RequestFlow.Web/public/config/role-labels.json`. The frontend fetches these static assets with browser cache revalidation, validates their shape, and reports a retryable error if configuration cannot be loaded. Updating the JSON assets does not require changing the form renderer.

## Authentication flow

- Login calls the backend `/api/auth/login`
- A JWT is stored in localStorage through the token-storage abstraction
- The HTTP client attaches the `Authorization` header automatically
- Unauthorized responses clear the stored auth state and redirect to `/login`
- Protected routes redirect unauthenticated users to the login page

## Role-based UI behavior

Role checks are centralized in the auth context and request page logic. Manager and Finance users see review actions only when the request is pending and the user matches the `AssignedRole` on the request. The backend remains the source of truth for authorization enforcement.

## Backend assumptions

This frontend assumes the API exposes the following contract:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/requests`
- `POST /api/requests`
- `PUT /api/requests/{id}/review`

The API response shapes are isolated in the feature API layer to make future backend contract changes easy to adapt in one place.

## Trade-offs

The implementation prioritizes clarity and maintainability over deep abstraction. It keeps helper layers focused on actual value: routing, auth, HTTP configuration, and schema-based rendering. This keeps the codebase easier to reason about without adding unnecessary framework complexity.
