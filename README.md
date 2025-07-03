# Live Polling System

A real-time interactive polling system built with Next.js for classroom engagement between teachers and students.

## Features

### Teacher Portal
- ✅ Create polls with multiple choice options
- ✅ Configure poll duration (30s to 5 minutes)
- ✅ View live results with real-time updates
- ✅ Monitor student participation
- ✅ Kick students from sessions
- ✅ View poll history
- ✅ Real-time chat with students

### Student Portal
- ✅ Join sessions with unique names (per tab)
- ✅ Answer polls within time limits
- ✅ View live results after answering
- ✅ 60-second countdown timer
- ✅ Real-time chat with teacher and other students

### Technical Features
- ✅ Real-time updates using React state management
- ✅ Session persistence using sessionStorage
- ✅ Responsive design for all devices
- ✅ Interactive chat system
- ✅ Poll history tracking

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd live-polling-system
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Deploy with one click

## Usage

### For Teachers
1. Go to `/teacher`
2. Create polls with questions and multiple options
3. Set custom poll duration
4. Monitor student responses in real-time
5. Use chat to interact with students
6. View poll history and analytics

### For Students
1. Go to `/student`
2. Enter your name to join the session
3. Answer polls when they become available
4. View live results after submitting
5. Use chat to ask questions or discuss

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React hooks with custom store
- **Real-time Updates**: React state synchronization
- **Deployment**: Vercel

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Home page
│   ├── teacher/page.tsx      # Teacher dashboard
│   ├── student/page.tsx      # Student interface
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Reusable UI components
│   └── chat-popup.tsx        # Chat functionality
├── hooks/
│   └── use-polling.ts        # Polling state management
├── lib/
│   ├── polling-store.ts      # Core business logic
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
