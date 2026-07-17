/* =========================================
   My Favorite Places — map & spot cards
   spots 配列を書き換えるだけでカードと地図の両方が更新される
   ========================================= */

const spots = [
  {
    name: "兼六園(金沢)",
    area: "石川県",
    coords: [36.5613, 136.6626],
    desc: "日本三名園のひとつ。雪吊りの季節が特に好きで、何度でも行きたくなる場所。",
    tags: ["庭園", "冬が最高"],
    img: "https://picsum.photos/seed/kenrokuen/640/400",
  },
  {
    name: "嵐山(京都)",
    area: "京都府",
    coords: [35.0094, 135.6668],
    desc: "竹林の小径を朝早く歩くのがおすすめ。渡月橋から見る夕暮れも忘れられない。",
    tags: ["竹林", "朝活"],
    img: "https://picsum.photos/seed/arashiyama/640/400",
  },
  {
    name: "江の島(神奈川)",
    area: "神奈川県",
    coords: [35.2996, 139.4804],
    desc: "初めて一人旅をした思い出の場所。しらす丼と夕日のセットが最強。",
    tags: ["海", "しらす丼"],
    img: "https://picsum.photos/seed/enoshima/640/400",
  },
  {
    name: "札幌(北海道)",
    area: "北海道",
    coords: [43.0618, 141.3545],
    desc: "冬の雪まつりに一度行って以来のファン。味噌ラーメンの食べ比べが恒例。",
    tags: ["雪まつり", "ラーメン"],
    img: "https://picsum.photos/seed/sapporo/640/400",
  },
];

/* ---------- Leaflet map ---------- */

const map = L.map("map", { scrollWheelZoom: false });

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const gsiPale = L.tileLayer(
  "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
  {
    maxZoom: 18,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
  }
);

const gsiPhoto = L.tileLayer(
  "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
  {
    maxZoom: 18,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
  }
);

osm.addTo(map);
L.control.layers(
  { OpenStreetMap: osm, "国土地理院(淡色)": gsiPale, "航空写真": gsiPhoto },
  null,
  { position: "topright", collapsed: true }
).addTo(map);
L.control.scale({ imperial: false }).addTo(map);

/* ---------- markers & cards ---------- */

const markers = [];
const cardsRow = document.getElementById("spotCards");

spots.forEach((spot, i) => {
  // marker + popup
  const marker = L.marker(spot.coords).addTo(map).bindPopup(
    `<h6 class="fw-bold">${spot.name}</h6>
     <span class="badge text-bg-secondary mb-1">${spot.area}</span>
     <p class="mb-0 small">${spot.desc}</p>`
  );
  markers.push(marker);

  // Bootstrap card
  const col = document.createElement("div");
  col.className = "col-sm-6 col-lg-3";
  col.innerHTML = `
    <div class="card spot-card h-100 shadow-sm rounded-4">
      <img src="${spot.img}" class="card-img-top" alt="${spot.name}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${spot.name}</h5>
        <div class="mb-2">
          <span class="badge text-bg-secondary">${spot.area}</span>
          ${spot.tags.map((t) => `<span class="badge text-bg-info">${t}</span>`).join(" ")}
        </div>
        <p class="card-text text-secondary small flex-grow-1">${spot.desc}</p>
        <button class="btn btn-danger btn-sm rounded-pill mt-auto" data-index="${i}">
          <i class="bi bi-geo-alt"></i> 地図で見る
        </button>
      </div>
    </div>`;
  cardsRow.appendChild(col);
});

// 全スポットが収まる位置から開始
const bounds = L.latLngBounds(spots.map((s) => s.coords));
map.fitBounds(bounds, { padding: [40, 40] });

// カードのボタン → 地図へフライ
cardsRow.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-index]");
  if (!btn) return;
  const i = Number(btn.dataset.index);
  document.getElementById("map-section").scrollIntoView({ behavior: "smooth" });
  map.flyTo(spots[i].coords, 14, { duration: 1.6 });
  markers[i].openPopup();
});

/* ---------- toolbar buttons ---------- */

document.getElementById("btnFitAll").addEventListener("click", () => {
  map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
});

document.getElementById("btnLocate").addEventListener("click", () => {
  map.locate({ setView: true, maxZoom: 14 });
});

map.on("locationfound", (e) => {
  L.circleMarker(e.latlng, { radius: 8, color: "#e63946" })
    .addTo(map)
    .bindPopup("いまここ!")
    .openPopup();
});

map.on("locationerror", () => {
  alert("現在地を取得できませんでした(位置情報の許可が必要です)");
});
