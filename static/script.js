let allPhones = [];
let filteredPhones = [];

let p1 = null;
let p2 = null;
let currentTurn = 1;
let isBattleOver = false;
let pickingSlot = 1;

let selectedBrand = "all";
let searchQuery = "";
let modalTargetPhone = null;

let usdToUzsRate = 12900;

// Xorazmcha boy dialoglar
const xorazmPhrases = {
  attack: [
    "Apparat bilan to'g'ri manglayidan urdi!",
    "Bunday zarb bilan quvvatini sug'urib oldi!",
    "Gullatding og'a! Ekraniga yoriq tushgandek bo'ldi!",
    "Matohing qattiq tegdi, raqib chayqalib ketdi!"
  ],
  crit: [
    "DAHXAT! 120 FPS Overclock kuchi bilan portlatdi!",
    "Barcha yadrolari baravar ishlab, raqibni shoshirib qo'ydi!",
    "O't chiqib ketdi apparatdan! Urganch to'yxonasi larzaga keldi!"
  ],
  cool: [
    "Kuler qo'yildi! Harorat tushib, apparat quvvatlandi!",
    "Sovutish tizimi yondi, himoya ko'tarildi!",
    "Apparatga muzdek choy sepilganday bo'ldi, tetiklashdi!"
  ],
  charge: [
    "Paynetdan hisobga pul tushdi! Zaryad to'ldi!",
    "Original zaryadchik ulandi, apparat yashnab ketdi!",
    "Akkumulyatori qaytadan kuchga to'ldi, davom etamiz og'a!"
  ],
  ulta: [
    "TARAS-QARS! Butun kuchlanishni bitta zarbga jamladi, apparat tutab ketdi!",
    "GULLATDI! Butun dehqon bozori bu zarbaga qarab qoldi!"
  ]
};

// Sahifa to'liq yuklangach ishga tushadi
document.addEventListener("DOMContentLoaded", () => {
  init();
});

async function init() {
  bindEvents();
  await fetchExchangeRate();
  await loadPhonesData();
}

async function fetchExchangeRate() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    if (data && data.rates && data.rates.UZS) {
      usdToUzsRate = Math.round(data.rates.UZS);
      const el = document.getElementById("usd-rate-badge");
      if (el) el.innerText = `1$ = ${usdToUzsRate.toLocaleString('uz-UZ')} so'm (Jonli)`;
    }
  } catch (e) {
    const el = document.getElementById("usd-rate-badge");
    if (el) el.innerText = `1$ = ${usdToUzsRate.toLocaleString('uz-UZ')} so'm (Oflayn)`;
  }
}

function formatUzs(priceStr) {
  if (!priceStr) return "Noma'lum";
  const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
  if (isNaN(num)) return priceStr;
  const uzs = num * usdToUzsRate;
  return uzs.toLocaleString('uz-UZ') + " so'm";
}

async function loadPhonesData() {
  try {
    const res = await fetch("phones.json");
    allPhones = await res.json();
    filteredPhones = [...allPhones];
    renderList();
  } catch (err) {
    const grid = document.getElementById("phone-grid");
    if (grid) grid.innerHTML = "<p>phones.json yuklanmadi!</p>";
  }
}

function bindEvents() {
  const searchInput = document.getElementById("search-box");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilter();
    });
  }

  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      selectedBrand = btn.dataset.brand;
      applyFilter();
    });
  });

  const btnCompare = document.getElementById("btn-compare-now");
  if (btnCompare) btnCompare.onclick = comparePhones;

  const btnFightStart = document.getElementById("btn-fight-start");
  if (btnFightStart) btnFightStart.onclick = startBattle;

  const btnChangePhone = document.getElementById("btn-change-phone");
  if (btnChangePhone) btnChangePhone.onclick = resetToSelection;

  const btnPlayAgain = document.getElementById("btn-play-again");
  if (btnPlayAgain) btnPlayAgain.onclick = resetToSelection;

  // Jang harakatlari tugmalari
  const btnAttack = document.getElementById("btn-attack");
  if (btnAttack) btnAttack.onclick = () => doAction("attack");

  const btnCrit = document.getElementById("btn-crit");
  if (btnCrit) btnCrit.onclick = () => doAction("crit");

  const btnCool = document.getElementById("btn-cool");
  if (btnCool) btnCool.onclick = () => doAction("cool");

  const btnCharge = document.getElementById("btn-charge");
  if (btnCharge) btnCharge.onclick = () => doAction("charge");

  const btnUlta = document.getElementById("btn-ulta");
  if (btnUlta) btnUlta.onclick = () => doAction("ulta");

  // Pasportdan apparatni tanlash
  const btnPickModal = document.getElementById("btn-pick-from-modal");
  if (btnPickModal) {
    btnPickModal.onclick = () => {
      if (modalTargetPhone) {
        selectPhoneForSlot(modalTargetPhone);
        closePassport();
      }
    };
  }

  const modalPassport = document.getElementById("modal-passport");
  if (modalPassport) {
    modalPassport.onclick = (e) => {
      if (e.target.id === "modal-passport") closePassport();
    };
  }
}

