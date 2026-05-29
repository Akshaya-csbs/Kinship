/**
 * KINSHIP DESIGN SYSTEM
 * 
 * Premium Mobile-First Social Network for Talented Creators
 * 
 * COLORS:
 * - Primary: #5b7fef (Electric Blue)
 * - Secondary: #8b7fef (Purple)
 * - Background Dark: #0a0a0f (Deep Charcoal)
 * - Card: #131318
 * - Elevated Card: #1a1a20
 * - Foreground: #fafafa (Soft White)
 * 
 * TYPOGRAPHY:
 * - Modern clean sans-serif
 * - Headings: Bold, emotional
 * - Body: Readable, elegant
 * 
 * SPACING:
 * - Mobile-optimized
 * - Breathing space between elements
 * - 4px base unit
 * 
 * BORDER RADIUS:
 * - Cards: 1.5rem - 2rem (24-32px)
 * - Buttons: 1rem - 1.5rem (16-24px)
 * - Images: 0.75rem - 1rem (12-16px)
 * 
 * DESIGN PRINCIPLES:
 * 1. Dark mode first
 * 2. Cinematic gradients
 * 3. Subtle glassmorphism
 * 4. Smooth animations
 * 5. Premium shadows
 * 6. Emotional connections
 * 7. Clean hierarchy
 * 8. Breathing space
 * 
 * COMPONENTS:
 * - Mobile Container: Max-width wrapper for mobile view
 * - Bottom Nav: Premium glassmorphic navigation
 * - Creator Cards: Immersive profile cards
 * - Talent Badges: Category indicators
 * - Glass Panels: Backdrop blur elements
 * - Gradient Buttons: Primary actions
 * 
 * SCREENS:
 * 1. Splash - Cinematic introduction
 * 2. Onboarding - Emotional slides
 * 3. Authentication - Clean forms
 * 4. Talent Selection - Interactive grid
 * 5. Home Feed - Social content
 * 6. Creator Profile - Portfolio showcase
 * 7. Explore - Discovery interface
 * 8. Collaboration - Project matching
 * 9. Messaging - Clean conversations
 * 10. Opportunities - Gig discovery
 * 11. Notifications - Activity feed
 * 12. Settings - Preferences
 * 
 * INTERACTIONS:
 * - Smooth page transitions
 * - Hover states
 * - Active states
 * - Loading states
 * - Empty states
 * - Micro-animations
 * 
 * ACCESSIBILITY:
 * - High contrast ratios
 * - Touch-friendly targets (min 44px)
 * - Clear focus indicators
 * - Semantic HTML
 * - ARIA labels where needed
 */

export const DESIGN_TOKENS = {
  colors: {
    primary: "#5b7fef",
    secondary: "#8b7fef",
    purpleSoft: "#a99fef",
    background: "#0a0a0f",
    card: "#131318",
    cardElevated: "#1a1a20",
    foreground: "#fafafa",
    muted: "#1e1e26",
    mutedForeground: "#a1a1aa",
    border: "rgba(255, 255, 255, 0.08)",
  },
  spacing: {
    xs: "0.5rem",    // 8px
    sm: "1rem",      // 16px
    md: "1.5rem",    // 24px
    lg: "2rem",      // 32px
    xl: "3rem",      // 48px
  },
  radius: {
    sm: "0.75rem",   // 12px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
  },
  shadows: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.1)",
    md: "0 4px 16px rgba(0, 0, 0, 0.15)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.2)",
    glow: "0 0 40px rgba(91, 127, 239, 0.3)",
  },
};
