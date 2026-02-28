# LUXE Shop — Luxury Glassmorphism E-Commerce

A production-ready full-stack e-commerce app with a luxury glassmorphism design, built with React + Vite + Supabase.

## Quick Start

```bash
npm install
npm run dev
```

## Pages Included
- **/** — Homepage with Hero, Categories, Featured Products, New Arrivals
- **/shop** — Full product catalog with filters, search, sort
- **/product/:id** — Product detail with gallery, reviews, tabs
- **/cart** — Cart management with coupon codes
- **/checkout** — Full checkout with address + payment forms
- **/orders** — Order history
- **/orders/:id** — Order detail with tracking timeline
- **/profile** — User profile & security
- **/wishlist** — Saved items
- **/login** & **/register** — Auth pages

## Supabase Tables Expected

| Table | Key Columns |
|-------|------------|
| `products` | id, name, description, price, sale_price, image_url, images, category, stock, is_featured, avg_rating, review_count |
| `categories` | id, name |
| `cart` | id, user_id, product_id, quantity |
| `wishlist` | id, user_id, product_id |
| `orders` | id, user_id, status, total_amount, subtotal_amount, shipping_amount, shipping_address (json), items (json), payment_method |
| `reviews` | id, product_id, user_id, rating, comment, created_at |
| `profiles` | id, full_name, phone, avatar_url |
| `coupons` | id, code, discount_type, discount_value, is_active |

## Design Features
- ◆ Luxury glassmorphism throughout
- Animated gradient background blobs
- Smooth micro-interactions & hover effects
- Fully responsive (mobile → tablet → desktop)
- Toast notification system
- Skeleton loading states
