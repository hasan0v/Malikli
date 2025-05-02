Development Plan Outline:

**Phase 1: Project Setup & Foundation**
- [ ] Initialize Next.js Project
- [ ] Integrate Tailwind CSS
- [ ] Define Basic Project Structure
- [ ] Setup Supabase Project (Create, note URL/keys)
- [ ] Integrate Supabase Client (@supabase/supabase-js, env vars)
- [ ] Define Database Schema (profiles, products, orders, order_items)
- [ ] Setup Supabase Auth Trigger (populate profiles)
- [ ] Setup Row Level Security (RLS) Policies
- [ ] Setup Version Control (Git)

**Phase 2: Authentication & User Management**
- [ ] Implement Auth State Management (Context/Zustand/Jotai)
- [ ] Create Auth UI Components (Sign Up, Sign In, Sign Out)
- [ ] (Optional) Password Reset Component
- [ ] Implement Frontend Protected Routes
- [ ] Define Admin Role Assignment Strategy

**Phase 3: Core Backend API Development (Next.js API Routes)**
- [ ] Product API Route (`/products` GET)
- [ ] Product Detail API Route (`/products/[id]` GET)
- [ ] Admin Product API Routes (`/admin/products` POST, PUT, DELETE with role check)
- [ ] (Optional) Cart Logic API Routes (`/api/cart` GET, POST, DELETE)
- [ ] Order Processing API Route (`/api/orders` POST with inventory transaction)
- [ ] Payment Intent API Route (`/api/payment/create-intent` POST)
- [ ] Payment Webhook Handler (`/api/webhooks/payment` POST)

**Phase 4: Core Frontend Development**
- [ ] Create Layout Component (Header, Footer, Nav, Conditional UI)
- [ ] Build Product Listing Page
- [ ] Build Product Detail Page
- [ ] Build Shopping Cart Component/Page
- [ ] Build Checkout Page (Form, Stripe Elements integration)
- [ ] Build Admin Product Management UI (Protected)
- [ ] Build User Account/Order History Page (Protected)

**Phase 5: Implementing Drop Functionality**
- [ ] Enhance Admin UI for Drop Scheduling (is_active, drop_scheduled_time)
- [ ] Implement Backend Filtering for Drops
- [ ] Implement Frontend Display Logic for Drops (Countdowns, conditional display)
- [ ] Test Inventory Handling Under Load

**Phase 6: Testing & Deployment**
- [ ] Test API Routes (Role-based access)
- [ ] Test RLS Policies
- [ ] Perform Frontend Component & E2E Testing
- [ ] Configure Vercel (Environment variables)
- [ ] Deploy to Vercel
- [ ] Verify Production Deployment