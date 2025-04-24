# MALIKLI1992 E-commerce Website - Detailed To-Do List

**Methodology:** Agile (Kanban/Sprints) - Prioritize MVP features first due to aggressive timeline (Schedule).

## Phase 0: Planning & Design

*   **[ ] Project Setup:**
    *   [ ] Confirm Final Scope & MVP Requirements (FRD, Schedule)
    *   [ ] Setup Project Management Tool (Jira, Trello, etc.) (Schedule)
    *   [ ] Setup Code Repositories (Git - GitHub/GitLab/Bitbucket) (Deploy 2)
    *   [ ] Define Git Branching Strategy (e.g., Gitflow/GitHub Flow) (Deploy 2)
    *   [ ] Confirm Team Roles & Responsibilities (Schedule)
    *   [ ] Estimate Budget & Secure Resources (Schedule)
*   **[ ] UI/UX Design:**
    *   [ ] Create Low-Fidelity Wireframes for all Key Screens (Homepage, Drop Calendar/Detail, PDP, Cart, Checkout, Account, Forum, Admin) (Wireframe 4)
    *   [ ] Develop High-Fidelity Mockups incorporating "Modern style, similar shades of Tiffany blue" aesthetic (Wireframe 4)
    *   [ ] Design User Interaction Flows / Customer Journey Maps (New User, Draw Winner Purchase, Community Engagement, Admin Drop Management) (Wireframe 5)
    *   [ ] Define Sitemap & Site Navigation Structure (Sitemap 3)
    *   [ ] Create Style Guide (Typography, Colors, Components)
    *   [ ] Design for Responsiveness (Mobile, Tablet, Desktop) (NFR9.2)
    *   [ ] Design for Accessibility (WCAG 2.1 AA) - Color contrast, focus states, etc. (NFR6)
    *   [ ] Design localized UI variations (especially RTL for Arabic) (NFR7.3)
*   **[ ] Architecture & Technology:**
    *   [ ] Finalize Technology Stack Selection (Tech Stack 7)
    *   [ ] Design Detailed System Architecture (System Architecture 6)
    *   [ ] Design Detailed Data Model / ER Diagram (Data Model 8)
    *   [ ] Define API Specification (High-level & Detailed Endpoints) (API Spec 9)
    *   [ ] Plan for Scalability (Horizontal scaling, DB read replicas) (NFR2, Arch)
    *   [ ] Plan for Localization (i18n library selection/integration) (NFR7)
    *   [ ] Define Security Requirements & Strategy (SRD 10, NFR4)

## Phase 1: Backend Development

*   **[ ] Core Setup:**
    *   [ ] Initialize Node.js project (Express/NestJS) (Tech Stack)
    *   [ ] Setup Basic Project Structure (Controllers, Services, Models, etc.)
    *   [ ] Integrate Logging Library (Winston, Pino) -> Centralized Logging (Arch)
    *   [ ] Setup Environment Configuration (.env files)
    *   [ ] Implement Basic Health Check Endpoint
*   **[ ] Database:**
    *   [ ] Setup PostgreSQL Database (Primary & Replica if needed early) (Tech Stack, Arch)
    *   [ ] Implement ORM (e.g., Sequelize, TypeORM)
    *   [ ] Define and Create Database Schema based on Data Model (Data Model 8)
        *   [ ] `USERS` table
        *   [ ] `DROPS` table
        *   [ ] `PRODUCTS` table
        *   [ ] `CATEGORIES` table
        *   [ ] `PRODUCT_SIZES` table
        *   [ ] `PRODUCT_IMAGES` table
        *   [ ] `DRAW_ENTRIES` table
        *   [ ] `ORDERS` table
        *   [ ] `ORDER_ITEMS` table
        *   [ ] `ADDRESSES` table
        *   [ ] `CONTENT` table
        *   [ ] `FORUM_POSTS` table
        *   [ ] `FORUM_REPLIES` table
        *   [ ] Waitlist Table (if separate from USERS `is_waitlisted`)
    *   [ ] Implement Database Migrations Tool (Sequelize CLI, Flyway, Alembic) (Deploy 3)
    *   [ ] Seed Initial Data (Categories, Admin User) (Deploy 6)
