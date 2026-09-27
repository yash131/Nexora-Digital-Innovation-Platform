"""
api/index.py — Vercel Python serverless entrypoint.

Vercel's Python runtime automatically serves ASGI apps exported as `app`.
Any request to /api/* on the deployed site is rewritten to this handler
(see the `rewrites` block in ../vercel.json) and FastAPI handles the
routing internally to /api/, /api/health, /api/status, etc.

This file is intentionally self-contained (no cross-directory imports)
so Vercel's dependency tracer bundles only what it needs. The same
logic is mirrored in /backend/server.py for local development with
`uvicorn backend.server:app`.

No database — the demo uses in-memory storage.
"""
from datetime import datetime, timezone
from typing import List
import os
import uuid

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware


app = FastAPI(title="Nexora API")
api_router = APIRouter(prefix="/api")


# -----------------------------------------------------------------------------
# In-memory store (replaces MongoDB; the project must work without a database)
# -----------------------------------------------------------------------------
_status_checks: List[dict] = []


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Hello World", "service": "Nexora API", "database": "none (in-memory demo)"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(payload: StatusCheckCreate):
    if not payload.client_name.strip():
        raise HTTPException(status_code=400, detail="client_name is required")
    obj = StatusCheck(client_name=payload.client_name.strip())
    _status_checks.append(obj.model_dump())
    return obj


@api_router.get("/status", response_model=List[StatusCheck])
async def list_status_checks():
    # Newest first; capped at 200 to keep responses small on Vercel.
    return list(reversed(_status_checks))[:200]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

__all__ = ["app"]
