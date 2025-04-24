### 8. Data Model / ER Diagram

*(Simplified - Key Entities & Relationships. Attributes omitted for brevity)*

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ DRAW_ENTRIES : makes
    USERS ||--o{ FORUM_POSTS : authors
    USERS ||--o{ FORUM_REPLIES : authors

    DROPS ||--o{ PRODUCTS : contains
    DROPS ||--o{ DRAW_ENTRIES : belongs_to

    PRODUCTS ||--|{ CATEGORIES : belongs_to
    PRODUCTS ||--o{ ORDER_ITEMS : included_in
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    PRODUCTS ||--o{ PRODUCT_SIZES : has

    ORDERS ||--|{ USERS : placed_by
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ADDRESSES : ships_to
    ORDERS {
        INT id PK
        INT user_id FK
        INT shipping_address_id FK
        VARCHAR order_status
        DECIMAL total_amount
        TIMESTAMP created_at
        -- etc.
    }

    ORDER_ITEMS {
        INT id PK
        INT order_id FK
        INT product_id FK
        INT quantity
        DECIMAL price_per_unit
        VARCHAR size
    }

    PRODUCTS {
        INT id PK
        INT drop_id FK
        INT category_id FK
        VARCHAR name
        TEXT description
        DECIMAL price
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    PRODUCT_SIZES {
        INT id PK
        INT product_id FK
        VARCHAR size_name
        INT stock_quantity
    }

    DROPS {
        INT id PK
        VARCHAR name
        TEXT description
        TIMESTAMP entry_start_time
        TIMESTAMP entry_end_time
        TIMESTAMP purchase_start_time
        TIMESTAMP purchase_end_time
        VARCHAR status
    }

    DRAW_ENTRIES {
        INT id PK
        INT user_id FK
        INT drop_id FK
        BOOLEAN is_winner
        TIMESTAMP entered_at
    }

    USERS {
        INT id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR name
        VARCHAR role (Member, Admin)
        BOOLEAN is_waitlisted
        TIMESTAMP created_at
    }

    ADDRESSES {
        INT id PK
        INT user_id FK
        VARCHAR street
        VARCHAR city
        VARCHAR postal_code
        VARCHAR country
    }

    CATEGORIES {
        INT id PK
        VARCHAR name
    }

    CONTENT {
        INT id PK
        VARCHAR title
        TEXT body
        VARCHAR slug UK
        VARCHAR type (Article, Interview)
        TIMESTAMP published_at
    }

    FORUM_POSTS {
        INT id PK
        INT user_id FK
        VARCHAR title
        TEXT body
        TIMESTAMP created_at
    }

    FORUM_REPLIES {
        INT id PK
        INT post_id FK
        INT user_id FK
        TEXT body
        TIMESTAMP created_at
    }
```
