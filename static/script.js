const state = {
  phones: [],
  selectedIds: ["s25u", "ip16pm"],
  activeBrand: "ALL",
  searchQuery: ""
};

const elements = {
  searchInput: document.getElementById("search-input"),
  catalogGrid: document.getElementById("catalog-grid"),
  catalogCount: document.getElementById("catalog-count"),
  ringCount: document.getElementById("ring-count"),
  ringCards: document.getElementById("ring-cards"),
  btnFight: document.getElementById("btn-fight"),
  fightResult: document.getElementById("fight-result"),
  brandButtons: document.querySelectorAll(".brand-btn")
};

async function fetchPhones() {
  try {
    const res = await fetch("/api/phones");
    if (!res.ok) throw new Error("Serverdan javob kelmadi");
    const data = await res.json();
    state.phones = data.phones;
    render();
  } catch (err) {
    elements.catalogCount.innerText = "Ma’lumotlarni yuklashda xatolik yuz berdi!";
  }
}

function render() {
  renderCatalog();
  renderRing();
}

function renderCatalog() {
  const filtered = state.phones.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                        p.brand.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchBrand = state.activeBrand === "ALL" || 
                       p.brand.toLowerCase() === state.activeBrand.toLowerCase();
    return matchSearch && matchBrand;
  });

  elements.catalogCount.innerText = `Bozorda ${filtered.length} ta model ko‘rsatilmoqda`;

  elements.catalogGrid.innerHTML = filtered.map(phone => {
    const isSelected = state.selectedIds.includes(phone.id);
    return `
      <div 
        onclick="togglePhoneSelection('${phone.id}')"
        class="panel rounded-xl p-3 cursor-pointer transition flex flex-col justify-between hover:border-cyan-500/50 ${isSelected ? 'active-card' : ''}"
      >
        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400">${phone.brand}</span>
            <span class="text-[10px] text-slate-500 font-mono">${phone.amazon_price}</span>
          </div>
          <h4 class="font-bold text-xs text-slate-100 line-clamp-1 leading-snug">${phone.name}</h4>
        </div>

        <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
          <span class="text-[11px] font-mono font-bold text-emerald-400">${phone.uzum_price}</span>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${isSelected ? 'bg-amber-400 text-slate-950 shadow' : 'bg-slate-800 text-slate-300'}">
            ${isSelected ? '✓ Saylangan' : '+ Sol'}
          </span>
        </div>
      </div>
    `;
  }).join("");

  elements.ringCount.innerText = `Ringda: ${state.selectedIds.length} ta telefon`;
}