*   **[ ] Authentication & Authorization (Auth API - API Spec, SRD 1, SRD 2):**
    *   [ ] Implement User Registration (`POST /auth/register`) (FRD F2.1)
    *   [ ] Implement User Login (`POST /auth/login`) (FRD F2.2)
    *   [ ] Implement Strong Password Hashing (bcrypt/Argon2) (SRD 1)
    *   [ ] Implement JWT Generation & Validation Middleware (API Spec, SRD 1)
    *   [ ] Implement Secure Password Reset (`POST /auth/forgot-password`, `POST /auth/reset-password`) (FRD F2.3, SRD 1)
    *   [ ] Implement Role-Based Access Control (RBAC) Middleware (Admin, Member) (SRD 2)
    *   [ ] Implement Waitlist Signup Logic (`POST /auth/waitlist` or during registration) (FRD F1.1, API Spec)
*   **[ ] User Account Management (Account API - API Spec, FRD F2):**
    *   [ ] Implement Get User Profile (`GET /account/me`) (FRD F2.4)
    *   [ ] Implement Update User Profile (`PUT /account/me`) (FRD F2.4)
    *   [ ] Implement Address CRUD (`GET /account/addresses`, `POST /account/addresses`, etc.) (FRD F2.4)
    *   [ ] Implement Get Order History (`GET /orders`) (FRD F2.5)
    *   [ ] Implement Get Specific Order (`GET /orders/{order_id}`) (FRD F2.5)
    *   [ ] Implement Get User Draw Entries (`GET /account/entries`) (FRD F2.6)
*   **[ ] Drop & Draw System (Drops API - API Spec, FRD F3, FRD F4):**
    *   [ ] Implement List Drops (`GET /drops`) (FRD F3.1)
    *   [ ] Implement Get Drop Details (`GET /drops/{drop_id}`) (FRD F3.2)
    *   [ ] Implement Draw Entry (`POST /drops/{drop_id}/enter` - with auth, time window check, RBAC) (FRD F4.1, API Spec)
    *   [ ] Implement Logic to Prevent Duplicate Entries per User per Drop
    *   [ ] Implement Background Job for Random Winner Selection (See Background Workers) (FRD F4.3)
    *   [ ] Implement Logic to Update `DRAW_ENTRIES` with winner status
    *   [ ] Implement Endpoint to List Products for a Drop (`GET /drops/{drop_id}/products` - with access control for winners/time) (FRD F4.5, FRD F5.1, API Spec)
*   **[ ] Product Catalog (Products API - API Spec, FRD F5):**
    *   [ ] Implement Get Product Details (`GET /products/{product_id}`) (FRD F5.2, API Spec)
    *   [ ] Ensure Stock Levels are respected (Product Sizes Stock)
*   **[ ] Cart & Checkout (Cart/Orders API - API Spec, FRD F6, FRD F7):**
    *   [ ] Implement Get Cart (`GET /cart`) (FRD F6.2)
    *   [ ] Implement Add to Cart (`POST /cart` - check drop access, stock, quantity=1 logic) (FRD F6.1, API Spec)
    *   [ ] Implement Remove from Cart (`DELETE /cart/items/{cart_item_id}`) (FRD F6.4, API Spec)
    *   [ ] Implement Create Order (`POST /orders` - triggers payment, calculates totals, decrements stock) (FRD F7.5, API Spec)
    *   [ ] Integrate Payment Gateway (Stripe) SDK/API for Payment Intent creation and confirmation (FRD F7.3, Tech Stack, SRD 6)
    *   [ ] Implement Order Confirmation Logic (Update status, potentially trigger email job) (FRD F7.6)
