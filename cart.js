// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    setupCartListeners();
});

// Cart array to store items
let cart = [];

// Load cart from localStorage
function loadCart() {
    // Check both new and old storage keys to ensure compatibility
    const savedCart = localStorage.getItem('foodCart') || localStorage.getItem('cart');
    if (savedCart) {
        try {
            // Handle both new and old cart formats
            const parsedCart = JSON.parse(savedCart);
            
            // Check if it's using the old format (array with items having 'qty' and 'total' properties)
            if (Array.isArray(parsedCart) && parsedCart.length > 0 && parsedCart[0].hasOwnProperty('qty')) {
                // Convert old format to new format
                cart = parsedCart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.qty,
                    image: item.image || getDefaultImage(item.name),
                    total: item.price * item.qty
                }));
            } else {
                // It's already in the new format
                cart = parsedCart;
            }
            
            // Save in the new format
            saveCart();
            renderCart();
        } catch (e) {
            console.error("Error parsing cart data:", e);
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('foodCart', JSON.stringify(cart));
    // Also save to the old key for backward compatibility
    localStorage.setItem('cart', JSON.stringify(cart.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.quantity,
        total: item.price * item.quantity,
        image: item.image
    }))));
}

// Add item to cart
function addToCart(item, quantity = 1) {
    // Convert quantity to number
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 1) quantity = 1;
    
    console.log("Adding to cart:", item, "quantity:", quantity);
    
    // Find if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
  } else {
        // Add new item if it doesn't exist
        cart.push({
            name: item.name,
            price: item.price,
            quantity: quantity,
            image: item.image || getDefaultImage(item.name),
            total: item.price * quantity // Add total for backward compatibility
        });
  }

    // Save cart and update UI
    saveCart();
    renderCart();
    updateCartCount();
    
    // Show notification
    showNotification(`Added ${quantity} ${item.name} to cart`);
    
    // Add animation to cart icon
    animateCartIcon();
    
    // Show map notification if this is the first item added
    if (cart.length === 1) {
        setTimeout(() => {
            if (typeof showMapNotification === 'function') {
                showMapNotification();
            }
        }, 2000);
    }
    
    console.log("Cart updated:", cart);
}

// Get default image based on product name
function getDefaultImage(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('pizza')) return '../assets/img/p1.jpg';
    if (lowerName.includes('burger')) return '../assets/img/b1.jpg';
    if (lowerName.includes('sandwich')) return '../assets/img/s1.jpg';
    if (lowerName.includes('pasta')) return '../assets/img/p2.png';
    if (lowerName.includes('sushi')) return '../assets/img/s2.png';
    if (lowerName.includes('salad')) return '../assets/img/s3.png';
    return '../assets/img/food-bg.jpg';
}

// Remove item from cart
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    const removedItem = cart[index];
    
    // Create animation effect
    const cartTable = document.querySelector('.cart-table');
    if (cartTable) {
        const rows = cartTable.querySelectorAll('tr');
        if (rows[index + 1]) { // +1 because of the header row
            rows[index + 1].style.transition = 'all 0.3s ease';
            rows[index + 1].style.transform = 'translateX(100%)';
            rows[index + 1].style.opacity = '0';
            
            setTimeout(() => {
                // Remove item from cart array
                cart.splice(index, 1);
                // Save cart and update UI
                saveCart();
                renderCart();
                updateCartCount();
                showNotification(`Removed ${removedItem.name} from cart`);
            }, 300);
            
            return;
        }
    }
    
    // Fallback if animation doesn't work
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartCount();
    showNotification(`Removed ${removedItem.name} from cart`);
}

// Update quantity of cart item
function updateQuantity(index, newQuantity) {
    // Ensure quantity is valid
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) newQuantity = 1;
    
    // Update quantity
    cart[index].quantity = newQuantity;
    cart[index].total = cart[index].price * newQuantity; // Update total for backward compatibility
    
    // Save cart and update UI
    saveCart();
    renderCart();
  updateCartCount();
}

// Render cart in the DOM
function renderCart() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;
    
    // Get the table body or create the structure
    let cartTable = cartContent.querySelector('.cart-table');
    
    if (!cartTable) {
        cartContent.innerHTML = `
            <h3 class="text-center">Shopping Cart</h3>
            <table class="cart-table" border="0">
                <tr>
                    <th>Food</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </table>
            <a href="order.html" class="btn-primary"><i class="fas fa-check-circle"></i> Checkout</a>
        `;
        cartTable = cartContent.querySelector('.cart-table');
    }
    
    // Clear existing cart items (keep the header row)
    const headerRow = cartTable.querySelector('tr');
    cartTable.innerHTML = '';
    cartTable.appendChild(headerRow);
    
    // Add items to cart
    let total = 0;
    
    if (cart.length === 0) {
        // Show empty cart message
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center">Your cart is empty</td>
        `;
        cartTable.appendChild(emptyRow);
    } else {
        // Add each item to the cart
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.image}" alt="${item.name}"></td>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-controls">
                        <button class="qty-btn qty-decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn qty-increase" data-index="${index}">+</button>
                    </div>
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td><a href="#" class="btn-delete" data-index="${index}"><i class="fas fa-times"></i></a></td>
            `;
            cartTable.appendChild(row);
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'cart-total';
        totalRow.innerHTML = `
            <th colspan="4" class="text-right">Total</th>
            <th>$${total.toFixed(2)}</th>
            <th></th>
        `;
        cartTable.appendChild(totalRow);
    }
    
    // Add styles for quantity controls
    addQuantityControlsStyle();
}

