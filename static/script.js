let allPhones = [];
let filteredPhones = [];

let p1 = null;
let p2 = null;
let currentTurn = 1; // 1 yoki 2
let isBattleOver = false;
let pickingSlot = 1; // Hozir qaysi o'yinchiga telefon saylanyapti

let selectedBrand = "all";
let searchQuery = "";

// Xorazmcha jonli dialoglar
const xorazmPhrases = {
  attack: [
    "Apparat bilan to'g'ri manglayidan urdi!",
    "Bunday zarb bilan quvvatini sug'urib oldi!",
    "Gullatding og'a! Ekraniga yoriq tushgandek bo'ldi!"
  ],
  crit: [
    "DAHXAT! 120 FPS Overclock kuchi bilan portlatdi!",
    "Barcha yadrolari baravar ishlab, raqibni shoshirib qo'ydi!"
  ],
  cool: [
    "Kuler qo'yildi! Harorat tushib, apparat quvvatlandi!",
    "Sovutish tizimi yondi, himoya ko'tarildi!"
  ],
  charge: [
    "Paynetdan hisobga pul tushdi! Zaryad to'ldi!",
    "Original zaryadchik ulandi, apparat yashnab ketdi!"
  ],
  ulta: [
    "TARAS-QARS! Butun kuchlanishni bitta zarbga jamladi, apparat tutab ketdi!"
  ]
};

async function init() {
  try {
    const res = await fetch("phones.json");
    allPhones = await res.json();
    filteredPhones = [...allPhones];
    renderList();
    bindEvents();
  } catch (err) {
    document.getElementById("phone-grid").innerHTML = "<p>phones.json yuklanmadi!</p>";
  }
}

function bindEvents() {
  document.getElementById("search-box").addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilter();
  });

  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      selectedBrand = btn.dataset.brand;
      applyFilter();
    });
  });

  document.getElementById("btn-fight-start").onclick = startBattle;
  document.getElementById("btn-change-phone").onclick = resetToSelection;

  // Jang harakatlari
  document.getElementById("btn-attack").onclick = () => doAction("attack");
  document.getElementById("btn-crit").onclick = () => doAction("crit");
  document.getElementById("btn-cool").onclick = () => doAction("cool");
  document.getElementById("btn-charge").onclick = () => doAction("charge");
  document.getElementById("btn-ulta").onclick = () => doAction("ulta");
}

function applyFilter() {
  filteredPhones = allPhones.filter(p => {
    const matchesBrand = selectedBrand === "all" || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                          p.chipset.toLowerCase().includes(searchQuery);
    return matchesBrand && matchesSearch;
  });
  renderList();
}

function renderList() {
  const container = document.getElementById("phone-grid");
  container.innerHTML = "";

  filteredPhones.forEach(p => {
    const item = document.createElement("div");
    item.className = "phone-item";
    if (p1 && p1.id === p.id) item.classList.add("selected-p1");
    if (p2 && p2.id === p.id) item.classList.add("selected-p2");

    item.onclick = () => selectPhoneForSlot(p);

    item.innerHTML = `
      <div class="phone-item-head">
        <span class="brand">${p.brand}</span>
        <span class="price">${p.price}</span>
      </div>
      <div class="phone-item-name">${p.name}</div>
      <div class="phone-item-chip">${p.chipset}</div>
      <div class="phone-item-stats">
        <span>HP: <b>${p.hp}</b></span>
        <span>Zarb: <b>${p.attack}</b></span>
        <span>Himoya: <b>${p.defense}</b></span>
      </div>
    `;
    container.appendChild(item);
  });
}

// Qaysi slot aktiv ekanini belgilash
function setPickingSlot(slotNum) {
  pickingSlot = slotNum;
  document.getElementById("slot-p1").classList.toggle("active-slot", slotNum === 1);
  document.getElementById("slot-p2").classList.toggle("active-slot", slotNum === 2);
  document.getElementById("selected-summary").innerText = `${slotNum}-ishtirokchi uchun apparat tanlang`;
}

// Foydalanuvchi tanlagan telefonni kerakli slotga kiritish
function selectPhoneForSlot(p) {
  const cloned = JSON.parse(JSON.stringify(p));
  cloned.temp = 36;
  cloned.energy = 0;

  if (pickingSlot === 1) {
    p1 = cloned;
    document.getElementById("slot-name-p1").innerText = p1.name;
    document.getElementById("slot-specs-p1").innerText = `HP: ${p1.hp} | Zarb: ${p1.attack}`;
    document.getElementById("slot-p1").classList.add("ready");
    setPickingSlot(2); // Avtomatik 2-slotga o'tkazadi
  } else {
    p2 = cloned;
    document.getElementById("slot-name-p2").innerText = p2.name;
    document.getElementById("slot-specs-p2").innerText = `HP: ${p2.hp} | Zarb: ${p2.attack}`;
    document.getElementById("slot-p2").classList.add("ready");
  }

  renderList();

  // Agar ikkala telefon ham tanlangan bo'lsa, start tugmasi yonadi
  if (p1 && p2) {
    document.getElementById("btn-fight-start").disabled = false;
    document.getElementById("selected-summary").innerHTML = 
      `<b style="color:var(--primary)">${p1.name}</b> vs <b style="color:var(--accent)">${p2.name}</b> maydonga tayyor!`;
  }
}

function startBattle() {
  isBattleOver = false;
  currentTurn = p1.speed >= p2.speed ? 1 : 2; // Tezligi yuqorisi birinchi boshlaydi

  document.getElementById("selection-phase").classList.add("hidden");
  document.getElementById("battle-phase").classList.remove("hidden");

  setupBattleUI();
}

