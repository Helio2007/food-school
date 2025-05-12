$(function () {
  // Main Menu JS
  $(window).scroll(function () {
    if ($(this).scrollTop() < 50) {
      $("nav").removeClass("site-top-nav");
      $("#back-to-top").fadeOut();
    } else {
      $("nav").addClass("site-top-nav");
      $("#back-to-top").fadeIn();
    }
  });

  // Shopping Cart Toggle JS
  $("#shopping-cart").on("click", function () {
    $("#cart-content").toggle("blind", "", 500);
  });

  $(document).ready(function () {
    $("#shopping-cart").on("click", function () {
        $(".cart-content").toggle("blind", 500);
    });
});

function updateCartCount(count) {
  $("#cart-count").text(count);
}


  // Back-To-Top Button JS
  $("#back-to-top").click(function (event) {
    event.preventDefault();
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      1000
    );
  });

  // Delete Cart Item JS
  $(document).on("click", ".btn-delete", function (event) {
    event.preventDefault();
    $(this).closest("tr").remove();
    updateTotal();
  });

  // Update Total Price JS
  function updateTotal() {
    let total = 0;
    $("#cart-content tr").each(function () {
      const rowTotal = parseFloat($(this).find("td:nth-child(5)").text().replace("$", ""));
      if (!isNaN(rowTotal)) {
        total += rowTotal;
      }
    });
    $("#cart-content th:nth-child(5)").text("$" + total.toFixed(2));
    $(".tbl-full th:nth-child(6)").text("$" + total.toFixed(2));
  }
});

// Food items data with details for search functionality
const foodItems = [
  { name: "Pizza", price: 9.99, page: "categories-foods.html", keywords: ["cheese", "italian", "tomato", "crust"] },
  { name: "Burger", price: 6.99, page: "categories-foods.html", keywords: ["beef", "patty", "bun", "cheese", "fast food"] },
  { name: "Sandwich", price: 5.49, page: "categories-foods.html", keywords: ["bread", "lunch", "quick", "ham", "cheese"] },
  { name: "Pasta", price: 8.99, page: "categories-foods.html", keywords: ["italian", "noodle", "sauce", "spaghetti"] },
  { name: "Sushi", price: 12.99, page: "categories-foods.html", keywords: ["japanese", "raw", "fish", "rice", "seafood"] },
  { name: "Salad", price: 7.49, page: "categories-foods.html", keywords: ["fresh", "healthy", "vegetables", "greens"] },
  { name: "Steak", price: 15.99, page: "categories-foods.html", keywords: ["beef", "meat", "grilled", "protein"] },
  { name: "Dessert", price: 4.50, page: "categories-foods.html", keywords: ["sweet", "cake", "ice cream", "chocolate"] }
];

// Enhanced search function with autocomplete
function searchFood(e) {
  e.preventDefault();
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  
  if (!query) return false;
  
  // Check if we have a direct match
  const directMatch = foodItems.find(item => 
    item.name.toLowerCase() === query || 
    item.keywords.some(keyword => keyword === query)
  );
  
  if (directMatch) {
    // Redirect to specific food page with a search parameter
    window.location.href = `${directMatch.page}?search=${encodeURIComponent(query)}`;
    return false;
  }
  
  // If no direct match, search for partial matches
  const matches = foodItems.filter(item => 
    item.name.toLowerCase().includes(query) || 
    item.keywords.some(keyword => keyword.includes(query))
  );
  
  if (matches.length > 0) {
    // Redirect to categories page with search parameter
    window.location.href = `categories-foods.html?search=${encodeURIComponent(query)}`;
    return false;
  }
  
  // If no matches, show a message
  alert("No food items found matching your search. Try something else!");
  return false;
}

// Initialize search functionality with autocomplete
function initSearchAutocomplete() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  
  // Create autocomplete dropdown container
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "search-autocomplete";
  searchInput.parentNode.appendChild(dropdownContainer);
  
  // Add styles for the dropdown
  const style = document.createElement("style");
  style.textContent = `
    .search-container {
      position: relative;
    }
    .search-autocomplete {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      border-radius: 0 0 8px 8px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
    }
    .search-suggestion {
      padding: 12px 15px;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .search-suggestion:hover {
      background-color: #f9f9f9;
    }
    .suggestion-name {
      font-weight: 500;
    }
    .suggestion-price {
      color: #ff3b3b;
      font-weight: 600;
    }
    .suggestion-keywords {
      font-size: 12px;
      color: #777;
    }
  `;
  document.head.appendChild(style);
  
  // Wrap search input in a container
  const searchForm = searchInput.parentNode;
  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";
  searchInput.parentNode.insertBefore(searchContainer, searchInput);
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(dropdownContainer);
  
  // Handle input changes for autocomplete
  searchInput.addEventListener("input", function() {
    const query = this.value.trim().toLowerCase();
    
    if (query.length < 1) {
      dropdownContainer.style.display = "none";
      return;
    }
    
    // Find matching food items
    const matches = foodItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.keywords.some(keyword => keyword.includes(query))
    );
    
    if (matches.length > 0) {
      // Show dropdown and populate with matches
      dropdownContainer.innerHTML = "";
      matches.forEach(item => {
        const suggestion = document.createElement("div");
        suggestion.className = "search-suggestion";
        suggestion.innerHTML = `
          <div>
            <div class="suggestion-name">${item.name}</div>
            <div class="suggestion-keywords">${item.keywords.join(", ")}</div>
          </div>
          <div class="suggestion-price">$${item.price.toFixed(2)}</div>
        `;
        
        // Handle click on suggestion
        suggestion.addEventListener("click", function() {
          searchInput.value = item.name;
          dropdownContainer.style.display = "none";
          window.location.href = `${item.page}?search=${encodeURIComponent(item.name.toLowerCase())}`;
        });
        
        dropdownContainer.appendChild(suggestion);
      });
      
      dropdownContainer.style.display = "block";
    } else {
      dropdownContainer.style.display = "none";
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener("click", function(e) {
    if (!searchContainer.contains(e.target)) {
      dropdownContainer.style.display = "none";
    }
  });
  
  // Handle keyboard navigation
  searchInput.addEventListener("keydown", function(e) {
    const suggestions = dropdownContainer.querySelectorAll(".search-suggestion");
    if (!suggestions.length) return;
    
    // Find the currently selected suggestion
    const currentIndex = Array.from(suggestions).findIndex(s => s.classList.contains("selected"));
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      
      if (currentIndex === -1 || currentIndex === suggestions.length - 1) {
        // Select first item if none or last is selected
        if (currentIndex !== -1) suggestions[currentIndex].classList.remove("selected");
        suggestions[0].classList.add("selected");
      } else {
        // Select next item
        suggestions[currentIndex].classList.remove("selected");
        suggestions[currentIndex + 1].classList.add("selected");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      
      if (currentIndex === -1 || currentIndex === 0) {
        // Select last item if none or first is selected
        if (currentIndex !== -1) suggestions[currentIndex].classList.remove("selected");
        suggestions[suggestions.length - 1].classList.add("selected");
      } else {
        // Select previous item
        suggestions[currentIndex].classList.remove("selected");
        suggestions[currentIndex - 1].classList.add("selected");
      }
    } else if (e.key === "Enter" && currentIndex !== -1) {
      e.preventDefault();
      suggestions[currentIndex].click();
    }
  });
}

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the navbar
    initNavbar();

    // Initialize animations
    initAnimations();

    // Initialize smooth scrolling
    initSmoothScroll();

    // Initialize category slider
    initCategorySlider();

    // Initialize cart functionality
    initCart();
    
    // Initialize search autocomplete functionality
    initSearchAutocomplete();
});

