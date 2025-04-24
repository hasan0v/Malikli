## Project Plan: MALIKLI1992 E-commerce Website

**Project Goal:** To develop a high-quality, secure, and scalable e-commerce website for MALIKLI1992, focusing on exclusive timed "drops" of fashion items, a fair draw system for access, community engagement, and a premium user experience.

---

### 1. Functional Requirements Document (FRD)

This document outlines *what* the system must do.

**1.1. User Facing Features:**

*   **F1: Homepage:**
    *   F1.1: Display prominent "Join Waitlist" section with email input field for non-members/logged-out users.
    *   F1.2: Showcase the current or upcoming "Drop" (e.g., "April Drop") with key visuals and a link/button to view details.
    *   F1.3: Display a snippet or link to the Drop Calendar.
    *   F1.4: Potentially showcase featured content (designer interviews, etc.).
    *   F1.5: Standard header (Logo, Navigation, Account Access/Login, Cart) and footer (Links to Legal, Support, Social Media).
*   **F2: User Authentication & Accounts:**
    *   F2.1: User Registration (Likely via waitlist confirmation or direct signup if waitlist is bypassed later).
    *   F2.2: User Login (Email & Password).
    *   F2.3: Password Reset functionality.
    *   F2.4: User Profile Management (View/Edit Name, Email, Addresses, Password).
    *   F2.5: Order History view.
    *   F2.6: Drop Entry History view.
    *   F2.7: Waitlist Status display (if applicable).
*   **F3: Drop System:**
    *   F3.1: Drop Calendar: Display past, current, and upcoming drops with dates/times.
    *   F3.2: Drop Detail Page: Show information about a specific drop (theme, items, date/time, draw status).
    *   F3.3: Drop Notification Signup: Allow users to register interest for notifications about specific upcoming drops.
    *   F3.4: Automated Reminders: Send email notifications to registered users before a drop starts.
*   **F4: Draw System:**
    *   F4.1: Secure Draw Entry: Allow logged-in members to enter the draw for a specific drop during the entry window.
    *   F4.2: Entry Confirmation: Display confirmation upon successful entry.
    *   F4.3: Draw Execution: Backend process to randomly select winners (details handled by admin/system).
    *   F4.4: Winner Notification: Notify successful entrants via email and potentially on their account dashboard.
    *   F4.5: Priority Checkout Access: Grant winners exclusive access to purchase items from the drop for a limited time.
*   **F5: Product Catalog & Display:**
    *   F5.1: Product Listing: Display products associated with a specific drop (visible to winners during priority access, potentially browsable by all members outside access window).
    *   F5.2: Product Detail Page (PDP):
        *   F5.2.1: High-quality product images (multiple angles).
        *   F5.2.2: Product Name & Description (emphasizing quality/sustainability).
        *   F5.2.3: Price.
        *   F5.2.4: Available Sizes (with selection).
        *   F5.2.5: Indication of limited stock/exclusivity.
        *   F5.2.6: "Add to Cart" button (enabled only for eligible users during purchase windows).
*   **F6: Shopping Cart:**
    *   F6.1: Add items to cart from PDP.
    *   F6.2: View cart contents (product, size, price, quantity, subtotal).
    *   F6.3: Update item quantity (likely fixed at 1 per item due to exclusivity).
    *   F6.4: Remove items from cart.
    *   F6.5: Display estimated total.
    *   F6.6: Proceed to Checkout button.
*   **F7: Checkout Flow:**
    *   F7.1: Shipping Address Entry/Selection (using saved addresses).
    *   F7.2: Shipping Method Selection (Mail, display cost).
    *   F7.3: Payment Method Entry (Card details via secure gateway).
    *   F7.4: Order Summary Review (Items, Shipping, Tax (if applicable), Total).
    *   F7.5: Place Order button.
    *   F7.6: Order Confirmation Page: Display order number and summary.
    *   F7.7: Order Confirmation Email: Send detailed confirmation to the user.
*   **F8: Content & Community:**
    *   F8.1: Content Display: Pages/sections to display behind-the-scenes features, designer interviews, styling tutorials (managed via Admin Panel).
    *   F8.2: Community Forum:
        *   F8.2.1: View forum categories/topics.
        *   F8.2.2: View discussion threads.
        *   F8.2.3: Create new discussion threads (logged-in members).
        *   F8.2.4: Post replies to threads (logged-in members).
        *   F8.2.5: User profiles visible within the forum context.
*   **F9: Support:**
    *   F9.1: Contact/Support Page with an Email Form for inquiries.
    *   F9.2: FAQ Section (Recommended).
*   **F10: Localization:**
    *   F10.1: Display website content in selected languages (English, Turkish, Russian, Arabic, Chinese).
    *   F10.2: Language selector accessible to users.
*   **F11: Notifications:**
    *   F11.1: Email notification for Drop Start (for registered interest).
    *   F11.2: Email notification for Order Confirmation.
    *   F11.3: Email notification for Shipment Tracking/Dispatch.
    *   F11.4: Email notification for Draw Winners.
    *   F11.5: Email notification for Waitlist confirmation/updates (if implemented).
*   **F12: Social Media Integration:**
    *   F12.1: Links to Instagram/Facebook profiles.
    *   F12.2: Potential integration to display Instagram feed on the website.
    *   F12.3: Potential integration with Facebook/Instagram Shop (requires specific setup and product feed).

**1.2. Admin Panel Features:**

*   **F13: Admin Dashboard:** Overview of key metrics (sales, users, current drop status).
*   **F14: User Management:**
    *   F14.1: View/Search Users.
    *   F14.2: Manage User Roles (Admin, Member).
    *   F14.3: View User Details (Order History, Drop Entries).
    *   F14.4: Manage Waitlist (View emails, potentially approve users).
*   **F15: Drop Management:**
    *   F15.1: Create/Edit/Delete Drops (Set name, theme, dates/times for entry and purchase windows).
    *   F15.2: Associate Products with specific Drops.
    *   F15.3: View Drop Calendar.
*   **F16: Draw Management:**
    *   F16.1: View entrants for a specific Drop's draw.
    *   F16.2: Initiate secure, random draw process.
    *   F16.3: View draw winners.
    *   F16.4: Manage winner access periods.
    *   F16.5: Tools to ensure fairness and detect potential bots (logging, basic checks).
*   **F17: Product Management:**
    *   F17.1: Create/Edit/Delete Product Categories (initially 2-3).
    *   F17.2: Create/Edit/Delete Products (Name, Description, Price, Sizes, Quality details, Images, Stock Quantity).
    *   F17.3: Manage Inventory levels (small batches).
*   **F18: Order Management:**
    *   F18.1: View/Search Orders.
    *   F18.2: View Order Details (Customer info, Products, Shipping, Payment status).
    *   F18.3: Update Order Status (e.g., Processing, Shipped).
    *   F18.4: Add Tracking Information.
    *   F18.5: Handle Returns/Refunds (Process defined manually, status updated).
*   **F19: Content Management System (CMS):**
    *   F19.1: Create/Edit/Delete Content Pages/Articles (for interviews, tutorials, etc.).
    *   F19.2: Basic WYSIWYG editor.
*   **F20: Community Forum Management:**
    *   F20.1: Moderate Threads/Posts (Edit, Delete, Lock).
    *   F20.2: Manage Forum Categories.
    *   F20.3: Ban/Manage problematic users within the forum.
*   **F21: System Settings:**
    *   F21.1: Configure site settings (e.g., contact email, social media links).
    *   F21.2: Manage localization strings/content.

