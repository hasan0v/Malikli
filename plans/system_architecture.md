### 6. System Architecture Diagram

```mermaid
graph LR
    subgraph User Devices
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph CDN[CDN (e.g., Cloudflare, AWS CloudFront)]
        StaticAssets[Static Assets (JS, CSS, Images)]
        CachedPages[Cached Pages (Optional)]
    end

    subgraph Cloud Infrastructure (e.g., AWS, GCP, Azure)
        LB[Load Balancer]

        subgraph Web Tier (Auto-scaling Group)
            WebApp1[Web Server / Frontend Server (Node.js/React Build)]
            WebApp2[Web Server / Frontend Server (Node.js/React Build)]
            WebAppN[... ]
        end

        subgraph API Tier (Auto-scaling Group)
            API1[Backend API Server (Node.js/Python/Ruby)]
            API2[Backend API Server (Node.js/Python/Ruby)]
            APIN[... ]
        end

        subgraph Data Stores
            DB[(Primary Database - PostgreSQL/MySQL)]
            ReplicaDB[(Read Replica DB)]
            Cache[(Cache - Redis)]
            JobQueue[(Background Job Queue - Redis/RabbitMQ)]
        end

        subgraph Background Workers
             Worker1[Worker Process (Notifications, Draw Execution)]
             Worker2[Worker Process ...]
        end

        subgraph Monitoring & Logging
            Monitoring[Monitoring Service (e.g., Datadog, Prometheus)]
            Logging[Centralized Logging (e.g., ELK Stack, CloudWatch Logs)]
            Alerting[Alerting System]
        end
    end

    subgraph Third-Party Services
        PaymentGW[Payment Gateway (Stripe/Braintree)]
        EmailSvc[Email Service (SendGrid/Mailgun)]
        Analytics[Web Analytics (Google Analytics)]
        SocialAPI[Social Media APIs (Instagram/Facebook)]
    end

    %% Connections
    Browser --> CDN
    Mobile --> CDN
    CDN --> LB
    LB --> Web Tier
    Web Tier --> API Tier
    Web Tier --- StaticAssets

    API Tier --> DB
    API Tier --> Cache
    API Tier --> JobQueue
    API Tier --> PaymentGW
    API Tier --> EmailSvc
    API Tier --> SocialAPI

    DB --> ReplicaDB
    API Tier --> ReplicaDB  // Reads can go to replica

    JobQueue --> Worker1
    Worker1 --> DB
    Worker1 --> EmailSvc

    WebApp1 -- Logs --> Logging
    API1 -- Logs --> Logging
    Worker1 -- Logs --> Logging
    DB -- Metrics --> Monitoring
    API1 -- Metrics --> Monitoring
    LB -- Metrics --> Monitoring
    Monitoring --> Alerting

    Browser -- Analytics Event --> Analytics
    Mobile -- Analytics Event --> Analytics
```

**Explanation:**

1.  **User Devices:** Access the site via browsers.
2.  **CDN:** Serves static assets (CSS, JS, images) and potentially cached pages globally for faster load times. Acts as the first line of defense (WAF).
3.  **Load Balancer:** Distributes incoming traffic across multiple web/API server instances for scalability and availability.
4.  **Web Tier:** Serves the frontend application (e.g., React build files). Could potentially be merged with API tier if using a monolithic framework or server-side rendering setup.
5.  **API Tier:** Handles business logic, data processing, interacts with databases and third-party services. Built using Node.js, Python, Ruby, etc. Scales independently.
6.  **Data Stores:**
    *   **Primary Database:** Stores core data (Users, Products, Orders, Drops, etc.). PostgreSQL or MySQL recommended for relational integrity.
    *   **Read Replica:** Handles read traffic to reduce load on the primary DB, improving performance.
    *   **Cache (Redis):** Stores frequently accessed data (sessions, product details, drop status) in memory for fast retrieval.
    *   **Job Queue:** Manages background tasks (sending emails, processing draws) asynchronously so they don't block web requests.
7.  **Background Workers:** Processes tasks from the Job Queue.
8.  **Third-Party Services:** External services for payments, emails, analytics, social integration.
9.  **Monitoring & Logging:** Essential for tracking performance, errors, and system health.