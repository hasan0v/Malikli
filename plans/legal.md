### 11. Compliance & Legal Checklist

*   **[ ] Privacy Policy:** Develop a comprehensive policy detailing:
    *   What data is collected (email, name, address, IP, cookies, usage data).
    *   How data is used (order fulfillment, notifications, marketing (if opt-in), analytics, draw operation).
    *   How data is stored and protected.
    *   Data sharing with third parties (payment gateway, email service, hosting, analytics).
    *   User rights (access, correction, deletion - GDPR).
    *   Cookie usage details.
    *   Contact information for privacy inquiries.
*   **[ ] Terms of Service:** Develop T&S covering:
    *   User account responsibilities.
    *   Rules of conduct (especially for community forum).
    *   Drop and Draw rules (eligibility, process, fairness disclaimer, limitations).
    *   Ordering process, payment terms, shipping policy (costs borne by customer).
    *   Returns/Refund policy (define clearly).
    *   Intellectual Property rights (website content, brand).
    *   Disclaimers of warranty, limitation of liability.
    *   Governing law.
*   **[ ] GDPR Compliance (If targeting EU users):**
    *   Lawful basis for processing data (Consent for marketing, Legitimate Interest/Contract for orders/account).
    *   Implement mechanisms for user consent (e.g., cookie banner, marketing opt-in).
    *   Provide mechanisms for users to exercise data rights (access, rectify, erase, port data).
    *   Appoint a Data Protection Officer (DPO) if required by scale/data type.
    *   Data Processing Agreements (DPAs) with third-party vendors.
*   **[ ] PCI-DSS Compliance:**
    *   Confirm integration method with Payment Gateway minimizes scope (e.g., SAQ A).
    *   Complete and submit the required SAQ annually.
    *   Ensure hosting/processes meet requirements.
*   **[ ] Cookie Consent:** Implement a cookie consent banner/mechanism allowing users to manage preferences (especially for non-essential cookies like analytics/marketing).
*   **[ ] Regional Regulations:** Research specific e-commerce, consumer protection, and privacy laws in key target markets beyond the EU (e.g., CCPA/CPRA in California if applicable, laws in Turkey, Russia, China, MENA region). Localization includes legal compliance.
*   **[ ] Accessibility Statement (Optional but Recommended):** Document commitment and level of WCAG conformance.


### 12. Vendor / SLA Agreements

*   **Hosting Provider (e.g., AWS, GCP, Azure):**
    *   Review their standard SLA for relevant services (Compute, Database, Cache). Aim for >= 99.9% uptime.
    *   Understand support plans and response times.
*   **Payment Gateway (e.g., Stripe):**
    *   Review their SLA regarding transaction processing uptime and reliability.
    *   Ensure their PCI-DSS compliance documentation is available.
    *   Understand transaction fees, payout schedules, dispute resolution processes.
*   **CDN Provider (e.g., Cloudflare, AWS CloudFront):**
    *   Review their SLA for uptime and performance.
    *   Understand features included (WAF, DDoS mitigation).
*   **Email Service Provider (e.g., AWS SES, SendGrid):**
    *   Review their SLA for email delivery uptime.
    *   Understand deliverability commitments, IP reputation management, sending limits.
*   **Domain Registrar:** Ensure domain registration is secure and auto-renewal is set up.
*   **(Future) Fulfillment Partner (If applicable):** Define responsibilities, shipping times, costs, reporting requirements in a formal agreement.
