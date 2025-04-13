let map;
let drivers = [];
const tiranaCoords = [41.3275, 19.8187];

function initMap() {
    if(map) return;
    
    map = L.map('map').setView(tiranaCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Initialize 5 drivers
    for(let i = 0; i < 5; i++) {
        addDriver();
    }
}

function addDriver() {
    const driver = L.marker([
        tiranaCoords[0] + (Math.random() - 0.5) * 0.02,
        tiranaCoords[1] + (Math.random() - 0.5) * 0.02
    ], {
        icon: L.divIcon({
            className: 'driver-marker',
            html: '🚗',
            iconSize: [30, 30]
        })
    }).addTo(map);

    drivers.push({
        marker: driver,
        interval: setInterval(() => moveDriver(driver), 3000)
    });
}

function moveDriver(driver) {
    const currentPos = driver.getLatLng();
    const newPos = [
        currentPos.lat + (Math.random() - 0.5) * 0.002,
        currentPos.lng + (Math.random() - 0.5) * 0.002
    ];
    driver.setLatLng(newPos);
}

function openMap() {
    document.querySelector('.map-popup').style.display = 'block';
    if(!map) {
        initMap();
    } else {
        map.invalidateSize();
    }
}

function closeMap() {
    document.querySelector('.map-popup').style.display = 'none';
}

document.addEventListener('click', function(event) {
    const popup = document.querySelector('.map-popup');
    if(event.target === popup) {
        closeMap();
    }
});