function renderRing() {
  const selectedPhones = state.phones.filter(p => state.selectedIds.includes(p.id));

  elements.ringCards.innerHTML = selectedPhones.map((phone, idx) => `
    <div class="panel rounded-2xl p-4 relative flex flex-col justify-between border-slate-800 shadow-xl">
      <button 
        onclick="togglePhoneSelection('${phone.id}')"
        class="absolute top-3 right-3 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-2 py-0.5 rounded-full border border-rose-500/20 transition"
      >
        ✕ Chiqar
      </button>

      <div>
        <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block mb-1.5">
          #${idx + 1} Burchak: ${phone.brand}
        </span>

        <h3 class="text-sm font-black text-slate-100 mb-2">${phone.name}</h3>

        <!-- Narxlar -->
        <div class="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 mb-3 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-slate-400">🛒 Uzum Market:</span>
            <span class="font-bold text-emerald-400 font-mono text-xs">${phone.uzum_price}</span>
          </div>
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-slate-500">📦 Amazon / Xalqaro:</span>
            <span class="text-slate-300 font-mono">${phone.amazon_price}</span>
          </div>
        </div>

        <!-- Parametrlar -->
        <div class="text-[11px] space-y-1 text-slate-300 mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <div><span class="text-slate-500">🖥️ Ekran:</span> ${phone.screen}</div>
          <div><span class="text-slate-500">⚡ Chip:</span> ${phone.cpu}</div>
          <div><span class="text-slate-500">📸 Kamera:</span> ${phone.camera}</div>
          <div><span class="text-slate-500">🔋 Batareya:</span> ${phone.battery}</div>
          <div><span class="text-slate-500">⚖️ Og‘irligi:</span> ${phone.weight}</div>
        </div>

        <!-- Ballar va NIMA UCHUN berilgani -->
        <div class="mb-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-[10px]">
          <span class="font-bold text-amber-400 uppercase tracking-wider block">📊 Nega bu ball berildi? (Asoslar):</span>
          <div class="text-slate-300">⚡ <strong class="text-cyan-300">Chip (${phone.scores.cpu}/100):</strong> ${phone.score_reasons.cpu}</div>
          <div class="text-slate-300">📸 <strong class="text-amber-300">Kamera (${phone.scores.camera}/100):</strong> ${phone.score_reasons.camera}</div>
          <div class="text-slate-300">🔋 <strong class="text-emerald-300">Batareya (${phone.scores.battery}/100):</strong> ${phone.score_reasons.battery}</div>
          <div class="text-slate-300">🖥️ <strong class="text-purple-300">Ekran (${phone.scores.screen}/100):</strong> ${phone.score_reasons.screen}</div>
        </div>

        <!-- Plyus va Minus -->
        <div class="space-y-1.5 text-[11px]">
          <div>
            <span class="font-bold text-emerald-400">✅ Zo‘r tarafi:</span>
            <span class="text-slate-300">${phone.pros.join(', ')}.</span>
          </div>
          <div>
            <span class="font-bold text-rose-400">⚠️ Chala tarafi:</span>
            <span class="text-slate-400">${phone.cons.join(', ')}.</span>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

window.togglePhoneSelection = function(id) {
  if (state.selectedIds.includes(id)) {
    if (state.selectedIds.length <= 1) {
      alert("Kamida bitta telefon ringda tursin, jo‘ra!");
      return;
    }
    state.selectedIds = state.selectedIds.filter(item => item !== id);
  } else {
    state.selectedIds.push(id);
  }
  render();
};

elements.searchInput.addEventListener("input", (e) => {
  state.searchQuery = e.target.value.trim();
  renderCatalog();
});

elements.brandButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    state.activeBrand = btn.dataset.brand;
    elements.brandButtons.forEach(b => {
      b.classList.remove("bg-amber-400", "text-slate-950", "font-black", "shadow");
      b.classList.add("bg-slate-800", "text-slate-300", "font-semibold");
    });
    btn.classList.remove("bg-slate-800", "text-slate-300", "font-semibold");
    btn.classList.add("bg-amber-400", "text-slate-950", "font-black", "shadow");
    renderCatalog();
  });
});

elements.btnFight.addEventListener("click", async () => {
  if (state.selectedIds.length < 2) {
    alert("Urush boshlash uchun kamida 2 ta telefon saylang, jo‘ra!");
    return;
  }

  try {
    const res = await fetch("/api/fight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_ids: state.selectedIds })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Jang xatoligi");

    elements.fightResult.classList.remove("hidden");
    elements.fightResult.scrollIntoView({ behavior: "smooth" });

    elements.fightResult.innerHTML = `
      <div class="text-center max-w-xl mx-auto">
        <span class="text-4xl inline-block mb-1 animate-bounce">🏆</span>
        <h4 class="text-xs font-black uppercase tracking-widest text-amber-400">XORAZM RINGI CHEMPIONI</h4>
        <h3 class="text-xl sm:text-2xl font-black text-slate-100 uppercase mt-0.5 mb-2">
          ${data.winner.name} YUTDI!
        </h3>
        <p class="text-slate-300 text-xs leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30">
          ${data.xorazmcha_xulosa}
        </p>
      </div>

      <div class="border-t border-slate-800 pt-3">
        <h5 class="text-center text-[11px] font-bold text-slate-400 mb-2 uppercase">Umumiy ballar jamg‘armasi:</h5>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          ${data.standings.map((st, i) => `
            <div class="p-2.5 rounded-xl border ${i === 0 ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 bg-slate-950'} flex justify-between items-center">
              <span class="text-xs font-bold ${i === 0 ? 'text-amber-400' : 'text-slate-300'}">
                #${i + 1} ${st.phone.name}
              </span>
              <span class="text-xs font-mono font-bold text-cyan-400">${st.total_score} ball</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  } catch (err) {
    alert(err.message);
  }
});

fetchPhones();