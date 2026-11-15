import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from app.core.config import settings
from app.database.session import engine, Base
from app.api import auth, departments, doctors, patients, appointments, prescriptions, consultations, analytics, notifications

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareHealth Point REST API – Production-style Smart Hospital Management System with Observability",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics Definitions
REQUEST_COUNT = Counter(
    "carehealth_http_requests_total",
    "Total HTTP Requests handled by CareHealth API",
    ["method", "endpoint", "status_code"]
)
REQUEST_LATENCY = Histogram(
    "carehealth_http_request_duration_seconds",
    "HTTP Request Latency in seconds",
    ["endpoint"]
)

@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    endpoint = request.url.path
    # Group dynamic IDs to prevent metric cardinality explosion
    for prefix in ["/api/v1/doctors/", "/api/v1/patients/", "/api/v1/appointments/", "/api/v1/departments/"]:
        if endpoint.startswith(prefix) and len(endpoint) > len(prefix):
            endpoint = prefix + "{id}"
            break

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=endpoint,
        status_code=response.status_code
    ).inc()
    REQUEST_LATENCY.labels(endpoint=endpoint).observe(process_time)
    
    return response

# System Probes for Kubernetes
@app.get("/health", tags=["Health & Probes"])
def health_check():
    """Liveness probe: verifies that the application process is running."""
    return {"status": "healthy", "service": "carehealth-backend", "version": settings.VERSION}

@app.get("/ready", tags=["Health & Probes"])
def readiness_check():
    """Readiness probe: verifies that database connectivity is active."""
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return Response(content=f'{{"status": "not ready", "error": "{str(e)}"}}', status_code=503, media_type="application/json")

@app.get("/metrics", tags=["Observability"])
def metrics():
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)
app.include_router(doctors.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router, prefix=settings.API_V1_STR)
app.include_router(prescriptions.router, prefix=settings.API_V1_STR)
app.include_router(consultations.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to CareHealth Point API",
        "tagline": "Better Healthcare. Smarter Management.",
        "docs": "/docs",
        "health": "/health",
        "metrics": "/metrics"
    }
