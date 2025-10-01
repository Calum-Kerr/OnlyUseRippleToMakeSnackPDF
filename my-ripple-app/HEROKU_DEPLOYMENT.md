# Heroku Deployment Summary

## Deployment Details

**App Name**: snackpdf  
**URL**: https://snackpdf-46e2f908f9d6.herokuapp.com/  
**Git Remote**: https://git.heroku.com/snackpdf.git  
**Status**: ✅ Successfully Deployed

## What Was Done

### 1. Created Express Server
Created `server.js` to serve the static files built by Vite:
- Serves files from `dist/` directory
- Handles client-side routing (sends all requests to index.html)
- Runs on PORT provided by Heroku

### 2. Updated package.json
- Changed `start` script to `node server.js`
- Added `heroku-postbuild` script to run `pnpm build`
- Added `express` as a dependency
- Updated app name to "snackpdf"
- Set Node.js engine to >=22.0.0

### 3. Created Procfile
Created `Procfile` with:
```
web: node server.js
```

### 4. Set Environment Variables
Configured the following environment variables on Heroku:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRICE_ID`

### 5. Deployed to Heroku
- Initialised git repository in `my-ripple-app/`
- Committed all files
- Added Heroku remote
- Pushed to Heroku
- Build succeeded with Vite production build

## Deployment Commands Used

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create snackpdf

# Install Express
pnpm install express

# Initialise git and commit
git init
git add .
git commit -m "Initial commit"

# Add Heroku remote
git remote add heroku https://git.heroku.com/snackpdf.git

# Set environment variables
heroku config:set VITE_SUPABASE_URL=... --app snackpdf
heroku config:set VITE_SUPABASE_ANON_KEY=... --app snackpdf
heroku config:set VITE_STRIPE_PUBLISHABLE_KEY=... --app snackpdf
heroku config:set VITE_STRIPE_PRICE_ID=... --app snackpdf

# Deploy
git push heroku master

# Open app
heroku open --app snackpdf
```

## Build Output

```
vite v7.1.7 building for production...
✓ 36 modules transformed.
dist/index.html                    0.70 kB │ gzip: 0.42 kB
dist/assets/favicon-b6ivA8ez.ico  15.41 kB
dist/assets/index-DYScuG_S.css     7.03 kB │ gzip: 2.15 kB
dist/assets/index-BJxWS6vC.js      8.54 kB │ gzip: 3.87 kB
✓ built in 281ms
```

## Server Logs

```
Server is running on port 39441
State changed from starting to up
```

All routes are working correctly:
- `/` - Main page (200 OK)
- `/assets/index-BJxWS6vC.js` - JavaScript bundle (200 OK)
- `/assets/index-DYScuG_S.css` - CSS bundle (200 OK)
- `/assets/favicon-b6ivA8ez.ico` - Favicon (200 OK)

## Next Steps

### 1. Update Supabase Redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:

**Site URL**:
```
https://snackpdf-46e2f908f9d6.herokuapp.com
```

**Redirect URLs** (add both):
```
https://snackpdf-46e2f908f9d6.herokuapp.com
https://snackpdf-46e2f908f9d6.herokuapp.com/#/auth/callback
```

### 2. Update Stripe Webhook URL
In Stripe Dashboard → Developers → Webhooks:

Once you implement the webhook endpoint (see `WEBHOOK_IMPLEMENTATION.md`):
```
https://snackpdf-46e2f908f9d6.herokuapp.com/api/webhooks/stripe
```

### 3. Link Custom Domain (Optional)
You mentioned you'll link domains manually later. When ready:

```bash
# Add domain to Heroku
heroku domains:add yourdomain.com --app snackpdf

# Get DNS target
heroku domains --app snackpdf

# Update DNS records at your domain registrar
# Add CNAME record pointing to the DNS target provided by Heroku
```

Then update Supabase and Stripe URLs to use your custom domain.

### 4. Enable SSL (Automatic)
Heroku automatically provides SSL certificates for all apps. Your app is already accessible via HTTPS.

### 5. Monitor Application
```bash
# View logs
heroku logs --tail --app snackpdf

# Check dyno status
heroku ps --app snackpdf

# View config vars
heroku config --app snackpdf
```

## Useful Heroku Commands

```bash
# Restart app
heroku restart --app snackpdf

# Scale dynos
heroku ps:scale web=1 --app snackpdf

# Run bash on dyno
heroku run bash --app snackpdf

# View app info
heroku info --app snackpdf

# Open app in browser
heroku open --app snackpdf

# View releases
heroku releases --app snackpdf

# Rollback to previous release
heroku rollback --app snackpdf
```

## Updating the App

To deploy updates:

```bash
# Make your changes
# ...

# Commit changes
git add .
git commit -m "Your commit message"

# Push to Heroku
git push heroku master

# Heroku will automatically:
# 1. Run pnpm install
# 2. Run pnpm build (via heroku-postbuild)
# 3. Restart the app
```

## Cost

**Current Plan**: Free (Eco Dynos)
- 1000 free dyno hours per month
- App sleeps after 30 minutes of inactivity
- Wakes up on first request (may take a few seconds)

**To prevent sleeping** (requires paid plan):
- Upgrade to Basic or higher
- Cost: $7/month for Basic dyno

```bash
heroku ps:type basic --app snackpdf
```

## Troubleshooting

### App not loading
```bash
# Check logs
heroku logs --tail --app snackpdf

# Check dyno status
heroku ps --app snackpdf

# Restart app
heroku restart --app snackpdf
```

### Build failures
```bash
# Check build logs
heroku logs --tail --app snackpdf

# Ensure package.json has correct scripts
# Ensure all dependencies are listed
```

### Environment variables not working
```bash
# Check config vars
heroku config --app snackpdf

# Set missing vars
heroku config:set VAR_NAME=value --app snackpdf
```

## Files Added for Heroku Deployment

1. **server.js** - Express server to serve static files
2. **Procfile** - Tells Heroku how to run the app
3. **Updated package.json** - Added Express, updated scripts

## Repository Structure

The git repository is now in `my-ripple-app/` directory with:
- All source files
- Configuration files
- Documentation
- Heroku deployment files

The parent directory (`OnlyUseRippleToMakeSnackPDF/`) also has a git repository, but the Heroku deployment uses the `my-ripple-app/` repository.

## Success Indicators

✅ App created on Heroku  
✅ Environment variables configured  
✅ Build succeeded  
✅ Server started successfully  
✅ All routes returning 200 OK  
✅ Assets loading correctly  
✅ HTTPS enabled automatically  

Your SnackPDF application is now live at:
**https://snackpdf-46e2f908f9d6.herokuapp.com/**

