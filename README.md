# Social Feed Client

Production-ready React client for the Social Feed assignment. This app preserves the provided template design while implementing a fully functional authenticated social feed experience.

## Live Demo
- Production URL: https://socialfeedweb.netlify.app
- Backend API: https://social-feed-server.vercel.app/api

## What This Frontend Delivers
- Complete auth flow: register, login, persist session, logout.
- Protected routing: only authenticated users can access feed routes.
- Feed experience:
	- Create post with visibility (public/private).
	- Upload post image via backend upload endpoint.
	- Like/unlike posts, comments, and replies.
	- Add comments and nested replies.
	- View liked user lists.
- UX polish:
	- Avoid global feed flicker during interactions.
	- Action-level loading states (like/comment/reply/post).
	- Responsive behavior across desktop and mobile.
	- SPA route fallback support on Netlify refresh/direct links.

## Tech Stack
- React 19
- Vite 8
- React Router 7
- Axios
- Context API for auth state
- Template-based CSS/assets (from provided task design)

## Project Structure
```
src/
	api/            Axios instance + auth header interceptor
	context/        Auth context and session persistence
	pages/          Login, Register, Feed
	routes/         ProtectedRoute wrapper
	App.jsx         Route map
	main.jsx        App bootstrap
public/assets/    Provided CSS, images, fonts
```

## Environment Variables
Create `.env` from `.env.example`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

For production, set it to:

```
VITE_API_BASE_URL=https://social-feed-server.vercel.app/api
```

## Local Development
1. Install dependencies:
	 - `npm install`
2. Configure environment:
	 - `cp .env.example .env`
3. Start dev server:
	 - `npm run dev`
4. Build for production:
	 - `npm run build`
5. Preview production build locally:
	 - `npm run preview`

## Available Scripts
- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Deployment Notes (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback is configured in `netlify.toml`:
	- `/* -> /index.html (200)`
- Ensure environment variable is set:
	- `VITE_API_BASE_URL=https://social-feed-server.vercel.app/api`

## Engineering Highlights For Reviewers
- Clean separation of responsibilities (routing, context, API, UI pages).
- Centralized API client with token injection for authenticated requests.
- Error-aware user flows and consistent handling of async operations.
- Production deployment concerns handled (route fallback, environment-based API targeting).

## Known Limitations / Future Improvements
- Automated frontend tests are not included yet.
- Infinite scroll and optimistic updates can further enhance perceived performance.
- Additional accessibility refinements can be added (keyboard shortcuts, richer ARIA semantics).
