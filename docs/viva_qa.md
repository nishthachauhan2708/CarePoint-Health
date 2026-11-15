# CareHealth Point – Technical Viva & Laboratory Defense Q&A

**Course:** DevOps & Automation Lab (Course Code: ENSP461)  
**Project Title:** Design and Implementation of an End-to-End DevOps Pipeline for Cloud-Native Application Deployment  
**System:** CareHealth Point – Smart Hospital Management System  

---

## Part 1: Core Application & Architecture

### Q1: What is the architectural design pattern of CareHealth Point?
**Answer:**  
CareHealth Point is engineered as a cloud-native 3-tier microservice architecture:
1. **Presentation Tier:** A responsive Single Page Application (SPA) built using React 18, TypeScript, and Tailwind CSS, served in production via an optimized Nginx Alpine reverse proxy.
2. **Application Tier:** An asynchronous REST API built with Python FastAPI and Pydantic, exposing OpenAPI/Swagger endpoints, Prometheus telemetry (`/metrics`), and health probes (`/health`, `/ready`).
3. **Data Tier:** PostgreSQL relational database with ACID guarantees, foreign key integrity constraints, and persistent storage managed via Kubernetes PersistentVolumeClaims.

---

### Q2: How does CareHealth Point prevent double-booking of doctor appointments?
**Answer:**  
Double-booking prevention is enforced at both database and application levels:
1. **Database Constraint:** A composite `UniqueConstraint("doctor_id", "appointment_date", "time_slot", name="uq_doctor_date_slot")` ensures physical impossibility of concurrent duplicate insertions.
2. **Application Logic:** The `POST /api/v1/appointments/` route validates slot availability before insert and returns an HTTP `409 CONFLICT` with a descriptive message if the slot is occupied.

---

### Q3: How is Role-Based Access Control (RBAC) enforced?
**Answer:**  
RBAC is enforced statelessly using JSON Web Tokens (JWT) with bcrypt-hashed passwords:
- Roles supported: `admin`, `doctor`, `receptionist`, `patient`.
- FastAPI route dependencies (`require_roles(["admin", ...])`) intercept inbound HTTP calls, decode the bearer token from the `Authorization` header, verify cryptographic signature and expiration, and validate permissions before executing handler logic.

---

## Part 2: Containerization & Docker

### Q4: Why did you use multi-stage Docker builds?
**Answer:**  
Multi-stage builds decouple the build environment from the final execution runtime:
- **Frontend:** Stage 1 uses Node.js 20 to install dependencies and run `npm run build` (producing static HTML/CSS/JS). Stage 2 copies only the compiled static assets into a lean Nginx Alpine image (~25MB), eliminating Node.js, npm cache, and source files from production.
- **Backend:** Stage 1 compiles wheel dependencies using build tools and `gcc`. Stage 2 copies the pre-built packages to a clean `python:3.9-slim` base, reducing image size by ~70% and removing development compilers to shrink the attack surface.

---

### Q5: What security practices are implemented in your Dockerfiles?
**Answer:**  
1. **Non-root user execution:** Containers run under a dedicated `appuser` (UID 1001) instead of `root`, mitigating container escape risks.
2. **Explicit healthchecks:** `HEALTHCHECK` instructions in both Dockerfiles monitor process responsiveness (`/health` on backend, `/` on Nginx).
3. **Layer caching:** `COPY package*.json` and `COPY requirements.txt` precede application code copying to cache dependency layers.
4. **.dockerignore:** Excludes secrets, `.git`, `.env`, and temporary files from image layers.

---

## Part 3: Continuous Integration with Jenkins

### Q6: Walk through the stages in your Jenkinsfile.
**Answer:**  
The declarative pipeline consists of 11 sequential and parallel stages:
1. **Checkout SCM:** Clones branch from GitHub.
2. **Dependency Installation:** Parallel installation of Python wheels and npm modules.
3. **Code Quality Checks:** Flake8 syntax linting and TypeScript compilation validation (`tsc --noEmit`).
4. **Automated Testing:** Pytest suite execution generating JUnit XML test reports.
5. **Frontend Production Build:** Compiles React bundle.
6. **SonarQube SAST:** Scans codebase for bugs, vulnerabilities, and code smells.
7. **Docker Image Build:** Builds version-tagged container images.
8. **Trivy Vulnerability Scan:** Container image CVE security audit.
9. **Docker Image Push:** Authenticates and pushes images to Docker Hub.
10. **Kubernetes Deployment:** Applies declarative manifests with dynamic image tags.
11. **Deployment Verification:** Rollout status check and health probe confirmation.

