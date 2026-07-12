# BookNook

A mobile bookstore app: browse and search a catalog, view book details with reviews and stock status, manage a cart, and check out. Built with React Native and Expo as a take-home assessment; extended with two bonus tabs (Home/Featured, Profile/Settings).

## Features

- **Browse & Search** — Paginated, debounced-search book list (`(tabs)/books.tsx`), infinite scroll via `onEndReached`
- **Book Details** — Cover, description, reviews with star ratings, stock status badge (in-stock / low-stock / out-of-stock), and an animated "fly to cart" add-to-cart interaction
- **Cart** — Quantity stepper, remove items, running total
- **Checkout** — Order summary, simulated payment (success/failure), confirmation screen, retry on failure
- **Home / Featured** *(bonus)* — Netflix-style layout: a large hero banner for a featured book (gradient-over-cover, Details/Add to Cart actions) followed by horizontally-scrolling shelves ("New Arrivals", "Trending Now", "Editor's Picks")
- **Profile / Settings** *(bonus)* — Order history (stats tiles for order count / books purchased / total spent, plus per-order cards with book-cover thumbnails) and a manual Light/Dark/System theme override

## Tech Stack

| Layer | Library | Why |
|---|---|---|
| Framework | Expo SDK 57, React Native 0.86, React 19.2 | Managed workflow — no native build step required for day-to-day development |
| Routing | Expo Router 57 (file-based) | Native tab bar (`unstable-native-tabs`) on iOS/Android, a custom web tab bar on web |
| Language | TypeScript 6.0 (strict) | |
| State Management | Zustand 5 | Three small, independent stores (cart, order history, theme preference) with frequent, localized updates. Zustand's selector subscriptions (`useCartStore((s) => s.items)`) let each component re-render only on the slice it reads, without the manual memoization Context would need to avoid over-rendering. Redux's action/reducer boilerplate isn't justified at this scale — Zustand gives the same centralized-store model with a plain hook API |
| Animation | React Native Reanimated 4 + Worklets | Drives the fly-to-cart flight (translate/scale/opacity on the JS-independent UI thread) |
| Images | expo-image | `cachePolicy="memory-disk"` everywhere a cover renders |
| Icons | expo-symbols | SF Symbols on iOS, Material icons on Android/web |
| Gradients | expo-linear-gradient | Hero banner's fade-to-background overlay on Home |
| Testing | Jest (`jest-expo` preset) + React Native Testing Library | |
| Linting | ESLint (`eslint-config-expo`) | |

## Project Structure

```
BookNook/
├── src/
│   ├── api/                       # Mock backend
│   │   ├── books.ts               # getBooks (paginated/search), getBookDetails
│   │   ├── checkout.ts            # checkout(cartItems) -> success/failure
│   │   ├── mock-network.ts        # simulated delay + failure-rate helpers
│   │   └── *.test.ts
│   ├── app/                       # Expo Router file-based routes
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx          # Home: featured hero + shelves
│   │   │   ├── books.tsx          # Book list (browse/search/paginate)
│   │   │   ├── cart.tsx
│   │   │   └── profile.tsx        # Order history + theme toggle
│   │   ├── book/[id].tsx          # Book details + add-to-cart animation
│   │   ├── _layout.tsx
│   │   └── checkout.tsx
│   ├── components/                # Reusable UI (book-card, cart-item-row,
│   │   │                          # featured-book-card, fly-to-cart-overlay,
│   │   │                          # order-history-row, review-item, search-input,
│   │   │                          # star-rating, stock-status-badge, theme-toggle,
│   │   │                          # themed-text/-view, app-tabs(.web), ...)
│   │   └── *.test.tsx
│   ├── constants/
│   │   └── theme.ts               # Colors, Fonts, Spacing, FontSize/LineHeight tokens
│   ├── hooks/
│   │   ├── use-book-list.ts       # Paginated/searchable book list state
│   │   ├── use-book-details.ts
│   │   ├── use-book-shelves.ts    # Home screen's shelf rows
│   │   ├── use-checkout.ts
│   │   ├── use-color-scheme.ts / .web.ts
│   │   ├── use-debounced-value.ts
│   │   ├── use-fly-to-cart.ts
│   │   ├── use-theme.ts           # Resolves OS scheme + manual override -> Colors
│   │   └── *.test.ts
│   ├── store/                     # Zustand stores
│   │   ├── use-cart-store.ts
│   │   ├── use-order-history-store.ts
│   │   ├── use-theme-preference-store.ts
│   │   └── *.test.ts
│   └── global.css
├── assets/                        # Icons, splash, tab images
├── jest/style-mock.js             # Stubs CSS imports out for Jest
├── scripts/reset-project.js
├── app.json
├── eslint.config.js
├── package.json
└── tsconfig.json
```

## Design Tokens

All colors, spacing, and type live in `src/constants/theme.ts`.

### Colors

| Token | Light | Dark | Rationale |
|---|---|---|---|
| `primary` | `#7A2E33` | `#C9797E` | Oxblood — evokes leather-bound book covers, warm and trustworthy without reading as tech-startup blue |
| `secondary` | `#3F6B54` | `#6FA085` | Forest green — classic library pairing with oxblood (burgundy books, green leather chairs) |
| `tertiary` | `#F4ECDD` | `#2A2320` | Warm parchment — reads like aged paper, a soft neutral for cards/backgrounds |
| `background` | `#ffffff` | `#000000` | |
| `backgroundElement` | `#F0F0F3` | `#212225` | |
| `backgroundSelected` | `#E0E1E6` | `#2E3135` | |
| `text` | `#000000` | `#ffffff` | |
| `textSecondary` | `#60646C` | `#B0B4BA` | |

