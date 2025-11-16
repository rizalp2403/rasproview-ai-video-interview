# Frontend Guideline Document

This document outlines the frontend architecture, design principles, styling, component structure, state management, routing, performance optimizations, and testing strategies for RasproView AI. Anyone reading this—even without a deep technical background—should get a clear picture of how our frontend is set up and why.

## 1. Frontend Architecture

**Framework and Language**
- We use **Next.js** with the **App Router**. This gives us a mix of server-side rendering (SSR) for fast initial loads and client-side transitions for a smooth experience.
- The entire codebase is written in **TypeScript**. Strong typing helps us catch bugs early and makes the code easier to understand.

**Core Libraries**
- **shadcn/ui**: A set of ready-made, accessible React components (buttons, forms, tables) that speed up UI building.
- **Tailwind CSS**: A utility-first CSS framework that lets us style quickly without writing long custom stylesheets.
- **next-themes**: Manages light- and dark-mode theming with minimal setup.
- **Better Auth**: Handles authentication and role-based access for candidates and recruiters.
- **Drizzle ORM** + **PostgreSQL**: Provides type-safe database access and structured data storage.

**Support for Scalability and Maintainability**
- **File-based routing** (Next.js App Router) keeps pages, layouts, and APIs in clear folders.
- **Component-based structure** means each UI piece lives in its own file, making it easy to find and update.
- **TypeScript** and **Drizzle** ensure our data models match the code, reducing surprises as the app grows.
- **Docker** and **docker-compose** guarantee the environment is the same for every developer and on production.

## 2. Design Principles

**Usability**
- Keep interactions simple: clear buttons, concise feedback messages, and step-by-step flows for recording and submitting interviews.
- Use familiar patterns (modals, tabs, wizards) so users don’t have to learn new behaviors.

**Accessibility**
- Write semantic HTML and use ARIA attributes where needed (e.g., `aria-live` for status updates).
- Ensure color contrast meets WCAG standards.
- Make all interactive elements keyboard-navigable.

**Responsiveness**
- Build mobile-first using Tailwind’s responsive utilities (sm, md, lg, xl).
- Design fluid layouts that adapt to different screen sizes, especially for video previews and dashboards.

## 3. Styling and Theming

**Styling Approach**
- **Tailwind CSS** utility classes for most styling needs—loose coupling between markup and design.
- For custom component tweaks, we use **CSS Modules** or inline `className` overrides.

**CSS Methodology**
- Avoid traditional BEM or SMACSS since Tailwind’s utility-first model gives us fine-grained control.

**Theming**
- Powered by **next-themes**, using CSS variables for colors. Users toggle light/dark mode seamlessly.

**Visual Style**
- A **modern flat design** with subtle shadows for depth and smooth transitions.
- Consistent spacing (8px grid) and border radius (4px) across all components.

**Color Palette**
- Primary (Indigo): `#4F46E5` (dark mode accents: `#818CF8`)
- Secondary (Teal): `#14B8A6`
- Accent (Emerald): `#10B981`
- Background Light: `#F9FAFB`; Dark: `#1F2937`
- Surface Light: `#FFFFFF`; Dark: `#111827`
- Text Light: `#111827`; Dark: `#F3F4F6`

**Typography**
- Font family: **Inter** (system-fallback: `-apple-system, BlinkMacSystemFont, sans-serif`)
- Sizes:  Base body `16px` (1rem), headings scale from `1.25rem` (h4) up to `2rem` (h1).

## 4. Component Structure

**Organization**
- `/components/ui/`: All `shadcn/ui` components and wrappers (Button, Card, Input, Table).
- `/components/common/`: Shared bits like `Logo`, `Spinner`, `Alert`.
- `/components/dashboard/`: Recruiter and candidate dashboard building blocks (Sidebar, Header, DataGrid).
- `/components/interview/`: Feature-specific parts (VideoRecorder, QuestionStep, SubmissionStatus).

**Reusability**
- Each component has its own folder (`index.tsx`, styles.module.css, tests).
- We keep props simple and well-typed, favoring composition over prop drilling.

## 5. State Management

**Server vs. Client**
- Data fetching is mostly done on the server (Next.js server components and API routes).

**Client State**
- **React Context** for global concerns: authentication state (AuthContext) and theme mode (ThemeContext via next-themes).
- **SWR** or **React Query** for caching API data, revalidation, and background refresh.
- Local component state with `useState` for UI interactions (e.g., step index in a multi-step form).

## 6. Routing and Navigation

**Next.js App Router**
- `/app/layout.tsx` defines the root layout (header, footer, theme provider).
- Nested layouts under `/app/dashboard/` wrap recruiter and candidate areas.

**Dynamic Routes**
- Interview pages live at `/app/interview/[id]/page.tsx`.
- API routes under `/app/api/` handle auth (`/api/auth/*`) and custom endpoints (e.g., `/api/interviews/submit`).

**Navigation**
- Use Next.js `<Link>` for client-side transitions, with `prefetch` enabled by default.
- Sidebar and top nav components include focus states and aria labels for screen readers.

## 7. Performance Optimization

- **SSR/SSG**: Pre-render landing pages and dashboards for recruiters using static generation or incremental regeneration.
- **Code Splitting**: Dynamic imports for heavy modules like video player or AI visualization charts.
- **Asset Optimization**: Next.js `Image` component, optimized SVGs, and compressed icons.
- **Tailwind Purge**: Strips unused CSS in production builds.
- **Lazy Loading**: Load non-critical components (e.g., analytics charts) only when needed.

## 8. Testing and Quality Assurance

**Unit Testing**
- **Jest** + **React Testing Library** for UI components. We test rendering, user interactions, and accessibility attributes.

**Integration Testing**
- Use **MSW (Mock Service Worker)** to simulate API responses and test flows end-to-end in isolation.

**End-to-End (E2E) Testing**
- **Playwright** or **Cypress** for full user journeys: sign up, record video, submit, and view results.

**Linting and Formatting**
- **ESLint** (with the Next.js and TypeScript plugins) and **Prettier** to enforce consistent code style.
- **Husky** pre-commit hooks to run lint and tests before code lands.

**Accessibility Checks**
- Integrate **axe-core** CI checks to catch common a11y issues automatically.

## 9. Conclusion and Overall Frontend Summary

RasproView AI’s frontend is built with modern, battle-tested tools—Next.js, TypeScript, shadcn/ui, and Tailwind CSS—organized in a clear, component-driven structure. Our design principles of usability, accessibility, and responsiveness guide every page and interaction. State is managed where it makes the most sense (server vs. client), and routing follows Next.js conventions for simplicity and performance. We bake in optimizations like SSR, code splitting, and lazy loading to keep the UI snappy, and we maintain quality through a full suite of tests and automated linting. 

This setup not only accelerates the launch of core video interview features but also provides a solid foundation for scaling, theming, and extending RasproView AI in the future. With these guidelines in hand, any developer—new or experienced—can dive in and contribute effectively to our goal of delivering a world-class AI interview experience.