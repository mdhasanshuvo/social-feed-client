# Social Feed Client

React frontend for the Social Feed Application. The UI is converted from the provided HTML/CSS pages and keeps the same design language.

## Project Overview
Frontend includes:
- Login page
- Registration page
- Protected feed page
- Post creation (text, optional image URL, visibility)
- Like/unlike on posts, comments, replies
- Comment and reply creation
- Auth state with Context API + localStorage token

## Tech Stack
- React.js
- React Router
- Axios
- Context API
- Plain CSS (provided design assets)
- Vite

## Setup
1. Install dependencies:
	- `npm install`
2. Copy env file:
	- `cp .env.example .env`
3. Run development server:
	- `npm run dev`
4. Build production bundle:
	- `npm run build`

## Environment Variables
Use `.env`:
- `VITE_API_BASE_URL=http://localhost:5000/api`

## Design Assets
Original assets are used from:
- `public/assets/css`
- `public/assets/images`
- `public/assets/fonts`

## Deployment (Netlify)
1. Connect frontend repo in Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env var `VITE_API_BASE_URL` with deployed backend API URL.

## Notes
- Do not commit `.env`.
- Ensure backend `CLIENT_ORIGIN` includes your Netlify domain.
