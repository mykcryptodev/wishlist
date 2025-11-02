# Fredoka Font with Text Stroke Implementation

## ✅ Changes Made

### 1. Font System Updated

- **Changed from**: Lexend Deca + Geist Mono (Google Fonts)
- **Changed to**: Fredoka (Local font files)
- **Location**: `/src/app/layout.tsx`

### 2. Fredoka Font Weights Available

All weights are loaded from `/public/fonts/Fredoka/`:

- Light (300)
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)

### 3. Global CSS Updates

- Updated `--font-sans` and `--font-mono` to use Fredoka
- Added comprehensive text stroke utilities

### 4. OG Images Updated

Both OG image routes now use Fredoka fonts:

- `/src/app/api/og/route.tsx` (main OG image)
- `/src/app/api/wishlist/og/route.tsx` (wishlist OG images)

## 🎨 Text Stroke Utility Classes

### Available Classes

#### Basic Strokes

```css
.text-stroke-sm    /* 1px black outline */
.text-stroke       /* 2px black outline (default) */
.text-stroke-lg    /* 3px black outline */
.text-stroke-xl    /* 4px black outline */
```

#### Pre-styled Combinations

```css
.text-outlined              /* White text with 3px black outline */
.text-christmas-outlined    /* Christmas gradient with 2px black outline */
```

## 📝 How to Apply Text Strokes

### Example 1: Simple White Text with Black Outline

```tsx
<h1 className="text-outlined">Holiday Wishlist</h1>
```

### Example 2: Custom Color with Stroke

```tsx
<h1 className="text-red-500 text-stroke-lg font-bold">My Custom Title</h1>
```

### Example 3: Christmas Gradient with Outline

```tsx
<h2 className="text-christmas-outlined">🎁 Explore Wishlists 🎁</h2>
```

### Example 4: Different Stroke Sizes

```tsx
<div>
  <h1 className="text-white text-stroke-sm">Small Outline</h1>
  <h1 className="text-white text-stroke">Default Outline</h1>
  <h1 className="text-white text-stroke-lg">Large Outline</h1>
  <h1 className="text-white text-stroke-xl">Extra Large Outline</h1>
</div>
```

## 🎯 Recommended Places to Apply Text Strokes

### High Priority (Maximum Impact)

1. **Main headings** - Hero titles, page titles
2. **Navigation items** - Top nav bar text
3. **Button text** - Primary call-to-action buttons
4. **Card titles** - Wishlist item titles, card headers

### Medium Priority

5. **Subheadings** - Section titles
6. **Labels** - Form labels, important UI text
7. **Stats/Numbers** - Count displays, metrics

### Low Priority (Optional)

8. **Body text** - Use sparingly, can reduce readability
9. **Small text** - Use `.text-stroke-sm` if needed

## 🎨 Design Tips

### DO:

- ✅ Use text strokes on large, bold text for maximum effect
- ✅ Pair with bright colors for contrast
- ✅ Use `.text-outlined` (white + black) for universal readability
- ✅ Apply to text over images or busy backgrounds

### DON'T:

- ❌ Apply to small text (< 16px) - can blur letters
- ❌ Use on body paragraphs - reduces readability
- ❌ Over-stroke text - stick to -sm or default for most use cases
- ❌ Combine with text-transparent - won't work together

## 🔧 Advanced Customization

### Custom Stroke Width

You can create custom stroke widths in your component:

```tsx
<h1
  className="text-white font-bold"
  style={{
    WebkitTextStroke: "5px black",
    textStroke: "5px black",
    paintOrder: "stroke fill",
  }}
>
  Custom Stroke
</h1>
```

### Custom Stroke Color

```tsx
<h1
  className="text-white font-bold"
  style={{
    WebkitTextStroke: "3px #468763", // Forest green
    textStroke: "3px #468763",
    paintOrder: "stroke fill",
  }}
>
  Green Outline
</h1>
```

## 📊 Current Usage

### Already Applied:

- ✅ Home page "Explore Wishlists" heading
- ✅ OG images now use Fredoka font

### Suggested Next Steps:

1. Add `.text-outlined` to main "Holiday Wishlist" logo (if not using image)
2. Add `.text-stroke` to wishlist owner names on public pages
3. Add `.text-stroke-sm` to navigation items
4. Add `.text-stroke-lg` to large emoji + text combinations
5. Consider `.text-outlined` for CTAs over the monster image

## 🎄 Christmas Theme Colors

For reference, here are the Christmas colors used in the app:

```css
--forest-green: #468763 --gold: #c0a053 --pine-green: #3d7357
  --background: #262626 --card-bg: #383838;
```

## 🚀 Quick Start Examples

### Update Your Wishlist Title

```tsx
// Before
<h1 className="text-4xl md:text-6xl font-bold text-christmas-gradient">
  {name}'s wishlist
</h1>

// After (Option 1: Simple white with outline)
<h1 className="text-4xl md:text-6xl font-bold text-outlined">
  {name}'s wishlist
</h1>

// After (Option 2: Christmas colors with outline)
<h1 className="text-4xl md:text-6xl font-bold text-christmas-outlined">
  {name}'s wishlist
</h1>
```

### Update Navigation Items

```tsx
<Link
  href="/wishlist"
  className="text-lg font-semibold text-white text-stroke-sm hover:text-gold"
>
  My Wishlist
</Link>
```

### Update Buttons

```tsx
<Button className="btn-christmas text-outlined">🎅 Create Wishlist</Button>
```

---

**Note**: Text strokes work best with the Fredoka font's rounded, friendly letterforms. The bold weights (600-700) provide the best visual results with outlines.
