// Driver-related state
let isDriver = false;
let activeOrder = null;
let driverStatus = 'offline';

// Function to generate a random referral code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'AFF';
    for(let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Function to update driver status UI
function updateDriverStatusUI(status) {
    const statusText = document.querySelector('.status-text');
    const statusIcon = document.querySelector('.status-icon');
    const toggleButton = document.getElementById('toggle-status');
    const onlineStatus = document.getElementById('online-status');

    if (status === 'online') {
        statusText.textContent = 'Go Offline';
        toggleButton.style.backgroundColor = '#d32f2f';
        onlineStatus.textContent = 'Online';
    } else {
        statusText.textContent = 'Go Online';
        toggleButton.style.backgroundColor = '#28a745';
        onlineStatus.textContent = 'Offline';
    }
}

// Function to toggle driver status
async function toggleDriverStatus() {
    try {
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        if (authError) throw authError;

        const newStatus = driverStatus === 'online' ? 'offline' : 'online';
        
        const { error } = await window.supabaseClient
            .from('drivers')
            .update({ current_status: newStatus })
            .eq('id', user.id);

        if (error) throw error;

        driverStatus = newStatus;
        updateDriverStatusUI(newStatus);

        // If going offline and there's an active order, show warning
        if (newStatus === 'offline' && activeOrder) {
            alert('Please complete your active delivery before going offline.');
            return;
        }

        // Only show available orders if online
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            if (newStatus === 'online') {
                loadAvailableOrders();
            } else {
                ordersList.innerHTML = '<p>Go online to see available orders</p>';
            }
        }
    } catch (error) {
        console.error('Error toggling status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Function to stop being a driver
async function stopBeingDriver() {
    if (activeOrder) {
        alert('Please complete your active delivery before stopping driver mode.');
        return;
    }

    if (!confirm('Are you sure you want to stop being a driver? You can always reactivate later.')) {
        return;
    }

    try {
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        if (authError) throw authError;

        const { error } = await window.supabaseClient
            .from('drivers')
            .update({ 
                is_active: false,
                current_status: 'offline'
            })
            .eq('id', user.id);

        if (error) throw error;

        isDriver = false;
        driverStatus = 'offline';
        document.getElementById('driver-content').style.display = 'none';
        document.getElementById('activate-driver').style.display = 'block';
        alert('You have successfully stopped being a driver. You can reactivate anytime!');
    } catch (error) {
        console.error('Error stopping driver mode:', error);
        alert('Error updating driver status. Please try again.');
    }
}

// Function to check if user is a driver
async function checkDriverStatus() {
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }

    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
    if (authError) {
        console.error('Auth error:', authError);
        return;
    }

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const { data: driver, error } = await window.supabaseClient
            .from('drivers')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking driver status:', error);
            return;
        }

        const referralCodeElement = document.getElementById('referral-code');
        const activateDriverButton = document.getElementById('activate-driver');
        const driverContent = document.getElementById('driver-content');

        if (driver) {
            isDriver = true;
            driverStatus = driver.current_status;
            if (activateDriverButton) activateDriverButton.style.display = 'none';
            if (driverContent) driverContent.style.display = 'block';
            if (referralCodeElement) referralCodeElement.textContent = driver.referral_code;
            
            // Update driver stats
            const totalDeliveries = document.getElementById('total-deliveries');
            const driverRating = document.getElementById('driver-rating');
            
            if (totalDeliveries) totalDeliveries.textContent = driver.total_deliveries;
            if (driverRating) driverRating.textContent = driver.rating.toFixed(1);
            
            // Update status UI
            updateDriverStatusUI(driver.current_status);
            
            // Load available orders if driver is active and online
            if (driver.is_active && driver.current_status === 'online') {
                loadAvailableOrders();
            }
        } else {
            const referralCode = generateReferralCode();
            if (referralCodeElement) referralCodeElement.textContent = referralCode;
            if (activateDriverButton) activateDriverButton.style.display = 'block';
            if (driverContent) driverContent.style.display = 'none';
        }
    } catch (error) {
        console.error('Error in checkDriverStatus:', error);
    }
}

