# Backend API Requirements for Pitch It App

## Authentication Endpoints

### 1. Sign In
**POST** `/auth/signin`
```json
{
  "phoneNumber": "03001234567",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "03001234567",
      "fullName": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Sign Up
**POST** `/auth/signup`
```json
{
  "phoneNumber": "03001234567",
  "password": "password123",
  "fullName": "John Doe"
}
```

### 3. Google Sign In
**POST** `/auth/google`
```json
{
  "token": "google_id_token"
}
```

### 4. Send OTP (Fallback)
**POST** `/auth/send-otp`
```json
{
  "phoneNumber": "03001234567"
}
```

### 5. Verify OTP
**POST** `/auth/verify-otp`
```json
{
  "phoneNumber": "03001234567",
  "otp": "123456",
  "password": "password123",
  "fullName": "John Doe",
  "isSignup": true
}
```

### 6. Verify Token
**GET** `/auth/verify-token`
Headers: `Authorization: Bearer jwt_token`

### 7. Forgot Password
**POST** `/auth/forgot-password`
```json
{
  "phoneNumber": "03001234567"
}
```

### 8. Reset Password
**POST** `/auth/reset-password`
```json
{
  "phoneNumber": "03001234567",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Codes Table
```sql
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/arenapro_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_CLIENT_ID=your_google_client_id
BCRYPT_ROUNDS=12
```

## Security Features
1. **Password Hashing**: Use bcrypt with 12 rounds
2. **JWT Tokens**: Expire in 7 days, include user ID and role
3. **Rate Limiting**: Limit OTP requests to 3 per hour per phone number
4. **Input Validation**: Validate phone numbers, passwords, and all inputs
5. **CORS**: Configure for your frontend domain
6. **HTTPS**: Use SSL certificates in production

## Recommended Tech Stack
- **Backend**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT tokens with refresh token mechanism
- **SMS Service**: Twilio for OTP delivery
- **Caching**: Redis for OTP storage and rate limiting
- **Deployment**: Docker containers on AWS/GCP/Azure

## Implementation Priority
1. ✅ Basic sign in/sign up with phone and password
2. ✅ JWT token generation and verification
3. ✅ OTP fallback system
4. 🔄 Google OAuth integration
5. 🔄 Password reset functionality
6. 🔄 Rate limiting and security measures
7. 🔄 Database optimization and indexing