// Update cart count badge
function updateCartCount() {
    const cartCounts = document.querySelectorAll('#cart-count');
    if (cartCounts.length === 0) return;
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCounts.forEach(cartCount => {
        cartCount.textContent = totalItems;
        
        // Add animation
        cartCount.style.transition = 'transform 0.3s ease';
        cartCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 300);
    });
}

// Setup cart listeners
function setupCartListeners() {
    // Add click event to the cart icon to redirect to order page
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'order.html';
        });
    }
    
    // Setup delete button click events
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn-delete') || e.target.matches('.btn-delete i')) {
            e.preventDefault();
            
            // Get the cart item row
            const deleteBtn = e.target.closest('.btn-delete');
            const row = deleteBtn.closest('tr');
            
            // Find the index of the row (skip the header row)
            const rows = Array.from(row.parentElement.querySelectorAll('tr'));
            const rowIndex = rows.indexOf(row) - 1; // -1 to account for the header row
            
            // Remove from cart
            if (rowIndex >= 0) {
                removeFromCart(rowIndex);
            }
        }
    });
    
    // Setup quantity change events
    document.addEventListener('change', function(e) {
        if (e.target.matches('.cart-quantity')) {
            const row = e.target.closest('tr');
            const rows = Array.from(row.parentElement.querySelectorAll('tr'));
            const rowIndex = rows.indexOf(row) - 1; // -1 to account for the header row
            
            if (rowIndex >= 0) {
                updateQuantity(rowIndex, e.target.value);
            }
        }
    });
    
    // Add quantity controls style
    addQuantityControlsStyle();
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `<i class="fas fa-shopping-cart"></i> ${message}`;
    document.body.appendChild(notification);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .cart-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease forwards, slideOut 0.3s ease 2s forwards;
            transform: translateX(100%);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        @keyframes slideIn {
            to { transform: translateX(0); }
        }
        
        @keyframes slideOut {
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove notification after animation
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 2500);
}

// Add quantity controls styles
function addQuantityControlsStyle() {
    // Check if styles are already added
    if (document.getElementById('quantity-controls-style')) return;
    
    const style = document.createElement('style');
    style.id = 'quantity-controls-style';
    style.textContent = `
        .quantity-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        
        .qty-btn {
            width: 24px;
            height: 24px;
            background: #f1f1f1;
            border: none;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .qty-btn:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .cart-total {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .text-right {
            text-align: right;
        }
    `;
    document.head.appendChild(style);
}

// Animate cart icon
function animateCartIcon() {
    const cartIcons = document.querySelectorAll('.cart-link, .cart-icon');
    if (cartIcons.length === 0) return;
    
    cartIcons.forEach(cartIcon => {
        cartIcon.classList.add('bounce');
    });
    
    // Add bounce animation if not already added
    if (!document.getElementById('cart-animation-style')) {
        const style = document.createElement('style');
        style.id = 'cart-animation-style';
        style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            .cart-link.bounce, .cart-icon.bounce {
                animation: bounce 0.5s ease;
}
        `;
        document.head.appendChild(style);
    }
    
    // Remove class after animation
    setTimeout(() => {
        cartIcons.forEach(cartIcon => {
            cartIcon.classList.remove('bounce');
        });
    }, 500);
}

// Adding backwards compatibility for older pages
// This helps pages that use the old cart system interact with the new one
function addToCartLegacy(item, qty = 1) {
  // Call the new addToCart function with converted parameters
  addToCart({
    name: item.name,
    price: item.price,
    image: item.image
  }, qty);
}

// Initialize on DOM load to handle both old and new cart implementations
document.addEventListener('DOMContentLoaded', function() {
  // Check if there are any cart icons that need event listeners
  const cartIcons = document.querySelectorAll('#cart-icon, .cart-icon');
  
  if (cartIcons.length > 0) {
    cartIcons.forEach(cartIcon => {
      cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const cartContent = document.getElementById('cart-content');
        if (cartContent) {
          cartContent.classList.toggle('show');
        }
      });
    });
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
      const cartContent = document.getElementById('cart-content');
      const isCartIcon = Array.from(cartIcons).some(icon => icon.contains(e.target));
      
      if (cartContent && !isCartIcon && !cartContent.contains(e.target)) {
        cartContent.classList.remove('show');
      }
    });
  }
});

