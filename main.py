from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from pathlib import Path
import json

app = FastAPI(
    title="TelefonJang API",
    description="Xorazmcha smartfonlarni solishtirish va urushtirish platformasi",
    version="2.0.0"
)

# CORS sozlamalari (domen ulaganda xavfsizlik uchun)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "phones.json"
STATIC_DIR = BASE_DIR / "static"

def load_database() -> List[Dict[str, Any]]:
    if not DB_FILE.exists():
        return []
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Baza o‘qishda xatolik: {str(e)}"
        )

class FightRequest(BaseModel):
    phone_ids: List[str] = Field(..., min_length=2, description="Kamida 2 ta telefon IDsi")

@app.get("/api/phones", response_model=Dict[str, Any])
async def get_all_phones():
    phones = load_database()
    return {"status": "success", "count": len(phones), "phones": phones}

@app.post("/api/fight", response_model=Dict[str, Any])
async def fight_selected_phones(payload: FightRequest):
    phones = load_database()
    phone_map = {p["id"]: p for p in phones}
    
    selected = [phone_map[p_id] for p_id in payload.phone_ids if p_id in phone_map]
    
    if len(selected) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ringga tushirish uchun kamida 2 ta to‘g‘ri telefon saylang, jo‘ra!"
        )

    # Ballarni hisoblash
    standings = []
    for p in selected:
        total_score = sum(p.get("scores", {}).values())
        standings.append({"phone": p, "total_score": total_score})

    standings.sort(key=lambda x: x["total_score"], reverse=True)
    winner = standings[0]["phone"]
    loser = standings[-1]["phone"]

    analysis = (
        f"G‘olib — {winner['name']} bo‘ldi! Uning {winner['cpu']} protsessori hamda "
        f"{winner['pros'][0].lower()} raqibi {loser['name']} ustidan aniq g‘alabani ta’minladi."
    )

    return {
        "status": "success",
        "winner": winner,
        "standings": standings,
        "xorazmcha_xulosa": analysis
    }

# Statik fayllar (Frontend)
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")