### Typography

- **Serif** (`ui-serif` / platform serif) for headings — titles, subtitles, book titles — for a literary feel.
- **Sans** (`system-ui` / platform default) for body copy.
- The type scale is intentionally flat above `base`: `lg`, `xl`, and `xxl` are all 18px. Hierarchy above body text comes from font family (serif) and weight, not size.

## State Management

- **`use-cart-store.ts`** — `items: CartItem[]`. `addItem` (merges quantity if the book's already in the cart), `removeItem`, `updateQuantity` (removes the line item at quantity ≤ 0), `clear`, and a `selectCartTotal` selector.
- **`use-order-history-store.ts`** — `orders: Order[]` (`orderId`, `total`, `items`, `timestamp`), newest-first. `addOrder` is called from `checkout.tsx` on a successful order. In-memory only — no persistence, resets on app reload.
- **`use-theme-preference-store.ts`** — `preference: 'system' | 'light' | 'dark'`, defaults to `'system'`. `use-theme.ts` resolves this against the OS-driven `useColorScheme()` via `useResolvedColorScheme()`, which both `useTheme()` and the tab bar chrome (`app-tabs.tsx`/`app-tabs.web.tsx`) call — so the manual override reaches every themed surface, including native tab bar colors.

## Getting Started

**Requirements:** Node 18+, npm. An iOS Simulator (Xcode) or Android emulator (Android Studio) for native; a browser is enough for web. `npm run ios` / `npm run android` use `expo run:*`, which does a local native build — Expo Go is not required, but Xcode/Android Studio must be installed.

```bash
npm install
npx expo start        # or: npm start
```

From the dev server output, open the app in an iOS simulator, Android emulator, Expo Go, or a browser — or run a target directly:

```bash
npm run ios
npm run android
npm run web
```

## Testing

```bash
npm test
```

Runs Jest with the `jest-expo` preset. 36 tests across 5 files:

- `store/use-cart-store.test.ts` — addItem/removeItem/updateQuantity (incl. remove-at-zero), `selectCartTotal`
- `api/books.test.ts` — `getBooks` pagination/search, `getBookDetails`, both success and `simulateFailure` paths
- `api/checkout.test.ts` — success (incl. rounding), failure
- `hooks/use-checkout.test.ts` — submit success, discriminated-union failure, thrown-`Error` and thrown-non-`Error` fallback messages, and that a successful resubmission clears a prior error
- `components/book-card.test.tsx` — price formatting/rendering

Network delay is stubbed to resolve immediately (`mock-network.ts`'s `delay` is mocked; `shouldFail`'s real implementation is kept, since it's already deterministic when `simulateFailure` is passed explicitly) — no test waits on the real 300–800ms simulated latency, and no test depends on `Math.random()`.

## Performance Notes

- **Book list `FlatList`** (`(tabs)/books.tsx`): tuned `initialNumToRender={8}`, `maxToRenderPerBatch={6}`, `windowSize={5}`, `removeClippedSubviews`, and a `getItemLayout` derived from `BookCard`'s actual rendered height (`BOOK_CARD_HEIGHT`, exported from `book-card.tsx`) — the title reserves 2-line height via `minHeight` so every card is the same height and the layout math can't drift out of sync with the component.
- **Images** — `expo-image` with `cachePolicy="memory-disk"` consistently across `book-card.tsx`, `fly-to-cart-overlay.tsx`, and the book-details hero. `FlatList` virtualization means off-screen covers aren't mounted/requested until they scroll into the render window.
- **Pagination** — `getBooks(page, pageSize, search)`, 20 books/page.
- **500-book stress test** (temporarily bumping the mock dataset, reverted after): verified pagination correctness programmatically — 25 pages of 20, zero duplicate/missing IDs across the full walk, search narrowing still correct. Actual on-device scroll-jank/frame-drop behavior was **not** verified — no browser automation tooling was available in the dev environment to drive and observe it interactively; the tuning values above are grounded in the card's measured height and standard RN virtualization heuristics, not a captured frame trace.

## Known Limitations

- **Fly-to-cart target position is approximate.** The animation flies the cover toward a hardcoded estimate of where the cart tab icon sits (`fly-to-cart-overlay.tsx`), not a measured position — the cart tab isn't mounted in the tree on the Book Details screen (it's a stack-pushed route outside the `(tabs)` group), so there's nothing to `measure()` against. Acceptable for a quick visual flourish; not pixel-accurate.

## Assumptions

- **Mock API only** — `src/api/` (`books.ts`, `checkout.ts`, `mock-network.ts`) simulates a backend with in-memory generated data, artificial 300–800ms latency, and a configurable failure rate. There is no real backend, authentication, or payment integration.
- **No persistence** — cart, order history, and theme preference are all in-memory Zustand state; everything resets on app reload.
- Home's three shelves ("New Arrivals" / "Trending Now" / "Editor's Picks") are different pages of the same flat mock book list, not real curated categories — the mock API has no genre/category data to group by.
