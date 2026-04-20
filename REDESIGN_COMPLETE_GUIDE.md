# QualityVoice — Complete Frontend Redesign Guide

## ✅ What's Already Done

### Core Infrastructure
- ✅ **Dark theme** — fully working with ThemeContext
- ✅ **Responsive layout** — mobile-first, tablet centered, desktop 3-column
- ✅ **Toast notifications** — success/error/info with auto-dismiss
- ✅ **Skeleton screens** — loading placeholders for shop cards and reviews
- ✅ **Photo lightbox** — full-screen image viewer with keyboard nav
- ✅ **Review likes** — heart button with like count
- ✅ **Notifications system** — real-time comment/like activity
- ✅ **Onboarding flow** — city picker + interests
- ✅ **Search autocomplete** — dropdown with shop suggestions
- ✅ **Trending algorithm** — weighted by rating + recency + volume
- ✅ **Share button** — native Web Share API + clipboard fallback

### New Components Created
- ✅ `Navbar.jsx` — top navigation with search, location, notifications, user menu
- ✅ `BottomTabBar.jsx` — mobile bottom tabs (Home, Explore, Add, Alerts, Profile)
- ✅ `Toast.jsx` + `ToastProvider` — toast notification system
- ✅ `SkeletonCard.jsx` — loading skeletons for vertical/horizontal cards
- ✅ `ShopCard.jsx` — vertical (desktop) and horizontal (mobile) shop cards

### Design System
- ✅ Inter font (clean, professional)
- ✅ 4px spacing system (4, 8, 12, 16, 24, 32, 48px)
- ✅ Consistent border radius (4px, 8px, 12px, 16px, 24px)
- ✅ CSS variables for all colors (light + dark themes)
- ✅ Typography scale (28px page title, 20px section, 16px card, 14px body, 12px label)
- ✅ Shadow system (xs, sm, md, lg, xl)

---

## 🚧 What Needs to Be Done

### 1. Replace Desktop Sidebar with Top Navbar

**Current:** Desktop uses a left sidebar (Instagram-style)
**New:** Desktop uses a top navbar (like the reference image you showed)

**Changes needed:**
- Remove `DesktopLayout.jsx` and `DesktopLayout.css`
- Update `App.js` to use `Navbar` + `BottomTabBar` instead of `DesktopLayout`
- Update `global.css` to remove the 3-column grid on desktop
- Desktop layout becomes: top navbar (fixed) + full-width content (max 1200px centered) + no bottom tabs

