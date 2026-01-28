# Favicon Setup - Clash Royale Elixir Icon

I've added a custom Elixir icon SVG that appears in browser tabs. Here's how to customize it further.

## Current Setup

- **SVG Icon**: `/public/elixir-icon.svg` - A purple/pink elixir container icon
- **Favicon**: `/public/favicon.ico` - Standard favicon (placeholder)
- **Metadata**: Updated in `app/layout.tsx` to use the elixir icon

## How to Replace with Actual Clash Royale Elixir Icon

If you have an actual Clash Royale elixir icon image:

### Option 1: Replace SVG File
1. Get a Clash Royale elixir icon (PNG or SVG)
2. Save it as `/public/elixir-icon.svg` (if SVG) or `/public/elixir-icon.png` (if PNG)
3. If using PNG, update `app/layout.tsx` to reference `.png` instead of `.svg`

### Option 2: Use Online Icon Generator
1. Go to https://realfavicongenerator.net/
2. Upload your Clash Royale elixir icon image
3. Download the generated favicon package
4. Replace files in `/public/` folder
5. Update `app/layout.tsx` if needed

### Option 3: Create Custom Icon
1. Use an image editor to create a 64x64 or 128x128 icon
2. Save as PNG or SVG
3. Place in `/public/` folder
4. Update references in `app/layout.tsx`

## Icon Specifications

For best results:
- **Size**: 64x64px minimum (128x128px recommended)
- **Format**: SVG (scalable) or PNG (with transparency)
- **Colors**: Purple/pink elixir colors (#a855f7, #ec4899, #8b5cf6)
- **Background**: Transparent or dark (#0F172A)

## Current Icon Design

The current SVG icon includes:
- Purple/pink gradient elixir liquid
- Gold container rims (top and bottom)
- Animated bubbles effect
- Dark container background

## Testing

After updating the icon:
1. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Check browser tab to see the icon
3. Test on mobile devices
4. Clear browser cache if icon doesn't update

## Browser Support

- ✅ Chrome/Edge: SVG favicon supported
- ✅ Firefox: SVG favicon supported
- ✅ Safari: SVG favicon supported (iOS 11+)
- ✅ Fallback: `.ico` file for older browsers

The icon should now appear in browser tabs showing the Elixir container!


