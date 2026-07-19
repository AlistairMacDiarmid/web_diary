from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#allow frontend (port 5173) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/entries")
def get_entries():
    #returning a simple list for now"
    return [{"id": 1, "text": "This is my first diary entry!"}]