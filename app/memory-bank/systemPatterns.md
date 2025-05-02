```markdown
## System Patterns (systemPatterns.md)

This document outlines the architectural design, data models, API definitions, component structure, integration points, and scalability strategy for the malikli1992 e-commerce web application.

### 1. Architectural Design: JAMstack with Serverless Functions

We will employ a JAMstack architecture leveraging Next.js for the frontend, Tailwind CSS for styling, and Supabase as the backend. Serverless functions (Supabase Edge Functions or Next.js API routes) will handle specific backend logic, such as payment processing and complex data transformations.

*   **Frontend (Next.js):** Handles user interface, routing, and presentation logic. It fetches data from the Supabase database and serverless functions.
*   **Backend (Supabase):** Provides database management (Postgres), authentication, storage, and serverless function capabilities.
*   **Serverless Functions (Supabase Edge Functions/Next.js API Routes):** Handle specific backend tasks, ensuring separation of concerns and scalability.
*   **CDN (Content Delivery Network):** Next.js's built-in static site generation (SSG) and image optimization will be leveraged for optimal performance, deployed to a CDN for faster content delivery.

This architecture allows for improved performance, security, and scalability compared to traditional monolithic applications. The separation of concerns simplifies development and maintenance.

### 2. Data Models (Supabase Database Schema)

The following are the key data models within the Supabase database:

*   **Users:**
    *   `id` (UUID, Primary Key, Auto-generated): Unique user identifier. Managed by Supabase Auth.
    *   `email` (TEXT, Unique): User's email address. Managed by Supabase Auth.
    *   `created_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the user was created. Managed by Supabase Auth.
    *   `updated_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the user was last updated. Managed by Supabase Auth.
    *   `username` (TEXT, Unique): User's chosen username.
    *   `full_name` (TEXT): User's full name.
    *   `profile_picture_url` (TEXT): URL to the user's profile picture.
    *   `role` (ENUM ['user', 'admin']): User role; defaults to 'user'.

*   **Products:**
    *   `id` (UUID, Primary Key, Auto-generated): Unique product identifier.
    *   `name` (TEXT): Product name.
    *   `description` (TEXT): Product description.
    *   `price` (NUMERIC): Product price.
    *   `image_urls` (TEXT[]): Array of URLs to product images.
    *   `stock` (INTEGER): Number of units in stock.
    *   `category` (TEXT): Product category (e.g., "T-shirts", "Hoodies").
    *   `created_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the product was created.
    *   `updated_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the product was last updated.
    *   `drop_id` (UUID, Foreign Key referencing `Drops.id`): The drop this product belongs to.

*   **Drops:**
    *   `id` (UUID, Primary Key, Auto-generated): Unique drop identifier.
    *   `name` (TEXT): Drop name (e.g., "Summer Collection 2025").
    *   `description` (TEXT): Drop description.
    *   `start_date` (TIMESTAMP WITH TIME ZONE): Date and time when the drop becomes available.
    *   `end_date` (TIMESTAMP WITH TIME ZONE): Date and time when the drop ends.
    *   `is_active` (BOOLEAN): Indicates whether the drop is currently active.
    *   `created_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the drop was created.
    *   `updated_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the drop was last updated.

*   **Orders:**
    *   `id` (UUID, Primary Key, Auto-generated): Unique order identifier.
    *   `user_id` (UUID, Foreign Key referencing `Users.id`): ID of the user who placed the order.
    *   `order_date` (TIMESTAMP WITH TIME ZONE): Date and time the order was placed.
    *   `total_amount` (NUMERIC): Total amount of the order.
    *   `status` (ENUM ['pending', 'processing', 'shipped', 'delivered', 'cancelled']): Order status.
    *   `shipping_address` (JSONB): JSON object containing shipping address details.
    *   `created_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the order was created.
    *   `updated_at` (TIMESTAMP WITH TIME ZONE): Timestamp indicating when the order was last updated.

*   **OrderItems:**
    *   `id` (UUID, Primary Key, Auto-generated): Unique order item identifier.
    *   `order_id` (UUID, Foreign Key referencing `Orders.id`): ID of the order this item belongs to.
    *   `product_id` (UUID, Foreign Key referencing `Products.id`): ID of the product in this order item.
    *   `quantity` (INTEGER): Quantity of the product in this order item.
    *   `price` (NUMERIC): Price of the product at the time of the order.

### 3. API Definitions (Examples)

These are examples of API endpoints, implemented either as Next.js API routes or Supabase Edge Functions:

*   **`/api/products` (GET):**
    *   Description: Retrieves a list of products.
    *   Parameters:
        *   `dropId` (UUID, optional): Filter products by drop ID.
        *   `category` (string, optional): Filter products by category.
        *   `limit` (integer, optional): Limit the number of results.
        *   `offset` (integer, optional): Offset for pagination.
    *   Response: JSON array of product objects.

