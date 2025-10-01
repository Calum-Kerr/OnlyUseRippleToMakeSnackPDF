# SnackPDF Testing Guide

This guide provides comprehensive testing procedures for all features of SnackPDF.

## Prerequisites

Before testing:
1. ✅ Supabase project is set up and configured
2. ✅ Environment variables are set in `.env`
3. ✅ Development server is running (`pnpm dev`)
4. ✅ Database tables and functions are created (run SQL from `SUPABASE_SETUP.md`)

## 1. Authentication Flow Testing

### 1.1 Sign Up Flow

**Test Case**: New user registration

**Steps**:
1. Navigate to `/auth/signup`
2. Fill in the form:
   - Name: "Test User" (optional)
   - Email: Use a valid test email
   - Password: "TestPass123" (meets requirements)
   - Confirm Password: "TestPass123"
3. Click "Create account"

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Success screen shows: "Check your email"
- ✅ Email address is displayed
- ✅ Confirmation email is sent to the provided address
- ✅ "Go to sign in" button appears

**Error Cases to Test**:
- Empty email → "Email is required"
- Invalid email format → "Please enter a valid email address"
- Weak password → "Must be at least 8 characters with uppercase, lowercase, and number"
- Passwords don't match → "Passwords do not match"
- Email already exists → "User already registered"

### 1.2 Email Verification

**Test Case**: Verify email address

**Steps**:
1. Check email inbox for confirmation email
2. Click the confirmation link in the email

**Expected Results**:
- ✅ Redirected to application
- ✅ User is automatically signed in
- ✅ Profile is created in `profiles` table
- ✅ File limit is set to 1MB in `user_file_limits` table

### 1.3 Sign In Flow

**Test Case**: Existing user sign in

**Steps**:
1. Navigate to `/auth/signin`
2. Enter email and password
3. Click "Sign in"

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Redirected to Dashboard (`/`)
- ✅ User name appears in greeting
- ✅ Left navigation shows user profile
- ✅ Subscription status is loaded

**Error Cases to Test**:
- Wrong password → "Invalid login credentials"
- Non-existent email → "Invalid login credentials"
- Empty fields → Appropriate validation messages

### 1.4 Forgot Password Flow

**Test Case**: Password reset request

**Steps**:
1. Navigate to `/auth/forgot-password`
2. Enter registered email address
3. Click "Send reset link"

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Success screen shows: "Check your email"
- ✅ Password reset email is sent
- ✅ "Back to sign in" button appears

### 1.5 Reset Password Flow

**Test Case**: Set new password

**Steps**:
1. Click reset link in email
2. Enter new password: "NewPass123"
3. Confirm new password: "NewPass123"
4. Click "Reset password"

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Success screen shows: "Password reset successful"
- ✅ "Go to sign in" button appears
- ✅ Can sign in with new password

**Error Cases to Test**:
- Weak password → Validation error
- Passwords don't match → "Passwords do not match"
- Expired reset link → "Reset link has expired"

### 1.6 Sign Out Flow

**Test Case**: User sign out

**Steps**:
1. While signed in, click user profile in left navigation
2. Click "Sign out" (if implemented) or call sign out function

**Expected Results**:
- ✅ User is signed out
- ✅ Redirected to `/auth/signin`
- ✅ Session is cleared
- ✅ Cannot access protected routes

## 2. Subscription Flow Testing

### 2.1 View Subscription Status (Free User)

**Test Case**: Free user views subscription

**Steps**:
1. Sign in as a user without subscription
2. View Dashboard

**Expected Results**:
- ✅ Subscription card shows "Free Plan"
- ✅ File size limit shows "1 MB"
- ✅ "Subscribe for £1/month" button appears
- ✅ Upgrade prompt is visible

### 2.2 Initiate Checkout (Placeholder)

**Test Case**: Attempt to subscribe

**Steps**:
1. Click "Subscribe for £1/month" button

