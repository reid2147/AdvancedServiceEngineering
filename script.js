/* =========================================
   My Favorite Places — map & spot cards
   spots 配列を書き換えるだけでカードと地図の両方が更新される
   ========================================= */

// img には images/ 内のファイル名を書く。まだ画像が無い場合は
// 自動でプレースホルダ(picsum)が表示されるので、あとで写真を置くだけでOK。
const spots = [
  {
    name: "函館(北海道)",
    area: "北海道",
    coords: [41.7594, 140.7040], // 函館山
    desc: "函館山からの夜景は一度見たら忘れられない。朝市の海鮮丼も最高だった。",
    tags: ["夜景", "海鮮丼"],
    img: "images/hakodate.jpg",
    placeholder: "https://picsum.photos/seed/hakodate/640/400",
  },
  {
    name: "美ら海水族館(沖縄)",
    area: "沖縄県",
    coords: [26.6944, 127.8779],
    desc: "巨大な水槽を泳ぐジンベエザメは大迫力。周りの海の青さも別格だった。",
    tags: ["水族館", "ジンベエザメ"],
    img: "images/churaumi.jpg",
    placeholder: "https://picsum.photos/seed/churaumi/640/400",
  },
  {
    name: "京都",
    area: "京都府",
    coords: [35.0116, 135.7681],
    desc: "寺社の多さと街の落ち着いた雰囲気が好き。歩いているだけで楽しい街。",
    tags: ["寺社", "食べ歩き"],
    img: "images/kyoto.jpg",
    placeholder: "https://picsum.photos/seed/kyoto/640/400",
  },
  {
    name: "なんば(大阪)",
    area: "大阪府",
    coords: [34.6659, 135.5019],
    desc: "とにかく活気があって食べ物が美味しい。たこ焼きと串カツは外せない。",
    tags: ["グルメ", "たこ焼き"],
    img: "images/namba.jpg",
    placeholder: "https://picsum.photos/seed/namba/640/400",
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
      <img src="${spot.img}" class="card-img-top" alt="${spot.name}"
           onerror="this.onerror=null;this.src='${spot.placeholder}';">
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
