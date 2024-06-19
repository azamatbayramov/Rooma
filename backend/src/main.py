from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from src.bridge.router import router as bridge_router
from src.database import init_db
from src.logs.log import log
from src.vars.config import APP_ROOT_PATH, APP_DESCRIPTION, APP_TITLE


@asynccontextmanager
async def lifespan(app: FastAPI):
    # before startup
    log.info("Database initialization")
    await init_db()

    log.info("Prometheus instrumentator initialization")
    instrumentator.expose(app)

    log.info("Application startup")

    yield

    # after finishing
    log.info("Application shutdown")


app = FastAPI(
    lifespan=lifespan,
    root_path=APP_ROOT_PATH,
    title=APP_TITLE,
    description=APP_DESCRIPTION,
)
instrumentator = Instrumentator().instrument(app)

# include routers
app.include_router(bridge_router)

# CORS
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
