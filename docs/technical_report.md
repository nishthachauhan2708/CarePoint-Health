# Technical Project Report

**Title:** Design and Implementation of an End-to-End DevOps Pipeline for Cloud-Native Application Deployment  
**Project:** CareHealth Point – Smart Hospital Management System  
**Course Code:** ENSP461 – DevOps & Automation Lab  
**Academic Level:** Bachelor of Technology (Computer Science & Engineering), Semester VII  

---

## Abstract
Healthcare IT platforms demand uncompromising availability, strict patient data privacy, and rapid release cycles without service interruptions. Traditional monolithic hospital management systems suffer from high downtime during upgrades, fragile deployments, and a lack of automated telemetry. This project implements **CareHealth Point**, a full-stack, cloud-native hospital management platform, and wraps it in an end-to-end DevOps automation pipeline. The application tier is powered by Python FastAPI and PostgreSQL, and the presentation tier is built using React 18, TypeScript, and Tailwind CSS. The automation platform incorporates Git version control, Jenkins CI/CD, SonarQube SAST, Trivy vulnerability scanning, multi-stage Docker containerization, Kubernetes orchestration, Prometheus and Grafana telemetry, Fluentd centralized logging, Terraform infrastructure provisioning, Ansible configuration management, ArgoCD GitOps, and zero-downtime Blue-Green deployment.

---

## 1. Introduction & Objectives
### 1.1 Problem Statement
Hospital clinics experience peak load volatility, appointment scheduling conflicts, extended patient waiting times, and delayed prescription handoffs. Furthermore, deploying updates to critical healthcare systems often introduces regression bugs or unexpected outages that impair healthcare delivery.

### 1.2 Project Objectives
1. Build a functional, production-grade 3-tier hospital management system featuring role-based portals for Administrators, Doctors, Receptionists, and Patients.
2. Implement automated conflict-free appointment scheduling with real-time queue position tracking.
3. Engineer a secure DevSecOps continuous delivery pipeline with automated testing, static code analysis, and container vulnerability scanning.
4. Orchestrate cloud-native workloads on Kubernetes with self-healing, rolling updates, and persistent volume storage.
5. Demonstrate GitOps continuous deployment using ArgoCD and zero-downtime traffic switching using Blue-Green deployments.
6. Provide comprehensive observability via Prometheus metric scrapers and custom Grafana dashboards.

---

## 2. System Architecture & Methodology
The architecture is partitioned into three discrete layers:
- **Client Tier:** React 18 SPA compiled using Vite and delivered via Nginx reverse proxy.
- **Service Tier:** Asynchronous Python FastAPI backend exposing RESTful endpoints, OpenAPI documentation, and Prometheus metrics.
- **Persistence Tier:** PostgreSQL database running with persistent volume claims to prevent data loss.

```
[ Developer ] -> [ GitHub ] -> [ Jenkins Pipeline ] -> [ Docker Hub ]
                                      |
                         [ SonarQube + Trivy Scans ]
                                      |
                                      v
                             [ ArgoCD GitOps ]
                                      |
                                      v
                       [ Kubernetes Production Cluster ]
              (Ingress -> Frontend / Backend Pods -> PostgreSQL PVC)
                                      |
                          [ Prometheus & Grafana ]
```

---

## 3. Database Design & Relational Modeling
The schema comprises 9 interconnected entities:
- `users`: Authentication credentials, bcrypt hashes, user roles, phone numbers.
- `departments`: Medical specialties (Cardiology, Neurology, etc.), head doctor assignment.
- `doctors`: Professional medical licenses, qualifications, experience, consultation fees.
- `doctor_availabilities`: Daily consulting hours and 30-minute slot durations.
- `patients`: Unique Hospital Identification (UHID), date of birth, blood group, emergency contacts.
- `appointments`: Booking schedule, composite unique constraint `(doctor_id, appointment_date, time_slot)` to prevent double booking.
- `prescriptions`: Electronic prescriptions with structured JSON medication lists.
- `consultation_notes`: Clinical impression, vital signs (BP, Pulse, Temp, SpO2, Weight).
- `notifications`: Alerts, booking confirmations, and hospital broadcasts.

---

## 4. DevOps Automation Pipeline Implementation
- **Continuous Integration (Jenkins):** Multi-stage declarative pipeline checking out SCM, installing dependencies, validating code quality with Flake8 and TypeScript, running Pytest automated test suites, building production bundles, running SonarQube, scanning container CVEs with Trivy, and pushing images to Docker Hub.
- **Configuration Management (Ansible):** Modular roles (`docker`, `kubernetes`, `app_deploy`) automate prerequisite installation and manifest application idempotently.
- **Infrastructure as Code (Terraform):** Declarative provisioning of AWS VPC, dual-AZ public/private subnets, security groups, route tables, and S3 backup buckets.
- **GitOps (ArgoCD):** Maintains continuous reconciliation between Git desired state and Kubernetes live cluster state, with automatic pruning and self-healing.
- **Blue-Green Deployment:** Independent `blue` and `green` deployment versions managed through an active Kubernetes Service selector, enabling instant zero-downtime traffic switching.
- **Observability (Prometheus & Grafana):** Scrapes request throughput, error rates, and latency percentiles (p50, p95, p99) displayed on dark-mode operational dashboards.

---

## 5. Verification & Testing Results
- **Pytest Suite:** 10/10 automated tests passing, covering patient registration, login authentication, RBAC authorization, conflict prevention, queue calculation, and CRUD operations.
- **Frontend Build:** Compiled cleanly with Vite and TypeScript producing production bundles in `frontend/dist/`.
- **Quality Gates:** Zero critical vulnerabilities reported by Trivy and Flake8 syntax checks passing.

---

## 6. Conclusion
CareHealth Point successfully integrates modern software engineering and DevOps best practices into an accessible, robust educational capstone platform. The implementation demonstrates full lifecycle mastery from development to monitoring and automated deployment.
