import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "phones.json"

def get_phones():
    if not DB_FILE.exists():
        return []
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_phones(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("\n" + "="*50)
    print("🥊 TELEFON-JANG: BAZAGA YANGI MODEL QO‘SHISH")
    print("="*50)

    phones = get_phones()
    p_id = input("1. Qisqa ID (masalan: s25u): ").strip().lower()
    if any(p["id"] == p_id for p in phones):
        print(f"❌ '{p_id}' ID allaqachon mavjud!")
        return

    name = input("2. Telefon nomi: ").strip()
    brand = input("3. Brendi (Apple, Samsung, Xiaomi, Poco): ").strip()
    uzum = input("4. Uzum narxi (masalan: 4 500 000 so‘m): ").strip()
    amazon = input("5. Amazon narxi (masalan: $350): ").strip()
    screen = input("6. Ekrani: ").strip()
    cpu = input("7. Protsessori: ").strip()
    camera = input("8. Kamerasi: ").strip()
    battery = input("9. Batareyasi: ").strip()
    weight = input("10. Og‘irligi: ").strip()

    print("\n--- Kuch ko'rsatkichlari (1-100) ---")
    try:
        cpu_s = int(input("Protsessor bali: ") or 85)
        cam_s = int(input("Kamera bali: ") or 85)
        bat_s = int(input("Batareya bali: ") or 85)
        scr_s = int(input("Ekran bali: ") or 85)
    except ValueError:
        cpu_s, cam_s, bat_s, scr_s = 85, 85, 85, 85

    pros = [p.strip() for p in input("Afzalliklari (vergul bilan): ").split(",") if p.strip()]
    cons = [c.strip() for c in input("Kamchiliklari (vergul bilan): ").split(",") if c.strip()]

    new_model = {
        "id": p_id,
        "name": name,
        "brand": brand,
        "uzum_price": uzum,
        "amazon_price": amazon,
        "screen": screen,
        "cpu": cpu,
        "camera": camera,
        "battery": battery,
        "weight": weight,
        "scores": {"cpu": cpu_s, "camera": cam_s, "battery": bat_s, "screen": scr_s},
        "pros": pros,
        "cons": cons
    }

    phones.append(new_model)
    save_phones(phones)
    print(f"\n✅ '{name}' muvaffaqiyatli bazaga qo‘shildi! Jami: {len(phones)} ta model.")

if __name__ == "__main__":
    main()