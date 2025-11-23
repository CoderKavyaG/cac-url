# PostgreSQL + OTP Authentication Setup Guide

## Overview
This guide walks you through setting up the URL Shortener with PostgreSQL database and OTP-based email authentication using Gmail.

---

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user (you'll need this)
4. Complete the installation with default settings (port 5432)
5. PostgreSQL will start automatically

### Verify Installation
Open PowerShell and run:
```powershell
psql --version
```

---

## Step 2: Create PostgreSQL Database

1. Open pgAdmin (installed with PostgreSQL) or use psql command line:

```powershell
psql -U postgres
```

2. When prompted, enter the password you set during installation

3. Create the database:
```sql
CREATE DATABASE cac_url;
\q
```

**Database Name:** `cac_url` (matches your .env file)

---

## Step 3: Configure Gmail App Password

OTP emails are sent via Gmail. You need to:

1. Enable 2-Factor Authentication on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password

3. Update your `.env` file:
```
GMAIL_USER="your-email@gmail.com"
GMAIL_PASS="your-16-char-app-password"
```

---

## Step 4: Update Backend .env File

Update `backend/.env` with your actual values:

```
PORT=3000
JWT_SECRET="Kavyasecretkey12323"

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cac_url
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# OTP Settings
OTP_EXPIRY=600
MAX_OTP_ATTEMPTS=5
```

---

## Step 5: Install Dependencies

### Backend
```powershell
cd backend
npm install
```

Verify these packages are installed:
- `pg` - PostgreSQL driver
- `sequelize` - ORM
- `nodemailer` - Email service
- `dotenv` - Environment variables

### Frontend
```powershell
cd frontend
npm install
```

---

## Step 6: Start the Application

### Terminal 1: Backend
```powershell
cd backend
npm start
```

Expected output:
```
✓ Database synchronized successfully
✓ Server is running on port 3000
✓ PostgreSQL database connected: cac_url
```

### Terminal 2: Frontend
```powershell
cd frontend
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
```

---

## Step 7: Test OTP Authentication

1. Open http://localhost:5173 in your browser
2. Click "Sign In / Create Account"
3. Enter your email address
4. Click "Send OTP"
5. Check your Gmail inbox for the OTP code
6. Enter the 6-digit OTP
7. Click "Verify OTP"
8. You're logged in! 🎉

---

## Authentication Flow

### New User Signup
```
User enters email → Server sends OTP via Gmail → User enters OTP → New account created & logged in
```

### Existing User Login
```
User enters email → Server sends OTP via Gmail → User enters OTP → Existing account logged in
```

### Key Features
- **OTP Expiry**: 10 minutes (600 seconds)
- **Max Attempts**: 5 failed OTP attempts per request
- **JWT Token**: 7 days expiration
- **No Passwords**: 100% email-based authentication

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### URLs Table
```sql
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  originalUrl TEXT NOT NULL,
  shortId VARCHAR(50) UNIQUE NOT NULL,
  customAlias VARCHAR(255),
  userId INTEGER REFERENCES users(id),
  clicks INTEGER DEFAULT 0,
  clickHistory JSON DEFAULT '[]',
  isDeleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

### OTPs Table
```sql
CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Authentication
- **POST** `/auth/send-otp` - Send OTP to email
  ```json
  { "email": "user@example.com" }
  ```

- **POST** `/auth/verify-otp` - Verify OTP and login/signup
  ```json
  { "email": "user@example.com", "otp": "123456" }
  ```

### URL Management
- **POST** `/shorten` - Create short URL
- **GET** `/urls` - Get user's URLs (protected)
- **DELETE** `/urls/:shortId` - Delete URL (protected)
- **PUT** `/urls/:shortId/alias` - Set custom alias (protected)
- **POST** `/urls/:shortId/recover` - Recover deleted URL (protected)

---

## Troubleshooting

### PostgreSQL Connection Error
**Problem**: "ECONNREFUSED 127.0.0.1:5432"
- Check if PostgreSQL is running
- Windows: Start PostgreSQL service from Services app
- Verify credentials in `.env` match your PostgreSQL user

### Gmail OTP Not Received
**Problem**: "Failed to send OTP"
- Verify `GMAIL_USER` and `GMAIL_PASS` are correct
- Check Gmail App Passwords are enabled (not regular Gmail password)
- Check spam/promotions folder
- Verify 2-Factor Authentication is enabled on Gmail

### Database Table Not Created
**Problem**: Tables don't exist after starting
- Delete the database and recreate it
- Restart the backend server (Sequelize will auto-create tables)

### OTP Code Mismatch
**Problem**: "Invalid OTP" error
- OTP is case-sensitive and 6 digits only
- Check expiration time (10 minutes)
- Make sure you copied the OTP correctly from email

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Backend server port | 3000 |
| JWT_SECRET | Secret key for signing JWT tokens | Your-Secret-Key |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | cac_url |
| DB_USER | PostgreSQL username | postgres |
| DB_PASSWORD | PostgreSQL password | your_password |
| GMAIL_USER | Gmail email address | user@gmail.com |
| GMAIL_PASS | Gmail app-specific password | 16-char-app-password |
| OTP_EXPIRY | OTP validity in seconds | 600 |
| MAX_OTP_ATTEMPTS | Max failed OTP attempts | 5 |

---

## File Structure Changes (v2)

### Backend
```
backend/
├── config/
│   └── database.js (NEW - Sequelize config)
├── models/
│   ├── User.js (UPDATED - Sequelize)
│   ├── Url.js (UPDATED - Sequelize)
│   └── Otp.js (NEW - Sequelize)
├── services/
│   └── emailService.js (NEW - Nodemailer)
├── routes/
│   └── auth.js (UPDATED - OTP flow)
├── middleware/
│   └── auth.js (unchanged)
└── server.js (UPDATED - Sequelize sync)
```

### Frontend
```
frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx (UPDATED - OTP flow)
│   └── components/
│       └── SignUpModal.jsx (UPDATED - OTP form)
```

---

## Next Steps

1. ✅ PostgreSQL installed and configured
2. ✅ Gmail app password generated
3. ✅ Backend models migrated to Sequelize
4. ✅ Frontend updated with OTP flow
5. Start backend and frontend
6. Test the OTP authentication
7. Create a short URL and verify analytics work

Happy shortening! 🚀
