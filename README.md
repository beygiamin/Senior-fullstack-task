# RequestFlow

This project implements a simplified request approval workflow with ASP.NET Core backend and React frontend.

## Stack

- Backend: ASP.NET Core Web API, ASP.NET Core Identity, EF Core, PostgreSQL, JWT
- Frontend: React + Vite
- Architecture pattern: Repository + Unit of Work

## Key decisions

- Request routing threshold is configured in [RequestFlow.Api/appsettings.json](RequestFlow.Api/appsettings.json) under `RequestRouting:ManagerThreshold`.
- Authorization is enforced on both server and client sides.
- The request list is filtered server-side to only show:
  - requests created by the current user, or
  - requests assigned to the current user's role.
- State management on the frontend uses `useState` and `useEffect` because the app is small and the data flow is straightforward, with minimal complexity and easy debugging.

## How to run

### 1) Prepare PostgreSQL and environment variables

Create a PostgreSQL database named `requestflow`. Then copy the API environment template to a local `.env` file:

```powershell
Copy-Item RequestFlow.Api\.env.example RequestFlow.Api\.env
```

Edit `RequestFlow.Api/.env` and replace the placeholders with your PostgreSQL password and a long, random JWT signing key:

```dotenv
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=requestflow;Username=postgres;Password=your-postgres-password
Jwt__Key=replace-with-a-long-random-signing-key
```

The double underscores (`__`) map to nested ASP.NET Core configuration keys. The `.env` file is ignored by Git; keep your actual credentials in it and do not commit them. `.env.example` is only a template.

### 2) Run backend

```bash
dotnet restore
cd RequestFlow.Api
dotnet ef database update
dotnet run
```

The API will start on:

- https://localhost:7212
- http://localhost:5001

### 3) Run frontend

```bash
cd RequestFlow.Web
npm install
npm run dev -- --host 0.0.0.0
```

The app is served by Vite and can usually be opened at:

- http://localhost:5173

## API features implemented

- User registration and login with JWT
- Employee-only request creation
- Automatic request routing based on `Amount` and the configured threshold
- Server-side request visibility filtering
- Review endpoint for `Manager` or `Finance` users only
- EF Core migrations
- Unit tests for approval routing logic

## Technical notes

- The frontend uses a dynamic schema-based form renderer: fields are rendered from data in the component instead of hard-coded form fields.
- The app includes basic loading and error feedback.
- This is a compact implementation and does not include advanced production concerns such as email notifications, background job processing, or full audit trail features.

## Conceptual answers

### Backend

1. Scoped, Transient, and Singleton differ in lifetime: Scoped is one instance per request, Transient is one instance per resolution, and Singleton is one instance for the entire application. Scoped is usually best for Entity Framework DbContext and per-request services, Transient for lightweight stateless services, and Singleton for shared cached or read-only services.
2. Repository Pattern hides persistence details and centralizes data access logic, making it easier to swap storage and easier to test business logic. It becomes over-engineering when the project is very small and the data access layer is trivial, because it adds abstraction without adding real value.
3. For a long multi-step human approval workflow, I would use an orchestration layer with a persisted workflow state, an approval status table, and background job processing plus notifications. This keeps the process auditable and resumable even if a reviewer is unavailable.
4. Access tokens are short-lived credentials used to access protected APIs, while refresh tokens are long-lived credentials used to obtain a new access token without re-login. Both are needed so the application can keep sessions secure without forcing users to log in repeatedly.

### Frontend

1. Controlled components keep their value in React state and update on every change; uncontrolled components use a DOM ref and let the browser manage the value. Controlled components are preferred for validation and predictable state management.
2. An empty dependency array means run once on mount; no dependency array means run after every render; a specific dependency array means run when referenced values change. The correct pattern depends on whether the effect should tie itself to mount lifecycle, render lifecycle, or specific state changes.
3. For a form with many dynamic fields, I would memoize expensive derived data, avoid creating new objects inline when not necessary, use keyed lists, and keep field updates localized to only the changed input. This minimizes unnecessary re-renders while preserving clean state updates.

## Important note

The backend expects a PostgreSQL instance to be available locally. If PostgreSQL is not running, `dotnet ef database update` and the API startup will fail until the database is up and the connection string in `RequestFlow.Api/.env` matches your environment.
