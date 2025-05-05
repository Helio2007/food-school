let map;
let drivers = [];
const tiranaCoords = [41.3275, 19.8187];
let activeDriver = null;
let estimatedTime = "15-20 min";
let updateEtaInterval;
let isScheduledDelivery = false;
let scheduledDeliveryTime = null;

// Define street routes for cars to follow (hardcoded paths)
const routes = [
    // Major route 1 - Going north to south
    [
        [41.3350, 19.8200],
        [41.3320, 19.8205],
        [41.3290, 19.8210],
        [41.3260, 19.8215],
        [41.3230, 19.8220],
        [41.3200, 19.8225]
    ],
    // Major route 2 - Going east to west
    [
        [41.3280, 19.8300],
        [41.3285, 19.8270],
        [41.3290, 19.8240],
        [41.3295, 19.8210],
        [41.3300, 19.8180],
        [41.3305, 19.8150]
    ],
    // Major route 3 - Going northwest to southeast
    [
        [41.3310, 19.8130],
        [41.3290, 19.8150],
        [41.3270, 19.8170],
        [41.3250, 19.8190],
        [41.3230, 19.8210],
        [41.3210, 19.8230]
    ],
    // Major route 4 - Going southwest to northeast
    [
        [41.3210, 19.8150],
        [41.3230, 19.8170],
        [41.3250, 19.8190],
        [41.3270, 19.8210],
        [41.3290, 19.8230],
        [41.3310, 19.8250]
    ],
    // Major route 5 - Circular route
    [
        [41.3270, 19.8150],
        [41.3290, 19.8170],
        [41.3290, 19.8210],
        [41.3270, 19.8230],
        [41.3250, 19.8210],
        [41.3250, 19.8170],
        [41.3270, 19.8150]
    ]
];

// Define popular restaurant locations
const restaurants = [
    { name: "Pizza Place", coords: [41.3280, 19.8210], icon: "🍕" },
    { name: "Burger Joint", coords: [41.3255, 19.8180], icon: "🍔" },
    { name: "Sushi Bar", coords: [41.3310, 19.8185], icon: "🍣" },
    { name: "Pasta House", coords: [41.3240, 19.8225], icon: "🍝" },
    { name: "Taco Shop", coords: [41.3290, 19.8165], icon: "🌮" }
];

function initMap() {
    if(map) return;
    
    map = L.map('map').setView(tiranaCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Check if this is a scheduled delivery
    checkScheduledDelivery();
    
    // Add restaurants to map
    addRestaurants();
    
    // Draw route paths on the map
    drawRoutePaths();
    
    // Initialize 5 drivers on the routes
    for(let i = 0; i < 5; i++) {
        addDriver(i);
    }

    // Set one driver as the active delivery driver
    setActiveDriver();
}

function drawRoutePaths() {
    // Draw the major routes on the map with subtle styling
    routes.forEach(route => {
        L.polyline(route, {
            color: '#ddd',
            weight: 3,
            opacity: 0.5,
            dashArray: '5, 8'
        }).addTo(map);
    });
}

function addRestaurants() {
    // Add restaurant markers
    restaurants.forEach(restaurant => {
        L.marker(restaurant.coords, {
            icon: L.divIcon({
                className: 'restaurant-marker',
                html: `<div>${restaurant.icon}</div>`,
                iconSize: [30, 30]
            })
        })
        .bindTooltip(restaurant.name)
        .addTo(map);
    });
}

function checkScheduledDelivery() {
    const savedSchedule = JSON.parse(localStorage.getItem("scheduledDelivery"));
    if (savedSchedule) {
        isScheduledDelivery = true;
        scheduledDeliveryTime = savedSchedule;
        updateDeliveryStatus();
    }
}

function updateDeliveryStatus() {
    const etaInfoElement = document.getElementById('eta-info');
    const etaTimeElement = document.getElementById('eta-time');
    
    if (isScheduledDelivery && scheduledDeliveryTime) {
        // Check if delivery time has passed
        const now = new Date();
        const deliveryDateTime = new Date(scheduledDeliveryTime.date + 'T' + scheduledDeliveryTime.time);
        
        if (now < deliveryDateTime) {
            // Delivery is still scheduled for the future
            etaInfoElement.innerHTML = `
                <div class="scheduled-info">
                    <div class="scheduled-label">🗓️ Scheduled Delivery:</div>
                    <div class="scheduled-time">${scheduledDeliveryTime.formatted}</div>
                    <div class="delivery-status">Your order will be prepared closer to the delivery time</div>
                </div>
            `;
            
            // Hide drivers if not delivery time yet
            toggleDriversVisibility(false);
        } else {
            // Scheduled time has arrived, show normal ETA
            etaInfoElement.innerHTML = `Estimated delivery time: <span id="eta-time">${estimatedTime}</span>`;
            toggleDriversVisibility(true);
        }
    } else {
        // Regular delivery, show normal ETA
        etaInfoElement.innerHTML = `Estimated delivery time: <span id="eta-time">${estimatedTime}</span>`;
    }
    
    // Adjust map height after updating the ETA info
    setTimeout(() => {
        const etaHeight = etaInfoElement.offsetHeight;
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.height = `calc(100% - ${etaHeight}px)`;
            if (map) map.invalidateSize();
        }
    }, 50);
}

