from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.media_controller import router as media_router

from app.database.connection import Base
from app.database.connection import engine

from app.models.media_model import *

app = FastAPI(
    title="Media Service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Media Service Running"
    }

Base.metadata.create_all(bind=engine)

app.include_router(media_router)