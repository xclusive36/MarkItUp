# Authentication Integration Guide

## Overview

The MarkItUp application now includes complete authentication with automatic redirection for unauthenticated users. When `DISABLE_AUTH=false`, users will be redirected to the login page if they're not authenticated.

## What's New

### 1. **AuthGuard Component** (`/src/components/AuthGuard.tsx`)
- Automatically checks authentication status on page load
- Redirects unauthenticated users to `/auth/login`
- Shows a loading spinner while checking auth status
- Respects the `NEXT_PUBLIC_DISABLE_AUTH` environment variable for development

### 2. **App Layout Protection** (`/src/app/layout.tsx`)
- All pages are now wrapped with the `AuthGuard` component
- Authentication check happens before any content is rendered
- Maintains existing providers and context structure

### 3. **User Menu in Header** (`/src/components/AppHeader.tsx`)
- Shows user email in the header when authenticated
- Dropdown menu with:
  - **Dashboard**: View account info and quotas
  - **Profile**: Manage account settings
  - **Logout**: Sign out and return to login
- Only visible when authentication is enabled (`NEXT_PUBLIC_DISABLE_AUTH=false`)

## Environment Configuration

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Server-side auth bypass (for API routes)
DISABLE_AUTH=false

# Client-side auth bypass (for UI components)
NEXT_PUBLIC_DISABLE_AUTH=false
```

**Important:** Both variables must be set to the same value:
- Set both to `false` for production (authentication required)
- Set both to `true` for development (bypass authentication)

### Why Two Variables?

- `DISABLE_AUTH`: Used by server-side code (API routes, middleware)
- `NEXT_PUBLIC_DISABLE_AUTH`: Used by client-side React components

Next.js only exposes environment variables prefixed with `NEXT_PUBLIC_` to the browser.

## User Flows

### First-Time Setup

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Create an Account**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to `/auth/login`
   - Click "Sign up" link
   - Fill out the registration form
   - You'll be automatically logged in and redirected to the app

3. **Subsequent Logins**
   - Visit `http://localhost:3000`
   - If not logged in, you'll be redirected to `/auth/login`
   - Enter your credentials
   - Access the full application

### Development Workflow

If you want to bypass authentication during development:

1. Update `.env.local`:
   ```bash
   DISABLE_AUTH=true
   NEXT_PUBLIC_DISABLE_AUTH=true
   ```

2. Restart your development server:
   ```bash
   # Press Ctrl+C to stop the server
   npm run dev
   ```

3. The app will now work without requiring login

## Available Pages

### Public Pages (No Authentication Required)
- `/auth/login` - Sign in page
- `/auth/signup` - Registration page
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password` - Reset password with token
- `/auth/verify-email` - Email verification

### Protected Pages (Authentication Required)
- `/` - Main editor and PKM features
- `/dashboard` - User account dashboard
- All other app routes

## User Menu Features

When authenticated, the user menu in the header provides:

1. **Dashboard**
   - View account information
   - Check quota usage (notes, storage, AI requests)
   - See current subscription plan

2. **Profile** (via UserProfile modal)
   - Manage account settings
   - Update profile information
   - View collaboration settings

3. **Logout**
   - Sign out of the application
   - Clears session cookies
   - Redirects to login page

## Testing the Authentication Flow

### Test Case 1: New User Registration
1. Set `NEXT_PUBLIC_DISABLE_AUTH=false`
2. Visit `http://localhost:3000`
3. Should redirect to `/auth/login`
4. Click "Sign up"
5. Complete registration form
6. Should auto-login and redirect to home

### Test Case 2: Returning User Login
1. Ensure you're logged out
2. Visit `http://localhost:3000`
3. Should redirect to `/auth/login`
4. Enter credentials
5. Should redirect to home page

### Test Case 3: Protected Routes
1. While logged out, try to access `/dashboard`
2. Should redirect to `/auth/login`
3. After login, should access dashboard successfully

### Test Case 4: Logout
1. While logged in, click user menu
2. Click "Logout"
3. Should redirect to `/auth/login`
4. Session should be cleared

## Migration from Development to Production

### Before Production Deployment:

1. **Update Environment Variables**
   ```bash
   DISABLE_AUTH=false
   NEXT_PUBLIC_DISABLE_AUTH=false
   ```

2. **Generate Secure Keys**
   ```bash
   # Generate JWT secret
   openssl rand -base64 32
   
   # Generate encryption key
   openssl rand -hex 16
   ```

3. **Update `.env.local` or Production Environment**
   ```bash
   JWT_SECRET=<your-generated-jwt-secret>
   ENCRYPTION_KEY=<your-generated-encryption-key>
   ```

4. **Test Authentication Flow**
   - Create a test account
   - Verify email (if enabled)
   - Test login/logout
   - Verify session persistence

5. **Deploy**
   - Ensure environment variables are set in production
   - Deploy application
   - Test authentication in production

## Troubleshooting

### Issue: Stuck in Redirect Loop
**Solution:** Check that both `DISABLE_AUTH` and `NEXT_PUBLIC_DISABLE_AUTH` are set to the same value and restart your dev server.

### Issue: User Menu Not Showing
**Solution:** Ensure `NEXT_PUBLIC_DISABLE_AUTH=false` is set. Restart dev server after changing env variables.

### Issue: "Failed to Fetch User" in Console
**Solution:** 
1. Make sure the API server is running
2. Check that `/api/auth/me` endpoint is working
3. Verify you have valid authentication cookies

### Issue: Can't Access Dashboard
**Solution:**
1. Ensure you're logged in
2. Check browser console for errors
3. Verify `/api/auth/me` returns user data

## Security Considerations

1. **Always use HTTPS in production** - Authentication tokens should never be transmitted over HTTP
2. **Keep JWT_SECRET and ENCRYPTION_KEY secure** - Never commit these to version control
3. **Rotate secrets regularly** - Change JWT_SECRET and ENCRYPTION_KEY periodically
4. **Enable email verification** - Configure SMTP settings for production
5. **Use strong passwords** - Enforce password requirements (8+ chars, uppercase, lowercase, number)

## Next Steps

1. **Set up email service** - Configure SMTP for email verification and password reset
2. **Enable OAuth providers** - Add Google/GitHub login options
3. **Configure quotas** - Set appropriate limits for your use case
4. **Add user settings page** - Allow users to change password, update profile
5. **Implement 2FA** - Add two-factor authentication for enhanced security

---

For more information, see:
- `AUTHENTICATION_SETUP.md` - Backend authentication setup
- `docs/MANAGED_HOSTING_IMPLEMENTATION_STATUS.md` - Full feature status
- `docs/MANAGED_HOSTING_REQUIREMENTS.md` - Technical requirements
