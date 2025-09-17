# TeiqR - Task Manager

A powerful task management platform built with Next.js, TypeScript, and TailwindCSS for organizing projects, deadlines, and boosting productivity.

## Features

### 🔐 Authentication System
- Secure login and signup
- User profiles with personal information
- Password validation

### 📅 Smart Scheduler
- Interactive calendar view (monthly view implemented)
- Add, edit, and delete tasks/events
- Task categories (homework, exams, projects, personal)
- Priority levels with color-coded labels
- Due date tracking and overdue notifications

### ⏱️ Time Tracking
- **Real-time Timer** - Start, pause, stop with live tracking
- **Category Breakdown** - Track time by work type
- **Productivity Reports** - Daily and weekly time summaries
- **Time History** - Review past work sessions

### 🤖 AI-Powered Assistance
- **Task Management Focus** - Productivity and time management tips
- **File Upload Support** - Analyze documents for task planning
- **Model Selection** - Choose between GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Chat History** - Persistent conversation storage

### 🎨 Modern UI/UX
- **Dark/Light Mode** - Complete theme support with toggle
- **Responsive Design** - Mobile-first approach
- **Professional Theme** - Clean black & white aesthetic
- **Intuitive Navigation** - Dashboard, Tasks, Projects, Time Tracker, AI Help, Settings

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
```

## Usage

### Creating Tasks
1. Click "+" button on Dashboard or navigate to Tasks
2. Fill in task details including subtasks and tags
3. Set priority, category, and due date
4. Assign to team members if needed
5. Track estimated vs actual time

### Project Management
1. Navigate to Projects tab
2. Create new project with description and timeline
3. Add team members and set status
4. Track progress with visual indicators
5. Monitor project statistics

### Time Tracking
1. Go to Time Tracker tab
2. Enter task description and category
3. Start timer and work on your task
4. Pause/resume as needed
5. Stop timer to save time entry
6. Review daily and weekly reports

### AI Assistant
1. Click "AI Help" in navigation
2. Ask questions about productivity and task management
3. Upload files for analysis and planning
4. Switch between AI models for different needs
5. Access chat history from sidebar

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: OpenAI API (GPT-4o, GPT-3.5 Turbo)
- **Icons**: Lucide React
- **Storage**: LocalStorage for data persistence
- **Styling**: Dark mode support, responsive design
4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── AuthModal.tsx
│   ├── CalendarView.tsx
│   ├── Dashboard.tsx
│   ├── TaskList.tsx
│   └── TaskModal.tsx
├── lib/
│   └── auth.ts
└── types/
    └── index.ts
```

## Features Overview

### Authentication
- **Google OAuth**: One-click sign-in with Google account
- **Traditional Auth**: Email/password login with form validation
- **Session Management**: Secure session handling with NextAuth.js
- **User Profiles**: Automatic profile creation from Google account
2. Click "Sign Up" to create a new account
3. Fill in your details (name, email, school, grade)
4. Start adding tasks and organizing your academic life

### Adding Tasks
1. Click the "Add Task" button in the header
2. Fill in task details (title, description, category, priority, due date)
3. Add notes if needed
4. Save the task

### Managing Tasks
- **Dashboard**: View upcoming deadlines and quick stats
- **Calendar**: See tasks in monthly calendar view
- **Tasks**: Full task list with filtering and search options

### Task Categories
- **Homework**: Daily assignments and exercises
- **Exams**: Tests, quizzes, and examinations
- **Projects**: Long-term assignments and group work
- **Personal**: Personal tasks and reminders

### Priority Levels
- **High**: Urgent tasks requiring immediate attention (red)
- **Medium**: Important tasks with moderate urgency (yellow)
- **Low**: Tasks that can be completed when time allows (green)

## Future Enhancements

- [ ] Week and day calendar views
- [ ] File upload functionality for assignments
- [ ] Markdown support in notes
- [ ] Task collaboration and sharing
- [ ] Email notifications and reminders
- [ ] Backend integration with user data persistence
- [ ] Mobile app version
- [ ] Integration with school systems

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@studex.app or create an issue in the repository.

---

Built with ❤️ for students who demand excellence in their academic organization.