**Expected Results**:
- ✅ Error message appears: "Checkout functionality requires a backend endpoint"
- ✅ Reference to `STRIPE_SETUP.md` is shown
- ✅ No errors in console (except expected message)

**Note**: Full checkout testing requires backend implementation (see `WEBHOOK_IMPLEMENTATION.md`)

### 2.3 View Subscription Status (Subscribed User)

**Test Case**: Subscribed user views status

**Prerequisites**: Manually add subscription to database

**Steps**:
1. Add test subscription to `subscriptions` table:
```sql
INSERT INTO subscriptions (id, user_id, status, price_id, current_period_start, current_period_end, cancel_at_period_end)
VALUES ('sub_test123', 'your-user-id', 'active', 'price_test', NOW(), NOW() + INTERVAL '1 month', false);
```
2. Refresh Dashboard

**Expected Results**:
- ✅ Subscription card shows "SnackPDF Pro"
- ✅ Status badge shows "Active"
- ✅ Plan shows "£1.00/month"
- ✅ Current period end date is displayed (DD/MM/YYYY format)
- ✅ Benefits list is shown
- ✅ No subscribe button appears

### 2.4 File Size Limit Check

**Test Case**: Verify file size limits

**Steps**:
1. Open browser console
2. Run:
```javascript
// For free user (should return 1.0)
const limit = await supabase.rpc('get_user_max_file_size', { p_user_id: 'your-user-id' });
console.log('File size limit:', limit);

// Check if can upload 2MB file (should return false for free user)
const canUpload = await supabase.rpc('can_upload_file', { 
  p_user_id: 'your-user-id', 
  p_file_size_mb: 2.0 
});
console.log('Can upload 2MB:', canUpload);
```

**Expected Results**:
- ✅ Free user: limit = 1.0 MB
- ✅ Free user: cannot upload > 1MB
- ✅ Subscribed user: limit = 999999.99 MB (unlimited)
- ✅ Subscribed user: can upload any size

## 3. Navigation Testing

### 3.1 Left Navigation

**Test Case**: Navigate between pages

**Steps**:
1. Click each section in left navigation:
   - Organise
   - Convert to PDF
   - Convert from PDF
   - Sign and Security
   - View and Edit
   - Advanced

**Expected Results**:
- ✅ Each page loads correctly
- ✅ Active route is highlighted with green border
- ✅ "Coming Soon" message appears on each page
- ✅ Planned features are listed
- ✅ URL updates correctly

### 3.2 Top Navigation Breadcrumbs

**Test Case**: Breadcrumb navigation

**Steps**:
1. Navigate to different pages
2. Observe breadcrumb trail
3. Click breadcrumb links

**Expected Results**:
- ✅ Breadcrumbs update based on current route
- ✅ Format: "Dashboard > Current Page"
- ✅ Clicking breadcrumb navigates to that page
- ✅ Current page is not clickable

### 3.3 Search Functionality

**Test Case**: Search input

**Steps**:
1. Type in search bar: "merge"
2. Observe console logs

**Expected Results**:
- ✅ Search is debounced (300ms delay)
- ✅ Console logs search query
- ✅ No errors occur

### 3.4 Mobile Navigation

**Test Case**: Mobile menu

**Steps**:
1. Resize browser to < 768px width
2. Click hamburger menu button
3. Click a navigation link
4. Click outside menu

**Expected Results**:
- ✅ Hamburger button appears on mobile
- ✅ Menu slides in from left
- ✅ Overlay backdrop appears
- ✅ Menu closes when clicking link
- ✅ Menu closes when clicking overlay
- ✅ Smooth transitions

### 3.5 Footer Links

**Test Case**: Footer navigation

**Steps**:
1. Scroll to footer
2. Click each footer link:
   - Privacy Policy
   - Terms & Conditions
   - Cookie Policy
   - Data Protection
   - LinkedIn

