# SnackPDF Deployment Guide

This guide covers deploying SnackPDF to production.

## Prerequisites

Before deploying:
1. ✅ All tests pass (see `TESTING_GUIDE.md`)
2. ✅ Supabase project is configured
3. ✅ Stripe account is set up
4. ✅ Domain name is ready (optional)

## Environment Variables

### Required Variables

Create a `.env.production` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
VITE_STRIPE_PRICE_ID=price_your_price_id
```

### Important Notes

- **Never commit `.env` files to version control**
- Use **live** keys for production (not test keys)
- Supabase anon key is safe to expose in client-side code
- Stripe publishable key is safe to expose in client-side code
- Keep service role keys and secret keys secure (server-side only)

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides excellent support for static sites with serverless functions.

#### Steps:

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.production`
   - Set for "Production" environment

5. **Configure Build Settings**:
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

6. **Deploy to Production**:
```bash
vercel --prod
```

#### Custom Domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Option 2: Netlify

Netlify is another excellent option for static sites.

#### Steps:

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**:
```bash
netlify login
```

3. **Initialize**:
```bash
netlify init
```

4. **Configure Build Settings**:
   - Build Command: `pnpm build`
   - Publish Directory: `dist`

5. **Set Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add all variables from `.env.production`

6. **Deploy**:
```bash
netlify deploy --prod
```

### Option 3: Static Hosting (Cloudflare Pages, GitHub Pages, etc.)

For pure static hosting without serverless functions:

1. **Build the project**:
```bash
pnpm build
```

2. **Upload `dist` folder** to your hosting provider

3. **Configure environment variables** in your hosting provider's dashboard

**Note**: Stripe checkout and webhooks will require a separate backend service.

## Supabase Configuration

### 1. Update Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL**:
```
https://yourdomain.com
```

**Redirect URLs** (add both):
```
https://yourdomain.com
https://yourdomain.com/#/auth/callback
```

### 2. Configure Email Templates

Update email templates with your production domain:
- Confirmation emails
- Password reset emails
- Magic link emails

### 3. Enable Production Mode

Ensure your Supabase project is in production mode with appropriate rate limits and security settings.

### 4. Set Up Row Level Security (RLS)

Verify all RLS policies are in place:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All tables should have rowsecurity = true
```

## Stripe Configuration

### 1. Switch to Live Mode

In Stripe Dashboard:
1. Toggle from "Test mode" to "Live mode" (top right)
2. Complete account activation if not done

### 2. Create Live Product

1. Go to Products → Add product
2. Create "SnackPDF Pro" product
3. Set price to £1.00 GBP monthly
4. Copy the **live** Price ID (starts with `price_`)
5. Update `VITE_STRIPE_PRICE_ID` in production environment

### 3. Get Live API Keys

1. Go to Developers → API keys
2. Copy **Publishable key** (starts with `pk_live_`)
3. Update `VITE_STRIPE_PUBLISHABLE_KEY` in production environment
4. Keep **Secret key** secure (for backend/serverless functions only)

### 4. Set Up Webhooks

#### For Vercel/Netlify:

1. Deploy your webhook endpoint (see `WEBHOOK_IMPLEMENTATION.md`)
2. In Stripe Dashboard → Developers → Webhooks
3. Click "Add endpoint"
4. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your serverless function environment variables

### 5. Enable Customer Portal

1. Go to Settings → Billing → Customer portal
2. Click "Activate"
3. Configure what customers can do:
   - ✅ Cancel subscriptions
   - ✅ Update payment methods
   - ✅ View invoices

## Build Process

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Tests

```bash
# Type checking
pnpm run type-check

