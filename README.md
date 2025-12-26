# BookMyDoc - AI-Powered Healthcare Platform

BookMyDoc is a comprehensive healthcare platform that combines AI-driven symptom analysis with doctor appointment booking. The platform features an intelligent chatbot that analyzes user symptoms using Google Gemini AI and recommends appropriate medical specialists, integrated with a Supabase-powered database for user management and doctor profiles.

## Features

### 🤖 AI-Powered Healthcare Assistant
- **Intelligent Symptom Analysis**: Advanced chatbot powered by Google Gemini AI that analyzes user symptoms and provides preliminary medical assessments
- **Specialist Recommendations**: AI-driven suggestions for appropriate medical specialists based on symptoms, location, and user profile
- **Context-Aware Conversations**: Natural language processing with conversation state management and personalized responses
- **Medical Dictionary Integration**: Comprehensive symptom normalization, spell correction, and medical terminology mapping
- **Multi-language Support**: Handles common medical terms, typos, and regional language variations (Hinglish, etc.)

### 📅 Appointment Management System
- **Doctor Discovery**: Search and filter doctors by specialty, location, experience, and ratings
- **Real-time Booking**: Interactive calendar system for scheduling appointments with available time slots
- **Appointment History**: Track past and upcoming appointments with detailed records
- **Doctor Profiles**: Comprehensive profiles including qualifications, experience, consultation fees, and patient reviews

### 👤 User Management
- **Secure Authentication**: Supabase-powered login/signup system with email verification
- **Patient Profiles**: Detailed health profiles with medical history, allergies, and personal information
- **Doctor Registration**: Multi-step verification process for medical professionals with document upload
- **Role-based Access**: Separate interfaces and permissions for patients and healthcare providers

### 🏥 Healthcare Features
- **Symptom Checker**: Interactive tool for preliminary symptom assessment and triage
- **Disease Risk Evaluation**: AI-powered risk assessment based on symptoms, demographics, and medical history
- **Seasonal Health Alerts**: Location and season-based health recommendations and preventive care tips
- **Medical Context Analysis**: Intelligent analysis of user input with medical reasoning and clinical logic

### 🔍 Advanced Search & Discovery
- **Location-based Search**: GPS-enabled doctor search with proximity filtering (up to 5km radius)
- **Smart Filtering**: Filter doctors by specialty, availability, fees, ratings, and languages spoken
- **Review System**: Patient reviews and ratings with detailed feedback and star ratings
- **Availability Calendar**: Real-time availability checking and instant booking confirmation

### 💬 Communication Tools
- **Real-time Chat Interface**: Interactive chatbot with typing indicators and message history
- **Chat History**: Persistent conversation logs for symptom analysis sessions
- **Emergency Alerts**: Priority routing for urgent medical situations
- **Multilingual Interface**: Support for multiple languages and regional dialects

### 📊 Analytics & Insights
- **Health Trends**: Seasonal and regional health pattern analysis
- **Usage Analytics**: Platform usage statistics and user engagement metrics
- **Medical Insights**: AI-generated insights from symptom analysis patterns
- **Performance Metrics**: System performance monitoring and optimization

### 🎨 User Experience
- **Responsive Design**: Fully responsive interface optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive design built with Tailwind CSS and Radix UI components
- **Accessibility**: WCAG-compliant interface with screen reader support and keyboard navigation
- **Dark/Light Mode**: Theme switching capability for user preference
- **Smooth Animations**: GSAP and Framer Motion-powered animations for enhanced user experience

### 🔒 Security & Privacy
- **Data Encryption**: End-to-end encryption for sensitive medical data
- **HIPAA Compliance**: Healthcare data protection standards implementation
- **Secure API**: RESTful API with authentication and authorization
- **Data Backup**: Automated backup and recovery systems for critical data

## Tech Stack

### Backend
- **Django** - Web framework
- **Django REST Framework** - API development
- **Supabase** - Database and authentication
- **Google Gemini AI** - Symptom analysis
- **Gunicorn** - Production server
- **PostgreSQL** - Database (via Supabase)

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Framer Motion & GSAP** - Animations

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm or bun package manager
- Git

## Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookmydoc
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Navigate to backend directory**
   ```bash
   cd backend
   ```

5. **Apply database migrations**
   ```bash
   python manage.py migrate
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../react-frontend
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   # or if using bun
   bun install
   ```

   **Note**: If you encounter missing dependencies during development, you may need to install additional packages like GSAP or other animation libraries. Check the console for any missing module errors and install them as needed.

## Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Django Settings
SECRET_KEY=your-django-secret-key
DEBUG=True
DJANGO_SETTINGS_MODULE=userapp.settings

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=your-supabase-database-url

# Google Gemini AI
GEMINI_API_KEY=your-google-gemini-api-key
```

Create a `.env` file in the `react-frontend` directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Running the Project

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   python manage.py runserver
   ```
   The backend will run on `http://localhost:8000`

2. **Start the frontend development server**
   ```bash
   cd react-frontend
   npm run dev
   # or
   bun dev
   ```
   The frontend will run on `http://localhost:8080`

3. **Access the application**
   Open your browser and navigate to `http://localhost:8080`

### Production Build

1. **Build the frontend**
   ```bash
   cd react-frontend
   npm run build
   ```

2. **Collect static files**
   ```bash
   cd backend
   python manage.py collectstatic --noinput
   ```

3. **Start production server**
   ```bash
   gunicorn userapp.wsgi:application --bind 0.0.0.0:8000
   ```

## API Keys Required

### Essential Keys
- **Google Gemini API Key**: Required for AI symptom analysis. Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Supabase URL & Keys**: Required for database operations and authentication. Create a project at [Supabase](https://supabase.com)

### Optional Keys
- **Supabase Service Role Key**: Required for admin operations (optional for basic functionality)

## Project Structure

```
bookmydoc/
├── backend/                    # Django backend
│   ├── api/                   # API endpoints
│   ├── home/                  # Home app
│   ├── userapp/               # Main Django settings
│   ├── manage.py
│   └── requirements.txt
├── react-frontend/            # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utilities and API clients
│   │   └── types/            # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt           # Root Python dependencies
├── render.yaml               # Deployment configuration
└── README.md
```

## Enhancements Needed

### High Priority
1. **Profile Fetching Fix**: Fix issue where patient profile isn't refetched after restarting chatbot conversation
2. **Enhanced Medical Dictionary**: Expand symptom mappings to handle more medical terms and common typos

### Medium Priority
3. **Fuzzy String Matching**: Implement Levenshtein distance for better typo correction in symptom input
4. **Context-Aware Correction**: Use surrounding words for more accurate symptom detection
5. **Multi-Language Support**: Add Hinglish and regional language mappings for Indian users

### Low Priority
6. **Confidence Scoring**: Assign confidence scores to symptom detections to reduce false positives
7. **Dynamic Learning**: Implement user feedback loop to improve mappings over time
8. **Medical API Integration**: Connect with external medical APIs for validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@bookmydoc.com or create an issue in the repository.

---

**Note**: This is a healthcare platform. Always consult with qualified medical professionals for actual medical advice. The AI analysis is for informational purposes only and should not replace professional medical consultation.
