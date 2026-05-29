# Kinship Design System

## Premium Mobile-First Social Network for Creators

### Design Philosophy

Kinship is built with an emotional, cinematic, and premium design language that celebrates talented creators. The experience combines:

- **Apple-level minimalism** - Clean, breathable interfaces
- **Instagram elegance** - Visual storytelling focus
- **Pinterest inspiration** - Discovery and curation
- **Futuristic aesthetics** - Subtle gradients and glassmorphism
- **Dark mode first** - Optimized for OLED displays

---

## Color System

### Primary Colors
- **Kinship Blue**: `#5B7FFF` - Muted electric blue for primary actions
- **Kinship Purple**: `#8B5CF6` - Accent color for special moments
- **Deep Charcoal**: `#1a1a1a` - Primary background in dark mode
- **Soft White**: `#fafafa` - Text and cards

### Semantic Colors
- **Background**: `#0f0f0f` (Dark) / `#fafafa` (Light)
- **Card**: `#1a1a1a` with glassmorphism
- **Muted**: `#a3a3a3` for secondary text

---

## Typography

### Font Hierarchy
- **Display**: Large emotional headings (32-48px)
- **Heading**: Section titles (20-28px)
- **Body**: Readable content (16px)
- **Caption**: Metadata and labels (12-14px)

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Components

### GlassCard
Premium glass-morphism card with blur and transparency
```tsx
<GlassCard className="p-6">
  {children}
</GlassCard>
```

### TalentBadge
Gradient badge displaying creator talents
```tsx
<TalentBadge 
  icon="🎵" 
  label="Music" 
  gradient="from-primary to-accent"
/>
```

### BottomNav
Thumb-friendly navigation with active states
```tsx
<BottomNav />
```

---

## Spacing System

- **xs**: 0.5rem (8px)
- **sm**: 0.75rem (12px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)

---

## Border Radius

- **sm**: 0.75rem (12px)
- **md**: 1rem (16px)
- **lg**: 1.25rem (20px)
- **xl**: 1.5rem (24px)
- **2xl**: 2rem (32px)

---

## Animation Principles

1. **Smooth**: All transitions use ease curves
2. **Purposeful**: Motion guides attention
3. **Responsive**: Instant feedback on interactions
4. **Delightful**: Micro-interactions add personality

---

## Mobile-First Approach

- Max width: 768px (tablet)
- Touch targets: Minimum 44px
- Bottom navigation for thumb zone
- Swipe-friendly cards
- Optimized for one-handed use

---

## Accessibility

- WCAG AA contrast ratios
- Touch targets meet accessibility guidelines
- Semantic HTML structure
- Clear focus states
- Screen reader friendly