// Navbar behavior when scrolling
function initNavbar() {
    const navbar = document.querySelector('.navbar-fixed-top');
    const navbarHeight = navbar.offsetHeight;
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow and background when scrolling down
        if (scrollTop > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.backgroundColor = '#ffffff';
        }

        // Hide navbar when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add active class to current page nav link
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.menu ul li a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Initialize scroll animations
function initAnimations() {
    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elementsToAnimate = document.querySelectorAll('.food-menu-box, .scroll-item');
        
        elementsToAnimate.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const isVisible = (elementTop < window.innerHeight) && (elementBottom > 0);
            
            if (isVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state of elements
    const setInitialState = function() {
        const elementsToAnimate = document.querySelectorAll('.food-menu-box, .scroll-item');
        
        elementsToAnimate.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
    };

    // Call setInitialState and animateOnScroll on load
    setInitialState();
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Add hover effects to food menu boxes
    const foodMenuBoxes = document.querySelectorAll('.food-menu-box');
    foodMenuBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        });
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Initialize smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize category slider with touch support
function initCategorySlider() {
    const scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;

    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollContainer.style.cursor = 'grabbing';
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });

    scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });

    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainer.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    scrollContainer.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('touchend', () => {
        isDown = false;
    });

    scrollContainer.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainer.scrollLeft = scrollLeft - walk;
    });

    // Scroll buttons
    const addScrollButtons = () => {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'scroll-buttons';
        buttonContainer.innerHTML = `
            <button class="scroll-left"><i class="fas fa-chevron-left"></i></button>
            <button class="scroll-right"><i class="fas fa-chevron-right"></i></button>
        `;
        
        scrollContainer.parentNode.appendChild(buttonContainer);
        
        // Style the buttons
        const style = document.createElement('style');
        style.textContent = `
            .scroll-buttons {
                display: flex;
                justify-content: space-between;
                width: 100%;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                padding: 0 10px;
            }
            .scroll-left, .scroll-right {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.9);
                border: none;
                color: #e60000;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                pointer-events: auto;
                transition: all 0.3s ease;
            }
            .scroll-left:hover, .scroll-right:hover {
                background-color: #e60000;
                color: white;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
        
        // Add event listeners
        const scrollLeftBtn = document.querySelector('.scroll-left');
        const scrollRightBtn = document.querySelector('.scroll-right');
        
        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });
        
        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    };
    
    addScrollButtons();
}

// Initialize cart functionality
function initCart() {
    const cartIcon = document.getElementById('cart-icon');
    const cartContent = document.getElementById('cart-content');
    
    if (!cartIcon || !cartContent) return;
    
    // Toggle cart dropdown when clicking on cart icon
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartContent.classList.toggle('show');
    });
    
    // Close cart dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartIcon.contains(e.target) && !cartContent.contains(e.target)) {
            cartContent.classList.remove('show');
        }
    });
    
    // Add animation when adding items to cart
    const addToCartAnimation = (button) => {
        // Create a notification animation
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = '<i class="fas fa-check"></i> Added to cart!';
        
        // Add it to the DOM
        document.body.appendChild(notification);
        
        // Style the notification
        const style = document.createElement('style');
        style.textContent = `
            .cart-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #4CAF50;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideIn 0.3s ease forwards, slideOut 0.3s ease 2s forwards;
                transform: translateX(100%);
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Remove notification after 2.5 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2500);
    };
    
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.btn-primary');
    addToCartButtons.forEach(button => {
        if (button.textContent.includes('Add to Cart')) {
            button.addEventListener('click', () => {
                addToCartAnimation(button);
                
                // Update cart count (for demo purposes)
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    const currentCount = parseInt(cartCount.textContent);
                    cartCount.textContent = currentCount + 1;
                }
            });
        }
    });
}



