# SnackPDF Style Guide

## Brand Identity

### Colours
- **Primary Brand Green**: `#238287`
  - Used for: PDF text in logo, primary buttons, active navigation items, links, focus states
- **Footer Background**: `#333333`
  - Used for: Footer background only
- **White**: `#ffffff`
  - Used for: Snack text in logo, button text, card backgrounds

### Logo
The SnackPDF logo consists of two parts:
- **"Snack"** - Always in white (`#ffffff`)
- **"PDF"** - Always in brand green (`#238287`)

## Typography

### Font Families
- **Primary**: System font stack (San Francisco, Segoe UI, Roboto, etc.)
- **Monospace**: Courier New, Courier, monospace

### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)
- `--font-size-4xl`: 2.25rem (36px)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Line Heights
- **Tight**: 1.25 (for headings)
- **Normal**: 1.5 (for body text)
- **Relaxed**: 1.75 (for long-form content)

## Spacing

Use the spacing scale consistently:
- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)
- `--spacing-3xl`: 4rem (64px)

## British English Spelling

**IMPORTANT**: All user-facing text must use British English spelling conventions.

### Common Words
- ✅ **organise** (not organize)
- ✅ **colour** (not color)
- ✅ **centre** (not center)
- ✅ **licence** (noun, not license)
- ✅ **practise** (verb, not practice)
- ✅ **analyse** (not analyze)
- ✅ **catalogue** (not catalog)
- ✅ **dialogue** (not dialog)
- ✅ **favour** (not favor)
- ✅ **honour** (not honor)
- ✅ **labour** (not labor)
- ✅ **neighbour** (not neighbor)
- ✅ **behaviour** (not behavior)
- ✅ **defence** (not defense)
- ✅ **offence** (not offense)
- ✅ **programme** (not program, except for computer programs)
- ✅ **grey** (not gray)
- ✅ **travelled** (not traveled)
- ✅ **cancelled** (not canceled)

### Date Format
- Use DD/MM/YYYY format (e.g., 13/05/2024)
- Not MM/DD/YYYY (American format)

### Currency
- Use £ symbol for pounds sterling
- Format: £1.00 (not $1.00)
- Write out: "one pound" or "£1"

## Component Patterns

### Buttons
```css
.btn-primary {
  background-color: var(--brand-green);
  color: var(--brand-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-button-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Form Inputs
```css
input:focus {
  border-color: var(--brand-green);
  box-shadow: 0 0 0 3px rgba(35, 130, 135, 0.1);
}
```

### Loading States
Use the `<Loading />` component with brand green spinner:
```typescript
<Loading message="Loading..." size="medium" />
```

### Error States
Use the `<ErrorMessage />` component:
```typescript
<ErrorMessage 
  title="Something went wrong"
  message="Please try again later"
  onRetry={handleRetry}
/>
```

### Empty States
Use the `<EmptyState />` component:
```typescript
<EmptyState 
  icon="📭"
  title="No items found"
  message="Try adjusting your search criteria"
/>
```

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Navigation
- Hamburger menu appears on screens < 768px
- Left navigation slides in from left
- Overlay backdrop when menu is open
- Menu closes when clicking outside or on a link

### Layout
- Left navigation: 260px wide on desktop, full-screen overlay on mobile
- Top navigation: 64px height, sticky on scroll
- Main content: Responsive padding (xl on desktop, md on mobile)
- Footer: Stacked sections on mobile

## Accessibility

### Focus States
All interactive elements must have visible focus states:
```css
*:focus-visible {
  outline: 2px solid var(--brand-green);
  outline-offset: 2px;
}
```

### ARIA Labels
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for form field hints
- Use `role` attributes where appropriate

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should be logical
- Escape key should close modals/menus

## File Organisation

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components (Loading, Error, Empty)
│   ├── Navigation/     # Navigation components
│   └── Subscription/   # Subscription components
├── pages/              # Page components
├── styles/
│   ├── global.css      # Global styles
│   └── variables.css   # CSS custom properties
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and services
```

## Code Style

### Component Naming
- Use PascalCase for component names
- Use descriptive names (e.g., `SubscriptionButton`, not `SubBtn`)

### File Naming
- Components: PascalCase with `.ripple` extension
- Utilities: camelCase with `.ts` extension
- Types: camelCase with `.ts` extension

### CSS Class Naming
- Use kebab-case for class names
- Use BEM-like naming for component-specific classes
- Prefix utility classes appropriately

### Comments
- Use British English in comments
- Explain "why" not "what"
- Document complex logic

## Testing Checklist

Before deploying:
- [ ] All text uses British English spelling
- [ ] Brand colours are applied consistently
- [ ] Responsive design works on all screen sizes
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] Forms validate properly
- [ ] Navigation works correctly
- [ ] Footer is positioned correctly (requires scroll)

## Resources

- [British English vs American English](https://www.oxfordinternationalenglish.com/differences-in-british-and-american-spelling/)
- [UK Date Format](https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#dates)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