*   **[ ] Content API (API Spec, FRD F8.1):**
    *   [ ] Implement List Content (`GET /content`)
    *   [ ] Implement Get Specific Content (`GET /content/{slug}`)
*   **[ ] Community Forum API (API Spec, FRD F8.2 - *Potential MVP Cut*):**
    *   [ ] Implement List Topics (`GET /forum/topics`)
    *   [ ] Implement List Threads in Topic (`GET /forum/topics/{topic_id}/threads`)
    *   [ ] Implement Create Thread (`POST /forum/topics/{topic_id}/threads`)
    *   [ ] Implement List Replies in Thread (`GET /forum/threads/{thread_id}/replies`)
    *   [ ] Implement Create Reply (`POST /forum/threads/{thread_id}/replies`)
*   **[ ] Background Jobs & Queue (Arch, FRD F11):**
    *   [ ] Setup Job Queue (Redis/RabbitMQ) (Arch, Tech Stack)
    *   [ ] Implement Job Enqueuing Logic (e.g., for Emails, Draw Execution) in API Tier
    *   [ ] Implement Background Worker Process(es) (Arch)
    *   [ ] Implement Draw Execution Worker Logic (Selects winners randomly, updates DB) (FRD F4.3, FRD F16.2)
    *   [ ] Implement Email Notification Worker Logic (Integrate Email Service - SES/SendGrid) (FRD F11, Tech Stack, Arch)
        *   [ ] Waitlist Confirmation Email Job
        *   [ ] Drop Start Reminder Email Job
        *   [ ] Draw Winner Notification Email Job
        *   [ ] Order Confirmation Email Job
        *   [ ] Shipment Notification Email Job (Triggered by Admin action)
*   **[ ] Admin API (API Spec, FRD F13-F21):**
    *   [ ] Implement Admin Auth Middleware (Check Admin Role)
    *   [ ] Implement User Management CRUD (`/admin/users/...`) (FRD F14)
    *   [ ] Implement Drop Management CRUD (`/admin/drops/...`) (FRD F15)
    *   [ ] Implement Product Management CRUD (`/admin/products/...`, `/admin/categories/...`) (FRD F17)
    *   [ ] Implement Order Management View/Update (`/admin/orders/...`) (FRD F18)
    *   [ ] Implement Draw Management Endpoints:
        *   [ ] View Entrants (`GET /admin/drops/{drop_id}/entrants`) (FRD F16.1)
        *   [ ] Trigger Draw (`POST /admin/drops/{drop_id}/run-draw`) (FRD F16.2)
        *   [ ] View Winners (`GET /admin/drops/{drop_id}/winners`) (FRD F16.3)
    *   [ ] Implement Content Management CRUD (`/admin/content/...`) (FRD F19)
    *   [ ] Implement Forum Moderation Endpoints (`/admin/forum/...`) (FRD F20 - *Potential MVP Cut*)
*   **[ ] Security Implementation (SRD 10, NFR4):**
    *   [ ] Implement Input Validation on all API endpoints (SRD 4)
    *   [ ] Implement Output Encoding (Handled by framework defaults, verify) (SRD 4)
    *   [ ] Implement CSRF Protection (Framework middleware) (SRD 5)
    *   [ ] Implement Rate Limiting (Login, Draw Entry, potentially others) (SRD 1, SRD 7)
    *   [ ] Implement Security Headers (HSTS, CSP, X-Frame-Options, etc.) (SRD 3)
    *   [ ] Configure CORS correctly
    *   [ ] Implement Security Audit Logging (SRD 8)
*   **[ ] Performance Optimization:**
    *   [ ] Implement Caching Strategy (Redis for sessions, frequent queries) (NFR1, Arch)
    *   [ ] Optimize Database Queries (Indexing, efficient joins) (NFR1.4)
    *   [ ] Ensure Stateless API Design for Scalability (NFR2.2)

## Phase 2: Frontend Development