**File to update:**
```jsx
// Quality-voice/client/src/App.js
import Navbar from './components/common/Navbar';
import BottomTabBar from './components/common/BottomTabBar';
import { ToastProvider } from './components/common/Toast';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <Router>
              <Routes>
                {/* Public routes — no navbar */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

                {/* Protected routes — with navbar + bottom tabs */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <div className="app-shell">
                      <Navbar />
                      <Routes>
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/shop/:id" element={<ShopDetailPage />} />
                        {/* ... all other routes */}
                      </Routes>
                      <BottomTabBar />
                    </div>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### 2. Redesign HomePage

**Current:** Welcome banner + 3 horizontal scroll sections
**New:** Cleaner layout with better spacing

**Changes:**
- Replace "Hello, Jayadeep 👋" with "Good morning, Jayadeep" (time-aware greeting)
- Location shown as a pill button (not in navbar on mobile)
- Category pills: solid primary when active, white with border when inactive
- Feed sections: use the new `ShopCardVertical` on desktop, `ShopCardHorizontal` on mobile
- Show skeleton cards while loading (use `SkeletonFeedSection`)
- Empty states: use the new design with icon + heading + subtext + action button

**File:** `Quality-voice/client/src/pages/HomePage.jsx`

### 3. Redesign SearchPage / Explore

**Current:** Search bar at top, filters, results below
**New:** Large search bar, better filter UI

**Changes:**
- Desktop: large search bar (full width, 52px height)
- Mobile: full-screen search overlay (already done)
- Filter row: Category dropdown + Rating filter ("3+ stars", "4+ stars", "Any") + Sort ("Nearest", "Top rated", "Newest")
- Results: "Near You (Hyderabad)" section first, then "Other Areas"
- Use `ShopCardHorizontal` for all results
- Show skeleton cards while loading

**File:** `Quality-voice/client/src/pages/SearchPage.jsx`

### 4. Redesign ShopDetailPage

**Current:** Cover photo + header + tabs
**New:** Cover photo with overlaid shop name

**Changes:**
- Cover photo: 300px tall on desktop, 220px on mobile
- Shop name overlaid on photo (bottom, white bold text with dark gradient background)
- Category pill + location overlaid on photo
- Below photo: rating summary row (big star number 32px, 5-star visual, review count)
- Govt badge row if applicable
- Action buttons: "Write Review" (primary filled) + "Report Shop" (red outline)
- Tabs: Reviews | About (underline style)
- Review cards: use the new design with like button + comment count
- Show skeleton reviews while loading

**File:** `Quality-voice/client/src/pages/ShopDetailPage.jsx`

### 5. Redesign WriteReviewPage

**Current:** Single form with all fields
**New:** Multi-step form with progress indicator

**Changes:**
- Step 1: Select Shop (search dropdown)
- Step 2: Rate + Review (large star selector 40px, textarea, helpful tip)
- Step 3: Add Photos (2-column grid, min 1 required)
- Progress indicator at top (3 dots, active dot is primary color)
- Max width 600px, centered
- Use toast notification on success

**File:** `Quality-voice/client/src/pages/WriteReviewPage.jsx`

### 6. Redesign ProfilePage

**Current:** Gradient header banner + stats + actions
**New:** Clean layout, no gradient banner

**Changes:**
- Remove gradient header
- Avatar circle (64px, initials, primary background)
- Name in 22px bold
- Email in secondary color
- Stats row: 3 cards side-by-side (Reviews | Avg Rating | Shops Added)
- Each stat: big number on top, label below, white card with border
- Below stats: "Edit Profile" (outline) + "Logout" (red outline)
- My Reviews section: each review as a card with shop name + category + stars + date + text preview + photo thumbnail

**File:** `Quality-voice/client/src/pages/ProfilePage.jsx`

### 7. Redesign AddShopPage

**Current:** Single long form
**New:** Multi-step form with progress bar

**Changes:**
- Step 1: Basic Info (name, category grid with icons, description)
- Step 2: Location (city/district/area grid, full address)
- Step 3: Photos (upload grid, submit button)
- Progress bar at top (3 steps)
- Use toast notification on success

**File:** `Quality-voice/client/src/pages/AddShopPage.jsx`

### 8. Redesign GovtDashboard

**Current:** Tabs with shops + reports
**New:** Two-column layout (desktop) / stacked (mobile)

**Changes:**
- Top: summary stats row (Total Reported | Badges Given | Pending Reports)
- Desktop: two columns side-by-side
  - Left: Reported Shops (shop name + reason + count + "Review Report" button)
  - Right: Top Rated Shops (shop name + rating + "Give Badge" / "Remove Badge")
- Mobile: stacked sections
- Use skeleton cards while loading

**File:** `Quality-voice/client/src/pages/DashboardPage.jsx`

---

## 📋 Implementation Checklist

### Phase 1: Core Layout (30 mins)
- [ ] Update `App.js` to use Navbar + BottomTabBar (remove DesktopLayout)
- [ ] Update `global.css` to remove 3-column grid, use top navbar layout
- [ ] Test on mobile (< 768px) and desktop (>= 768px)

### Phase 2: Home + Search (45 mins)
- [ ] Redesign `HomePage.jsx` with time-aware greeting, new card layout
- [ ] Add skeleton loading to HomePage
- [ ] Redesign `SearchPage.jsx` with better filters
- [ ] Add skeleton loading to SearchPage
- [ ] Test category filtering, search autocomplete

### Phase 3: Shop Detail + Write Review (45 mins)
- [ ] Redesign `ShopDetailPage.jsx` with overlaid shop name on cover
- [ ] Add skeleton loading to reviews
- [ ] Redesign `WriteReviewPage.jsx` as multi-step form
- [ ] Add progress indicator
- [ ] Test photo upload, review submission, toast notifications

### Phase 4: Profile + Add Shop (30 mins)
- [ ] Redesign `ProfilePage.jsx` with clean stats cards
- [ ] Redesign `AddShopPage.jsx` as multi-step form
- [ ] Test profile editing, shop creation

### Phase 5: Dashboard + Polish (30 mins)
- [ ] Redesign `DashboardPage.jsx` with two-column layout
- [ ] Add pull-to-refresh on mobile (optional)
- [ ] Add smooth page transitions (optional)
- [ ] Final testing on all screen sizes

---

## 🎨 Design Tokens Reference

```css
/* Colors */
--primary:        #4F46E5  /* Indigo */
--accent:         #F59E0B  /* Amber */
--success:        #10B981  /* Green */
--danger:         #EF4444  /* Red */

