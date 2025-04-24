### 10. Security Requirements Document

(Expands on NFR4)

1.  **Authentication:**
    *   Use strong password hashing (bcrypt or Argon2).
    *   Implement secure password reset flow (time-limited tokens sent via email).
    *   Use JWT for session management with short expiry times and refresh tokens. Store securely (HttpOnly, Secure cookies).
    *   Protect against brute-force login attacks (rate limiting, CAPTCHA after failures).
    *   Consider Multi-Factor Authentication (MFA) for admin accounts (highly recommended).
2.  **Authorization:**
    *   Implement Role-Based Access Control (RBAC): Admin vs. Member.
    *   Enforce authorization checks on *every* API endpoint, especially admin functions and actions like adding to cart (check winner status/time), placing orders.
    *   Prevent IDOR (Insecure Direct Object Reference) vulnerabilities by ensuring users can only access their own data (orders, profile, etc.).
3.  **Data Encryption:**
    *   Enforce HTTPS/TLS 1.2+ for all communication. Configure HSTS header.
    *   Encrypt sensitive data at rest (e.g., user PII if required by regulations beyond basic hashing) using database-level or application-level encryption.
    *   Do NOT store raw credit card numbers. Rely entirely on the PCI-compliant payment gateway's tokenization/iframes.
4.  **Input Validation & Output Encoding:**
    *   Validate *all* input from users/clients (length, type, format, range). Use allow-lists where possible.
    *   Sanitize input to prevent injection attacks (SQLi, NoSQLi, Command Injection). Use prepared statements/ORMs correctly.
    *   Encode output correctly in HTML/JS/CSS contexts to prevent Cross-Site Scripting (XSS). Use modern frontend frameworks' built-in protections.
5.  **OWASP Top 10 Mitigation:**
    *   Address all relevant OWASP Top 10 risks through secure coding practices, framework features, and infrastructure configuration.
    *   Implement CSRF protection (e.g., anti-CSRF tokens).
    *   Keep dependencies updated (Security Vulnerabilities in Components).
    *   Implement proper logging and monitoring (Security Logging and Monitoring Failures).
    *   Secure configuration of servers, databases, cloud services.
6.  **PCI-DSS Compliance:**
    *   Use a validated PCI-DSS compliant payment gateway (e.g., Stripe Elements/Checkout) to ensure cardholder data never touches your servers.
    *   Complete the relevant Self-Assessment Questionnaire (SAQ) - likely SAQ A.
    *   Ensure website hosting and processes meet requirements outlined in the SAQ A.
7.  **Intrusion Detection & Prevention:**
    *   Utilize a Web Application Firewall (WAF) (e.g., Cloudflare WAF, AWS WAF) to filter malicious traffic.
    *   Implement rate limiting on sensitive endpoints (login, draw entry, checkout).
    *   Monitor logs for suspicious activity.
8.  **Audit Logging:**
    *   Log security-relevant events: Logins (success/failure), Password changes, Order placements, Admin actions (user changes, drop creation, draw execution), Access control failures.
    *   Ensure logs are stored securely and retained appropriately.
9.  **Bot Mitigation:**
    *   Implement measures during draw entry: CAPTCHA, rate limiting per user/IP, basic behavioural checks (if feasible), potentially require account age or activity. *Note: Sophisticated bot mitigation is complex.*