---

### Q7: How are secrets managed in the Jenkins pipeline?
**Answer:**  
No secrets or tokens are hardcoded. Credentials (`docker-hub-credentials`, `sonarqube-token`, `kubeconfig-credentials`) are securely stored in Jenkins Credential Manager and injected into environment variables at runtime using `withCredentials()` blocks, which automatically mask passwords in console logs.

---

## Part 4: Kubernetes & Orchestration

### Q8: What is the difference between Liveness and Readiness probes in your deployment?
**Answer:**  
- **Liveness Probe (`/health`):** Verifies if the FastAPI process is alive. If this probe fails repeatedly, kubelet restarts the container.
- **Readiness Probe (`/ready`):** Verifies whether the application has active connectivity to the PostgreSQL database. If this probe fails, the pod is temporarily removed from service endpoints so incoming patient traffic is not routed to a failing pod.

---

### Q9: How does Horizontal Pod Autoscaling (HPA) work?
**Answer:**  
The HPA controller queries the Kubernetes Metrics Server to evaluate pod utilization:
- Scale target: Backend deployment scales from a minimum of 2 pods up to 10 pods when average CPU utilization exceeds 70% or memory exceeds 80%.

---

## Part 5: Blue-Green Deployment & GitOps

### Q10: How did you implement Blue-Green Deployment without downtime?
**Answer:**  
1. We maintain two identical deployment environments: `carehealth-backend-blue` (current stable version) and `carehealth-backend-green` (new release version).
2. A single active Kubernetes Service (`carehealth-backend-active-service`) exposes port 8000.
3. Traffic routing is controlled via label selectors: `selector: { app: carehealth-backend, version: blue }`.
4. To release version green, green pods are deployed and verified for health.
5. A shell/batch automation script patches the service selector from `blue` to `green`.
6. Traffic switches instantaneously (0 milliseconds downtime).
7. If unexpected anomalies occur, rollback to `blue` is executed in 1 second by repatching the selector.

---

### Q11: What is GitOps and how does ArgoCD enforce it?
**Answer:**  
GitOps treats the Git repository as the **single source of truth** for declarative cluster state. ArgoCD continually monitors the repository and compares Git manifests with active live cluster state:
- **Auto-Sync:** Changes pushed to Git trigger automatic application of manifests.
- **Self-Healing:** If an operator manually modifies or deletes a cluster pod or service, ArgoCD detects the configuration drift and immediately reconciles the cluster back to the state declared in Git.
- **Pruning:** Resources deleted from Git are safely garbage-collected from the cluster.

---

## Part 6: Observability & Security

### Q12: How does Prometheus scrape metrics from FastAPI?
**Answer:**  
We integrated `prometheus-client` and custom ASGI middleware in `backend/app/main.py`. Every inbound HTTP request increments a Prometheus `Counter` (`carehealth_http_requests_total`) partitioned by method, endpoint, and status code, and records response duration into a `Histogram` (`carehealth_http_request_duration_seconds`). Prometheus server scrapes these metrics from the `/metrics` endpoint every 15 seconds.

---

### Q13: What does Fluentd do in your logging architecture?
**Answer:**  
Fluentd runs as a centralized log aggregator. It tails container log streams (`/var/log/containers/*carehealth*.log`), parses JSON logs, enriches them with cluster and timestamp metadata, applies regex filters to sanitize sensitive parameters (passwords, tokens), and routes structured logs to stdout and persistent storage.

---

### Q14: How did you ensure database persistence across container restarts?
**Answer:**  
PostgreSQL uses a Kubernetes `PersistentVolumeClaim` (`carehealth-postgres-pvc`) mapped to a host/cloud storage volume mounted at `/var/lib/postgresql/data`. Even if the PostgreSQL pod is deleted or rescheduled onto another node, the persistent volume reattaches intact without data loss.
