# Clario

A peer-to-peer skill learning platform for college communities. Students can teach and learn skills from each other.

## Tech Stack

- **React + Vite** - Frontend
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Firebase Auth + Firestore** - Shared auth and cross-device data
- **Jitsi Meet** - Video sessions
- **Three.js** - 3D skill map

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase env vars**
   Copy `.env.example` into `.env` and fill in your Firebase project values.

3. **Enable Firebase services**
   Turn on Email/Password auth in Firebase Authentication and apply the included `firestore.rules` in your Firestore project.

4. **Run development server**
   ```bash
   npm run dev
   ```

## Features

- **Students**: Browse tutors, search skills, book sessions, join live video calls, rate sessions
- **Tutors**: Add skills, accept/reject requests, join teaching sessions
- **3D Skill Map**: Interactive Three.js visualization to discover skills

## Pages

| Page | Path |
|------|------|
| Landing | / |
| Login | /login |
| Register | /register |
| Student Dashboard | /student/dashboard |
| Find Skills | /find-skills |
| Tutor Profile | /tutor/:id |
| My Sessions | /my-sessions |
| Tutor Dashboard | /tutor/dashboard |
| Tutor Requests | /tutor/requests |
| Edit Profile | /tutor/profile |
| Session Lobby | /session/lobby/:id |
| Session Room | /session/room/:id |
| Session Complete | /session/complete/:id |
| Rate Session | /session/rate/:id |
| Settings | /settings |
