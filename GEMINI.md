# Project Overview: Web App Console (Safure)

This is a modern Angular monorepo (v20.3.0) consisting of multiple applications and a central shared library. The project is designed to be cross-platform (Web + Mobile via Capacitor) and uses the latest Angular features and architectural patterns.

## Architecture & Tech Stack

- **Framework:** Angular 20.3.0 (Zoneless, Standalone, Signals, Modern Control Flow).
- **Workspace:** Angular Monorepo.
  - `projects/frontend`: Customer-facing web application (SSR enabled).
  - `projects/console-panel`: Admin/Internal management panel (SSR enabled).
  - `projects/shared-lib`: Core library containing services, models, and shared UI components.
  - `projects/custom-editor`: Specialized library for CKEditor/Quill integrations.
- **Mobile:** Capacitor 7.x (Android & iOS).
- **State Management:** Angular Signals and dedicated `SignalService`.
- **Change Detection:** `OnPush` strategy by default; **Zoneless** change detection is enabled.
- **Styling:** SCSS, Bootstrap 5, Angular Material.
- **SSR & Hydration:** `@angular/ssr` with modern hydration features (`withEventReplay()`).

## Key Project Conventions & "The New Angular Way"

### 1. Visual Builder (Elementor-like Editor)
A custom block-based visual editor has been implemented for rich content management in the `console-panel`.

- **Location:** `projects/console-panel/src/app/modules/products/add-product/elementor-editor/`
- **Block Types:** `text`, `image`, `video`, `button`, `spacer`, `divider`, and `row` (for multi-column layouts).
- **Architecture:** 
  - Uses `@angular/cdk/drag-drop` for block reordering and layout management.
  - Implements `ControlValueAccessor` for seamless integration with Angular Reactive Forms.
- **Data Serialization:**
  - Content is saved as standard HTML for maximum compatibility.
  - Re-editability is preserved by embedding a base64-encoded JSON metadata string within a comment (`<!-- ELEMENTOR_BLOCKS:... -->`) or a `data-elementor-blocks` attribute in the wrapper `div.elementor-content-wrapper`.
- **Frontend Rendering:**
  - The `frontend` application renders this content using `DomSanitizer.bypassSecurityTrustHtml()`.
  - Shared styles for these blocks are located in `projects/shared-lib/src/lib/scss/_elementor-blocks.scss`.

### 2. Standalone Components
All components are **standalone**. Avoid creating `NgModules`.
```typescript
@Component({
  selector: 'app-example',
  standalone: true, // Optional in latest versions as it's default
  imports: [CommonModule, OtherComponent],
  templateUrl: './example.html',
  styleUrl: './example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Example { ... }
```

### 2. Functional Injection & Initialization
Prefer `inject()` over constructor injection. Use functional initializers for app setup.
```typescript
export class App {
  private readonly dataService = inject(DataService);
  protected readonly user = inject(SignalService).user;
}
```

### 3. Signals
Use **Signals** for reactive state.
- Use `signal()` for writable state.
- Use `computed()` for derived state.
- Use `effect()` for side effects (sparingly).

### 4. Modern Control Flow
Always use `@if`, `@for`, and `@switch` in templates. Avoid `*ngIf`, `*ngFor`.
```html
@if (user()) {
  <span>Welcome, {{ user().name }}</span>
} @else {
  <button (click)="login()">Login</button>
}
```

### 5. Component Naming
Follow the project's "Clean Naming" convention:
- Class name: `App`, `Header`, `Footer`, `Login` (instead of `AppComponent`, `HeaderComponent`).
- Files: `app.ts`, `header.ts` (usually).

### 6. SSR & Platform Awareness
Since SSR is enabled, always check the platform before accessing browser-only globals (like `window`, `localStorage`, `document`).
```typescript
private platformId = inject(PLATFORM_ID);
isBrowser = isPlatformBrowser(this.platformId);

if (this.isBrowser) {
  localStorage.getItem('token');
}
```

### 7. Shared Library Pattern
Most business logic and shared UI should live in `projects/shared-lib`.
- Services: `DataService` (APIs), `SignalService` (Global State), `GlobalCommonService`.
- Components: Shared UI components like `Header`, `Footer`, `Auth` modals.

## Development Workflow

- **Serve Frontend:** `ng serve frontend`
- **Serve Console:** `ng serve console-panel`
- **Build All:** `npm run build`
- **Mobile Sync:** `npx cap sync`

## Core Services Analysis

### DataService (`projects/shared-lib/src/lib/services/data-service.ts`)

The `DataService` is the central hub for all HTTP communications. it handles authentication, guest session tracking, and global settings initialization.

#### Key Functions:

- **`request(method, endpoint, postdata?, options?)`**: The internal engine for all HTTP calls.
  - Automatically attaches `Authorization: Bearer <token>` if a user is logged in.
  - Handles **Guest Tokens** by appending them as query parameters or headers for unauthenticated sessions.
  - Supports `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, and a specialized `POST_COMMON` method.
  - **Platform Aware**: Uses `isPlatformBrowser` to safely access `localStorage`.

- **`get(endpoint, from?)`**: Standard GET request wrapper.
- **`post(data, endpoint)`**: Standard POST request wrapper.
- **`postForm(endpoint, data: FormData)`**: Used for multi-part form data submissions (e.g., file uploads).
- **`put(data, endpoint)` / `patch(endpoint, data)`**: Update request wrappers.
- **`delete(endpoint)`**: Deletion request wrapper.
- **`getById(endpoint, id)`**: Convenience method for `GET /endpoint/id`.
- **`update(endpoint, data, id)`**: Convenience method for `POST /endpoint/id`.
- **`postCommonApi(data, endpoint)`**: Specifically for hitting the `https://api.demohandler.in/api/v1/` endpoint.

- **`loadGeneralSettings(endpoint)`**: 
  - Returns a `Promise<void>`.
  - Used in `app.config.ts` via `provideAppInitializer` to ensure settings are loaded before the app starts.
  - Populates SEO meta tags (keywords, description, title) globally.
  - Stores settings in `generalSetting` property.

- **`getSpecificGeneralSettings(key, defaultValue?)`**: Safely retrieves a specific setting value (e.g., site title, logos) from the pre-loaded global configuration.
- **`getAllGeneralSettings()`**: Returns the entire settings object.

## Key Files to Reference
- `angular.json`: Workspace configuration.
- `projects/frontend/src/app/app.config.ts`: Main application configuration (Providers, SSR).
- `projects/shared-lib/src/public-api.ts`: Shared library exports.
- `projects/shared-lib/src/lib/services/data-service.ts`: Core API handler.
- `projects/shared-lib/src/lib/services/signal-service.ts`: Global state management.
