# CareHealth Point – 10-Minute Presentation & Demonstration Deck

**Course:** DevOps & Automation Lab (Course Code: ENSP461)  
**Project:** CareHealth Point – Smart Hospital Management System with End-to-End DevOps Automation  
**Presenter:** Nishtha Chauhan (B.Tech CSE - 7th Semester)  
**Total Allocated Time:** 10 Minutes (6 min Presentation + 4 min Live Demonstration)

---

## Slide 1: Title & Introduction (0:00 - 1:00)
- **Title:** Design and Implementation of an End-to-End DevOps Pipeline for Cloud-Native Application Deployment.
- **Project Name:** CareHealth Point.
- **Tagline:** Better Healthcare. Smarter Management.
- **Objective:** Bridge the gap between software development and clinical operational reliability by delivering a fully functional Hospital Management System coupled with a production-grade automated DevSecOps platform.

---

## Slide 2: Problem Statement & Functional Requirements (1:00 - 2:00)
- **Healthcare Challenges:** Long OPD wait times, fragmented patient records, paper-based double bookings, and critical service downtime during software deployments.
- **Application Capabilities:**
  - Public Hospital Landing Page & Smart Specialist Finder.
  - Role-Based Access Control for 4 user personas (Admin, Doctor, Receptionist, Patient).
  - Conflict-Free Appointment Booking with automated queue token generation.
  - Live OPD Queue Status & estimated wait telemetry.
  - Tamper-evident Electronic Prescriptions (e-Rx) & Digital Health Cards.

---

## Slide 3: System Architecture & Technology Stack (2:00 - 3:00)
- **3-Tier Cloud-Native Architecture:**
  - **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide icons, Recharts.
  - **Backend API:** Python FastAPI, Pydantic validation, SQLAlchemy ORM, JWT stateless authentication.
  - **Database:** PostgreSQL with strict relational integrity, composite unique constraints, and persistent volume mounts.
- **Infrastructure:** Docker multi-stage builds, Kubernetes (Deployments, StatefulSets, Services, Ingress, HPA, RBAC).

---

## Slide 4: DevOps Automation Pipeline Lifecycle (3:00 - 4:00)
- **Continuous Integration:** Jenkins declarative pipeline (11 stages).
- **Automated Testing:** Pytest unit and integration test suite with JUnit reporting.
- **Static Code Analysis (SAST):** SonarQube quality gates.
- **Container Vulnerability Scanning:** Trivy scanning before Docker Hub registry push.
- **GitOps Delivery:** ArgoCD continuous reconciliation and self-healing.
- **Advanced Release Strategy:** Zero-downtime Blue-Green traffic routing via Kubernetes label selectors.

---

## Slide 5: Observability, Logging & DevSecOps (4:00 - 5:00)
- **Metrics & Alerting:** Prometheus scrapes `/metrics` endpoint; Grafana visualizes throughput, latency percentiles (p95), and HTTP error rates.
- **Centralized Logging:** Fluentd collects structured JSON logs with sensitive credential masking.
- **Infrastructure as Code:** Terraform provisions modular cloud VPC, subnets, and security groups; Ansible handles idempotent configuration management.

---

## Slide 6: Live System Demonstration (5:00 - 9:00)
- **Demo 1: Patient Experience:**
  - Log in as demo patient (`patient@carehealth.com`).
  - View Digital Health Card with verified UHID (`CHP-2026-1001`).
  - Walk through 4-step Appointment Booking Wizard.
  - Demonstrate conflict prevention: booking the same doctor and slot triggers instant duplicate prevention.
  - Review real-time Queue Tracker with token number and estimated wait time.
- **Demo 2: Doctor Experience:**
  - Switch to doctor portal (`doctor@carehealth.com`).
  - Record consultation notes with vital signs (BP, Pulse, Temp, SpO2).
  - Generate digital prescription with medications.
- **Demo 3: Admin & Receptionist Hub:**
  - Show live operational dashboard with 7-day trend area chart and department distribution.
  - Front-desk desk check-in marking patient as arrived.
- **Demo 4: DevOps Pipeline & Blue-Green Traffic Switch:**
  - Show Jenkinsfile stage graph and passing automated pytests.
  - Execute zero-downtime Blue-Green switch script (`./switch_blue_green.sh green`).

---

## Slide 7: Conclusion & Key Learnings (9:00 - 10:00)
- **Achievements:** 100% reproducible deployment, 0s deployment downtime, automated security auditing, full observability, and high clinical usability.
- **Viva Readiness:** Ready for questions from committee members.