function applyFilter() {
  filteredPhones = allPhones.filter(p => {
    const matchesBrand = selectedBrand === "all" || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    const uzsPrice = formatUzs(p.price).toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                          p.chipset.toLowerCase().includes(searchQuery) ||
                          uzsPrice.includes(searchQuery);
    return matchesBrand && matchesSearch;
  });
  renderList();
}

function renderList() {
  const container = document.getElementById("phone-grid");
  if (!container) return;
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
        <span class="price-uzs">${formatUzs(p.price)}</span>
      </div>
      <div class="phone-item-name">${p.name}</div>
      <div class="phone-item-chip">${p.chipset.split('(')[0]}</div>
      <div class="phone-item-stats">
        <span>HP: <b>${p.hp}</b></span>
        <span>Zarb: <b>${p.attack}</b></span>
        <span onclick="event.stopPropagation(); openFullPassportById('${p.id}')" style="color:var(--primary); text-decoration:underline; font-weight:700;">📋 Pasport</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function setPickingSlot(slotNum) {
  pickingSlot = slotNum;
  const s1 = document.getElementById("slot-p1");
  const s2 = document.getElementById("slot-p2");
  if (s1) s1.classList.toggle("active-slot", slotNum === 1);
  if (s2) s2.classList.toggle("active-slot", slotNum === 2);
  const summary = document.getElementById("selected-summary");
  if (summary) summary.innerText = `${slotNum}-apparat uchun modelni bosing yoki Pasportini oching`;
}

function selectPhoneForSlot(p) {
  const cloned = JSON.parse(JSON.stringify(p));
  cloned.temp = 36;
  cloned.energy = 0;
  cloned.priceUzs = formatUzs(p.price);

  if (pickingSlot === 1) {
    p1 = cloned;
    document.getElementById("slot-name-p1").innerText = p1.name;
    document.getElementById("slot-specs-p1").innerText = `${p1.chipset.split('(')[0]} | HP: ${p1.hp}`;
    document.getElementById("slot-price-p1").innerText = p1.priceUzs;
    document.getElementById("slot-p1").classList.add("ready");
    const btnV1 = document.getElementById("btn-view-p1");
    if (btnV1) btnV1.style.display = "inline-block";
    setPickingSlot(2);
  } else {
    p2 = cloned;
    document.getElementById("slot-name-p2").innerText = p2.name;
    document.getElementById("slot-specs-p2").innerText = `${p2.chipset.split('(')[0]} | HP: ${p2.hp}`;
    document.getElementById("slot-price-p2").innerText = p2.priceUzs;
    document.getElementById("slot-p2").classList.add("ready");
    const btnV2 = document.getElementById("btn-view-p2");
    if (btnV2) btnV2.style.display = "inline-block";
  }

  renderList();

  if (p1 && p2) {
    const btnStart = document.getElementById("btn-fight-start");
    const btnComp = document.getElementById("btn-compare-now");
    if (btnStart) btnStart.disabled = false;
    if (btnComp) btnComp.disabled = false;
    document.getElementById("selected-summary").innerHTML = 
      `<b style="color:var(--primary)">${p1.name}</b> va <b style="color:var(--accent)">${p2.name}</b> tayyor! "Katta Tahlil" yoki "Maydonda Urishtirish"ni bosing!`;
    comparePhones();
  }
}

function openFullPassportById(id) {
  const phone = allPhones.find(x => x.id === id);
  if (phone) openFullPassport(phone);
}

function openFullPassport(phone) {
  if (!phone) return;
  modalTargetPhone = phone;

  document.getElementById("pass-brand").innerText = phone.brand.toUpperCase();
  document.getElementById("pass-title").innerText = phone.name;
  document.getElementById("pass-usd").innerText = phone.price;
  document.getElementById("pass-uzs").innerText = formatUzs(phone.price);

  document.getElementById("pass-vibe").innerText = `"${phone.vibe}"`;

  document.getElementById("pass-chip").innerText = phone.chipset;
  document.getElementById("pass-ram-storage").innerText = `Tezkor xotira (RAM): ${phone.ram} | Ichki xotira: ${phone.storage}`;
  document.getElementById("pass-screen").innerText = phone.screen;
  document.getElementById("pass-camera").innerText = phone.camera;
  document.getElementById("pass-battery").innerText = `Akkumulyator: ${phone.battery} | Quvvatlash: ${phone.charging}`;
  document.getElementById("pass-materials").innerText = phone.materials || "Metall rom, shisha korpus, suvdan himoyalangan";
  document.getElementById("pass-dimensions").innerText = `Vazni: ${phone.weight || '-'} | O'lchamlari: ${phone.dimensions || '-'}`;
  document.getElementById("pass-combat-stats").innerText = `Zarb: ${phone.attack} | Himoya: ${phone.defense} | Jon (HP): ${phone.hp} | Tezlik: ${phone.speed || 30}`;

  document.getElementById("modal-passport").classList.remove("hidden");
}

function closePassport() {
  const modal = document.getElementById("modal-passport");
  if (modal) modal.classList.add("hidden");
}

function comparePhones() {
  if (!p1 || !p2) return;

  const box = document.getElementById("comparison-box");
  const details = document.getElementById("comp-details");
  if (box) box.classList.remove("hidden");

  let p1Points = 0;
  let p2Points = 0;

  const atkBetter = p1.attack > p2.attack ? 1 : (p2.attack > p1.attack ? 2 : 0);
  if (atkBetter === 1) p1Points++; if (atkBetter === 2) p2Points++;

  const batBetter = p1.hp > p2.hp ? 1 : (p2.hp > p1.hp ? 2 : 0);
  if (batBetter === 1) p1Points++; if (batBetter === 2) p2Points++;

  const numP1 = parseInt(p1.price.replace(/[^0-9]/g, '')) || 999;
  const numP2 = parseInt(p2.price.replace(/[^0-9]/g, '')) || 999;
  const priceBetter = numP1 < numP2 ? 1 : (numP2 < numP1 ? 2 : 0);
  if (priceBetter === 1) p1Points++; if (priceBetter === 2) p2Points++;

  let verdictText = "";
  if (p1Points > p2Points) verdictText = `🔥 Umumiy ustunlik: ${p1.name} zo'roq!`;
  else if (p2Points > p1Points) verdictText = `🔥 Umumiy ustunlik: ${p2.name} zo'roq!`;
  else verdictText = `⚖️ Har ikkala apparat deyarli teng kuchli!`;

  const verdictTag = document.getElementById("verdict-tag");
  if (verdictTag) verdictTag.innerText = verdictText;

  if (details) {
    details.innerHTML = `
      <div class="comp-item">
        <span>⚙️ Protsessor va Zarb:</span>
        <b class="${atkBetter === 1 ? 'better' : ''}">${p1.name}: ${p1.attack} ball</b> vs 
        <b class="${atkBetter === 2 ? 'better' : ''}">${p2.name}: ${p2.attack} ball</b>
      </div>
      <div class="comp-item">
        <span>🔋 Batareya & Chidamlilik:</span>
        <b class="${batBetter === 1 ? 'better' : ''}">${p1.battery}</b> vs 
        <b class="${batBetter === 2 ? 'better' : ''}">${p2.battery}</b>
      </div>
      <div class="comp-item">
        <span>💰 Hamyonboplik (Narx/Sifat):</span>
        <b class="${priceBetter === 1 ? 'better' : ''}">${p1.priceUzs}</b> vs 
        <b class="${priceBetter === 2 ? 'better' : ''}">${p2.priceUzs}</b>
      </div>
    `;
  }
}

function startBattle() {
  if (!p1 || !p2) return;
  isBattleOver = false;
  currentTurn = (p1.speed || 30) >= (p2.speed || 30) ? 1 : 2;

  document.getElementById("modal-verdict").classList.add("hidden");
  document.getElementById("selection-phase").classList.add("hidden");
  document.getElementById("battle-phase").classList.remove("hidden");

  setupBattleUI();
}

function resetToSelection() {
  document.getElementById("modal-verdict").classList.add("hidden");
  document.getElementById("battle-phase").classList.add("hidden");
  document.getElementById("selection-phase").classList.remove("hidden");
}

function setupBattleUI() {
  document.getElementById("p1-name").innerText = p1.name;
  document.getElementById("p1-price").innerText = p1.priceUzs;
  document.getElementById("p1-chip").innerText = p1.chipset.split('(')[0];
  document.getElementById("p1-attack").innerText = p1.attack;
  document.getElementById("p1-defense").innerText = p1.defense;
  document.getElementById("p1-battery").innerText = p1.battery;
  document.getElementById("p1-charging").innerText = p1.charging ? p1.charging.split(',')[0] : "Standart";
  document.getElementById("p1-screen").innerText = p1.screen ? p1.screen.split(',')[0] : "OLED";
  document.getElementById("p1-camera").innerText = p1.camera ? p1.camera.split('+')[0] : "Asosiy";
  document.getElementById("p1-mat").innerText = p1.materials ? p1.materials.split(',')[0] : "Titan/Metall";

  document.getElementById("p2-name").innerText = p2.name;
  document.getElementById("p2-price").innerText = p2.priceUzs;
  document.getElementById("p2-chip").innerText = p2.chipset.split('(')[0];
  document.getElementById("p2-attack").innerText = p2.attack;
  document.getElementById("p2-defense").innerText = p2.defense;
  document.getElementById("p2-battery").innerText = p2.battery;
  document.getElementById("p2-charging").innerText = p2.charging ? p2.charging.split(',')[0] : "Standart";
  document.getElementById("p2-screen").innerText = p2.screen ? p2.screen.split(',')[0] : "OLED";
  document.getElementById("p2-camera").innerText = p2.camera ? p2.camera.split('+')[0] : "Asosiy";
  document.getElementById("p2-mat").innerText = p2.materials ? p2.materials.split(',')[0] : "Titan/Metall";

  updateUI();
  setCommentary(`Maydonda: ${p1.name} (${p1.priceUzs}) va ${p2.name} (${p2.priceUzs})! Urganch to'yxonasidek qizg'in, boshla og'a!`);
}

function updateUI() {
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

  document.getElementById("p1-box").classList.toggle("active-turn", currentTurn === 1);
  document.getElementById("p2-box").classList.toggle("active-turn", currentTurn === 2);
  document.getElementById("turn-indicator").innerText = `Navbat: ${currentTurn === 1 ? p1.name : p2.name}`;

  const currentAttacker = currentTurn === 1 ? p1 : p2;
  const btnUlta = document.getElementById("btn-ulta");
  if (btnUlta) btnUlta.disabled = currentAttacker.energy < 100;
}

function setCommentary(msg) {
  const el = document.getElementById("commentary-text");
  if (el) el.innerHTML = msg;
}

function doAction(type) {
  if (isBattleOver) return;

  const attacker = currentTurn === 1 ? p1 : p2;
  const defender = currentTurn === 1 ? p2 : p1;

  if (type === "attack") {
    const dmg = Math.max(8, attacker.attack - Math.floor(defender.defense / 3) + rand(-3, 3));
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
    setCommentary(`❄️ <b>${attacker.name}</b> sovutildi va mustahkamlandi! ${getRandom(xorazmPhrases.cool)}`);
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
    showVerdict(attacker, defender);
    return;
  }

  currentTurn = currentTurn === 1 ? 2 : 1;
  updateUI();
}

function showVerdict(winner, loser) {
  document.getElementById("verdict-winner-name").innerText = `${winner.name} G'alaba Qozondi!`;
  document.getElementById("verdict-vs-text").innerText = `${winner.name} (${winner.priceUzs}) vs ${loser.name} (${loser.priceUzs})`;

  const reasonsList = document.getElementById("verdict-reasons");
  reasonsList.innerHTML = "";
  const reasons = [];

  if (winner.attack > loser.attack) {
    reasons.push(`<b>Kuchliroq protsessor kuchi:</b> ${winner.name} ning chipseti (${winner.chipset.split('(')[0]}) raqibga qaraganda ko'proq FPS berdi.`);
  }

  if (winner.max_hp > loser.max_hp) {
    reasons.push(`<b>Quvvat zaxirasi ustunligi:</b> ${winner.name} ning akkumulyatori (${winner.battery}) yuklamaga ko'proq bardosh berdi.`);
  }

  if (winner.defense >= loser.defense) {
    reasons.push(`<b>Sovutish va barqarorlik:</b> ${winner.name} qizib ketmay, himoyasini saqlay oldi.`);
  } else {
    reasons.push(`<b>Tezkor zarbalar:</b> ${winner.name} chaqqon zarbalar va yuqori chastota hisobiga ustun keldi.`);
  }

  reasons.push(`<b>Urganch bozori bahosi:</b> ${winner.name} (${winner.priceUzs}) o'z narxini to'laqonli oqlab, maydonda mutlaq hukmron bo'ldi!`);

  reasons.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = r;
    reasonsList.appendChild(li);
  });

  document.getElementById("modal-verdict").classList.remove("hidden");
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}