*   **[ ] Core Setup:**
    *   [ ] Initialize React (Next.js) project (Tech Stack)
    *   [ ] Setup Basic Project Structure (Pages, Components, Services, Store, etc.)
    *   [ ] Integrate CSS Framework/Library or Styling Solution (Styled Components, Tailwind CSS)
    *   [ ] Implement Routing based on Sitemap (Sitemap 3)
    *   [ ] Setup Global State Management (Context API, Redux, Zustand) if needed
    *   [ ] Setup API Client/Service Layer (e.g., Axios, fetch)
    *   [ ] Implement Base Layout (Header, Footer, Main Content Area) (FRD F1.5)
    *   [ ] Integrate i18n Library (e.g., react-i18next) & Setup Language Files (FRD F10, NFR7)
    *   [ ] Implement Language Selector Component (FRD F10.2)
*   **[ ] User Interface - Public Pages:**
    *   [ ] Implement Homepage (Waitlist form, Current Drop display, Calendar snippet) (FRD F1)
    *   [ ] Implement Drop Calendar/List Page (FRD F3.1)
    *   [ ] Implement Drop Detail Page (Display info, Enter Draw button logic, Purchase button logic based on status) (FRD F3.2, FRD F4.5)
    *   [ ] Implement Product Detail Page (Image gallery, Info, Size selection, Add to Cart button logic) (FRD F5.2)
    *   [ ] Implement Content Display Pages/Templates (FRD F8.1)
*   **[ ] User Interface - Authentication & Account:**
    *   [ ] Implement Login Page/Modal (FRD F2.2)
    *   [ ] Implement Registration Integration (Potentially via waitlist flow) (FRD F2.1)
    *   [ ] Implement Password Reset Forms (FRD F2.3)
    *   [ ] Implement Account Dashboard (FRD F2.4)
    *   [ ] Implement Profile Editing Form (FRD F2.4)
    *   [ ] Implement Address Management UI (FRD F2.4)
    *   [ ] Implement Order History Page (List & Detail View) (FRD F2.5)
    *   [ ] Implement Drop Entry History Page (FRD F2.6)
*   **[ ] User Interface - E-commerce Flow:**
    *   [ ] Implement Shopping Cart Page/Overlay (FRD F6)
    *   [ ] Implement Checkout Flow UI (Shipping Address, Shipping Method, Payment (Stripe Elements), Summary) (FRD F7)
    *   [ ] Implement Order Confirmation Page (FRD F7.6)
*   **[ ] User Interface - Community (*Potential MVP Cut*):**
    *   [ ] Implement Forum Topic List Page (FRD F8.2.1)
    *   [ ] Implement Forum Thread View Page (FRD F8.2.2)
    *   [ ] Implement Create Thread Form/Page (FRD F8.2.3)
    *   [ ] Implement Reply Form (FRD F8.2.4)
*   **[ ] User Interface - Other:**
    *   [ ] Implement Support/Contact Page (FRD F9.1)
    *   [ ] Implement FAQ Page (FRD F9.2)
    *   [ ] Implement Legal Pages (Privacy, Terms) (Legal 11)
    *   [ ] Implement Cookie Consent Banner (Legal 11)
*   **[ ] Frontend Integration:**
    *   [ ] Connect all UI components to Backend API endpoints
    *   [ ] Implement JWT handling (storage, refresh, attaching to requests)
    *   [ ] Implement State Management for Cart, User Session, etc.
    *   [ ] Integrate Stripe Elements for secure payment input (SRD 6)
    *   [ ] Integrate Web Analytics (Google Analytics) (Arch)
*   **[ ] Frontend Quality:**
    *   [ ] Implement Responsive Design across all pages/components (NFR9.2)
    *   [ ] Implement Accessibility Features (ARIA attributes, keyboard nav) (NFR6)
    *   [ ] Test cross-browser compatibility (Major browsers)
    *   [ ] Optimize Frontend Performance (Code splitting, image optimization, lazy loading) (NFR1)
    *   [ ] Implement Frontend Error Tracking (Sentry) (Maint 1)
    *   [ ] Ensure SEO best practices (Meta tags, semantic HTML) (NFR5)

