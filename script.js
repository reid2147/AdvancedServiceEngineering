/* =========================================
   My Favorite Places — map & spot cards
   spots 配列を書き換えるだけでカードと地図の両方が更新される
   ========================================= */

// 各スポットは「地名(本人が挙げたもの)＋本人が撮った写真」だけで構成。
// img = カード表紙, gallery = 写真一覧(すべて本人撮影)。
const spots = [
  {
    name: "函館(北海道)",
    area: "北海道",
    coords: [41.7969, 140.7568],
    img: "images/IMG_1110.jpeg",
    gallery: [
      "images/IMG_1110.jpeg",
      "images/IMG_1099.jpeg",
      "images/IMG_0949.jpeg",
      "images/IMG_0879.jpeg",
      "images/IMG_0883.jpeg",
      "images/IMG_0920.jpeg",
      "images/IMG_1005.jpeg",
      "images/IMG_0882.jpeg",
    ],
  },
  {
    name: "美ら海水族館(沖縄)",
    area: "沖縄県",
    coords: [26.6944, 127.8779],
    img: "images/IMG_2291.jpeg",
    gallery: [
      "images/IMG_2291.jpeg",
      "images/IMG_2295.jpeg",
      "images/IMG_2330.jpeg",
      "images/IMG_2323.jpeg",
      "images/IMG_2301.jpeg",
    ],
  },
  {
    name: "京都",
    area: "京都府",
    coords: [34.9949, 135.7850],
    img: "images/IMG_0481.jpeg",
    gallery: [
      "images/IMG_0481.jpeg",
      "images/IMG_0513.jpeg",
      "images/IMG_0538.jpeg",
      "images/IMG_0533.jpeg",
      "images/IMG_0476.jpeg",
    ],
  },
  {
    name: "なんば(大阪)",
    area: "大阪府",
    coords: [34.6686, 135.5010],
    img: "images/IMG_9403.jpeg",
    gallery: [
      "images/IMG_9403.jpeg",
      "images/IMG_9245.jpeg",
      "images/IMG_9348.jpeg",
      "images/IMG_9266.jpeg",
      "images/IMG_9284.jpeg",
    ],
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
    `<h6 class="fw-bold mb-1">${spot.name}</h6>
     <div class="mb-2"><span class="badge text-bg-secondary">${spot.area}</span></div>
     <button class="btn btn-primary btn-sm rounded-pill js-popup-gallery" data-index="${i}">
       <i class="bi bi-images"></i> 写真を見る
     </button>`
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
        <div class="mb-3">
          <span class="badge text-bg-secondary">${spot.area}</span>
        </div>
        <div class="d-flex gap-2 mt-auto">
          <button class="btn btn-danger btn-sm rounded-pill flex-fill js-map-btn" data-index="${i}">
            <i class="bi bi-geo-alt"></i> 地図で見る
          </button>
          ${
            spot.gallery
              ? `<button class="btn btn-outline-primary btn-sm rounded-pill flex-fill js-gallery-btn" data-index="${i}">
                   <i class="bi bi-images"></i> 写真 ${spot.gallery.length}枚
                 </button>`
              : ""
          }
        </div>
      </div>
    </div>`;
  cardsRow.appendChild(col);
});

// 全スポットが収まる位置から開始
const bounds = L.latLngBounds(spots.map((s) => s.coords));
map.fitBounds(bounds, { padding: [40, 40] });

// カードのボタン → 地図へフライ / ギャラリーを開く
cardsRow.addEventListener("click", (e) => {
  const mapBtn = e.target.closest(".js-map-btn");
  if (mapBtn) {
    const i = Number(mapBtn.dataset.index);
    document.getElementById("map-section").scrollIntoView({ behavior: "smooth" });
    map.flyTo(spots[i].coords, 14, { duration: 1.6 });
    markers[i].openPopup();
    return;
  }
  const galBtn = e.target.closest(".js-gallery-btn");
  if (galBtn) {
    openGallery(spots[Number(galBtn.dataset.index)]);
  }
});

// 地図のポップアップ内「写真を見る」→ ギャラリーを開く
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".js-popup-gallery");
  if (btn) openGallery(spots[Number(btn.dataset.index)]);
});

/* ---------- photo gallery modal ---------- */

const galleryModal = new bootstrap.Modal(document.getElementById("galleryModal"));

function openGallery(spot) {
  if (!spot.gallery) return;
  document.getElementById("galleryModalTitle").innerHTML =
    `<i class="bi bi-images"></i> ${spot.name} の写真`;

  const inner = document.getElementById("galleryInner");
  const indicators = document.getElementById("galleryIndicators");
  inner.innerHTML = "";
  indicators.innerHTML = "";

  spot.gallery.forEach((src, idx) => {
    inner.insertAdjacentHTML(
      "beforeend",
      `<div class="carousel-item ${idx === 0 ? "active" : ""}">
         <img src="${src}" class="d-block w-100 gallery-img" alt="${spot.name}の写真${idx + 1}">
       </div>`
    );
    indicators.insertAdjacentHTML(
      "beforeend",
      `<button type="button" data-bs-target="#galleryCarousel" data-bs-slide-to="${idx}"
         ${idx === 0 ? 'class="active" aria-current="true"' : ""} aria-label="写真${idx + 1}"></button>`
    );
  });

  galleryModal.show();
}

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
