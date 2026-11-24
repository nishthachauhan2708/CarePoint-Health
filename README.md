# CareHealth Point – Smart Hospital Management System with End-to-End DevOps Automation

[![CI/CD Pipeline](https://img.shields.io/badge/Jenkins-CI%2FCD%20Automated-blue?logo=jenkins)](./Jenkinsfile)
[![Kubernetes Ready](https://img.shields.io/badge/Kubernetes-Orchestration%20Ready-326CE5?logo=kubernetes)](./kubernetes)
[![GitOps](https://img.shields.io/badge/GitOps-ArgoCD%20Sync-EF7B4D?logo=argo)](./kubernetes/argocd)
[![Monitoring](https://img.shields.io/badge/Observability-Prometheus%20%2B%20Grafana-E6522C?logo=prometheus)](./monitoring)
[![Security](https://img.shields.io/badge/DevSecOps-SonarQube%20%2B%20Trivy-4E9BCD?logo=sonarqube)](./security)
[![Tests Passing](https://img.shields.io/badge/Tests-29%2F29%20Passing-brightgreen?logo=pytest)](./backend/tests)

> **Course:** DevOps & Automation Lab
> **Course Code:** ENSP461
> **Project Title:** Design and Implementation of an End-to-End DevOps Pipeline for Cloud-Native Application Deployment
> **Tagline:** *Better Healthcare. Smarter Management.*

> ⚠️ **ACADEMIC DEMONSTRATION DISCLAIMER:**
> CareHealth Point is an educational, capstone project developed for university laboratory evaluation. All hospital contact details, emergency phone numbers (`+91-1800-CARE-NOW`), facility addresses, patient profiles, doctor records, operational notices, and clinical metrics are **simulated demonstration placeholders**. For actual medical emergencies, always contact verified national emergency services (112 / 108 / 911).

---

## 1. Project Introduction

**CareHealth Point** is a modern, production-style, cloud-native Hospital Management System (HMS) developed as a final B.Tech CSE Semester VII capstone project. Unlike academic mockups or static prototypes, CareHealth Point is a genuinely functional full-stack healthcare platform integrated with a complete end-to-end DevOps automation pipeline.

The platform seamlessly connects four distinct hospital user roles:
1. **Hospital Administrators:** Manage capacity, departments, doctor rosters, patient records, and live clinical analytics.
2. **Specialist Doctors:** View daily consultation queues, review patient histories, record vital signs, write consultation notes, and generate electronic prescriptions (e-Rx).
3. **Front-Desk Receptionists:** Onboard walk-in patients, manage real-time OPD check-ins, coordinate waiting room queues, and assign tokens.
4. **Patients:** Access personal Digital Health Cards (verified UHIDs), search doctors via the Smart Specialist Finder, book conflict-free appointments, and track live queue wait times in real time.

---

## 2. Problem Statement

Modern healthcare providers face critical digital bottlenecks:
- **Extended Patient Wait Times:** Lack of visibility into real-time outpatient department (OPD) queue progress leads to crowded waiting halls.
- **Double-Bookings & Scheduling Conflicts:** Manual paper-based or basic electronic registers frequently create conflicting appointment slots.
- **Deployment Downtime Risks:** Updating clinical management software in hospital settings can disrupt emergency and outpatient workflows if release pipelines lack zero-downtime deployment strategies.
- **Lack of Observability:** Infrastructure teams lack granular metrics on API throughput, error spikes, and patient traffic volume.

---

## 3. Objectives

- **Develop a Production-Style Full-Stack Healthcare Platform:** Featuring role-based access control, relational PostgreSQL storage, electronic prescriptions, and real-time OPD queue telemetry.
- **Implement a 12-Stage Jenkins CI/CD Pipeline:** Automate dependency installation, linting, unit testing, SonarQube SAST, Trivy vulnerability scanning, multi-stage Docker builds, and deployment.
- **Orchestrate Cloud-Native Workloads with Kubernetes:** Declarative deployments, persistent database storage (StatefulSets + PVCs), liveness/readiness probes, and horizontal pod autoscaling.
- **Achieve Zero-Downtime Releases:** Deliver automated Blue-Green traffic switching with instant rollback capabilities.
- **Enforce GitOps Principles:** Implement ArgoCD continuous reconciliation, self-healing, and drift detection.
- **Establish Full Observability:** Implement Prometheus time-series metric scrapers, custom Grafana operational dashboards, and Fluentd centralized structured logging.

---

## 4. Key Features

### A. Clinical & Functional Features
- **Public Hospital Landing Page:** Emergency banner, centers of excellence, department catalog, doctor directory, and hospital statistics.
- **Role-Based Authentication (RBAC):** Cryptographically salted bcrypt passwords and stateless JSON Web Tokens (JWT) for Admin, Doctor, Receptionist, and Patient accounts.
- **1-Click Evaluator Demo Switcher:** Allows college evaluators and committee members to switch between Admin, Doctor, Receptionist, and Patient views in 1 click!
- **Conflict-Free Appointment Scheduling:** Relational composite unique constraint strictly prevents overlapping appointments for the same doctor, date, and slot.
- **Live OPD Queue Tracker:** Displays patient token number, current serving number, patients ahead in queue, and estimated waiting time.
- **Digital Health Card:** Generates a patient health card with verified UHID (`CHP-2026-XXXX`), blood group, emergency contact, and visit history.
- **Electronic Prescriptions (e-Rx):** Multi-drug prescription generator with dosage, frequency, duration, and dietary advice.
- **Consultation Notes & Vitals:** Record BP, pulse rate, temperature, SpO2, and clinical impressions.

### B. DevOps & Infrastructure Features
- **Multi-Stage Containerization:** Lean Nginx Alpine image for frontend (~25MB) and secure non-root Python slim runtime image for backend.
- **Zero-Downtime Blue-Green Deployment:** Automated traffic routing between Blue and Green deployments via Kubernetes service label selectors.
- **ArgoCD GitOps Automation:** Declarative Git repository as the single source of truth with automated drift reconciliation.
- **Prometheus Telemetry & Grafana Dashboards:** Visualizes request throughput (QPS), HTTP error rates, p95 latency percentiles, and active queue counts.
- **Centralized Logging with Fluentd:** JSON structured logging with automatic masking of sensitive credentials.
- **Infrastructure as Code (Terraform & Ansible):** AWS VPC, dual-AZ public/private subnets, and idempotent configuration management.

---

## 5. Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | High-performance Single Page Application (SPA) with medical UI design system |
| **Icons & Charts** | Lucide React, Recharts | Standard healthcare iconography and interactive operational charts |
| **Backend REST API**| Python 3.9+, FastAPI, Pydantic, SQLAlchemy | Asynchronous API, OpenAPI/Swagger docs, schema validation |
| **Database** | PostgreSQL 15, SQLite fallback | ACID-compliant relational storage, composite unique constraints, indexes |
| **Authentication** | JWT (JSON Web Tokens), bcrypt | Secure password hashing and stateless role-based authorization |
| **Containers** | Docker, Docker Compose | Multi-stage production container builds with non-root security |
| **CI/CD** | Jenkins (Declarative Pipeline) | 12-stage automated continuous integration and delivery |
| **Quality & Security**| SonarQube & Trivy | Static code analysis (SAST) and container image CVE vulnerability scanning |
| **Orchestration** | Kubernetes (Minikube / EKS) | Deployments, StatefulSets, Services, Ingress, HPA, PV/PVC, NetworkPolicies |
| **GitOps** | ArgoCD | Git-as-source-of-truth continuous reconciliation and self-healing |
| **Deployment** | Blue-Green Deployment | Zero-downtime releases with instant rollback via label selector swapping |
| **Config Management**| Ansible | Idempotent automation playbooks for host provisioning and deployment |
| **IaC** | Terraform | Modular AWS infrastructure (VPC, subnets, route tables, S3) |
| **Monitoring** | Prometheus & Grafana | Custom metrics exporter (`/metrics`), alerting rules, and telemetry dashboard |
| **Logging** | Fluentd | Centralized structured JSON logging with credential masking |

---

## 6. System Architecture Diagram

```
                                  [ DEVELOPER WORKSTATION ]
                                              │
                                              │ Git Commit & Push (main / develop / feature)
                                              ▼
                                      [ GITHUB REPOSITORY ]
                                              │
                                              │ Webhook Trigger
                                              ▼
                                    [ JENKINS CI SERVER ]
        ┌─────────────────────────────────────┴─────────────────────────────────────┐
        │ Stage 1: Checkout SCM                                                     │
        │ Stage 2: Dependency Installation (Python requirements + npm ci)           │
        │ Stage 3: Code Quality Checks (Flake8 Linting + TypeScript Typecheck)      │
        │ Stage 4: Automated Testing (10/10 Pytests passing with JUnit XML report)  │
        │ Stage 5: Frontend Production Build (React Vite compilation -> dist/)      │
        │ Stage 6: SonarQube SAST (Code Smells, Bugs, Security Hotspots)            │
        │ Stage 7: Docker Multi-Stage Image Build (Frontend Nginx + Backend Slim)   │
        │ Stage 8: Trivy Container Image Security Vulnerability Scan                │
        │ Stage 9: Push Container Images to Docker Hub Registry                     │
        └─────────────────────────────────────┬─────────────────────────────────────┘
                                              │
                                              │ GitOps Trigger / Update Manifests
                                              ▼
                                   [ ARGOCD GITOPS ENGINE ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │ Automated Sync & Self-Healing Reconciliation  │
                      │ Blue / Green Traffic Router (K8s Service)     │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                         [ KUBERNETES PRODUCTION CLUSTER (Minikube / Cloud) ]
  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                         │
  │   [ K8s Ingress Controller ] ────────► Routing ( / -> Frontend, /api -> Backend )      │
  │                                                                                         │
  │   ┌───────────────────────────┐                     ┌───────────────────────────┐       │
  │   │  Frontend Deployment      │                     │  Backend Deployment       │       │
  │   │  (React 18 + TS + Nginx)  │ ──── HTTP/REST ───► │  (FastAPI + Python 3.9)   │       │
  │   │  Replicas: 2              │                     │  Replicas: 2              │       │
  │   └───────────────────────────┘                     └─────────────┬─────────────┘       │
  │                                                                   │                     │
  │                                                                   │ SQLAlchemy / ORM    │
  │                                                                   ▼                     │
  │                                                     ┌───────────────────────────┐       │
  │                                                     │  PostgreSQL Database      │       │
  │                                                     │  StatefulSet / PV + PVC   │       │
  │                                                     └───────────────────────────┘       │
  │                                                                                         │
  │   [ Observability & Telemetry ]                                                         │
  │   - Prometheus Server (Scrapes /metrics from FastAPI & Node Exporter)                   │
  │   - Grafana (Visualizes KPIs: Request Rates, Errors, Latency, Pod CPU/RAM)              │
  │   - Fluentd DaemonSet (Centralized JSON Log Shipping to Storage/Elasticsearch)          │
  └─────────────────────────────────────────────────────────────────────────────────────────┘
                                              ▲
                                              │
        ┌─────────────────────────────────────┴─────────────────────────────────────┐
        │  [ INFRASTRUCTURE AUTOMATION ]                                            │
        │  - Terraform: Provisions AWS VPC, Subnets, EKS/EC2, Security Groups, S3   │
        │  - Ansible: Configuration management, Docker/Kubeadm installation & config│
        └───────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Database Design & Relational Schema

CareHealth Point implements 9 relational tables with strict foreign keys, cascade rules, composite unique constraints, and indexes:

```
users (id, email, hashed_password, full_name, role, phone_number, is_active, created_at)
  ├── doctors (id, user_id, department_id, license_number, specialization, qualification, experience_years, consultation_fee, biography)
  │     ├── doctor_availabilities (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_available)
  │     └── appointments (id, patient_id, doctor_id, department_id, appointment_date, time_slot, queue_number, status, symptoms)
  │           ├── prescriptions (id, appointment_id, patient_id, doctor_id, diagnosis, medications, additional_advice)
  │           └── consultation_notes (id, appointment_id, doctor_id, patient_id, clinical_impression, vital_signs, follow_up_recommendation)
  ├── patients (id, user_id, patient_uhid, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, address)
  ├── departments (id, name, code, description, icon, head_doctor_name)
  └── notifications (id, user_id, title, message, type, is_read, created_at)
```

- **Conflict Prevention Constraint:** `UniqueConstraint("doctor_id", "appointment_date", "time_slot", name="uq_doctor_date_slot")` guarantees double bookings cannot occur.

---

## 8. Demo Accounts & Credentials

> 🔒 **SECURITY & EVALUATION NOTICE:**
> The credentials below are pre-configured strictly for university laboratory evaluation, academic viva, and local feature demonstration. They are seeded into development environments to allow evaluators to inspect all 4 role portals. **Never deploy or reuse these default credentials in public production environments.** In production deployments, disable the 1-click persona switcher by setting `VITE_ENABLE_DEMO_LOGIN=false`.

For academic evaluations, university viva examinations, and live demonstrations, use the pre-configured accounts:

| User Role | Email Address | Password | Demonstration Purpose |
|---|---|---|---|
| **Hospital Admin** | `admin@carehealth.com` | `Admin@123` | Full clinical operations, department management, doctor roster, hospital analytics |
| **Specialist Doctor** | `doctor@carehealth.com` | `Doctor@123` | Dr. Aarav Sharma (Cardiology) – View patient schedule, enter vitals, issue prescriptions |
| **Receptionist Desk** | `receptionist@carehealth.com` | `Reception@123` | Desk check-in, walk-in patient onboarding, live queue token coordination |
| **Patient Portal** | `patient@carehealth.com` | `Patient@123` | Rohan Mehra (UHID: `CHP-2026-1001`) – Digital Health Card, Book appointment, Queue Tracker |

*Tip: The web interface includes a 1-click **"Demo Accounts"** switcher button in the top navigation bar to switch personas instantly without manual typing!*

---

## 9. Project Directory Structure

```
CareHealth Point/
├── PROJECT_STATUS.md                  # Detailed milestone progress tracker
├── .gitignore                         # Comprehensive Git ignore rules
├── .env.example                       # Environment variables template
├── README.md                          # Master project documentation
├── docker-compose.yml                 # Full-stack container orchestration
├── Jenkinsfile                        # 12-stage declarative CI/CD pipeline
├── sonar-project.properties           # SonarQube static analysis configuration
│
├── frontend/                          # Client-side React 18 TypeScript application
│   ├── public/                        # Static assets and brand icons
│   ├── src/
│   │   ├── components/common/         # Navbar, Footer, Sidebar, ProtectedRoute
│   │   ├── context/AuthContext.tsx    # JWT session and role management
│   │   ├── pages/                     # Landing, Login, Register, Role Dashboards
│   │   ├── services/api.ts            # Axios client with JWT interceptors
│   │   └── types/index.ts             # TypeScript domain interfaces
│   ├── Dockerfile                     # Multi-stage build (Node build -> Nginx Alpine)
│   ├── nginx.conf                     # Production Nginx reverse proxy configuration
│   └── package.json
│
├── backend/                           # FastAPI Python REST backend service
│   ├── app/
│   │   ├── core/                      # Security (bcrypt, JWT), Settings
│   │   ├── database/session.py        # SQLAlchemy engine and session
│   │   ├── models/                    # 9 SQLAlchemy relational models
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   ├── api/                       # Versioned REST endpoints (v1)
│   │   ├── utils/seed_data.py         # Realistic medical demonstration dataset
│   │   └── main.py                    # App entrypoint, Prometheus middleware, probes
│   ├── tests/                         # Automated Pytest suite (10/10 passing)
│   ├── Dockerfile                     # Multi-stage Python slim (non-root user)
│   └── requirements.txt
│
├── kubernetes/                        # Cloud-native orchestration manifests
│   ├── base/                          # Deployments, StatefulSets, Services, Ingress, HPA, RBAC
│   ├── blue/                          # Blue stable deployment version
│   ├── green/                         # Green release deployment version
│   ├── blue-green-service.yaml        # Active traffic router service
│   ├── monitoring/                    # Prometheus and Grafana K8s deployment
│   └── argocd/application.yaml        # ArgoCD GitOps Application CRD
│
├── ansible/                           # Configuration management
│   ├── inventory/hosts.ini            # Host inventory
│   ├── roles/                         # Docker, Kubernetes, App deploy roles
│   └── site.yml                       # Master automation playbook
│
├── terraform/                         # Infrastructure as Code
│   ├── main.tf                        # AWS VPC, dual-AZ subnets, security groups, S3
│   ├── variables.tf                   # Configurable region, instance types, tags
│   ├── outputs.tf                     # Exported VPC, subnet IDs, security groups
│   └── providers.tf                   # HashiCorp AWS & Kubernetes providers
│
├── monitoring/                        # Observability
│   ├── prometheus/                    # prometheus.yml scrape configs & alert_rules.yml
│   └── grafana/dashboards/            # Custom JSON telemetry dashboards
│
├── logging/fluentd/                   # Centralized logging configuration & Dockerfile
├── security/                          # Trivy vulnerability scanner scripts
├── scripts/                           # Local run, test, and blue-green switch scripts
└── docs/                              # Technical report, viva questions, presentation deck
```

---

## 10. Installation & Quickstart Instructions

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ and npm installed
- Docker and Docker Compose installed (optional for containerized deployment)
- Git installed

### Option A: 1-Click Local Development (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/carehealth/carehealth-point.git
   cd carehealth-point
   ```

2. **Run Local Server Script (Windows):**
   ```cmd
   scripts\run_local.bat
   ```
   *Or launch manually:*
   - **Backend API:**
     ```bash
     cd backend
     python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
     ```
   - **Frontend:**
     ```bash
     cd frontend
     npm run dev
     ```

3. **Access Services in Your Browser:**
   - **CareHealth Point Web Portal:** [http://localhost:3000](http://localhost:3000)
   - **Interactive OpenAPI/Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **Prometheus Metrics Endpoint:** [http://127.0.0.1:8000/metrics](http://127.0.0.1:8000/metrics)
   - **Application Health Probe:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### Option B: Docker Compose Full-Stack Deployment

Run the complete multi-tier application stack with PostgreSQL, FastAPI, and React in isolated Docker containers:

```bash
docker compose up --build -d
```

- **Verify Container Health:**
  ```bash
  docker compose ps
  ```
- **Inspect Logs:**
  ```bash
  docker compose logs -f backend
  ```
- **Stop Containers:**
  ```bash
  docker compose down
  ```

---

## 11. Automated Testing Suite

The backend includes a comprehensive automated test suite in `backend/tests/` covering authentication, authorization, CRUD operations, duplicate prevention, and telemetry endpoints.

To run tests:
```bash
cd backend
python -m pytest tests/ -v
```

**Test Execution Results (10/10 Passing):**
- `tests/test_auth.py::test_register_patient` -> **PASSED** (Registers new patient and creates verified UHID)
- `tests/test_auth.py::test_login_success` -> **PASSED** (Validates bcrypt hash and returns JWT token)
- `tests/test_auth.py::test_login_invalid_password` -> **PASSED** (Enforces authentication security)
- `tests/test_auth.py::test_get_current_user_profile` -> **PASSED** (Retrieves role-specific profile data)
- `tests/test_appointments.py::test_book_appointment_and_prevent_duplicates` -> **PASSED** (Verifies slot booking, duplicate 409 conflict prevention, and queue calculation)
- `tests/test_crud.py::test_health_and_metrics_endpoints` -> **PASSED** (Verifies `/health` liveness and `/metrics` Prometheus exporter)
- `tests/test_crud.py::test_departments_crud` -> **PASSED** (Tests department creation and listing)
- `tests/test_crud.py::test_doctors_list_and_filter` -> **PASSED** (Tests specialist filtering by department)
- `tests/test_crud.py::test_digital_health_card` -> **PASSED** (Validates Digital Health Card payload)
- `tests/test_crud.py::test_analytics_summary` -> **PASSED** (Validates hospital KPI metrics and trends)

---

## 12. Jenkins CI/CD Pipeline Setup

The project includes an enterprise-grade `Jenkinsfile` orchestrating 12 stages:

1. **SCM Checkout:** Clones branch from GitHub.
2. **Dependency Installation:** Parallel installation of backend Python requirements and frontend npm dependencies.
3. **Code Quality Checks:** Flake8 Python linting and TypeScript compilation validation (`tsc --noEmit`).
4. **Automated Testing:** Pytest test suite with JUnit XML reporting (`backend/test-reports/junit.xml`).
5. **Frontend Production Build:** Compiles React bundle into production static assets.
6. **SonarQube SAST:** Analyzes code quality, test coverage, and security smells.
7. **Docker Image Build:** Builds version-tagged container images using multi-stage Dockerfiles.
8. **Container Vulnerability Scan (Trivy):** Scans images for HIGH and CRITICAL CVE vulnerabilities.
9. **Docker Image Push:** Authenticates and pushes images to Docker Hub.
10. **Kubernetes Deployment:** Applies updated manifests to the `carehealth` namespace.
11. **Deployment Verification:** Confirms rollout status and liveness probes.

### Configuring Jenkins Credentials
In the Jenkins dashboard under **Manage Jenkins > Credentials**, add:
- `docker-hub-credentials`: Username & Password for Docker Hub.
- `sonarqube-token`: Secret text for SonarQube authentication.
- `kubeconfig-credentials`: Secret file containing cluster kubeconfig.

---

## 13. Kubernetes Orchestration & Deployment

Deploy CareHealth Point to Minikube or a cloud Kubernetes cluster (EKS/GKE):

```bash
# 1. Create Namespace
kubectl apply -f kubernetes/base/namespace.yaml

# 2. Apply ConfigMap and Secrets
kubectl apply -f kubernetes/base/configmap.yaml
kubectl apply -f kubernetes/base/secret.yaml
kubectl apply -f kubernetes/base/rbac.yaml
kubectl apply -f kubernetes/base/network-policy.yaml

# 3. Deploy PostgreSQL StatefulSet with Persistent Storage
kubectl apply -f kubernetes/base/postgres-pvc.yaml
kubectl apply -f kubernetes/base/postgres-statefulset.yaml

# 4. Deploy Backend & Frontend Workloads
kubectl apply -f kubernetes/base/backend-deployment.yaml
kubectl apply -f kubernetes/base/frontend-deployment.yaml
kubectl apply -f kubernetes/base/ingress.yaml
kubectl apply -f kubernetes/base/hpa.yaml

# 5. Check Pod and Service Status
kubectl get pods,services,pvc -n carehealth
```

### Accessing on Minikube
```bash
minikube service carehealth-frontend-service -n carehealth
```

---

## 14. Zero-Downtime Blue-Green Deployment

CareHealth Point implements Blue-Green deployment using Kubernetes label selectors:

1. **Deploy Stable Blue Version:**
   ```bash
   kubectl apply -f kubernetes/blue/backend-deployment-blue.yaml
   kubectl apply -f kubernetes/blue-green-service.yaml
   ```
2. **Deploy New Green Version:**
   ```bash
   kubectl apply -f kubernetes/green/backend-deployment-green.yaml
   ```
3. **Switch Live Traffic from Blue to Green:**
   ```bash
   # Linux / macOS
   ./scripts/switch_blue_green.sh green

   # Windows
   scripts\switch_blue_green.bat green
   ```
4. **Instant Rollback (If needed):**
   ```bash
   scripts\switch_blue_green.bat blue
   ```

---

## 15. GitOps with ArgoCD

ArgoCD maintains the desired cluster state declared in Git:

1. **Install ArgoCD:**
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```
2. **Apply CareHealth GitOps Application:**
   ```bash
   kubectl apply -f kubernetes/argocd/application.yaml
   ```
3. **Verify Self-Healing:**
   Manually delete a pod or modify a service:
   ```bash
   kubectl delete pod -l app=carehealth-backend -n carehealth
   ```
   *ArgoCD detects the configuration drift and automatically reconciles the cluster back to the Git desired state within seconds!*

---

## 16. Observability: Prometheus, Grafana & Fluentd

### Deploying the Monitoring Stack
```bash
kubectl apply -f kubernetes/monitoring/prometheus-grafana.yaml
```
- **Prometheus Dashboard:** [http://localhost:30090](http://localhost:30090)
- **Grafana Operational Dashboard:** [http://localhost:30030](http://localhost:30030) (Default dev credentials configured via environment / Kubernetes secret: `admin` / see `.env.example`)

### Monitored Metrics
- `carehealth_http_requests_total`: Total HTTP requests partitioned by HTTP method, route, and status code.
- `carehealth_http_request_duration_seconds`: API latency percentiles (p50, p95, p99).
- `up{job="carehealth-backend"}`: Real-time service uptime probe.

---

## 17. Security & DevSecOps

- **Static Application Security Testing (SAST):** SonarQube static scan configured via `sonar-project.properties`.
- **Container Vulnerability Scanning (Trivy):** Scans images for HIGH and CRITICAL CVE vulnerabilities:
  ```bash
  # Run vulnerability scan
  scripts\trivy-scan.bat
  ```
- **Password Security:** Salted cryptographic hashing with bcrypt.
- **Least-Privilege Execution:** Application containers run as non-root user `appuser` (UID 1001).
- **Network Isolation:** Kubernetes NetworkPolicy restricts database port 5432 ingress solely to backend pods.

---

## 18. Infrastructure as Code: Terraform & Ansible

### Terraform (AWS Infrastructure Provisioning)
```bash
cd terraform
terraform init
terraform plan -var-file="terraform.tfvars.example"
# Apply (dry-run or cloud):
# terraform apply -var-file="terraform.tfvars.example"
```

### Ansible (Configuration Management)
```bash
cd ansible
ansible-playbook -i inventory/hosts.ini site.yml
```

---

## 19. Troubleshooting & FAQ

- **Database Connection Error:** Verify PostgreSQL is running. For local testing, CareHealth Point automatically falls back to SQLite (`carehealth.db`) with zero manual setup required.
- **Port Conflict on 3000 or 8000:** Specify alternative ports:
  `PORT=3001 npm run dev` or `python -m uvicorn app.main:app --port 8080`.
- **TestClient Socket Permission Warning on Windows:** Run pytest outside sandboxed environments (`python -m pytest tests/`).

---

## 20. Future Scope

- Integration with HL7/FHIR healthcare interoperability standards.
- Real-time WebSockets for instant live queue notifications.
- Telemedicine video consultation integration via WebRTC.
- Automated multi-region canary deployments with Istio service mesh.

---

## License & Academic Disclaimer

This project is submitted in partial fulfillment of the requirements for the **B.Tech Degree in Computer Science and Engineering** (Course: *DevOps & Automation Lab*, Course Code: *ENSP461*). All patient records and doctor profiles used in this demonstration are synthetic dummy data.

*"CareHealth Point – Better Healthcare. Smarter Management."*
