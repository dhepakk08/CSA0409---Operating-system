# LinuxXplore

LinuxXplore is a browser-based operating systems learning platform built with React and Vite. It provides interactive simulations for core OS concepts, a Linux-like sandbox, adaptive quizzes, tutor support, and role-based analytics for students and teachers.

## Overview

The application is fully client-side and uses localStorage as its persistence layer for:

- user accounts and sessions
- progress and quiz history
- sandbox command/process logs
- role-based analytics data

No backend service is required for local development and evaluation.

## Core Features

### Role-Based Authentication

- Student and Teacher sign-in flows
- Account registration with role support
- Teacher account creation protected with an access code
- Forgot Password flow using a local reset-code mechanism
- Persistent browser session management

### Student Experience

- Learning Modules for scheduling, memory, paging, disk, and advanced OS topics
- Linux Sandbox with virtual filesystem and process simulation
- Quiz engine with topic and difficulty coverage, scoring, and history
- Tutor module for guided concept support
- Personal Dashboard and Progress analytics

### Teacher Experience

- Class-level analytics dashboard
- Registered student count
- Quiz performance insights
- Sandbox/process activity overview
- Progress visibility across learners

## Technology Stack

- React
- Vite
- JavaScript (ES Modules)
- CSS
- localStorage (data persistence)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Open the local URL printed in the terminal (typically http://localhost:5173).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Default Access

- Teacher demo account:
	- Email: teacher@linuxxplore.com
	- Password: teacher123

Students can create accounts directly from the authentication screen.

## Data Persistence

All data is stored in browser localStorage. Clearing browser storage or changing storage keys resets all app data for that browser profile.

## Project Structure

```text
src/
	components/
		App.jsx
		Layout.jsx
		Dashboard.jsx
		Learning.jsx
		Quiz.jsx
		Tutor.jsx
		Sandbox.jsx
		Analytics.jsx
		AdvancedLearning.jsx
		AdvancedMemory.jsx
		AdvancedDisk.jsx
	logic/
		algorithms.js
		advancedAlgorithms.js
		commandCatalog.js
		sandbox.js
	database.js
	main.jsx
	styles.css
```

## Scope and Limitations

- This project is an educational simulator, not a production LMS.
- Linux process scheduling, memory, and filesystem behavior are simplified models.
- Password reset is local-demo based and does not send real emails.

## License

For academic and learning use.

