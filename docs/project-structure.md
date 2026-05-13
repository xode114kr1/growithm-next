# Project Structure Guide

This guide defines where new code should live in this project.

한국어 설명: 이 문서는 새 코드를 생성하거나 기존 코드를 리팩토링할 때 어떤 디렉터리에 어떤 책임을 배치할지 정의한다.

## Architecture

Use a feature-first structure with thin Next.js route files.

- `src/app`: Next.js routing boundary only.
- `src/features`: domain feature code.
- `src/components`: domain-agnostic shared UI.
- `src/lib`: application infrastructure and low-level shared utilities.
- `src/types`: global type declarations.
- `src/generated`: generated code. Do not edit manually.

## Directory Layout

```text
src/
  app/
    (app)/
      (home)/
      dashboard/
      friend/
      problem/
      study/
      webhook-guide/
    api/
      auth/
      github/
  components/
    common/
    layout/
    ui/
  features/
    auth/
    dashboard/
    friend/
    github/
    home/
    problem/
    study/
  lib/
    env/
    hooks/
    utils/
    prisma.ts
  generated/
    prisma/
  types/
```

## `src/app`

Keep `src/app` focused on Next.js file conventions and route composition.

Allowed files:

- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- `route.ts`
- Route-local `_components`
- Route-local `_lib` only for small code that is not useful outside that route

Route files should:

- Read route params and search params.
- Call feature server functions, actions, or query functions.
- Compose page-level UI.
- Handle route-only concerns such as `notFound`, `redirect`, and metadata.

Route files should not:

- Contain large Prisma queries.
- Contain reusable business rules.
- Contain external API client logic.
- Contain parsing, normalization, or formatting logic shared across pages.
- Become the long-term owner of feature-specific components.

## `src/features`

Use `src/features` for domain-owned code. A feature is a product area or business capability such as `problem`, `study`, `github`, `auth`, `dashboard`, `home`, or `friend`.

Recommended feature layout:

```text
src/features/[feature]/
  actions/
  components/
  hooks/
  server/
  validation/
  types.ts
  utils.ts
```

Use these folders as follows:

- `actions`: server actions used by forms or client interactions.
- `components`: UI components specific to the feature.
- `hooks`: client-only React hooks owned by the feature.
- `server`: server-only queries, mutations, external API integrations, and domain services.
- `validation`: feature-owned validation and parsing functions.
- `types.ts`: feature-owned public types.
- `utils.ts`: small pure helpers owned by the feature.

Create deeper folders only when a feature has a real subdomain.

Example:

```text
src/features/github/
  server/
    webhooks/
      delivery-repository.ts
      github-webhook-client.ts
      payload-parser.ts
      receiver.ts
      signature.ts
  types.ts
```

## Code Splitting

Split code by responsibility first, then by feature.

Use this decision order:

1. Is it required by Next.js routing? Put it in `src/app`.
2. Is it owned by a product feature? Put it in `src/features/[feature]`.
3. Is it reusable UI without domain ownership? Put it in `src/components`.
4. Is it infrastructure or a generic low-level utility? Put it in `src/lib`.
5. Is it a global type declaration? Put it in `src/types`.

Keep files small enough that their responsibility is obvious.

Split a file when:

- It mixes UI rendering with data access.
- It mixes validation with database mutation.
- It mixes external API calls with request/response handling.
- It contains multiple unrelated exported functions.
- It is difficult to name precisely without using vague words like `helpers`, `common`, or `service`.
- It is repeatedly imported by files outside its current route folder.

Do not split code only to make many tiny files. A private helper can stay in the same file when it is short, has one caller, and exists only to support that file.

Preferred route composition:

```text
src/app/(app)/study/[studyId]/members/page.tsx
  -> src/features/study/server/study-members-data.ts
  -> src/features/study/components/study-member-list.tsx
  -> src/features/study/types.ts
```

Preferred API route composition:

```text
src/app/api/github/webhook-receiver/route.ts
  -> src/features/github/server/webhooks/receiver.ts
  -> src/features/github/server/webhooks/signature.ts
  -> src/features/github/server/webhooks/payload-parser.ts
  -> src/features/github/server/webhooks/delivery-repository.ts
```