// Function to activate driver account
async function activateDriverAccount() {
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
    if (authError || !user) {
        console.error('Auth error:', authError);
        return;
    }

    try {
        const referralCode = document.getElementById('referral-code').textContent;
        const { data, error } = await window.supabaseClient
            .from('drivers')
            .insert([
                {
                    id: user.id,
                    referral_code: referralCode,
                    is_active: true
                }
            ]);

        if (error) {
            console.error('Error activating driver account:', error);
            return;
        }

        document.getElementById('activate-driver').style.display = 'none';
        document.getElementById('driver-content').style.display = 'block';
        isDriver = true;
        loadAvailableOrders();
    } catch (error) {
        console.error('Error in activateDriverAccount:', error);
    }
}

// Function to load available orders
async function loadAvailableOrders() {
    if (!isDriver) return;

    try {
        const { data: orders, error } = await window.supabaseClient
            .from('orders')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading available orders:', error);
            return;
        }

        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        if (!orders || orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-inbox"></i>
                    <p>No available orders at the moment</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = '';
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-details">
                    <div>
                        <strong>Order #${order.id}</strong>
                        <p>Customer: ${order.customer_name}</p>
                    </div>
                    <div>
                        <p>Delivery Address:</p>
                        <p>${order.delivery_address}</p>
                    </div>
                    <div>
                        <p>Total: $${order.total_amount.toFixed(2)}</p>
                        <p>Items: ${order.items_count || 'N/A'}</p>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn-accept" onclick="acceptOrder('${order.id}')">
                        Accept Order
                    </button>
                </div>
            `;
            ordersList.appendChild(orderCard);
        });
    } catch (error) {
        console.error('Error in loadAvailableOrders:', error);
    }
}

// Function to accept an order
async function acceptOrder(orderId) {
    if (!isDriver || activeOrder) return;

    try {
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        if (authError || !user) {
            console.error('Auth error:', authError);
            return;
        }

        const { data, error } = await window.supabaseClient
            .from('driver_orders')
            .insert([
                {
                    driver_id: user.id,
                    order_id: orderId,
                    status: 'accepted'
                }
            ]);

        if (error) {
            console.error('Error accepting order:', error);
            return;
        }

        // Update order status
        await window.supabaseClient
            .from('orders')
            .update({ status: 'in_progress' })
            .eq('id', orderId);

        activeOrder = orderId;
        document.getElementById('active-delivery').style.display = 'block';
        loadActiveOrderDetails(orderId);
        loadAvailableOrders(); // Refresh available orders
    } catch (error) {
        console.error('Error in acceptOrder:', error);
    }
}

// Function to load active order details
async function loadActiveOrderDetails(orderId) {
    try {
        const { data: order, error } = await window.supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) {
            console.error('Error loading order details:', error);
            return;
        }

        const activeOrderDetails = document.getElementById('active-order-details');
        if (!activeOrderDetails) return;

        activeOrderDetails.innerHTML = `
            <div class="order-details">
                <div>
                    <strong>Order #${order.id}</strong>
                    <p>Customer: ${order.customer_name}</p>
                </div>
                <div>
                    <p>Delivery Address:</p>
                    <p>${order.delivery_address}</p>
                </div>
                <div>
                    <p>Total: $${order.total_amount.toFixed(2)}</p>
                    <p>Items: ${order.items_count || 'N/A'}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error in loadActiveOrderDetails:', error);
    }
}

