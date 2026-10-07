# RequestFlow Frontend

این Frontend با React و TypeScript برای گردش‌کار تأیید درخواست پیاده‌سازی شده است. این برنامه برای کار با ASP.NET Core API موجود طراحی شده و مسئولیت‌های سمت Client را از قواعد کسب‌وکار Backend جدا نگه می‌دارد.

## راه‌اندازی Frontend

```bash
cd RequestFlow.Web
npm install
npm run dev -- --host 0.0.0.0
```

این برنامه با Vite اجرا می‌شود و معمولاً در نشانی http://localhost:5173 در دسترس است.

## متغیرهای Environment

برای تغییر API URL پیش‌فرض، یک فایل `.env` در پوشه Frontend ایجاد کنید:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

اگر این مقدار را تنظیم نکنید، برنامه از `http://localhost:5001/api` استفاده می‌کند.

## پیکربندی Routing در API

API فایل `.env` را از پوشه کاری یا پوشه `RequestFlow.Api` بارگذاری می‌کند. برای تعیین حداکثر مبلغ درخواستی که به Manager ارجاع داده می‌شود، مقدار `RequestRouting__ManagerThreshold` را در `RequestFlow.Api/.env` تنظیم کنید (برای مثال، `RequestRouting__ManagerThreshold=1000000`). این مقدار باید بزرگ‌تر از صفر باشد. الگوی Environment مربوط به API در `RequestFlow.Api/.env.example` قرار دارد.

## راه‌اندازی و اجرای Backend

Backend یک ASP.NET Core API است که .NET 10 را هدف می‌گیرد. برای ذخیره‌سازی از PostgreSQL، برای دسترسی به داده از Entity Framework Core، برای مدیریت کاربران و Roleها از ASP.NET Core Identity و برای Authentication از JWT bearer token استفاده می‌کند.

1. .NET 10 SDK و Docker به‌همراه Docker Compose را نصب کنید.
2. از ریشه Repository، PostgreSQL را اجرا کنید:

   ```bash
   docker compose up -d
   ```

3. فایل `RequestFlow.Api/.env` را بر اساس `RequestFlow.Api/.env.example` ایجاد کنید. مقدار `ConnectionStrings__DefaultConnection` را با Connection String مربوط به PostgreSQL و مطابق اطلاعات ورود در `docker-compose.yml` تنظیم کنید (برای دیتابیس محلی، نام کاربری `requestflow` و رمز عبور `requestflow_dev_password` است). مقدار `Jwt__Key` را با یک signing key طولانی و تصادفی جایگزین کنید. در صورت نیاز، `RequestRouting__ManagerThreshold` را تغییر دهید.
4. از ریشه Repository، API را اجرا کنید:

   ```bash
   dotnet run --project RequestFlow.Api --urls http://localhost:5001
   ```

   هنگام شروع، API، migrationهای اعمال‌نشده EF Core را اجرا می‌کند و Roleهای Employee، Manager و Finance را ایجاد می‌کند. سپس API در نشانی `http://localhost:5001` در دسترس خواهد بود که با API URL پیش‌فرض Frontend مطابقت دارد. برای متوقف‌کردن آن `Ctrl+C` را بزنید.

## معماری Backend و Design Patternها

ساختار Backend در `RequestFlow.Api` بر اساس مسئولیت‌ها سازمان‌دهی شده است:

- `Controllers` — Endpointهای ASP.NET Core API برای Authentication و گردش‌کار درخواست‌ها. Controllerها مسئولیت‌های HTTP را مدیریت می‌کنند و عملیات کسب‌وکار و دسترسی به داده را به Serviceها و abstractionهای مربوط واگذار می‌کنند.
- `Services` — منطق برنامه برای Routing درخواست‌ها، ایجاد JWT و ایجاد Roleها.
- `Repositories` — دسترسی عمومی به داده از طریق `IRepository<T>` و `Repository<T>`، به‌همراه `IUnitOfWork` و `UnitOfWork` برای هماهنگی دسترسی و ذخیره‌سازی از طریق یک EF Core `DbContext` مشترک.
- `Data` — `ApplicationDbContext` مربوط به EF Core، ذخیره‌سازی Identity و نگاشت Entityهای درخواست.
- `Models`، `Contracts` و `Options` — مدل‌های دامنه و Identity، DTOهای Request/Response مربوط به API و Configuration نوع‌دار.

الگوها و رویکردهای معماری اصلی عبارت‌اند از:

