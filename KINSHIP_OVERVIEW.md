# Kinship - Premium Social Network for Talented Creators

## Overview
Kinship is a mobile-first social networking application designed for talented people like singers, dancers, artists, chefs, photographers, athletes, designers, fashion creators, performers, and creators of all kinds.

## Design Philosophy
- **Emotional & Creative**: Warm, premium, modern, cinematic
- **NOT Corporate**: Avoids generic startup UI
- **NOT Dating App**: Focused on creative collaboration
- **Dark Mode First**: Premium dark aesthetic with cinematic gradients

## Visual Language
- Apple-level minimalism
- Instagram elegance  
- Pinterest inspiration
- Subtle futuristic aesthetics
- Soft cinematic gradients
- Premium glassmorphism (used lightly)
- Clean spacing with breathing room
- Smooth rounded cards (1-2rem radius)
- Elegant typography
- Emotional photography from Unsplash

## Color Palette
- **Primary**: #5b7fef (Muted Electric Blue)
- **Secondary**: #8b7fef (Subtle Purple)
- **Background**: #0a0a0f (Deep Charcoal Black)
- **Card**: #131318
- **Elevated Card**: #1a1a20
- **Foreground**: #fafafa (Soft Warm White)
- **Muted**: #1e1e26
- **Border**: rgba(255, 255, 255, 0.08)

## Typography
- Modern clean sans-serif
- Large emotional headings
- Readable body text (14-16px)
- Minimal but expressive

## Components

### Core Components
- **MobileContainer**: Max-width wrapper for mobile-first design
- **BottomNav**: Premium glassmorphic navigation with smooth tab transitions
- **GradientBackground**: Reusable gradient backgrounds

### UI Components (from design system)
- Button, Badge, Input, Switch
- Card, Avatar, Separator
- Dialog, Sheet, Popover
- And more from Radix UI

## Screens

### 1. Splash Screen (`/`)
- Animated logo with gradient background
- Emotional tagline: "A home for talented people"
- Auto-navigates to onboarding after 3 seconds

### 2. Onboarding (`/onboarding`)
- 3 smooth card transitions
- Explains purpose emotionally
- Human-centered copy
- Skip button for quick access

### 3. Authentication (`/auth`)
- Sign up / Login toggle
- Email + Password fields
- Continue with Google option
- Clean, minimal form design

### 4. Talent Selection (`/talent-selection`)
- 12 talent categories to choose from
- Interactive grid with visual feedback
- Minimum 1 selection required
- Categories: Music, Dance, Art, Photography, Cooking, Fitness, Fashion, Gaming, Writing, Film, Voice Acting, Sports, Tech

### 5. Home Feed (`/home`)
- Main social feed with posts
- Trending creators carousel
- Like, comment, share interactions
- Collaboration badges
- Talent tags
- Quick access to Collaborate button

### 6. Creator Profile (`/profile/:id`)
- Profile image with verification badge
- Stats: Followers, Following, Posts
- Bio and location
- Talent badges
- Achievements showcase
- Portfolio grid (Posts/Videos tabs)
- Follow/Message actions

### 7. Explore (`/explore`)
- Search bar for creators/talents
- Category filters (All, Trending, Nearby, Rising Stars)
- Talent filters (12 categories)
- Featured "Creator of the Week"
- Grid view of creators with immersive cards

### 8. Collaboration (`/collaborate`)
- Two tabs: Requests & Find Creators
- Collaboration request cards with Accept/Decline
- Project details, dates, locations
- Suggested creators for collaboration
- Invite functionality

### 9. Messaging (`/messages`)
- Conversation list
- Unread message indicators
- Last message preview
- Talent badges for context
- Search functionality

### 10. Opportunities (`/opportunities`)
- Filter by type: Events, Gigs, Competitions, Workshops
- Opportunity cards with images
- Location, date, applicant count
- Categories matching talents
- Apply Now functionality

### 11. Notifications (`/notifications`)
- Categorized activity (likes, comments, follows, collabs, opportunities)
- Unread indicators
- Mark all as read
- User avatars with action icons
- Timestamps

### 12. Settings (`/settings`)
- Profile quick access card
- Account settings
- Notifications toggle
- Dark mode toggle
- Privacy & security
- Help center
- About Kinship
- Logout

## Navigation
- **Bottom Navigation**: 
  - Home (Feed)
  - Explore
  - Messages  
  - Notifications
  - Profile
- Smooth tab transitions with Motion animations
- Active state indicators

## Mock Data
- 8 realistic creator profiles with Unsplash images
- Posts with likes, comments, shares
- Collaboration requests
- Opportunities (events, gigs, workshops)
- Notifications
- Messages

## Interactions
- Smooth page transitions (Motion/React)
- Hover states on desktop
- Active/pressed states
- Like/save animations
- Loading states
- Empty states with helpful messaging
- Micro-interactions throughout

## Accessibility
- Mobile-first responsive design
- Touch-friendly targets (44px minimum)
- High contrast ratios in dark mode
- Semantic HTML structure
- Clear visual hierarchy
- Thumb-friendly navigation at bottom

## Technical Stack
- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS v4** for styling
- **Motion** (Framer Motion) for animations
- **Radix UI** components for accessibility
- **Lucide React** for icons
- **Unsplash** for realistic creator images

## File Structure
```
/src/app/
  ├── App.tsx (Main entry with RouterProvider)
  ├── routes.tsx (Route configuration)
  ├── components/
  │   ├── MobileContainer.tsx
  │   ├── BottomNav.tsx
  │   ├── GradientBackground.tsx
  │   ├── DesignShowcase.tsx (Design system documentation)
  │   └── ui/ (Radix UI components)
  ├── screens/
  │   ├── SplashScreen.tsx
  │   ├── OnboardingScreen.tsx
  │   ├── AuthScreen.tsx
  │   ├── TalentSelectionScreen.tsx
  │   ├── HomeFeedScreen.tsx
  │   ├── CreatorProfileScreen.tsx
  │   ├── ExploreScreen.tsx
  │   ├── CollaborationScreen.tsx
  │   ├── MessagingScreen.tsx
  │   ├── OpportunityScreen.tsx
  │   ├── NotificationsScreen.tsx
  │   └── SettingsScreen.tsx
  ├── data/
  │   └── mockData.ts (All mock data)
  └── styles/
      ├── index.css (Custom utilities)
      ├── theme.css (Kinship color system)
      ├── tailwind.css
      └── fonts.css
```

## Design Tokens
See `/src/app/components/DesignShowcase.tsx` for complete design token documentation.

## Future Enhancements
- Real-time messaging
- Video posts
- Live streaming
- Direct collaboration tools
- Calendar integration
- Portfolio builder
- Skill verification
- Creator analytics
- Event check-in
- Payment integration for gigs

---

**Kinship v1.0.0**  
*A home for talented people* ❤️