// Function to complete an order
async function completeOrder() {
    if (!activeOrder) return;

    const photoInput = document.getElementById('completion-photo');
    if (!photoInput.files || !photoInput.files[0]) {
        alert('Please upload a completion photo');
        return;
    }

    try {
        // Upload photo
        const file = photoInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${activeOrder}_completion.${fileExt}`;
        const { data: uploadData, error: uploadError } = await window.supabaseClient
            .storage
            .from('completion-photos')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Error uploading photo:', uploadError);
            return;
        }

        // Update order status
        const { error: updateError } = await window.supabaseClient
            .from('driver_orders')
            .update({
                status: 'completed',
                completed_at: new Date(),
                completion_photo_url: uploadData.path
            })
            .eq('order_id', activeOrder);

        if (updateError) {
            console.error('Error updating order status:', updateError);
            return;
        }

        await window.supabaseClient
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', activeOrder);

        activeOrder = null;
        document.getElementById('active-delivery').style.display = 'none';
        loadAvailableOrders();
    } catch (error) {
        console.error('Error in completeOrder:', error);
    }
}

// Update loadOrderHistory to include both customer orders and deliveries
async function loadOrderHistory() {
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
    if (authError || !user) return;

    try {
        // Get customer orders
        const { data: customerOrders, error: customerError } = await window.supabaseClient
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        // Get driver deliveries
        const { data: driverOrders, error: driverError } = await window.supabaseClient
            .from('driver_orders')
            .select(`
                *,
                orders (*)
            `)
            .eq('driver_id', user.id)
            .order('created_at', { ascending: false });

        if (customerError) throw customerError;
        if (driverError) throw driverError;

        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;

        if ((!customerOrders || customerOrders.length === 0) && (!driverOrders || driverOrders.length === 0)) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-inbox"></i>
                    <p>No orders or deliveries found</p>
                </div>
            `;
            return;
        }

        let tableHTML = `
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Add customer orders
        if (customerOrders) {
            customerOrders.forEach(order => {
                const orderDate = new Date(order.created_at).toLocaleDateString();
                const statusClass = `status-${order.status.toLowerCase()}`;
                
                tableHTML += `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${orderDate}</td>
                        <td>Order</td>
                        <td>$${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</td>
                        <td><span class="status-pill ${statusClass}">${order.status}</span></td>
                    </tr>
                `;
            });
        }

        // Add driver deliveries
        if (driverOrders) {
            driverOrders.forEach(delivery => {
                const orderDate = new Date(delivery.created_at).toLocaleDateString();
                const statusClass = `status-${delivery.status.toLowerCase()}`;
                const order = delivery.orders;
                
                tableHTML += `
                    <tr>
                        <td>#${delivery.order_id}</td>
                        <td>${orderDate}</td>
                        <td>Delivery</td>
                        <td>$${order?.total_amount ? order.total_amount.toFixed(2) : '0.00'}</td>
                        <td><span class="status-pill ${statusClass}">${delivery.status}</span></td>
                    </tr>
                `;
            });
        }

        tableHTML += `
                </tbody>
            </table>
        `;

        ordersContainer.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error loading order history:', error);
        document.getElementById('orders-container').innerHTML = `
            <div class="empty-state">
                <p>Error loading orders. Please try again.</p>
            </div>
        `;
    }
}

// Initialize driver functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the profile page
    if (document.getElementById('work-tab-content')) {
        checkDriverStatus();
        
        // Add event listeners
        const activateDriverBtn = document.getElementById('activate-driver');
        if (activateDriverBtn) {
            activateDriverBtn.addEventListener('click', activateDriverAccount);
        }

        const toggleStatusBtn = document.getElementById('toggle-status');
        if (toggleStatusBtn) {
            toggleStatusBtn.addEventListener('click', toggleDriverStatus);
        }

        const stopDrivingBtn = document.getElementById('stop-driving');
        if (stopDrivingBtn) {
            stopDrivingBtn.addEventListener('click', stopBeingDriver);
        }

        const uploadPhoto = document.getElementById('upload-photo');
        if (uploadPhoto) {
            uploadPhoto.addEventListener('click', () => {
                document.getElementById('completion-photo').click();
            });
        }

        const completeDeliveryBtn = document.getElementById('complete-delivery');
        if (completeDeliveryBtn) {
            completeDeliveryBtn.addEventListener('click', completeOrder);
        }

        // Add tab switching functionality
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                if (tabName === 'work' && isDriver) {
                    loadAvailableOrders();
                } else if (tabName === 'orders') {
                    loadOrderHistory();
                }
            });
        });
    }
}); 