**Expected Results**:
- ✅ Legal pages navigate correctly (currently placeholder)
- ✅ LinkedIn opens in new tab
- ✅ Footer is positioned off-screen (requires scroll)
- ✅ Footer sections stack on mobile

## 4. Responsive Design Testing

### 4.1 Desktop (> 1024px)

**Test Case**: Desktop layout

**Expected Results**:
- ✅ Left navigation is visible (260px wide)
- ✅ Top navigation shows breadcrumbs and search
- ✅ Main content has xl padding
- ✅ Footer has 3-column grid
- ✅ Dashboard cards in grid layout

### 4.2 Tablet (640px - 1024px)

**Test Case**: Tablet layout

**Expected Results**:
- ✅ Left navigation is visible
- ✅ Layout adjusts appropriately
- ✅ Footer has 2-column grid
- ✅ Touch interactions work

### 4.3 Mobile (< 640px)

**Test Case**: Mobile layout

**Expected Results**:
- ✅ Hamburger menu appears
- ✅ Left navigation is hidden by default
- ✅ Breadcrumbs may be hidden
- ✅ Main content has md padding
- ✅ Footer has 1-column layout
- ✅ Dashboard cards stack vertically
- ✅ Quick actions stack vertically

## 5. Browser Compatibility Testing

Test on the following browsers:

### Chrome/Edge (Chromium)
- ✅ All features work
- ✅ Styles render correctly
- ✅ No console errors

### Firefox
- ✅ All features work
- ✅ Styles render correctly
- ✅ No console errors

### Safari
- ✅ All features work
- ✅ Styles render correctly
- ✅ No console errors
- ✅ Date formatting works (DD/MM/YYYY)

## 6. Accessibility Testing

### 6.1 Keyboard Navigation

**Test Case**: Navigate with keyboard only

**Steps**:
1. Use Tab key to navigate
2. Use Enter/Space to activate buttons
3. Use Escape to close menus

**Expected Results**:
- ✅ All interactive elements are reachable
- ✅ Focus order is logical
- ✅ Focus indicators are visible (green outline)
- ✅ Can navigate entire app with keyboard

### 6.2 Screen Reader

**Test Case**: Use with screen reader

**Expected Results**:
- ✅ All content is announced
- ✅ ARIA labels are present
- ✅ Form fields have labels
- ✅ Buttons have descriptive text

## 7. Performance Testing

### 7.1 Load Time

**Test Case**: Initial page load

**Expected Results**:
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ No layout shifts

### 7.2 Navigation Speed

**Test Case**: Route changes

**Expected Results**:
- ✅ Route changes are instant
- ✅ No flickering
- ✅ Smooth transitions

## Testing Checklist

Before deployment, verify:

- [ ] All authentication flows work correctly
- [ ] Subscription status displays correctly
- [ ] All navigation links work
- [ ] Breadcrumbs update correctly
- [ ] Search input works (debounced)
- [ ] Mobile menu works correctly
- [ ] Footer links work
- [ ] Responsive design works on all screen sizes
- [ ] All browsers render correctly
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] British English spelling throughout
- [ ] Brand colours applied consistently
- [ ] No console errors
- [ ] No TypeScript errors

## Known Limitations

1. **Stripe Checkout**: Requires backend implementation (see `WEBHOOK_IMPLEMENTATION.md`)
2. **PDF Tools**: All tool pages are placeholders ("Coming Soon")
3. **Search**: Currently logs to console, needs implementation
4. **Legal Pages**: Currently placeholders, need content
5. **Feature Request**: Button shows alert, needs implementation

## Next Steps

1. Implement Supabase Edge Functions for Stripe integration
2. Build actual PDF manipulation tools
3. Add content to legal pages
4. Implement search functionality
5. Add feature request form
6. Set up error monitoring (e.g., Sentry)
7. Set up analytics (e.g., Plausible, Google Analytics)