function resetToSelection() {
  document.getElementById("battle-phase").classList.add("hidden");
  document.getElementById("selection-phase").classList.remove("hidden");
}

function setupBattleUI() {
  // P1
  document.getElementById("p1-name").innerText = p1.name;
  document.getElementById("p1-chip").innerText = p1.chipset;
  document.getElementById("p1-attack").innerText = p1.attack;
  document.getElementById("p1-defense").innerText = p1.defense;
  document.getElementById("p1-cam").innerText = p1.camera.split('+')[0] || "Asosiy";

  // P2
  document.getElementById("p2-name").innerText = p2.name;
  document.getElementById("p2-chip").innerText = p2.chipset;
  document.getElementById("p2-attack").innerText = p2.attack;
  document.getElementById("p2-defense").innerText = p2.defense;
  document.getElementById("p2-cam").innerText = p2.camera.split('+')[0] || "Asosiy";

  updateUI();
  setCommentary(`Maydonga ${p1.name} va ${p2.name} tushdi! Harakat: ${currentTurn}-apparatda!`);
}

function updateUI() {
  // HP & Energy
  document.getElementById("p1-hp-bar").style.width = Math.max(0, (p1.hp / p1.max_hp) * 100) + "%";
  document.getElementById("p1-hp-text").innerText = `${Math.max(0, p1.hp)}/${p1.max_hp}`;
  document.getElementById("p1-energy-bar").style.width = p1.energy + "%";
  document.getElementById("p1-energy-text").innerText = p1.energy + "%";
  document.getElementById("p1-temp").innerText = p1.temp + "°C";

  document.getElementById("p2-hp-bar").style.width = Math.max(0, (p2.hp / p2.max_hp) * 100) + "%";
  document.getElementById("p2-hp-text").innerText = `${Math.max(0, p2.hp)}/${p2.max_hp}`;
  document.getElementById("p2-energy-bar").style.width = p2.energy + "%";
  document.getElementById("p2-energy-text").innerText = p2.energy + "%";
  document.getElementById("p2-temp").innerText = p2.temp + "°C";

  // Turn box indicator
  document.getElementById("p1-box").classList.toggle("active-turn", currentTurn === 1);
  document.getElementById("p2-box").classList.toggle("active-turn", currentTurn === 2);
  document.getElementById("turn-indicator").innerText = `Navbat: ${currentTurn === 1 ? p1.name : p2.name}`;

  const currentAttacker = currentTurn === 1 ? p1 : p2;
  document.getElementById("btn-ulta").disabled = currentAttacker.energy < 100;
}

function doAction(type) {
  if (isBattleOver) return;

  const attacker = currentTurn === 1 ? p1 : p2;
  const defender = currentTurn === 1 ? p2 : p1;

  if (type === "attack") {
    const dmg = Math.max(8, attacker.attack - Math.floor(defender.defense / 3) + rand(-4, 4));
    defender.hp -= dmg;
    attacker.energy = Math.min(100, attacker.energy + 25);
    attacker.temp += 2;
    setCommentary(`💥 <b>${attacker.name}</b> zarba urdi (-${dmg} HP)! ${getRandom(xorazmPhrases.attack)}`);
  } 
  else if (type === "crit") {
    if (Math.random() > 0.35) {
      const dmg = Math.floor(attacker.attack * 1.65) + rand(2, 6);
      defender.hp -= dmg;
      attacker.energy = Math.min(100, attacker.energy + 35);
      attacker.temp += 5;
      setCommentary(`⚡ <b>${attacker.name}</b> OVERCLOCK zarbasi (-${dmg} HP)! ${getRandom(xorazmPhrases.crit)}`);
    } else {
      attacker.temp += 4;
      setCommentary(`⚠️ Trottling bo'ldi! Zarb o'tmadi, apparat qizidi.`);
    }
  } 
  else if (type === "cool") {
    attacker.temp = Math.max(30, attacker.temp - 8);
    attacker.hp = Math.min(attacker.max_hp, attacker.hp + 12);
    setCommentary(`❄️ <b>${attacker.name}</b> sovutildi va himoyalandi! ${getRandom(xorazmPhrases.cool)}`);
  } 
  else if (type === "charge") {
    const heal = Math.floor(attacker.max_hp * 0.25);
    attacker.hp = Math.min(attacker.max_hp, attacker.hp + heal);
    attacker.energy = Math.min(100, attacker.energy + 15);
    setCommentary(`🔌 <b>${attacker.name}</b> zaryadlandi (+${heal} HP)! ${getRandom(xorazmPhrases.charge)}`);
  } 
  else if (type === "ulta") {
    const dmg = Math.floor(attacker.attack * 2.3);
    defender.hp -= dmg;
    attacker.energy = 0;
    attacker.temp += 8;
    setCommentary(`🔥 <b>${attacker.name}</b> TARAS-QARS ULTA berdi (-${dmg} HP)! ${getRandom(xorazmPhrases.ulta)}`);
  }

  updateUI();

  if (defender.hp <= 0) {
    defender.hp = 0;
    updateUI();
    isBattleOver = true;
    setCommentary(`🏆 <b>G'ALABA! ${attacker.name} maydonda yagona hukmdor bo'ldi og'a!</b>`);
    return;
  }

  // Navbatni ikkinchi apparatga berish
  currentTurn = currentTurn === 1 ? 2 : 1;
  updateUI();
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

init();