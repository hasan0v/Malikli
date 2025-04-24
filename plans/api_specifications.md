### 9. API Specification (High-Level Examples)

*   **Authentication:** JWT (JSON Web Tokens) via Authorization Header (`Bearer <token>`).
*   **Base URL:** `/api/v1`
*   **Format:** JSON

**Endpoints:**

*   `POST /auth/register` (Creates user, potentially adds to waitlist)
*   `POST /auth/login` (Returns JWT)
*   `POST /auth/waitlist` (Adds email to waitlist)
*   `GET /drops` (List upcoming/current/past drops)
*   `GET /drops/{drop_id}` (Get details of a specific drop)
*   `POST /drops/{drop_id}/enter` (Authenticated users enter the draw)
*   `GET /drops/{drop_id}/products` (List products for a specific drop - access control based on winner status/time)
*   `GET /products/{product_id}` (Get product details)
*   `GET /cart` (View user's cart)
*   `POST /cart` (Add item to cart - requires product_id, size_id, quantity=1)
*   `DELETE /cart/items/{cart_item_id}` (Remove item from cart)
*   `POST /orders` (Create order from cart - includes address_id, triggers payment flow)
*   `GET /orders` (List user's order history)
*   `GET /orders/{order_id}` (Get specific order details)
*   `GET /account/me` (Get current user profile)
*   `PUT /account/me` (Update user profile)
*   `GET /account/addresses` / `POST /account/addresses` / `PUT /account/addresses/{id}` / `DELETE /account/addresses/{id}`
*   `GET /account/entries` (List user's draw entries)
*   `GET /content` (List articles/features)
*   `GET /content/{slug}` (Get specific article)
*   `GET /forum/topics`
*   `GET /forum/topics/{topic_id}/threads`
*   `POST /forum/topics/{topic_id}/threads` (Create thread)
*   `GET /forum/threads/{thread_id}/replies`
*   `POST /forum/threads/{thread_id}/replies` (Create reply)

**Admin API (e.g., `/api/v1/admin/...` with Admin role protection):**

*   CRUD endpoints for Users, Drops, Products, Categories, Orders, Content.
*   `POST /admin/drops/{drop_id}/run-draw` (Initiate the draw)
*   `GET /admin/drops/{drop_id}/entrants` (View draw participants)
*   `GET /admin/drops/{drop_id}/winners` (View draw winners)
*   Endpoints for forum moderation.