## Phase 3: Admin Panel Development

*   **[ ] Core Setup:**
    *   [ ] Setup Separate Admin UI Project or Section within Frontend App
    *   [ ] Implement Admin Login Flow
    *   [ ] Implement Admin Layout/Navigation
    *   [ ] Connect Admin UI to Admin API Endpoints
*   **[ ] Admin Features:**
    *   [ ] Implement Admin Dashboard (FRD F13)
    *   [ ] Implement User Management UI (List, View, Edit Roles, View History) (FRD F14)
    *   [ ] Implement Waitlist Management UI (if applicable) (FRD F14.4)
    *   [ ] Implement Drop Management UI (CRUD, Associate Products) (FRD F15)
    *   [ ] Implement Product Management UI (CRUD Products & Categories, Manage Stock) (FRD F17)
    *   [ ] Implement Order Management UI (List, View Details, Update Status, Add Tracking) (FRD F18)
    *   [ ] Implement Draw Management UI (View Entrants, Trigger Draw, View Winners) (FRD F16)
    *   [ ] Implement Content Management UI (WYSIWYG Editor) (FRD F19)
    *   [ ] Implement Forum Moderation UI (FRD F20 - *Potential MVP Cut*)
    *   [ ] Implement System Settings UI (FRD F21)

## Phase 4: Infrastructure & DevOps

*   **[ ] Cloud Infrastructure Setup (AWS - Tech Stack, Arch):**
    *   [ ] Provision VPC, Subnets, Security Groups
    *   [ ] Provision RDS PostgreSQL Instance (Primary + Replica)
    *   [ ] Provision ElastiCache Redis Instance (Cache + Job Queue)
    *   [ ] Provision Compute Resources (EC2/ECS/EKS/App Runner) for Web, API, Workers
    *   [ ] Configure Auto-scaling Groups / Managed Scaling
    *   [ ] Provision Load Balancer (ALB/NLB)
    *   [ ] Setup S3 Buckets for Static Assets / User Uploads (if any)
    *   [ ] Setup CloudFront CDN (Configure distributions, caching rules)
    *   [ ] Setup SES for Email Sending (Verify domain, request production access)
    *   [ ] Setup Monitoring (CloudWatch Metrics, Alarms / Datadog integration)
    *   [ ] Setup Centralized Logging (CloudWatch Logs / ELK integration)
    *   [ ] Configure DNS (Route 53)
    *   [ ] Implement Infrastructure as Code (Terraform/CloudFormation) (Deploy 6)
*   **[ ] CI/CD Pipeline (GitHub Actions/GitLab CI/Jenkins - Deploy 3):**
    *   [ ] Configure Linting step
    *   [ ] Configure Unit Test execution step
    *   [ ] Configure Integration Test execution step (Requires test DB/services)
    *   [ ] Configure Frontend Build step
    *   [ ] Configure Docker Image Build step (Frontend, Backend, Worker)
    *   [ ] Configure Push to Container Registry (ECR) step
    *   [ ] Configure Deployment Script to Staging Environment
    *   [ ] Configure Deployment Script to Production Environment (Manual trigger)
    *   [ ] Configure Database Migration execution step in pipeline
*   **[ ] Containerization:**
    *   [ ] Create Dockerfiles for Frontend, Backend, Worker services (Tech Stack)
    *   [ ] Configure Docker Compose for local development environments

## Phase 5: Testing & QA

*   **[ ] Unit Testing:**
    *   [ ] Write Backend Unit Tests (Services, Utils)
    *   [ ] Write Frontend Unit Tests (Components, Utils)
*   **[ ] Integration Testing:**
    *   [ ] Write Backend Integration Tests (API Endpoints interacting with DB/Cache)
    *   [ ] Test Third-Party Integrations (Payment Gateway sandbox, Email Service sandbox)