- **معماری لایه‌ای:** پردازش HTTP، Serviceهای برنامه، لایه ذخیره‌سازی و مدل‌های داده را از یکدیگر جدا می‌کند.
- **الگوهای Repository و Unit of Work:** دسترسی به داده از طریق EF Core را کپسوله می‌کنند و ذخیره تغییرات را با استفاده از یک Context مشترک انجام می‌دهند.
- **Dependency Injection:** ASP.NET Core، Serviceها و abstractionهای دسترسی به داده را ثبت می‌کند و آن‌ها را در اختیار Controllerها و مصرف‌کنندگان دیگر قرار می‌دهد.
- **الگوی Options:** مقدار `RequestRouting__ManagerThreshold` را به تنظیمات نوع‌دار Routing متصل می‌کند و بزرگ‌تر بودن آن از صفر را اعتبارسنجی می‌کند.
- **Authorization مبتنی بر Role:** Claimهای JWT و Attributeهای Authorization در ASP.NET Core دسترسی را کنترل می‌کنند؛ حتی اگر Frontend بعضی عملیات را پنهان کند، مرجع نهایی اعمال دسترسی همچنان API است.

## معماری

ساختار Frontend بر اساس قابلیت‌ها سازمان‌دهی شده است:

- `src/app` — router و providerها
- `src/features/auth` — جریان login/register و وضعیت auth
- `src/features/requests` — فهرست درخواست‌ها، فرم ایجاد و عملیات بررسی
- `src/lib` — HTTP client متمرکز، ذخیره‌سازی token و helperهای کاربردی
- `src/components/ui` — کامپوننت‌های shadcn/ui ساخته‌شده با Base UI و Tailwind CSS

## طراحی UI

Frontend از پالت تیره و سینمایی تعریف‌شده در `RequestFlow.Web/src/assets/DESIGN.md` استفاده می‌کند؛ این پالت شامل رنگ فیروزه‌ای برای عملیات اصلی، سطوح لایه‌ای slate، چیدمان فارسی RTL و فونت محلی Vazirmatn است. جدول‌ها، فیلدها، ورودی‌ها، دکمه‌ها، badgeها، کارت‌ها، هشدارها، placeholderهای بارگذاری و تأیید رد درخواست از کامپوننت‌های shadcn/ui استفاده می‌کنند.

## مدیریت State

برنامه از TanStack Query برای server state و از React state محلی برای UI state استفاده می‌کند. این جداسازی باعث می‌شود دریافت درخواست‌ها، invalidation و جریان‌های mutation یکپارچه بمانند، بدون آنکه داده‌های سرور به State سراسری و گسترده منتقل شوند. در نتیجه، برنامه ساده می‌ماند و در عین حال قابل پیش‌بینی و تست‌پذیر است.

## فرم Dynamic مبتنی بر JSON-schema

فرم درخواست بر اساس `RequestFlow.Web/public/config/request-form-schema.json` نمایش داده می‌شود. برچسب‌های نمایشی Role از `RequestFlow.Web/public/config/role-labels.json` بارگذاری می‌شوند. Frontend این assetهای ثابت را همراه با revalidation در browser cache دریافت می‌کند، ساختار آن‌ها را اعتبارسنجی می‌کند و اگر بارگذاری Configuration ممکن نباشد، خطایی قابل تلاش مجدد گزارش می‌دهد. برای به‌روزرسانی assetهای JSON نیازی به تغییر form renderer نیست.

## جریان Authentication

- Login، Backend را از طریق `/api/auth/login` فراخوانی می‌کند
- یک JWT از طریق abstraction مربوط به token-storage در localStorage ذخیره می‌شود
- HTTP client هدر `Authorization` را به‌صورت خودکار اضافه می‌کند
- Responseهای Unauthorized، وضعیت auth ذخیره‌شده را پاک می‌کنند و کاربر را به `/login` هدایت می‌کنند
- Routeهای محافظت‌شده، کاربران unauthenticated را به صفحه login هدایت می‌کنند

## رفتار UI مبتنی بر Role

بررسی Roleها در auth context و منطق صفحه درخواست متمرکز شده است. کاربران Manager و Finance فقط زمانی عملیات بررسی را می‌بینند که وضعیت درخواست pending باشد و Role کاربر با `AssignedRole` درخواست مطابقت داشته باشد. Backend همچنان مرجع نهایی برای اعمال Authorization است.

## فرض‌های Backend

این Frontend فرض می‌کند API، contract زیر را ارائه می‌دهد:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/requests`
- `POST /api/requests`
- `PUT /api/requests/{id}/review`

ساختار Responseهای API در لایه API مربوط به قابلیت‌ها جدا نگه داشته شده است تا سازگار کردن برنامه با تغییرات آتی در contract مربوط به Backend به‌سادگی و از یک محل انجام شود.

## ملاحظات و مصالحه‌ها

در این پیاده‌سازی، شفافیت و نگهداشت‌پذیری بر abstractionهای عمیق اولویت دارند. لایه‌های helper بر موارد واقعاً مفید متمرکزند: Routing، auth، پیکربندی HTTP و نمایش مبتنی بر schema. به این ترتیب، درک و بررسی codebase ساده‌تر می‌شود، بدون آنکه پیچیدگی غیرضروری به Framework اضافه شود.