/* Spacing (4px base) */
4px, 8px, 12px, 16px, 24px, 32px, 48px

/* Border Radius */
--r-xs:   4px
--r-sm:   8px
--r-md:   12px
--r-lg:   16px
--r-xl:   24px
--r-full: 9999px

/* Typography */
Page title:      28px, weight 700
Section heading: 20px, weight 600
Card title:      16px, weight 600
Body text:       14px, weight 400
Small label:     12px, weight 500

/* Shadows (light mode) */
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)
--shadow-md:  0 4px 16px rgba(79,70,229,0.12), 0 1px 4px rgba(0,0,0,0.06)
```

---

## 🔧 Quick Fixes for Current Issues

### Fix 1: Remove DesktopLayout, use Navbar everywhere
```bash
# Delete these files:
rm Quality-voice/client/src/components/DesktopLayout.jsx
rm Quality-voice/client/src/styles/DesktopLayout.css
```

### Fix 2: Update App.js routing structure
See Phase 1 above — wrap all protected routes in a shell with Navbar + BottomTabBar.

### Fix 3: Replace all old components
- Replace `TopBar` with `Navbar`
- Replace `BottomNav` with `BottomTabBar`
- Replace `ShopCardCompact` with `ShopCardVertical`
- Replace `ShopCardFull` with `ShopCardHorizontal`

### Fix 4: Add ToastProvider to App.js
Wrap everything in `<ToastProvider>` so all pages can use `useToast()`.

---

## 💡 Pro Tips

1. **Use the new design system consistently**
   - All spacing: multiples of 4px
   - All colors: CSS variables only
   - All border radius: use --r-sm, --r-md, --r-lg

2. **Mobile-first CSS**
   - Write mobile styles first
   - Add desktop styles with `@media (min-width: 768px)`

3. **Loading states**
   - Always show skeleton cards while loading
   - Never show blank white space

4. **Empty states**
   - Every empty state needs: icon + heading + subtext + action button
   - Use the new `.empty-state` class

5. **Transitions**
   - All interactive elements: 200ms transition
   - Use `var(--transition)` for consistency

6. **Accessibility**
   - Min tap target: 44px height on mobile
   - All buttons have aria-labels
   - All images have alt text

---

## 🚀 Next Steps

1. **Start with Phase 1** — fix the layout architecture first
2. **Test on both mobile and desktop** after each phase
3. **Use the new components** (Navbar, BottomTabBar, ShopCard, Toast, Skeleton)
4. **Follow the design tokens** — no custom colors or spacing

The backend is perfect — don't touch it. Just rebuild the frontend systematically using the new design system.

---

## 📸 Reference

The Discover page you showed (RateIt) has:
- Top navbar with logo, search, user menu
- Clean card grid
- Category pills
- No sidebar on desktop
- Full-width content with max-width constraint

That's exactly what we're building. The new Navbar component already matches that design.