function toggleDriversVisibility(show) {
    drivers.forEach(driver => {
        if (show) {
            driver.marker.setOpacity(1);
        } else {
            driver.marker.setOpacity(0);
        }
    });
    
    if (activeDriver) {
        if (show) {
            activeDriver.routeLine.setStyle({ opacity: 0.7 });
            activeDriver.destination.setOpacity(1);
        } else {
            activeDriver.routeLine.setStyle({ opacity: 0 });
            activeDriver.destination.setOpacity(0);
        }
    }
}

function addDriver(routeIndex) {
    // Choose a route for this driver
    const routePath = routes[routeIndex % routes.length];
    
    // Start at a random position along the route
    const startPointIndex = Math.floor(Math.random() * routePath.length);
    const startPoint = routePath[startPointIndex];
    
    // Create driver marker
    const driver = L.marker(startPoint, {
        icon: L.divIcon({
            className: 'driver-marker',
            html: '🚗',
            iconSize: [30, 30]
        })
    }).addTo(map);

    // Create path progress tracker
    const driverData = {
        marker: driver,
        routeIndex: routeIndex % routes.length,
        pathIndex: startPointIndex,
        direction: Math.random() > 0.5 ? 1 : -1, // Random direction along path
        speed: 0.02 + Math.random() * 0.03, // Random speed
        interval: null,
        isPickingUp: Math.random() > 0.7, // 30% chance the driver is picking up from a restaurant
        restaurant: null
    };
    
    // Randomly assign a restaurant for pickup
    if (driverData.isPickingUp) {
        driverData.restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    }
    
    // Set movement interval
    driverData.interval = setInterval(() => moveDriverAlongPath(driverData), 1000);
    
    drivers.push(driverData);
}

