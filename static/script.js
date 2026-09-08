let allPhones = [];
let filteredPhones = [];
let player = null;
let enemy = null;
let isBattleOver = false;

let selectedBrand = "all";
let searchQuery = "";

// Xorazmcha iboralar
const xorazmPhrases = {
  attack: [
    "Apparat bilan to'g'ri manglayidan urding!",
    "Bunday zarb bilan quvvatini sug'urib olding!",
    "Gullatding og'a! Ekraniga yoriq tushgandek bo'ldi!"
  ],
  enemyAttack: [
    "Voy dodingni bersin! Raqibing qattiq keldi!",
    "Apparating qizib ketti, batareyang shuvillab ketmoqda!",
    "Ehtiyot bo'l og'a, dushman shafqatsiz kelmoqda!"
  ],
  critSuccess: [
    "DAHXAT! 120 FPS Benchmark kuchi bilan portlatding!",
    "Barcha yadrolari baravar urib, raqibni qotirib qo'ydi!"
  ],
  critFail: [
    "Attang! Protsessor qizib trottling bo'ldi, zarbing o'tmadi!",
    "Ekran qotib qoldi, zarba havoga ketdi og'a!"
  ],
  charge: [
    "Paynetdan hisobingga pul tushdi! Zaryad to'ldi!",
    "Original zaryadchik ulanding, apparating yashnab ketti!"
  ],
  ultaSuccess: [
    "TARAS-QARS! Butun kuchlanishni bitta zarbga jamlading, raqib tutab ketti!",
    "Super-zarba! Urganch shamoliday uchirib yubordi!"
  ],
  win: "G'ALABA! Raqibning batareyi nol bo'ldi, maydon seniki bo'ldi og'a! 🏆",
  lose: "MAG'LUBIYAT! Apparating o'chdi, ustaga olib borish kerak endi... 💀"
};

// 1. Dasturni ishga tushirish
async function init() {
  try {
    const res = await fetch("/phones.json");
    allPhones = await res.json();
    filteredPhones = [...allPhones];
    updateCounter();
    renderList();
    bindEvents();
  } catch (err) {
    document.getElementById("phone-grid").innerHTML = "<p>Telefonlar bazasi yuklanmadi.</p>";
  }
}

function updateCounter() {
  document.getElementById("phones-counter").innerText = `${filteredPhones.length} ta apparat`;
}

// 2. Qidiruv va brend filtrlari
function bindEvents() {
  const searchInput = document.getElementById("search-box");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilter();
  });

  const chips = document.querySelectorAll(".chip-btn");
  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      selectedBrand = btn.dataset.brand;
      applyFilter();
    });
  });

  // Modal oynani yopish
  document.getElementById("modal-close").onclick = () => {
    document.getElementById("modal-details").classList.add("hidden");
  };
  document.getElementById("modal-details").onclick = (e) => {
    if (e.target.id === "modal-details") {
      document.getElementById("modal-details").classList.add("hidden");
    }
  };

  // Tafsilot tugmasi
  document.getElementById("btn-show-details").onclick = () => {
    if (player) openDetailsModal(player);
  };
}

function applyFilter() {
  filteredPhones = allPhones.filter(p => {
    const matchesBrand = selectedBrand === "all" || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                          p.chipset.toLowerCase().includes(searchQuery);
    return matchesBrand && matchesSearch;
  });
  updateCounter();
  renderList();
}

