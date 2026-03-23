# AI Money Mentor - Project

A comprehensive financial planning and money management application designed to help users achieve financial independence and make informed financial decisions.

## 🌟 Features

### Core Functionality
- **Financial Health Assessment**: Analyze your current financial situation with personalized insights
- **FIRE Planner**: Calculate your path to Financial Independence, Retire Early (FIRE)
- **Interactive Dashboard**: Real-time visualization of your financial metrics
- **Personalized Recommendations**: AI-powered suggestions for improving your financial health

### User Experience
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Onboarding Flow**: Guided setup process for new users
- **Authentication**: Secure user authentication system
- **Mobile Responsive**: Works seamlessly on all devices

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### UI Components
- **shadcn/ui** - High-quality, accessible component library
- **Framer Motion** - Smooth animations and transitions

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Authentication** - Secure user management

### Development Tools
- **ESLint** - Code linting and formatting
- **Playwright** - End-to-end testing
- **Vitest** - Unit testing framework
- **PostCSS** - CSS processing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn or bun

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/kanakasudheer/AI-Money-Mentor---Project-.git
   cd AI-Money-Mentor---Project-
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Ballpit.tsx     # Animated background component
│   ├── Galaxy.tsx      # Galaxy animation
│   ├── Hyperspeed.tsx  # Speed animation
│   ├── Plasma.tsx      # Plasma effect
│   └── Threads.tsx     # Thread animation
├── pages/              # Main application pages
│   ├── AuthPage.tsx    # User authentication
│   ├── DashboardPage.tsx # Main dashboard
│   ├── FIREPlannerPage.tsx # FIRE calculator
│   ├── Index.tsx       # Landing page
│   ├── MoneyHealthPage.tsx # Financial health
│   └── OnboardingPage.tsx # User onboarding
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles and CSS
```

## 🎯 Key Pages

### Dashboard
- Overview of financial metrics
- Interactive charts and graphs
- Quick access to all features
- Real-time data updates

### FIRE Planner
- Calculate retirement timeline
- Savings rate optimization
- Investment growth projections
- Goal tracking and milestones

### Financial Health
- Comprehensive financial assessment
- Debt analysis and recommendations
- Savings optimization tips
- Risk tolerance evaluation

### Onboarding
- Step-by-step user setup
- Financial profile creation
- Goal setting and preferences
- Personalized recommendations


### Test Coverage
- Component unit tests with Vitest
- E2E tests with Playwright
- Visual regression testing
- Accessibility testing



### Environment Variables for Production
Ensure all environment variables are properly configured in your hosting environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic HTML
- Write tests for new features
- Maintain code coverage above 80%
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend service
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the lightning-fast build tool

---

**AI Money Mentor** - Your intelligent companion for financial wellness and independence.
