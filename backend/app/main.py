from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.events import router as events_router
from app.routers.departments import router as departments_router
from app.routers.tasks import router as tasks_router
from app.routers.timelines import router as timeline_router
from app.routers.reports import router as report_router

app = FastAPI(
    title="Mainstream Event Operating System",
    description="AI-powered Event Management Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)

app.include_router(events_router)

app.include_router(departments_router)

app.include_router(tasks_router)

app.include_router(timeline_router)

app.include_router(report_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Mainstream API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }