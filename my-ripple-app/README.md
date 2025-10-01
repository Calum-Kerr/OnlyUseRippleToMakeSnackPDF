# SnackPDF

A modern, fast PDF manipulation web application built with Ripple, Supabase, and Stripe.

## Overview

SnackPDF is a comprehensive PDF tool platform that allows users to organise, convert, sign, and edit PDF documents. The application features a freemium model with a £1/month subscription for unlimited file uploads.

### Key Features

- **Authentication**: Secure email/password authentication with Supabase
- **Subscription Management**: Stripe integration for £1/month subscriptions
- **File Size Limits**: 1MB for free users, unlimited for subscribers
- **Responsive Design**: Mobile-first design with hamburger menu
- **Modern UI**: Clean interface with brand colours (#238287 green)
- **British English**: All text uses British spelling conventions

### Tech Stack

- **Frontend**: Ripple (TypeScript UI framework)
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **Payments**: Stripe (Subscriptions, Checkout, Customer Portal)
- **Styling**: CSS with custom properties
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Project Status

**Current Phase**: Foundation Complete ✅

The application foundation is complete with:
- ✅ Authentication system (sign up, sign in, password reset)
- ✅ Subscription integration (Stripe setup, status display)
- ✅ Navigation system (left nav, top nav, breadcrumbs, mobile menu)
- ✅ Page structure (dashboard, tool pages)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Loading, error, and empty states
- ✅ British English throughout

**Next Steps**: PDF tool implementation, backend endpoints, production deployment

## Quick Start

### Prerequisites

- Node.js v22.20.0 or higher
- pnpm (or npm/yarn)
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Calum-Kerr/OnlyUseRippleToMakeSnackPDF.git
cd OnlyUseRippleToMakeSnackPDF/my-ripple-app
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRICE_ID=your_stripe_price_id
```

4. **Set up Supabase**:
   - Follow instructions in `SUPABASE_SETUP.md`
   - Run the SQL script to create tables and functions

5. **Set up Stripe**:
   - Follow instructions in `STRIPE_SETUP.md`
   - Create product and get price ID

6. **Start development server**:
```bash
pnpm dev
```

7. **Open browser**:
```
http://localhost:5173
```

## Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**: Complete Supabase configuration guide
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)**: Complete Stripe configuration guide
- **[WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md)**: Backend webhook implementation
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)**: Brand guidelines and code style
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**: Comprehensive testing procedures
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Production deployment guide

## Project Structure

```
my-ripple-app/
├── src/
│   ├── components/
│   │   ├── Auth/              # Authentication components
│   │   ├── Layout/            # Layout components (Loading, Error, Empty)
│   │   ├── Navigation/        # Navigation components
│   │   └── Subscription/      # Subscription components
│   ├── pages/                 # Page components
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   └── variables.css      # CSS custom properties
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions and services
├── .env.example               # Environment variables template
├── DEPLOYMENT.md              # Deployment guide
├── STRIPE_SETUP.md            # Stripe setup guide
├── STYLE_GUIDE.md             # Style guide
├── SUPABASE_SETUP.md          # Supabase setup guide
├── TESTING_GUIDE.md           # Testing guide
├── WEBHOOK_IMPLEMENTATION.md  # Webhook implementation guide
└── README.md                  # This file
```

## Available Scripts

```bash
# Development
pnpm dev          # Start development server (port 5173)

# Build
pnpm build        # Build for production

# Preview
pnpm preview      # Preview production build locally
```

## Features

### Authentication
- Email/password sign up with email verification
- Sign in with existing account
- Forgot password flow
- Reset password flow
- Protected routes
- Session management

### Subscription
- Free plan: 1MB file size limit
- Pro plan: £1/month, unlimited file size
- Stripe Checkout integration
- Subscription status display
- File size limit enforcement


### Navigation
- Left sidebar navigation (260px wide)
- Top navigation with breadcrumbs and search
- Mobile hamburger menu
- Footer with links
- Responsive design

### Pages
- **Dashboard**: Overview with subscription status and quick actions
- **Organise**: Merge, split, rotate PDFs (coming soon)
- **Convert to PDF**: Convert various formats to PDF (coming soon)
- **Convert from PDF**: Export PDFs to other formats (coming soon)
- **Sign & Security**: Digital signatures, passwords (coming soon)
- **View & Edit**: Annotate, highlight, edit PDFs (coming soon)
- **Advanced**: OCR, batch processing, optimisation (coming soon)

## Design System

### Brand Colours
- **Primary Green**: `#238287` (buttons, links, active states)
- **Footer Background**: `#333333`
- **White**: `#ffffff` (backgrounds, text on dark)

### Typography
- **Font Family**: System font stack
- **Font Sizes**: xs (12px) to 4xl (36px)
- **Font Weights**: Normal (400) to Bold (700)
- **Line Heights**: Tight (1.25) to Relaxed (1.75)

### Spacing
- **Scale**: xs (4px) to 3xl (64px)
- **Consistent**: Use CSS variables throughout

### Components
- **Buttons**: Primary, secondary, disabled states
- **Forms**: Inputs, validation, focus states
- **Loading**: Spinner with brand colours
- **Error**: Error message with retry option
- **Empty**: Empty state with action button

## British English

All user-facing text uses British English spelling:
- organise (not organize)
- colour (not color)
- centre (not center)
- £ (not $)
- DD/MM/YYYY date format

See `STYLE_GUIDE.md` for complete list.

## Testing

Run through the testing guide before deploying. See `TESTING_GUIDE.md` for comprehensive testing procedures.

Key areas to test:
- Authentication flows
- Subscription flows
- Navigation and routing
- Responsive design
- Browser compatibility
- Accessibility

## Deployment

Deploy to Vercel, Netlify, or any static hosting provider:

```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## Known Limitations

1. **Stripe Checkout**: Requires backend implementation (see `WEBHOOK_IMPLEMENTATION.md`)
2. **PDF Tools**: All tool pages are placeholders
3. **Search**: Currently logs to console
4. **Legal Pages**: Need content
5. **Feature Request**: Needs implementation

## Acknowledgements

- **Ripple**: [trueadm/ripple](https://github.com/trueadm/ripple)
- **Supabase**: [supabase.com](https://supabase.com)
- **Stripe**: [stripe.com](https://stripe.com)

## Roadmap

### Phase 1-7: Foundation ✅
- [x] Project setup
- [x] Authentication system
- [x] Subscription integration
- [x] Navigation system
- [x] Page structure
- [x] Responsive design
- [x] Styling and polish

### Phase 8: Testing & Deployment 🚧
- [x] Testing guide
- [x] Deployment documentation
- [ ] Production deployment
- [ ] Monitoring setup

### Future Phases
- [ ] Implement PDF merge tool
- [ ] Implement PDF split tool
- [ ] Implement PDF rotation tool
- [ ] Implement format conversion tools
- [ ] Implement digital signature tool
- [ ] Implement PDF viewer/editor
- [ ] Implement OCR tool
- [ ] Implement batch processing
- [ ] Add analytics
- [ ] Add error monitoring
- [ ] SEO optimisation
- [ ] Performance optimisation

---

Built with Ripple, Supabase, and Stripe