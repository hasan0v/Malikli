### 2. Non-Functional Requirements (NFR)

This document outlines *how well* the system must perform.

*   **NFR1: Performance:**
    *   NFR1.1: Average Page Load Time (Server Response + Client Render) < 2 seconds for key pages (Homepage, PDP, Cart) under expected load.
    *   NFR1.2: Server Response Time (Time To First Byte - TTFB) < 500ms.
    *   NFR1.3: Checkout process completion < 5 seconds (excluding payment gateway interaction time).
    *   NFR1.4: Efficient database queries, especially during high-demand drop periods.
*   **NFR2: Scalability:**
    *   NFR2.1: Support up to 10,000 simultaneous users, particularly during peak drop announcement/entry/purchase windows. (*Note: This is a high target for initial launch and requires careful architecture*).
    *   NFR2.2: Architecture should allow for horizontal scaling (adding more server instances).
    *   NFR2.3: Database should handle concurrent reads/writes during peak loads.
    *   NFR2.4: Draw system must perform efficiently without impacting site performance.
*   **NFR3: Availability:**
    *   NFR3.1: Target 99.9% uptime (excluding planned maintenance).
    *   NFR3.2: Robust backup and recovery strategy.
    *   NFR3.3: Redundancy in critical components (servers, database).
*   **NFR4: Security:**
    *   NFR4.1: Compliance with PCI-DSS Level 4 (or higher, depending on transaction volume) by using a compliant payment gateway and ensuring secure handling of any related data (even if not storing full card numbers).
    *   NFR4.2: Secure authentication and authorization mechanisms (password hashing, role-based access).
    *   NFR4.3: Protection against common web vulnerabilities (OWASP Top 10): XSS, SQL Injection, CSRF, etc. through input validation, output encoding, parameterized queries.
    *   NFR4.4: Use of HTTPS/TLS for all data transmission.
    *   NFR4.5: Regular security audits and vulnerability scanning (recommended).
    *   NFR4.6: Secure handling of personal data (PII) according to privacy regulations (GDPR, etc.).
    *   NFR4.7: Measures to mitigate bot activity, especially during draw entries.
*   **NFR5: Search Engine Optimization (SEO):**
    *   NFR5.1: SEO-friendly URLs.
    *   NFR5.2: Appropriate use of HTML meta tags (title, description).
    *   NFR5.3: Generate Sitemap.xml for search engines.
    *   NFR5.4: Use semantic HTML structure.
    *   NFR5.5: Optimize images for web use (size, alt tags).
*   **NFR6: Accessibility:**
    *   NFR6.1: Aim for WCAG 2.1 Level AA compliance.
    *   NFR6.2: Ensure keyboard navigation.
    *   NFR6.3: Provide text alternatives for non-text content.
    *   NFR6.4: Ensure sufficient color contrast (especially with Tiffany blue palette).
    *   NFR6.5: Use ARIA attributes where necessary for dynamic content.
*   **NFR7: Localization & Internationalization:**
    *   NFR7.1: System architecture must support multiple languages (UI text, content).
    *   NFR7.2: Support for different character sets (Latin, Cyrillic, Arabic, Chinese).
    *   NFR7.3: Right-to-Left (RTL) layout support for Arabic.
    *   NFR7.4: Consider cultural nuances in UI/UX if possible.
*   **NFR8: Maintainability:**
    *   NFR8.1: Codebase should be well-documented and follow consistent coding standards.
    *   NFR8.2: Modular design to facilitate updates and feature additions.
    *   NFR8.3: Use version control (e.g., Git).
*   **NFR9: Usability:**
    *   NFR9.1: Intuitive navigation and user flows.
    *   NFR9.2: Responsive design (works well on Desktop, Tablet, Mobile).
    *   NFR9.3: Clear feedback to users after actions (e.g., item added to cart, order placed, draw entered).
