# Visual Authority & Design System

## Theme: Academic Heritage & Editorial Walnut
Authentic editorial craftsmanship inspired by historical collegiate publications, fine typography, and warm earthy materials for **Xavier AlumniConnect**.

> **Design Principle:** Replaces generic AI-cliché templates (saturated navy blues, neon cyan gradients, and floating blur spheres) with grounded, physical-feeling espresso walnut, warm linen parchment, heritage amber gold, and forest moss.

---

### Core Palette & Design Tokens

```
  Warm Linen Canvas        Espresso Dark Canvas     Dark Walnut Well        Heritage Amber Gold      Forest Moss (Verified)
  ┌───────────────────┐    ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
  │  #f4efe6          │    │  #1a1410          │   │  #261f15          │   │  #c4821a          │   │  #3a5c3e          │
  │  Main Background  │    │  Primary Dark/CTA │   │  Showcase Cards   │   │  Warm Accent      │   │  Verified Stamp   │
  └───────────────────┘    └───────────────────┘   └───────────────────┘   └───────────────────┘   └───────────────────┘
```

#### 1. Canvas & Backgrounds
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `cream` (Linen) | `#f4efe6` | Default page canvas and container backgrounds |
| `cream-dark` (Parchment) | `#e8dfd0` | Secondary section background, subtle wells |
| `cream-deeper` | `#d9ccba` | Heavy dividers, inset shading |
| `card-surface` | `#ffffff` | Elevated form cards with crisp 1px ink rule |

#### 2. Ink & Earthy Browns
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `ink-900` / `espresso` | `#1a1410` | High-contrast display text, primary button background, dark showcase panel |
| `walnut-dark` | `#261f15` | Dark showcase feature card containers |
| `ink-700` / `walnut` | `#3d3222` | Secondary headers, dark card borders, hover states for dark buttons |
| `ink-600` / `umber` | `#5c4d37` | Body copy, descriptive text, helper captions |
| `ink-500` / `caramel` | `#7d6a4f` | Input placeholder text, secondary icons, subtle timestamps |

#### 3. Heritage Warm Accents & Status Hues
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `amber` | `#c4821a` | Key brand accent, pending approval alerts, active link highlights |
| `amber-light` | `#e8a93c` | Italic editorial display text, hover highlights, glowing points |
| `amber-pale` | `#fdf3e3` | Warning containers, pending review backgrounds |
| `moss` | `#3a5c3e` | "Verified Alumni Network" status stamps, verified email alert containers |
| `moss-light` | `#7aab7e` | Status indicator dots, pulse badges, success icons |

#### 4. Dividers & Borders
| Token | Value | Usage |
| :--- | :--- | :--- |
| `ink-rule` | `rgba(26, 20, 16, 0.12)` | Subtle 1px structural container and table borders |
| `walnut-rule` | `#3d3222` | Structural borders within dark espresso panels |

---

### Typography Hierarchy

| Role | Font Family | Style / Weight | Purpose |
| :--- | :--- | :--- | :--- |
| **Editorial Headlines** | `"DM Serif Display"`, `Georgia`, serif | Regular (400) / Italic | Display titles, hero headlines, card titles |
| **Body & Controls** | `"DM Sans"`, `Inter`, sans-serif | 400, 500, 600 | Navigation, input labels, form fields, button text |
| **Data, Stamps & Badges** | `"IBM Plex Mono"`, monospace | 400, 500 | Verification stamps, category tags, counter metrics, timestamps |

---

### Component Styling Guidelines

#### 1. Primary Action Button
- **Default:** `bg-[#1a1410] text-[#f4efe6] font-semibold text-sm rounded-xl py-3 px-4 border border-[#3d3222]/50 shadow-sm`
- **Hover:** `hover:bg-[#3d3222] hover:shadow hover:-translate-y-0.5 transition-all`
- **Focus:** `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c4821a]/30`

#### 2. Input Fields
- **Default:** `bg-white border border-[#1a1410]/15 text-[#1a1410] placeholder-[#7d6a4f]/60 rounded-xl px-3.5 py-2.5 text-sm`
- **Focus:** `focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410]`
- **Error:** `border-rose-300 focus:border-rose-500 focus:ring-rose-200`

#### 3. Verification Stamp / Status Badge
```html
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-[#3a5c3e] bg-[#3a5c3e]/20 text-[#7aab7e] font-mono text-[11px] uppercase tracking-wider">
  <span className="w-2 h-2 rounded-full bg-[#7aab7e] animate-pulse" />
  <span>Verified Alumni Network</span>
</div>
```

#### 4. Inline Success State (Post-Login)
- **Container:** `rounded-xl border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 p-4 sm:p-5 shadow-sm`
- **Icon:** `w-8 h-8 rounded-lg bg-[#3a5c3e] text-[#f4efe6]`
- **Title:** `font-serif text-[#1a1410]` ("Welcome back, {Name}!")
- **Subtext:** `text-[#5c4d37] text-xs` ("You're successfully signed in. Redirecting you to your dashboard...")

---

### Anti-Patterns to Refuse Across All Pages
- ❌ **No saturated generic AI blues** (`#3b82f6`, `#2563eb`) or neon purple/cyan gradients.
- ❌ **No floating blur spheres/blobs** (`bg-blue-600/20 blur-3xl`). Use authentic paper framing and ink rules.
- ❌ **No gradient text hacks.** Emphasis is achieved through `font-serif`, weight, and `#e8a93c` amber italics.
- ❌ **No unstyled browser defaults.** Checkbox accents must use `accent-[#1a1410]`.
