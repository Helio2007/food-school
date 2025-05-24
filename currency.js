// Currency conversion rates (as of March 2024)
const EXCHANGE_RATES = {
    USD: {
        EUR: 0.92,
        ALL: 95.50
    },
    EUR: {
        USD: 1.09,
        ALL: 103.80
    },
    ALL: {
        USD: 0.0105,
        EUR: 0.0096
    }
};

// Get user's preferred currency from localStorage or default to USD
function getUserCurrency() {
    return localStorage.getItem('preferredCurrency') || 'USD';
}

// Set user's preferred currency
function setUserCurrency(currency) {
    localStorage.setItem('preferredCurrency', currency);
    // Dispatch a custom event when currency changes
    document.dispatchEvent(new Event('currencyChanged'));
    updateAllPrices();
}

// Convert amount from one currency to another
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    return amount * EXCHANGE_RATES[fromCurrency][toCurrency];
}

// Format price with currency symbol
function formatPrice(amount, currency) {
    const symbols = {
        USD: '$',
        EUR: '€',
        ALL: 'L'
    };
    
    // Round to 2 decimal places for USD and EUR, 0 for ALL
    const decimals = currency === 'ALL' ? 0 : 2;
    return `${symbols[currency]}${amount.toFixed(decimals)}`;
}

// Update all prices on the page
function updateAllPrices() {
    const currentCurrency = getUserCurrency();
    
    // Update all price elements
    document.querySelectorAll('[data-price]').forEach(element => {
        const baseAmount = parseFloat(element.getAttribute('data-price'));
        const baseCurrency = element.getAttribute('data-currency') || 'USD';
        const convertedAmount = convertCurrency(baseAmount, baseCurrency, currentCurrency);
        element.textContent = formatPrice(convertedAmount, currentCurrency);
    });
    
    // Update cart total if it exists
    const cartTotal = document.getElementById('total-amount');
    if (cartTotal) {
        const baseAmount = parseFloat(cartTotal.getAttribute('data-base-amount') || 0);
        const convertedAmount = convertCurrency(baseAmount, 'USD', currentCurrency);
        cartTotal.textContent = formatPrice(convertedAmount, currentCurrency);
    }
    
    // Update delivery fee if it exists
    const deliveryFee = document.getElementById('delivery-fee');
    if (deliveryFee) {
        const baseAmount = parseFloat(deliveryFee.getAttribute('data-base-amount') || 0);
        const convertedAmount = convertCurrency(baseAmount, 'EUR', currentCurrency);
        deliveryFee.textContent = formatPrice(convertedAmount, currentCurrency);
    }

    // Update all prices in cart table if it exists
    const cartTable = document.getElementById('cart-table');
    if (cartTable) {
        const rows = cartTable.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            if (cells.length >= 6) {
                // Update price cell
                const price = parseFloat(cells[3].textContent.replace(/[^0-9.-]+/g, ''));
                cells[3].textContent = formatPrice(price, currentCurrency);
                
                // Update total cell
                const total = parseFloat(cells[5].textContent.replace(/[^0-9.-]+/g, ''));
                cells[5].textContent = formatPrice(total, currentCurrency);
            }
        }
    }
}

// Add currency selector to the page
function addCurrencySelector() {
    const menu = document.querySelector('.menu ul');
    if (!menu) return;
    
    // Remove all existing currency selectors to prevent duplicates
    menu.querySelectorAll('.currency-selector').forEach(el => el.remove());
    
    const currencySelector = document.createElement('li');
    currencySelector.className = 'currency-selector';
    
    // Create the select element
    const select = document.createElement('select');
    select.onchange = function() { setUserCurrency(this.value); };
    [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'ALL', label: 'ALL' }
    ].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    });
    select.value = getUserCurrency();
    currencySelector.appendChild(select);
    
    // Insert before the cart container
    const cartContainer = menu.querySelector('.cart-container');
    if (cartContainer) {
        menu.insertBefore(currencySelector, cartContainer);
    } else {
        menu.appendChild(currencySelector);
    }
    
    // Add styles for the currency selector
    const style = document.createElement('style');
    style.textContent = `
        .currency-selector {
            display: flex !important;
            align-items: center !important;
            margin: 0 15px !important;
            min-width: 80px;
            min-height: 40px;
        }
        .currency-selector select {
            padding: 5px 10px;
            border: 1px solid var(--primary-color);
            border-radius: 4px;
            background-color: white;
            color: var(--text-color);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 70px;
        }
        .currency-selector select:hover {
            border-color: var(--secondary-color);
        }
        .currency-selector select:focus {
            outline: none;
            border-color: var(--secondary-color);
            box-shadow: 0 0 0 2px rgba(230, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// Initialize currency functionality
document.addEventListener('DOMContentLoaded', () => {
    addCurrencySelector();
    updateAllPrices();
}); 