function moveDriverAlongPath(driverData) {
    const route = routes[driverData.routeIndex];
    const currentPoint = route[driverData.pathIndex];
    let nextPathIndex = driverData.pathIndex + driverData.direction;
    
    // If we reached the end of the path, reverse direction or go to a different path
    if (nextPathIndex >= route.length || nextPathIndex < 0) {
        // 20% chance to switch to a different route
        if (Math.random() > 0.8) {
            // Pick a new route
            const newRouteIndex = Math.floor(Math.random() * routes.length);
            driverData.routeIndex = newRouteIndex;
            driverData.pathIndex = driverData.direction > 0 ? 0 : routes[newRouteIndex].length - 1;
        } else {
            // Just reverse direction on current route
            driverData.direction *= -1;
            nextPathIndex = driverData.pathIndex + driverData.direction;
        }
    }
    
    // If this driver is picking up from a restaurant, make them visit it
    if (driverData.isPickingUp && driverData.restaurant) {
        const restaurantCoords = driverData.restaurant.coords;
        const distanceToRestaurant = calculateDistance(
            currentPoint[0], currentPoint[1],
            restaurantCoords[0], restaurantCoords[1]
        );
        
        // If close to the restaurant, go directly there
        if (distanceToRestaurant < 0.01) {
            const newPos = [
                currentPoint[0] + (restaurantCoords[0] - currentPoint[0]) * driverData.speed,
                currentPoint[1] + (restaurantCoords[1] - currentPoint[1]) * driverData.speed
            ];
            
            driverData.marker.setLatLng(newPos);
            
            // If very close to restaurant, consider pickup complete
            if (distanceToRestaurant < 0.001) {
                driverData.isPickingUp = false;
            }
            
            return;
        }
    }
    
    // Normal movement along route
    driverData.pathIndex = nextPathIndex;
    const nextPoint = route[nextPathIndex];
    
    // Linear interpolation for smoother movement
    const newPos = [
        currentPoint[0] + (nextPoint[0] - currentPoint[0]) * driverData.speed,
        currentPoint[1] + (nextPoint[1] - currentPoint[1]) * driverData.speed
    ];
    
    driverData.marker.setLatLng(newPos);
    
    // If we're close enough to the next point, advance to it
    const distanceToNextPoint = calculateDistance(
        newPos[0], newPos[1],
        nextPoint[0], nextPoint[1]
    );
    
    if (distanceToNextPoint < 0.0001) {
        driverData.pathIndex = nextPathIndex;
    }
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
    
    // Create a restaurant marker as the pickup point
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    
    // Create a more complex route through the restaurant to the customer
    const driverPos = activeDriver.marker.getLatLng();
    const routePoints = [
        [driverPos.lat, driverPos.lng], // Driver's current position
        randomRestaurant.coords, // Restaurant pickup
        destinationCoords // Customer's location
    ];
    
    // Draw the route line
    const routeLine = L.polyline(routePoints, {
        color: '#ff3b3b',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Update the active driver object
    activeDriver.routeLine = routeLine;
    activeDriver.destination = destination;
    activeDriver.destinationCoords = destinationCoords;
    activeDriver.restaurant = randomRestaurant;
    activeDriver.routePoints = routePoints;
    activeDriver.routeSegment = 0; // First segment: driver to restaurant
    
    // Stop the random movement interval and start the delivery route movement
    clearInterval(activeDriver.interval);
    activeDriver.interval = setInterval(() => moveActiveDriverAlongRoute(), 1000);
    
    // If this is a scheduled delivery for the future, hide the drivers
    if (isScheduledDelivery && scheduledDeliveryTime) {
        const now = new Date();
        const deliveryDateTime = new Date(scheduledDeliveryTime.date + 'T' + scheduledDeliveryTime.time);
        
        if (now < deliveryDateTime) {
            toggleDriversVisibility(false);
        }
    }
}

function moveActiveDriverAlongRoute() {
    // Get the current segment of the route
    const currentPos = activeDriver.marker.getLatLng();
    const currentSegment = activeDriver.routeSegment;
    const routePoints = activeDriver.routePoints;
    
    // Target is either the restaurant or the final destination
    const targetPoint = routePoints[currentSegment + 1];
    
    // Calculate direction and move towards target
    const moveSpeed = 0.00005 + Math.random() * 0.00002; // Add some randomness to speed
    
    // Calculate new position (move towards target)
    const newPos = [
        currentPos.lat + (targetPoint[0] - currentPos.lat) * moveSpeed * 20,
        currentPos.lng + (targetPoint[1] - currentPos.lng) * moveSpeed * 20
    ];
    
    // Update marker position
    activeDriver.marker.setLatLng(newPos);
    
    // Update route line
    const updatedRoutePoints = [
        [newPos[0], newPos[1]],
        ...routePoints.slice(currentSegment + 1)
    ];
    activeDriver.routeLine.setLatLngs(updatedRoutePoints);
    
    // Check if we've reached the target
    const distanceToTarget = calculateDistance(
        newPos[0], newPos[1],
        targetPoint[0], targetPoint[1]
    );
    
    // If reached target
    if (distanceToTarget < 0.0005) {
        // If we reached the restaurant, now head to the customer
        if (currentSegment === 0) {
            activeDriver.routeSegment = 1;
        }
    }
    
    // Update estimated time
    updateEstimatedTime(newPos, activeDriver.destinationCoords);
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
    
    // Only update the display if this isn't a scheduled future delivery
    if (!isScheduledDelivery || !scheduledDeliveryTime) {
        updateDeliveryStatus(); // Use our central function to update the display
    } else {
        // Check if scheduled time has passed
        const now = new Date();
        const deliveryDateTime = new Date(scheduledDeliveryTime.date + 'T' + scheduledDeliveryTime.time);
        
        if (now >= deliveryDateTime) {
            updateDeliveryStatus(); // Use our central function to update the display
        }
    }
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
        // Check scheduled delivery in case status has changed
        checkScheduledDelivery();
        updateDeliveryStatus();
    }
    
    // Make sure the map is properly sized based on the eta info height
    const etaInfo = document.getElementById('eta-info');
    if (etaInfo) {
        // Wait a moment for the eta-info to render completely
        setTimeout(() => {
            const etaHeight = etaInfo.offsetHeight;
            document.getElementById('map').style.height = `calc(100% - ${etaHeight}px)`;
            map.invalidateSize();
        }, 100);
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
    
    // After adding any needed HTML, check for scheduled delivery
    checkScheduledDelivery();
});

document.addEventListener('click', function(event) {
    const popup = document.querySelector('.map-popup');
    if(event.target === popup) {
        closeMap();
    }
});