## `src/components`

Use `src/components` only for shared UI that is not owned by one feature.

Recommended layout:

```text
src/components/
  common/
  layout/
  ui/
```

Use these folders as follows:

- `layout`: app shell, header, navigation, account menu.
- `ui`: primitive reusable UI controls such as dropdowns, buttons, inputs, modals, tabs, and tables.
- `common`: shared composed components that are reused across multiple features but are not primitives.

Do not put feature-specific components here. For example, `ProblemTable` belongs in `src/features/problem/components`, not `src/components`.

## `src/lib`

Use `src/lib` for infrastructure and low-level shared utilities.

Good examples:

- Prisma client setup.
- Environment variable parsing.
- Domain-agnostic React hooks.
- Generic date, string, or URL utilities.
- Shared low-level wrappers with no product domain ownership.

Avoid putting domain features in `src/lib`.

Move code to `src/features` when the file name or behavior clearly belongs to a domain such as GitHub webhooks, problem README parsing, study membership, or problem sharing.

## `src/generated`

`src/generated` contains generated code.

Rules:

- Do not edit generated files manually.
- Import Prisma generated types from `@/generated/prisma/...`.
- Change Prisma models in `prisma/`, then regenerate the client.

## `prisma`

Use `prisma/` for database schema, model splits, and migrations.

Recommended layout:

```text
prisma/
  schema.prisma
  models/
  migrations/
```

Rules:

- Keep database model definitions in Prisma files.
- Keep application behavior in `src/features`, not in Prisma schema files.
- Run Prisma validation after schema changes.

## Import Rules

Use the `@/*` path alias for imports from `src`.

Preferred:

```ts
import { prisma } from "@/lib/prisma";
import { getProblemListPageData } from "@/features/problem/server/problem-list-data";
```

Avoid fragile relative imports across feature boundaries.

Feature code may import:

- `@/lib/*`
- `@/components/ui/*`
- `@/components/common/*`
- `@/generated/*`
- Its own feature folder

Feature code should not import another feature unless the dependency is intentional and stable. If two features need the same code, move that code to `src/lib`, `src/components`, or a clearly named shared module.

## Server And Client Boundaries

Default to server components and server-side data loading.

Use client components only when the component needs:

- React state.
- Browser events.
- Form interactivity beyond plain server actions.
- Browser-only APIs.
- Effects.

Server-only code belongs in `server/` or route handlers and must not be imported by client components.

Client components should receive serializable props from server components.

## Hooks

Place React hooks based on ownership.

Use feature hooks for domain-specific client behavior:

```text
src/features/study/hooks/use-study-member-filter.ts
src/features/problem/hooks/use-problem-table-state.ts
```

Use shared hooks only when the hook is truly domain-agnostic:

```text
src/lib/hooks/use-debounced-value.ts
```

Hook rules:

- Hooks must be client-only.
- Files that export hooks must use `"use client"` when they call React client APIs.
- Feature hooks may import feature types, feature utilities, and shared UI utilities.
- Feature hooks must not import server modules.
- Do not put hooks in `src/app` unless they are small and route-local.
- Do not put domain-specific hooks in `src/lib`.

If a hook manages only one component's local state and is not reused, keep the logic inside that component.

## Server Actions

Place server actions in one of these locations:

- `src/features/[feature]/actions/*` for reusable feature actions.
- `src/app/.../actions.ts` only when the action is tightly coupled to one route and is small.

Server actions should:

- Validate input.
- Check authentication and authorization.
- Call feature server functions for complex behavior.
- Revalidate or redirect only at the boundary where the UI needs it.

Avoid placing large business workflows directly in `actions.ts`.

Action files should mostly orchestrate:

1. Read and normalize `FormData` or action arguments.
2. Validate input with feature validation functions.
3. Check the current user and permissions.
4. Call server data mutation functions.
5. Revalidate paths or redirect.
6. Return a serializable action state.

Move logic out of actions when:

- The logic is reused by another route, action, or API route.
- The logic needs focused tests.
- The logic performs multiple database operations.
- The logic calls an external service.
- The action file becomes hard to scan.

