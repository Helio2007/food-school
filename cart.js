let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find(cartItem => cartItem.name === item.name);

  if (existingItem) {
    existingItem.qty += 1;
    existingItem.total = existingItem.qty * existingItem.price;
  } else {
    cart.push({ ...item, qty: 1, total: item.price });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}


function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = count;
}


document.addEventListener("DOMContentLoaded", updateCartCount);

