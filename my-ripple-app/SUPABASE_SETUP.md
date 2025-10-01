# Supabase Setup Guide for SnackPDF

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - **Name**: SnackPDF
   - **Database Password**: (generate a strong password and save it securely)
   - **Region**: Choose closest to Edinburgh, UK (eu-west-2 or eu-west-1)
5. Click "Create new project"
6. Wait for project to be provisioned (2-3 minutes)

## 2. Get API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (this is safe to use in the browser)
3. Add these to your `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 3. Enable Email Authentication

1. Go to **Authentication** > **Providers**
2. Find **Email** provider
3. Enable it (should be enabled by default)
4. Configure settings:
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations
   - Set **Confirm email** to ON
   - Set **Secure email change** to ON

## 4. Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. Customise the following templates with SnackPDF branding:

### Confirm Signup Template:
```html
<h2>Welcome to SnackPDF!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create an account with SnackPDF, you can safely ignore this email.</p>
<p>Best regards,<br>The SnackPDF Team</p>
```

### Reset Password Template:
```html
<h2>Reset Your SnackPDF Password</h2>
<p>You requested to reset your password. Click the link below to create a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset your password</a></p>
<p>If you didn't request a password reset, you can safely ignore this email.</p>
<p>Best regards,<br>The SnackPDF Team</p>
```

### Magic Link Template:
```html
<h2>Sign in to SnackPDF</h2>
<p>Click the link below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to SnackPDF</a></p>
<p>If you didn't request this link, you can safely ignore this email.</p>
<p>Best regards,<br>The SnackPDF Team</p>
```

## 5. Configure Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Add the following URLs:

### Site URL:
```
http://localhost:5173
```

### Redirect URLs (add both):
```
http://localhost:5173
http://localhost:5173/#/auth/callback
```

**Note**: When deploying to production, add your production URLs here as well.

## 6. Run Complete SQL Setup

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire SQL script below:

```sql
-- ============================================
-- SnackPDF Database Setup
-- ============================================
-- This script creates all necessary tables, policies, and functions
-- for SnackPDF with file size limit enforcement based on subscription

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores additional user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
-- Stores Stripe subscription information
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);

-- ============================================
-- 3. USER FILE LIMITS TABLE
-- ============================================
-- Tracks file size limits per user based on subscription
CREATE TABLE user_file_limits (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  max_file_size_mb DECIMAL(10, 2) DEFAULT 1.0 NOT NULL,
  is_subscribed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE user_file_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policy for user_file_limits
CREATE POLICY "Users can view own file limits"
  ON user_file_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX user_file_limits_user_id_idx ON user_file_limits(user_id);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Function: Handle new user creation
-- Creates profile and sets default file limit (1MB for free users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );

  -- Insert default file limit (1MB for free users)
  INSERT INTO public.user_file_limits (user_id, max_file_size_mb, is_subscribed)
  VALUES (NEW.id, 1.0, FALSE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update file limit based on subscription
-- Called when subscription status changes
CREATE OR REPLACE FUNCTION public.update_user_file_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- If subscription is active, set unlimited (or very high limit)
  IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
    UPDATE public.user_file_limits
    SET
      max_file_size_mb = 999999.99, -- Effectively unlimited
      is_subscribed = TRUE,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE
    -- If subscription is not active, revert to 1MB limit
    UPDATE public.user_file_limits
    SET
      max_file_size_mb = 1.0,
      is_subscribed = FALSE,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's max file size
-- Helper function to check file size limit
CREATE OR REPLACE FUNCTION public.get_user_max_file_size(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_max_size DECIMAL;
BEGIN
  SELECT max_file_size_mb INTO v_max_size
  FROM public.user_file_limits
  WHERE user_id = p_user_id;

  -- Return 1MB if no record found (shouldn't happen with trigger)
  RETURN COALESCE(v_max_size, 1.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user can upload file
-- Returns TRUE if file size is within limit, FALSE otherwise
CREATE OR REPLACE FUNCTION public.can_upload_file(p_user_id UUID, p_file_size_mb DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_size DECIMAL;
BEGIN
  SELECT max_file_size_mb INTO v_max_size
  FROM public.user_file_limits
  WHERE user_id = p_user_id;

  -- Default to 1MB if no record found
  v_max_size := COALESCE(v_max_size, 1.0);

  RETURN p_file_size_mb <= v_max_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Trigger: Create profile and file limit on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update file limit when subscription changes
CREATE TRIGGER on_subscription_changed
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_file_limit();

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Free users: 1MB file size limit
-- Subscribed users (£1/month): Unlimited file size
--
-- To check a user's file limit in your application:
-- SELECT max_file_size_mb, is_subscribed FROM user_file_limits WHERE user_id = 'user-uuid';
--
-- To check if a user can upload a file:
-- SELECT can_upload_file('user-uuid', 5.5); -- Returns TRUE or FALSE
```

## 8. Test Authentication

1. Try signing up with a test email
2. Check your email for the confirmation link
3. Confirm your email
4. Try signing in with your credentials

## 9. Production Deployment

When deploying to production:
1. Update the Site URL and Redirect URLs in Supabase dashboard
2. Update your `.env` file with production values
3. Consider setting up a custom SMTP provider for emails (Settings > Auth > SMTP Settings)

## Troubleshooting

- **Email not received**: Check spam folder, verify SMTP settings
- **Redirect not working**: Ensure redirect URLs are correctly configured
- **Authentication errors**: Check browser console for detailed error messages
- **RLS policies**: If data access issues, verify Row Level Security policies are correct