// 3. Ixcham ro'yxatni chiqarish
function renderList() {
  const container = document.getElementById("phone-grid");
  container.innerHTML = "";

  if (filteredPhones.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 1.5rem;">Hech qanday apparat topilmadi.</div>`;
    return;
  }

  filteredPhones.forEach(p => {
    const item = document.createElement("div");
    item.className = "phone-item";
    if (player && player.id === p.id) item.classList.add("selected");

    item.onclick = () => selectPhone(p);

    item.innerHTML = `
      <div class="phone-item-head">
        <span class="brand">${p.brand}</span>
        <span class="price">${p.price}</span>
      </div>
      <div class="phone-item-name" title="${p.name}">${p.name}</div>
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

// 4. Foydalanuvchi o'zi tanlaydi
function selectPhone(p) {
  player = JSON.parse(JSON.stringify(p));
  player.energy = 0; // Ulta energiyasi

  document.querySelectorAll(".phone-item").forEach(el => el.classList.remove("selected"));
  renderList();

  document.getElementById("selected-summary").innerHTML = `
    Saylandi: <b style="color: var(--primary)">${player.name}</b> 
    | HP: <b>${player.hp}</b> | Zarb: <b>${player.attack}</b>
  `;
  document.getElementById("btn-fight-start").disabled = false;
  document.getElementById("btn-show-details").classList.remove("hidden");
}

// Tafsilotlar modalini ko'rsatish
function openDetailsModal(phone) {
  document.getElementById("modal-title").innerText = phone.name;
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <div class="detail-row"><span>Brend:</span><b>${phone.brand}</b></div>
    <div class="detail-row"><span>Narxi:</span><b>${phone.price}</b></div>
    <div class="detail-row"><span>Protsessor:</span><b>${phone.chipset}</b></div>
    <div class="detail-row"><span>Xotira & RAM:</span><b>${phone.ram} | ${phone.storage}</b></div>
    <div class="detail-row"><span>Batareya & Zaryad:</span><b>${phone.battery} (${phone.charging})</b></div>
    <div class="detail-row"><span>Kamera:</span><b>${phone.camera}</b></div>
    <div class="detail-row"><span>Displey:</span><b>${phone.screen}</b></div>
    <div class="detail-row"><span>Vazni & O'lchami:</span><b>${phone.weight || '-'} | ${phone.dimensions || '-'}</b></div>
    <p style="font-size: 0.8rem; color: #cbd5e1; font-style: italic; margin-top: 0.8rem; line-height: 1.3;">
      "${phone.vibe}"
    </p>
  `;
  document.getElementById("modal-details").classList.remove("hidden");
}

// 5. Jangni boshlash
document.getElementById("btn-fight-start").onclick = () => {
  if (!player) return;

  const remaining = allPhones.filter(p => p.id !== player.id);
  const randomEnemy = remaining[Math.floor(Math.random() * remaining.length)] || allPhones[0];
  enemy = JSON.parse(JSON.stringify(randomEnemy));
  enemy.energy = 0;

  isBattleOver = false;
  document.getElementById("selection-phase").classList.add("hidden");
  document.getElementById("battle-phase").classList.remove("hidden");

  setupBattleUI();
};

document.getElementById("btn-change-phone").onclick = () => {
  document.getElementById("battle-phase").classList.add("hidden");
  document.getElementById("selection-phase").classList.remove("hidden");
};

// 6. Arena sozlamalari
function setupBattleUI() {
  document.getElementById("player-name").innerText = player.name;
  document.getElementById("player-chip").innerText = player.chipset;
  document.getElementById("player-attack").innerText = player.attack;
  document.getElementById("player-defense").innerText = player.defense;
  document.getElementById("player-speed").innerText = player.speed || 30;

  document.getElementById("enemy-name").innerText = enemy.name;
  document.getElementById("enemy-chip").innerText = enemy.chipset;
  document.getElementById("enemy-attack").innerText = enemy.attack;
  document.getElementById("enemy-defense").innerText = enemy.defense;
  document.getElementById("enemy-speed").innerText = enemy.speed || 30;

  updateStatsBars();
  setCommentary(`Maydonga ${player.name} va ${enemy.name} tushdi! Birinchi zarbani ur, og'a!`);
}

function updateStatsBars() {
  // HP
  const pPercent = Math.max(0, (player.hp / player.max_hp) * 100);
  const ePercent = Math.max(0, (enemy.hp / enemy.max_hp) * 100);
  document.getElementById("player-hp-bar").style.width = pPercent + "%";
  document.getElementById("player-hp-text").innerText = `${Math.max(0, player.hp)}/${player.max_hp}`;
  document.getElementById("enemy-hp-bar").style.width = ePercent + "%";
  document.getElementById("enemy-hp-text").innerText = `${Math.max(0, enemy.hp)}/${enemy.max_hp}`;

  // Energiya (Ulta)
  document.getElementById("player-energy-bar").style.width = player.energy + "%";
  document.getElementById("player-energy-text").innerText = player.energy + "%";
  document.getElementById("enemy-energy-bar").style.width = enemy.energy + "%";
  document.getElementById("enemy-energy-text").innerText = enemy.energy + "%";

  document.getElementById("btn-ulta").disabled = player.energy < 100;
}

function setCommentary(msg) {
  document.getElementById("commentary-text").innerHTML = msg;
}

function triggerShake(targetId) {
  const el = document.getElementById(targetId);
  el.classList.add("hit-anim");
  setTimeout(() => el.classList.remove("hit-anim"), 350);
}

// 7. Jang zarbalari
document.getElementById("btn-attack").onclick = () => {
  if (isBattleOver) return;

  const dmg = Math.max(8, player.attack - Math.floor(enemy.defense / 3) + Math.floor(Math.random() * 8) - 4);
  enemy.hp -= dmg;
  player.energy = Math.min(100, player.energy + 25);
  
  triggerShake("enemy-box");
  setCommentary(`💥 <b>${player.name}</b> zarba urdi (-${dmg} HP)! ${getRandom(xorazmPhrases.attack)}`);
  updateStatsBars();

  if (checkWinner()) return;
  setTimeout(enemyTurn, 750);
};

document.getElementById("btn-crit").onclick = () => {
  if (isBattleOver) return;

  if (Math.random() > 0.4) {
    const dmg = Math.floor(player.attack * 1.65) + Math.floor(Math.random() * 6);
    enemy.hp -= dmg;
    player.energy = Math.min(100, player.energy + 35);
    triggerShake("enemy-box");
    setCommentary(`⚡ <b>${player.name}</b> BENCHMARK zarba berdi (-${dmg} HP)! ${getRandom(xorazmPhrases.critSuccess)}`);
  } else {
    setCommentary(`⚠️ ${getRandom(xorazmPhrases.critFail)}`);
  }
  updateStatsBars();

  if (checkWinner()) return;
  setTimeout(enemyTurn, 750);
};

document.getElementById("btn-charge").onclick = () => {
  if (isBattleOver) return;

  const heal = Math.floor(player.max_hp * 0.28);
  player.hp = Math.min(player.max_hp, player.hp + heal);
  player.energy = Math.min(100, player.energy + 15);
  setCommentary(`🔌 <b>${player.name}</b> quvvatlandi (+${heal} HP)! ${getRandom(xorazmPhrases.charge)}`);
  updateStatsBars();

  setTimeout(enemyTurn, 750);
};

// ULTA ZARBA
document.getElementById("btn-ulta").onclick = () => {
  if (isBattleOver || player.energy < 100) return;

  const dmg = Math.floor(player.attack * 2.4);
  enemy.hp -= dmg;
  player.energy = 0;
  triggerShake("enemy-box");
  setCommentary(`🔥 <b>${player.name}</b> ULTA ISHLATDI (-${dmg} HP)! ${getRandom(xorazmPhrases.ultaSuccess)}`);
  updateStatsBars();

  if (checkWinner()) return;
  setTimeout(enemyTurn, 750);
};

// Raqib navbati
function enemyTurn() {
  if (isBattleOver) return;

  // Agar raqibda ulta to'lsa, ulta ishlatadi
  if (enemy.energy >= 100) {
    const dmg = Math.floor(enemy.attack * 2.2);
    player.hp -= dmg;
    enemy.energy = 0;
    triggerShake("player-box");
    setCommentary(`🚨 DAHSHAT! <b>${enemy.name}</b> SUPER-ULTA bilan urdi (-${dmg} HP)!`);
  } else {
    const dmg = Math.max(6, enemy.attack - Math.floor(player.defense / 3) + Math.floor(Math.random() * 6) - 3);
    player.hp -= dmg;
    enemy.energy = Math.min(100, enemy.energy + 30);
    triggerShake("player-box");
    setCommentary(`🚨 <b>${enemy.name}</b> senga zarba urdi (-${dmg} HP)! ${getRandom(xorazmPhrases.enemyAttack)}`);
  }

  updateStatsBars();
  checkWinner();
}

function checkWinner() {
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    updateStatsBars();
    isBattleOver = true;
    setCommentary(`🏆 <b>${xorazmPhrases.win}</b>`);
    return true;
  }
  if (player.hp <= 0) {
    player.hp = 0;
    updateStatsBars();
    isBattleOver = true;
    setCommentary(`💀 <b>${xorazmPhrases.lose}</b>`);
    return true;
  }
  return false;
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

init();