*   **[ ] End-to-End (E2E) Testing:**
    *   [ ] Setup E2E Testing Framework (Cypress, Playwright)
    *   [ ] Write E2E Test Scenarios for Key User Journeys (Registration, Login, Draw Entry, Purchase Flow, Admin Actions) (Wireframe 5)
*   **[ ] Manual QA:**
    *   [ ] Execute Test Cases covering all Functional Requirements (FRD)
    *   [ ] Perform Exploratory Testing
    *   [ ] Test Responsiveness across devices/browsers
    *   [ ] Test Accessibility (Screen readers, keyboard navigation) (NFR6)
    *   [ ] Test Localization Functionality (Language switching, layout) (NFR7)
    *   [ ] Perform Security Testing (Check OWASP Top 10, access controls) (NFR4, SRD)
    *   [ ] Perform Performance Testing (Load testing tools - k6, JMeter) - *Crucial for Drop events* (NFR1)
*   **[ ] User Acceptance Testing (UAT):**
    *   [ ] Conduct UAT with Stakeholders/Client

## Phase 6: Documentation & Legal

*   **[ ] Documentation:**
    *   [ ] Document API Specification (Swagger/OpenAPI)
    *   [ ] Write README files for repositories
    *   [ ] Document Setup/Installation process for developers
    *   [ ] Document Deployment Process (Deploy 3, Deploy 4)
    *   [ ] Document Backup & Recovery Procedures (Maint 4)
    *   [ ] Document Maintenance Procedures (Maint 3)
    *   [ ] Create User Guide for Admin Panel (FRD F13-F21)
*   **[ ] Legal & Compliance (Legal 11):**
    *   [ ] Draft Privacy Policy
    *   [ ] Draft Terms of Service (Including Drop/Draw rules)
    *   [ ] Draft Cookie Policy
    *   [ ] Implement & Test GDPR Compliance mechanisms (Consent, Data Access/Deletion requests)
    *   [ ] Complete PCI-DSS Self-Assessment Questionnaire (SAQ A)
    *   [ ] Review and Finalize Vendor/SLA Agreements (Legal 12)

## Phase 7: Deployment & Launch

*   **[ ] Pre-Launch:**
    *   [ ] Deploy final approved build to Staging Environment (Deploy 1)
    *   [ ] Perform final QA & UAT on Staging
    *   [ ] Prepare Production Environment (Deploy 1, Deploy 6)
    *   [ ] Configure Production Environment Variables & Secrets
    *   [ ] Perform Production Sanity Checks (DB connection, services running)
    *   [ ] Develop Rollback Plan & Test (Deploy 5)
*   **[ ] Launch:**
    *   [ ] Schedule Maintenance Window (if needed)
    *   [ ] Execute Production Deployment (Deploy 3, Deploy 4)
    *   [ ] Run Database Migrations in Production (Deploy 3)
    *   [ ] Perform Post-Deployment Smoke Testing on Production
    *   [ ] Monitor Production Systems closely (Logs, Metrics, Errors) (Maint 1)
    *   [ ] Announce Launch

## Phase 8: Post-Launch & Maintenance

*   **[ ] Monitoring & Alerting (Maint 1):**
    *   [ ] Continuously Monitor Uptime, Performance, Errors
    *   [ ] Refine Alerting thresholds based on initial traffic
*   **[ ] Support & Maintenance (Maint 5):**
    *   [ ] Handle Customer Support Inquiries
    *   [ ] Establish Bug Triage Process (Maint 2)
    *   [ ] Address Bugs based on priority
*   **[ ] Operations (Maint 3, Maint 4):**
    *   [ ] Perform Regular Dependency Updates
    *   [ ] Apply OS/Security Patches
    *   [ ] Regularly Verify Backups & Test Restore Process
    *   [ ] Monitor Infrastructure Costs & Optimize
*   **[ ] Future Development:**
    *   [ ] Plan and prioritize Phase 2 features (deferred items, enhancements)
    *   [ ] Gather User Feedback for improvements