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

## API routing configuration

The API loads its `.env` file from the working directory or `RequestFlow.Api` folder. Set `RequestRouting__ManagerThreshold` in `RequestFlow.Api/.env` to configure the maximum request amount routed to a Manager (for example, `RequestRouting__ManagerThreshold=1000000`). The value must be greater than zero. The API environment template is in `RequestFlow.Api/.env.example`.

## Backend setup and running

The backend is an ASP.NET Core API targeting .NET 10. It uses PostgreSQL for persistence, Entity Framework Core for data access, ASP.NET Core Identity for user and role management, and JWT bearer tokens for authentication.

1. Install the .NET 10 SDK and Docker with Docker Compose.
2. Start PostgreSQL from the repository root:

   ```bash
   docker compose up -d
   ```

3. Create `RequestFlow.Api/.env` from `RequestFlow.Api/.env.example`. Set `ConnectionStrings__DefaultConnection` to a PostgreSQL connection string matching the credentials in `docker-compose.yml` (the local database uses `requestflow` / `requestflow_dev_password`). Set `Jwt__Key` to a long, randomly generated signing key. Adjust `RequestRouting__ManagerThreshold` if needed.
4. Start the API from the repository root:

   ```bash
   dotnet run --project RequestFlow.Api --urls http://localhost:5001
   ```

   On startup, the API applies pending EF Core migrations and seeds the Employee, Manager, and Finance roles. The API is then available at `http://localhost:5001`, matching the frontend's default API URL. Stop it with `Ctrl+C`.

## Backend architecture and design patterns

The backend is organized by responsibility within `RequestFlow.Api`:

- `Controllers` — ASP.NET Core API endpoints for authentication and request workflows. Controllers handle HTTP concerns and delegate business operations to services and data access abstractions.
- `Services` — application logic for request routing, JWT creation, and role seeding.
- `Repositories` — generic data access through `IRepository<T>` and `Repository<T>`, with `IUnitOfWork` and `UnitOfWork` coordinating access and persistence through a shared EF Core `DbContext`.
- `Data` — the EF Core `ApplicationDbContext`, Identity persistence, and request entity mapping.
- `Models`, `Contracts`, and `Options` — domain and Identity models, API request/response DTOs, and strongly typed configuration.

The main patterns and architectural practices are:

- **Layered architecture:** separates HTTP handling, application services, persistence, and data models.
- **Repository and Unit of Work patterns:** encapsulate EF Core data access and save changes through a shared context.
- **Dependency Injection:** ASP.NET Core registers services and data access abstractions and supplies them to controllers and other consumers.
- **Options pattern:** binds `RequestRouting__ManagerThreshold` to typed routing options and validates that it is greater than zero.
- **Role-based Authorization:** JWT claims and ASP.NET Core authorization attributes enforce access rules; the API remains authoritative even when the frontend hides unavailable actions.

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
