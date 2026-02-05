# CAC URL Shortener

A modern, full-stack URL shortening service with analytics, built with React and Node.js, powered by Neon.tech PostgreSQL.

## ✨ Features

- **URL Shortening**: Create short, shareable links instantly
- **Custom Aliases**: Personalize your links with custom aliases (e.g., `/johndoe/my-project`)
- **Click Analytics**: Track clicks with detailed analytics (referrer, browser, timestamp)
- **QR Code Generation**: Generate QR codes for any shortened URL
- **User Dashboard**: Manage all your links in one place
- **URL Recovery**: Soft delete with 30-day recovery window
- **Rate Limiting**: Built-in protection against abuse
- **Responsive Design**: Works beautifully on desktop and mobile

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express 5** - Modern server framework
- **PostgreSQL** via **Neon.tech** - Serverless Postgres database
- **Sequelize** - ORM for database operations
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **React 19** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS 4** - Utility-first styling
- **React Router** - Client-side routing
- **Recharts** - Analytics visualizations
- **QRCode.react** - QR code generation

## 📁 Project Structure

```
cac-url/
├── backend/
│   ├── config/
│   │   └── database.js       # Neon.tech PostgreSQL config
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── rateLimiter.js    # Rate limiting
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Url.js            # URL model
│   │   └── OTP.js            # OTP model (optional)
│   ├── routes/
│   │   ├── auth.js           # Auth endpoints
│   │   ├── shorten.js        # URL shortening
│   │   ├── urls.js           # URL management
│   │   ├── health.js         # Health check
│   │   └── redirect.js       # URL redirection
│   ├── utils/
│   │   ├── ApiError.js       # Custom error class
│   │   ├── errorHandler.js   # Error handling middleware
│   │   ├── responseHandler.js # Standardized responses
│   │   └── validators.js     # Input validation
│   ├── server.js             # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── context/          # Auth context
    │   ├── services/         # API service layer
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Neon.tech account (free tier available)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/cac-url.git
cd cac-url
```

### 2. Set up Neon.tech Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string from the dashboard

### 3. Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your Neon.tech credentials:

```env
# Database (use your Neon.tech connection string)
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Or individual variables
DB_HOST=ep-xxx.region.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your-username
DB_PASSWORD=your-password

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-key-min-32-chars

# Server
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### 4. Configure Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 5. Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |

### URL Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/shorten` | Create shortened URL |
| GET | `/urls` | Get all user's URLs (auth required) |
| DELETE | `/urls/:shortId` | Delete URL (soft delete) |
| POST | `/urls/:shortId/recover` | Recover deleted URL |
| PUT | `/urls/:shortId/alias` | Update custom alias |
| GET | `/urls/:shortId/stats` | Get URL analytics |
| POST | `/urls/transfer` | Transfer anonymous URLs to account |

### Redirects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:shortId` | Redirect to original URL |
| GET | `/:userName/:alias` | Redirect personalized URL |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |
| GET | `/health/db` | Database connectivity |

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with 7-day expiry
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 
  - General: 100 req/min
  - Auth: 10 attempts/15 min
  - Shortening: 30/min
- **Input Validation**: URL and alias format validation
- **CORS Configuration**: Configurable origins
- **Security Headers**: XSS, clickjacking protection

## 🌐 Deployment

### Backend (Vercel/Railway/Render)

1. Set environment variables in your hosting platform
2. Deploy the `backend` folder
3. Ensure `DATABASE_URL` points to your Neon.tech database

### Frontend (Vercel/Netlify)

1. Set `VITE_API_URL` to your deployed backend URL
2. Deploy the `frontend` folder

## 📊 Database Schema

### Users Table
```sql
- id (INTEGER, PK, auto-increment)
- email (STRING, unique)
- password (STRING, hashed)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### URLs Table
```sql
- id (INTEGER, PK, auto-increment)
- originalUrl (TEXT)
- shortId (STRING, unique)
- customAlias (STRING, unique, nullable)
- userId (INTEGER, FK -> users.id, nullable)
- clicks (INTEGER, default 0)
- clickHistory (JSON)
- isDeleted (BOOLEAN, default false)
- deletedAt (TIMESTAMP, nullable)
- expiresAt (TIMESTAMP, nullable)
- createdAt (TIMESTAMP)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

Built with ❤️ using Neon.tech PostgreSQL
