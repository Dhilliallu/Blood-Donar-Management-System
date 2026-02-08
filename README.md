# Blood Donor Management System

Mission-critical emergency blood donor management system with AI-powered health screening.

## Features

- 🩸 **Donor Registration** - Complete health screening and eligibility verification
- 🚨 **Emergency Requests** - Hospital-verified blood requests with OTP authentication
- 🔄 **Real-time Updates** - WebSocket-powered live emergency feed
- 🤖 **AI Health Assistant** - Google Gemini-powered health guidance
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with persistent storage
- **Real-time**: WebSocket (ws)
- **AI**: Google Gemini API
- **Authentication**: bcrypt, express-session

## Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/blood-donor-system.git
cd blood-donor-system
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

5. Start the server:
```bash
npm start
```

6. Open browser to `http://localhost:3000`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Render:
1. Push code to GitHub
2. Connect repository to Render
3. Configure environment variables
4. Deploy!

## Project Structure

```
blood-donor-system/
├── public/              # Frontend HTML/CSS/JS
├── routes/              # API route handlers
├── database.js          # Database schema and utilities
├── server.js            # Express server setup
├── render.yaml          # Render deployment config
└── DEPLOYMENT.md        # Deployment guide
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/profiles/donor/:userId` - Get donor profile
- `POST /api/requests` - Create emergency request
- `GET /api/requests/active` - Get active requests
- `POST /api/ai/chat` - AI health assistant

## License

MIT
