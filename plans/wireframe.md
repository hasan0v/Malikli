### 4. Wireframes & Mockups

*   **Process:**
    1.  **Low-Fidelity Wireframes:** Create basic block diagrams/sketches for key pages (Homepage, Drop Calendar, Drop Detail, PDP, Cart, Checkout steps, Account Dashboard, Forum View, Admin sections). Focus on layout, content hierarchy, and key functional elements (buttons, forms). Use tools like Balsamiq, Figma (in simple mode), or even pen and paper.
    2.  **High-Fidelity Mockups:** Develop pixel-perfect visual designs based on wireframes. Incorporate the "Modern style, similar shades of Tiffany blue" aesthetic, typography, imagery, and branding. Use tools like Figma, Sketch, Adobe XD. These should show the final look and feel.

*   **Key Screens to Design (Wireframe & Mockup):**
    *   Homepage (Waitlist visible, Current Drop focus)
    *   Drop Calendar/List Page
    *   Drop Detail Page (Showing Draw entry button or Purchase button based on state)
    *   Product Detail Page (Image gallery, size selection, price, description)
    *   Shopping Cart Page/Overlay
    *   Checkout Flow (Address, Shipping, Payment, Summary)
    *   Order Confirmation Page
    *   User Account Dashboard
    *   User Profile/Settings Page
    *   Order History Page
    *   Community Forum (Topic List & Thread View)
    *   Admin Panel Dashboard
    *   Admin Drop Creation/Management Form
    *   Admin Draw Management View

---

### 5. Interaction Flows / Customer Journey Maps

*   **Journey 1: New User Waitlist Signup & First Drop Entry:**
    1.  User lands on Homepage -> Sees "Join Waitlist" -> Enters Email -> Clicks Submit.
    2.  System sends confirmation email (optional double opt-in).
    3.  User receives email about upcoming drop -> Clicks link -> Logs in (after setting password via link?).
    4.  User navigates to Drop Calendar -> Selects upcoming drop.
    5.  User sees Drop details -> Clicks "Enter Draw" (if window is open).
    6.  System confirms entry -> User sees confirmation message/status update in Account.
*   **Journey 2: Draw Winner Purchase:**
    1.  User receives "You Won!" email notification -> Clicks link to Drop.
    2.  User lands on Drop Detail Page -> Sees "Shop Now" / Purchase access granted.
    3.  User browses limited products -> Clicks on a product.
    4.  User views PDP -> Selects Size -> Clicks "Add to Cart".
    5.  User proceeds to Cart -> Reviews item -> Clicks "Checkout".
    6.  User enters/confirms Shipping Address -> Selects Shipping Method.
    7.  User enters Card Details via Payment Gateway -> Reviews Order Summary.
    8.  User clicks "Place Order".
    9.  System processes payment -> Displays Order Confirmation Page -> Sends Confirmation Email.
*   **Journey 3: Community Engagement:**
    1.  Logged-in User navigates to "Community" section.
    2.  User browses Forum Categories -> Clicks on a Category/Topic.
    3.  User reads existing Thread -> Clicks "Reply".
    4.  User types message -> Clicks Submit.
    5.  OR User clicks "Start New Thread" -> Enters Title & Message -> Clicks Submit.
*   **Journey 4: Admin Creates & Manages a Drop:**
    1.  Admin logs into Admin Panel -> Navigates to "Drops".
    2.  Admin clicks "Create New Drop" -> Fills in details (Name, Dates, Description).
    3.  Admin navigates to "Products" -> Creates new products OR associates existing products with the new Drop (sets stock).
    4.  Drop entry window opens automatically based on dates.
    5.  After entry window closes, Admin navigates to "Draws" -> Selects the Drop -> Clicks "Run Draw".
    6.  System selects winners -> Admin reviews winner list.
    7.  Purchase window opens automatically for winners.
    8.  Admin monitors orders coming in via "Orders" section.