Example:

```text
src/features/study/actions/study-owner-actions.ts
src/features/study/server/study-owner-mutations.ts
src/features/study/validation/study-owner-validation.ts
```

## Validation

Put validation close to the feature that owns the rules.

Recommended layout:

```text
src/features/[feature]/validation/
  [feature]-input.ts
  [feature]-params.ts
```

Use validation files for:

- Form input validation.
- Search param parsing.
- Route param validation.
- External webhook payload shape checks.
- Domain constraints such as max title length, editable roles, and allowed statuses.

Validation rules:

- If a validation function is used by one action only and is very small, it may stay private inside that action file.
- If a validation function is used by more than one file, move it to `src/features/[feature]/validation`.
- If a validation function has no domain ownership and is generally reusable, move it to `src/lib/utils`.
- Validation functions should return typed results, not loosely shaped objects when possible.
- Avoid duplicating constants such as max lengths across components, actions, and server modules.

Preferred validation result shape:

```ts
type ValidationResult<T> =
  | { ok: true; value: T }
  | { error: string; ok: false };
```

Example:

```text
src/features/study/validation/study-input.ts
src/features/problem/validation/problem-list-search-params.ts
src/features/github/validation/github-webhook-request.ts
```

Server validation is required for any mutation or API route.

Client validation is optional and should improve UX only. Never rely on client validation for authorization, persistence, or external API calls.

## Utilities

Put utility functions in the narrowest correct place.

Use private functions inside a file when:

- They support only that file.
- They are short and easy to understand.
- Exporting them would create unnecessary API surface.

Use `src/features/[feature]/utils.ts` when:

- The utility is pure.
- The utility is used by multiple files in the same feature.
- The utility contains feature-specific language or rules.

Use `src/lib/utils` when:

- The utility has no domain ownership.
- The utility is safe to use from multiple features.
- The utility does not import feature modules.

Examples:

```text
src/features/study/utils.ts
src/features/problem/utils.ts
src/lib/utils/date.ts
src/lib/utils/url.ts
```

## Data Access

Prisma queries should live close to the feature that owns the data behavior.

Preferred:

```text
src/features/study/server/study-members-data.ts
src/features/study/server/study-owner-data.ts
src/features/problem/server/problem-list-data.ts
src/features/problem/server/problem-detail-data.ts
```

Route files should call these functions instead of building large queries inline.

## API Routes

API route files under `src/app/api/**/route.ts` should stay thin.

They should:

- Read the request.
- Validate request-level requirements.
- Call a feature server function.
- Return a `Response`.

They should not own long workflows.

For example, GitHub webhook receiving should be split into feature modules:

```text
src/app/api/github/webhook-receiver/route.ts
src/features/github/server/webhooks/signature.ts
src/features/github/server/webhooks/payload-parser.ts
src/features/github/server/webhooks/delivery-repository.ts
src/features/github/server/webhooks/receiver.ts
```

## Naming Rules

Use descriptive file names based on responsibility.

Examples:

- `problem-list-data.ts`
- `problem-detail-data.ts`
- `study-members-data.ts`
- `study-owner-actions.ts`
- `github-webhook-signature.ts`
- `github-webhook-receiver.ts`

Avoid vague names:

- `helpers.ts`
- `common.ts`
- `data.ts`
- `service.ts`

Generic names are allowed only inside a narrow folder where the meaning is obvious.

## Refactoring Order

When refactoring existing code, use this order:

1. Move reusable route-local data loading from `src/app/**/_lib` to `src/features/[feature]/server`.
2. Move feature-owned components from route `_components` to `src/features/[feature]/components`.
3. Move route-local server actions to `src/features/[feature]/actions` when they grow beyond one route.
4. Split large API route handlers into feature server modules.
5. Keep route files thin after each move.

Do not move everything at once if it increases risk. Prefer small, verifiable steps.

## Verification

After structure or import changes, run:

```bash
npm run lint
npx tsc --noEmit
```

After Prisma schema changes, also run:

```bash
npx prisma validate
```

If a feature has a dedicated verification document in `docs/`, follow that checklist too.