*   **`/api/products/:id` (GET):**
    *   Description: Retrieves a single product by ID.
    *   Parameters: `id` (UUID): Product ID.
    *   Response: JSON object representing the product.

*   **`/api/drops` (GET):**
    *   Description: Retrieves a list of drops.
    *   Parameters: `isActive` (boolean, optional): Filter for active drops.
    *   Response: JSON array of drop objects.

*   **`/api/orders` (POST):**
    *   Description: Creates a new order.  Requires authentication.
    *   Request Body: JSON object containing order details (e.g., `user_id`, `order_items`, `shipping_address`).
    *   Response: JSON object representing the created order.

*   **`/api/auth/signup` (POST):**
    *   Description: Registers a new user. (handled by Supabase Auth)
    *   Request Body: JSON object containing `email` and `password`.
    *   Response: JSON object containing user details (if successful) or an error message.

*   **`/api/auth/login` (POST):**
    *   Description: Logs in an existing user. (handled by Supabase Auth)
    *   Request Body: JSON object containing `email` and `password`.
    *   Response: JSON object containing user details (if successful) or an error message.

### 4. Component Structure (React Components)

The application will be structured using reusable React components. Here's a high-level overview:

*   **Layout Components:**
    *   `Layout`: Provides the overall page structure (header, footer, main content area).
    *   `Header`: Navigation bar with links to different sections of the application.
    *   `Footer`: Copyright information and other relevant links.

*   **UI Components:**
    *   `ProductCard`: Displays a single product with its image, name, price, and a "Add to Cart" button.
    *   `ProductList`: Displays a list of `ProductCard` components.
    *   `DropCard`: Displays information about a single drop.
    *   `DropList`: Displays a list of `DropCard` components.
    *   `Button`: Reusable button component with different styles.
    *   `Input`: Reusable input field component.

*   **Page Components:**
    *   `Home`: Landing page displaying active drops and featured products.
    *   `Products`: Page displaying all products, filterable by category and drop.
    *   `ProductDetail`: Page displaying detailed information about a specific product.
    *   `Drops`: Page displaying all drops.
    *   `Cart`: Shopping cart page.
    *   `Checkout`: Checkout page for completing the order.
    *   `Login`: Login page.
    *   `Signup`: Signup page.
    *   `Profile`: User profile page (requires authentication).
    *   `AdminDashboard`: Admin dashboard for managing products, drops, and users (requires admin role).

*   **Context Providers:**
    *   `AuthProvider`: Manages user authentication state.
    *   `CartProvider`: Manages the shopping cart state.

### 5. Integration Points

*   **Supabase Authentication:** Integrated with the frontend using the `@supabase/supabase-js` library for user signup, login, logout, and session management.
*   **Supabase Database:** Accessed directly from Next.js components and serverless functions using the `@supabase/supabase-js` library for data fetching and manipulation.
*   **Payment Gateway (Stripe):** Integrated via serverless functions to handle payment processing during checkout. Stripe's API will be used to create charges and handle webhooks for payment confirmation.
*   **Email Service (Resend, Sendgrid, or Supabase Email):** Used for sending transactional emails (e.g., order confirmation, password reset). Integrated via serverless functions.
*   **Image Storage (Supabase Storage):** Used to store product images and user profile pictures.  Accessed via the `@supabase/supabase-js` library.

### 6. Scalability Strategy

The following strategies will be employed to ensure the application can scale to handle increasing traffic and data:

*   **JAMstack Architecture:** The core of the application is pre-rendered and served from a CDN, providing excellent performance and scalability.
*   **Serverless Functions:** Backend logic is executed in serverless functions, which automatically scale based on demand.
*   **Database Optimization:** Database queries will be optimized for performance. Indexing will be used appropriately. Connection pooling will be configured to minimize latency.
*   **CDN Caching:** Static assets and API responses will be cached aggressively on the CDN to reduce load on the serverless functions and database.
*   **Horizontal Scaling:** Supabase provides options for horizontal scaling of the database and serverless functions.
*   **Rate Limiting:** Implement rate limiting on API endpoints to prevent abuse and ensure fair usage.
*   **Monitoring and Alerting:** Implement monitoring and alerting to track application performance and identify potential issues before they impact users.  Tools like Sentry or DataDog will be integrated.
*   **Load Testing:** Regularly perform load testing to identify bottlenecks and optimize the application for high traffic scenarios.
*   **Database Read Replicas:** Consider using database read replicas to offload read traffic from the primary database.

Created on 01.05.2025
```