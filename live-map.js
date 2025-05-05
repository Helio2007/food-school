let map;
let drivers = [];
const tiranaCoords = [41.3275, 19.8187];
let activeDriver = null;
let estimatedTime = "15-20 min";
let updateEtaInterval;

function initMap() {
    if(map) return;
    
    map = L.map('map').setView(tiranaCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Initialize 5 drivers
    for(let i = 0; i < 5; i++) {
        addDriver();
    }

    // Set one driver as the active delivery driver
    setActiveDriver();
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

function setActiveDriver() {
    // Randomly select one driver to be the active delivery driver
    const randomIndex = Math.floor(Math.random() * drivers.length);
    activeDriver = drivers[randomIndex];
    
    // Change the active driver's icon
    activeDriver.marker.setIcon(L.divIcon({
        className: 'driver-marker active',
        html: '🚚',
        iconSize: [30, 30]
    }));
    
    // Add a destination marker for the customer
    const destinationCoords = [
        tiranaCoords[0] + (Math.random() - 0.5) * 0.01,
        tiranaCoords[1] + (Math.random() - 0.5) * 0.01
    ];
    
    const destination = L.marker(destinationCoords, {
        icon: L.divIcon({
            className: 'destination-marker',
            html: '📍',
            iconSize: [30, 30]
        })
    }).addTo(map);
    
    // Draw a route line between driver and destination
    const driverPos = activeDriver.marker.getLatLng();
    const routePoints = [
        [driverPos.lat, driverPos.lng],
        destinationCoords
    ];
    
    const routeLine = L.polyline(routePoints, {
        color: '#ff3b3b',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Update route when driver moves
    activeDriver.routeLine = routeLine;
    activeDriver.destination = destination;
    activeDriver.destinationCoords = destinationCoords;
}

function moveDriver(driver) {
    const currentPos = driver.getLatLng();
    let newPos;
    
    // If this is the active driver, move towards the destination
    if (activeDriver && activeDriver.marker === driver) {
        const destCoords = activeDriver.destinationCoords;
        
        // Calculate direction towards destination
        const moveTowardsDestination = Math.random() > 0.3; // 70% chance to move towards destination
        
        if (moveTowardsDestination) {
            // Move towards destination with some randomness
            newPos = [
                currentPos.lat + (destCoords[0] - currentPos.lat) * 0.1 + (Math.random() - 0.5) * 0.001,
                currentPos.lng + (destCoords[1] - currentPos.lng) * 0.1 + (Math.random() - 0.5) * 0.001
            ];
        } else {
            // Random movement
            newPos = [
                currentPos.lat + (Math.random() - 0.5) * 0.002,
                currentPos.lng + (Math.random() - 0.5) * 0.002
            ];
        }
        
        // Update route line
        activeDriver.routeLine.setLatLngs([
            [newPos[0], newPos[1]],
            activeDriver.destinationCoords
        ]);
        
        // Update estimated time
        updateEstimatedTime(newPos, activeDriver.destinationCoords);
    } else {
        // Random movement for non-active drivers
        newPos = [
            currentPos.lat + (Math.random() - 0.5) * 0.002,
            currentPos.lng + (Math.random() - 0.5) * 0.002
        ];
    }
    
    driver.setLatLng(newPos);
}

function updateEstimatedTime(driverPos, destCoords) {
    // Calculate distance between driver and destination
    const distance = calculateDistance(
        driverPos[0], driverPos[1],
        destCoords[0], destCoords[1]
    );
    
    // Assume average speed of 30 km/h in city
    // Distance is in km, time will be in minutes
    const timeInMinutes = Math.round(distance / 30 * 60);
    
    // Add some randomness (±2 minutes)
    const minTime = Math.max(1, timeInMinutes - 2);
    const maxTime = timeInMinutes + 2;
    
    // Update the estimated time display
    estimatedTime = `${minTime}-${maxTime} min`;
    document.getElementById('eta-time').textContent = estimatedTime;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
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

// Make the map popup and button persist across pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's already a map popup element
    if (!document.querySelector('.map-popup')) {
        // Add the map popup HTML to the page if it doesn't exist
        const mapPopup = document.createElement('div');
        mapPopup.className = 'map-popup';
        mapPopup.innerHTML = `
            <button class="close-btn" onclick="closeMap()">×</button>
            <div id="map"></div>
            <div id="eta-info">Estimated delivery time: <span id="eta-time">${estimatedTime}</span></div>
        `;
        document.body.appendChild(mapPopup);
        
        // Add the button to open the map
        const openMapBtn = document.createElement('button');
        openMapBtn.className = 'open-map-btn';
        openMapBtn.innerHTML = 'Live Map 🚗';
        openMapBtn.onclick = openMap;
        document.body.appendChild(openMapBtn);
    }
});

document.addEventListener('click', function(event) {
    const popup = document.querySelector('.map-popup');
    if(event.target === popup) {
        closeMap();
    }
});