# Linting (if configured)
pnpm run lint
```

### 3. Build for Production

```bash
pnpm build
```

This creates an optimised production build in the `dist` folder.

### 4. Preview Build Locally

```bash
pnpm preview
```

Test the production build locally before deploying.

## Post-Deployment Checklist

After deploying, verify:

### Functionality
- [ ] Application loads correctly
- [ ] Sign up flow works
- [ ] Email verification works
- [ ] Sign in flow works
- [ ] Password reset works
- [ ] Navigation works
- [ ] Subscription status displays correctly
- [ ] All pages load correctly

### Configuration
- [ ] Environment variables are set correctly
- [ ] Supabase redirect URLs are updated
- [ ] Stripe webhooks are configured
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active (HTTPS)

### Security
- [ ] No sensitive keys in client-side code
- [ ] RLS policies are enabled
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images are optimised
- [ ] Assets are cached correctly
- [ ] No console errors

### SEO (Optional)
- [ ] Meta tags are set
- [ ] Favicon is configured
- [ ] robots.txt is configured
- [ ] Sitemap is generated

## Monitoring & Maintenance

### 1. Error Monitoring

Consider setting up error monitoring:
- **Sentry**: Real-time error tracking
- **LogRocket**: Session replay and error tracking
- **Rollbar**: Error monitoring and alerting

Example Sentry setup:
```bash
pnpm add @sentry/browser
```

```typescript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

### 2. Analytics

Consider adding analytics:
- **Plausible**: Privacy-friendly analytics
- **Google Analytics**: Comprehensive analytics
- **Fathom**: Simple, privacy-focused analytics

### 3. Uptime Monitoring

Set up uptime monitoring:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **StatusCake**: Website monitoring

### 4. Backup Strategy

- **Supabase**: Automatic daily backups (check your plan)
- **Database exports**: Regular manual exports
- **Code**: Version control with Git

## Troubleshooting

### Issue: Authentication not working

**Solution**:
1. Check Supabase redirect URLs are correct
2. Verify environment variables are set
3. Check browser console for errors
4. Verify Supabase project is active

### Issue: Stripe checkout fails

**Solution**:
1. Verify you're using live keys (not test keys)
2. Check webhook endpoint is accessible
3. Verify webhook signing secret is correct
4. Check Stripe Dashboard for errors

### Issue: Styles not loading

**Solution**:
1. Clear browser cache
2. Check build output includes CSS files
3. Verify asset paths are correct
4. Check CDN/hosting configuration

### Issue: 404 errors on refresh

**Solution**:
Configure your hosting provider for SPA routing:

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Scaling Considerations

As your user base grows:

### Database
- Monitor Supabase usage
- Upgrade plan if needed
- Optimise queries
- Add indexes for frequently queried fields

### Storage
- If adding file storage, use Supabase Storage or S3
- Implement file size limits (already configured)
- Consider CDN for static assets

### Performance
- Enable caching headers
- Use CDN for assets
- Optimise images
- Lazy load components

### Costs
- **Supabase**: Free tier → Pro ($25/month)
- **Stripe**: 1.5% + 20p per transaction (UK)
- **Hosting**: Vercel/Netlify free tier → Pro plans
- **Domain**: ~£10-15/year

## Support & Resources

- **Ripple Documentation**: [GitHub](https://github.com/trueadm/ripple)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)

## Next Steps

After successful deployment:

1. **Monitor**: Set up monitoring and analytics
2. **Test**: Perform thorough testing in production
3. **Iterate**: Gather user feedback and improve
4. **Scale**: Optimise performance as needed
5. **Maintain**: Keep dependencies updated
6. **Backup**: Regular database backups
7. **Security**: Regular security audits

## Emergency Procedures

### Rollback Deployment

**Vercel**:
```bash
vercel rollback
```

**Netlify**:
1. Go to Deploys
2. Find previous successful deploy
3. Click "Publish deploy"

### Database Restore

1. Go to Supabase Dashboard → Database → Backups
2. Select backup to restore
3. Follow restoration process

### Take Site Offline

Add maintenance page to your hosting provider or update DNS to point to a maintenance page.

