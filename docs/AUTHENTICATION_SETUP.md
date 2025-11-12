# Authentication Setup Guide

## Current Status

Your MarkItUp instance now has **full authentication** enabled. You're seeing 401 errors because:

1. ✅ Authentication is working correctly
2. ❌ No user account exists yet
3. ❌ Frontend doesn't have login UI yet

## Quick Fix Options

### Option A: Create a User Account (Recommended for Testing)

1. **Make sure your dev server is running:**
   ```bash
   npm run dev
   ```

2. **Create a user via API (use curl or Postman):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "Admin123!",
       "name": "Admin User"
     }'
   ```

3. **Login to get a session token:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "Admin123!"
     }'
   ```

   Save the `sessionToken` from the response.

4. **Use the token in requests:**
   - The login sets an `httpOnly` cookie automatically
   - Or include in header: `Authorization: Bearer YOUR_TOKEN`

### Option B: Temporarily Disable Auth (Development Only)

If you want to continue development without authentication:

1. **Switch back to the previous branch:**
   ```bash
   git stash
   git checkout ui-refinement-phase1
   ```

2. **Or create a development flag** to bypass auth in `middleware.ts`

### Option C: Use the Helper Script

Run the interactive user creation script:

```bash
node scripts/create-user.js
```

## What's Been Implemented

✅ **Backend (100% Complete)**
- User registration & login
- Session management (JWT + httpOnly cookies)
- Password hashing (bcrypt)
- Email verification system (not sending emails yet)
- Password reset system (not sending emails yet)
- Quota enforcement (free: 100 notes, 100MB storage, 20 AI requests/day)
- All API routes protected with user ownership

❌ **Frontend (Not Started)**
- Login page
- Signup page
- User dashboard
- Settings page

## Testing Authentication

### 1. Register a User
```bash
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "Test123!"
}
```

Response includes:
- `sessionToken` - Use in Authorization header
- Cookie is set automatically (httpOnly)

### 3. Access Protected Routes

The following routes now require authentication:
- `GET /api/files` - List your notes
- `POST /api/files` - Create note
- `GET /api/files/[filename]` - Read note
- `PUT /api/files/[filename]` - Update note
- `DELETE /api/files/[filename]` - Delete note
- `POST /api/ai` - AI assistant
- `GET /api/search-db` - Search (optional auth)

### 4. Check Your User Info
```bash
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

## Environment Setup

Make sure you have these in your `.env.local`:

```bash
# Required for production
JWT_SECRET=your-secret-key-at-least-32-characters-long
ENCRYPTION_KEY=your-32-byte-encryption-key-hex-encoded

# Generate them with:
# JWT_SECRET: openssl rand -base64 32
# ENCRYPTION_KEY: openssl rand -hex 16
```

For development, the app will auto-generate these if missing.

## Next Steps

To continue development with authentication:

1. **Create a test user** (Option A or C above)
2. **Build frontend login UI** (future work)
3. **Test with the session token**

To continue development **without** authentication:
1. Use `git stash` and switch branches
2. Or we can add a `DISABLE_AUTH=true` env flag for development

## Need Help?

Let me know which option you'd like to pursue:
- Continue with authentication (I can help build the login UI)
- Temporarily disable for development
- Create a development bypass flag
