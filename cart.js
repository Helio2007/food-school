function addToCart(item, qty = 1) {
  qty = parseInt(qty) || 1; // fallback to 1 if qty is invalid
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find(cartItem => cartItem.name === item.name);

  if (existingItem) {
      existingItem.qty += qty;
      existingItem.total = existingItem.qty * existingItem.price;
  } else {
      cart.push({ ...item, qty: qty, total: item.price * qty });
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

