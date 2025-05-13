// Enhanced chatbot implementation that can work with local responses or use an API
// Configuration
const config = {
    useApi: false, // Set to true to use API integration
    apiKey: "", // Your API key here
    apiProvider: "gemini", // gemini, openai, etc.
    botName: "Food School Assistant",
    initialGreeting: "Hello! Welcome to Food School. How can I help you today?",
    typingDelay: {
        min: 300, // Minimum typing delay in ms
        max: 1000, // Maximum typing delay in ms
        perCharacter: 20 // Additional delay per character in ms
    },
    apiConfig: {
        gemini: {
            url: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
            promptTemplate: "You are a helpful assistant for Food School, a food delivery website. Keep responses brief and focused on helping users with food ordering, menu information, delivery times, and restaurant locations. The website offers various food categories including Pizza, Burger, Sandwich, Pasta, Sushi, Salad, Steak, and Desserts. Delivery typically takes 30-45 minutes. Payment options include credit cards, debit cards, and cash on delivery."
        },
        openai: {
            url: "https://api.openai.com/v1/chat/completions",
            model: "gpt-3.5-turbo",
            promptTemplate: "You are a helpful assistant for Food School, a food delivery website. Keep responses brief and focused on helping users with food ordering, menu information, delivery times, and restaurant locations. The website offers various food categories including Pizza, Burger, Sandwich, Pasta, Sushi, Salad, Steak, and Desserts. Delivery typically takes 30-45 minutes. Payment options include credit cards, debit cards, and cash on delivery."
        }
    }
};

// Local response database
const knowledgeBase = {
    greetings: {
        keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings", "howdy", "yo", "sup"],
        responses: [
            "Hi there! How can I help you with your food order today?",
            "Hello! Welcome to Food School. What can I do for you?",
            "Hey! Ready to order some delicious food?",
            "Good to see you! What delicious meal are you in the mood for today?",
            "Welcome back! Looking for something tasty today?"
        ]
    },
    menu: {
        keywords: ["menu", "food", "eat", "order", "dish", "meal", "cuisine", "what do you have", "options", "choices", "dishes", "offerings"],
        responses: [
            "We offer a variety of foods including Pizza, Burgers, Sandwiches, Pasta, Sushi, Salad, Steak, and Desserts. What would you like to try?",
            "Our menu includes Pizza, Burgers, Sandwiches, Pasta, Sushi, Salad, Steak, and Desserts. Any preferences?",
            "You can explore our full menu in the Foods section. We have pizza, burgers, sandwiches, pasta, and more!",
            "From gourmet pizzas to fresh salads, we've got it all. Our most popular categories are Pizza, Burgers, Sandwiches, Pasta, Sushi, Salad, Steak, and Desserts.",
            "Hungry for something specific? We offer everything from Italian classics to Asian fusion. Just let me know what you're craving!"
        ]
    },
    pizza: {
        keywords: ["pizza", "pepperoni", "margherita", "hawaiian", "cheese pizza", "vegetarian pizza"],
        responses: [
            "Our pizzas are made with hand-tossed dough and fresh ingredients daily. Popular choices include Margherita, Pepperoni, Vegetarian, and Supreme.",
            "Pizza lovers adore our Signature Supreme and Classic Margherita! All pizzas come in 10\", 12\", and 16\" sizes.",
            "Try our award-winning pizzas with homemade sauce and premium cheese. The BBQ Chicken and Mediterranean Veggie are customer favorites!",
            "Our pizzas feature a perfect thin crust with bubbling cheese and generous toppings. The Meat Lover's Pizza is our bestseller!"
        ]
    },
    burger: {
        keywords: ["burger", "hamburger", "cheeseburger", "beef", "patty", "fries"],
        responses: [
            "Our gourmet burgers are made with 100% Angus beef, served on freshly baked buns with crispy fries on the side.",
            "Try our signature Deluxe Burger with aged cheddar, caramelized onions, and special sauce. It comes with a side of seasoned fries.",
            "From classic cheeseburgers to specialty creations like our Mushroom Swiss Burger, there's something for every burger lover!",
            "Our burgers are flame-grilled to perfection and served with your choice of toppings. The Bacon Avocado Burger is absolutely delicious!"
        ]
    },
    pasta: {
        keywords: ["pasta", "spaghetti", "noodle", "fettuccine", "alfredo", "carbonara", "lasagna", "italian"],
        responses: [
            "Our pasta dishes are made with authentic Italian recipes. Try the Fettuccine Alfredo or Spaghetti Bolognese!",
            "Pasta lovers rave about our Creamy Carbonara and Classic Lasagna. All pasta dishes come with garlic bread.",
            "Our chef's special Seafood Pasta features fresh shrimp, scallops, and a light white wine sauce. It's absolutely divine!",
            "We offer gluten-free pasta options for most of our dishes. The Pesto Primavera is a light, fresh favorite!"
        ]
    },
    salad: {
        keywords: ["salad", "healthy", "greens", "vegetables", "caesar", "garden", "fresh"],
        responses: [
            "Our salads are made with crisp, farm-fresh ingredients. The Caesar Salad and Greek Salad are particularly popular!",
            "For a healthy option, try our Superfood Salad with quinoa, avocado, and mixed greens tossed in a light vinaigrette.",
            "Our Chef's Salad comes loaded with premium toppings and your choice of house-made dressings.",
            "The Mediterranean Salad with feta cheese, olives, and our signature dressing is perfect for a light, refreshing meal."
        ]
    },
    sushi: {
        keywords: ["sushi", "japanese", "roll", "sashimi", "nigiri", "maki", "california roll", "spicy tuna"],
        responses: [
            "Our sushi is prepared by trained chefs using the freshest ingredients. Try our California Roll or Spicy Tuna Roll!",
            "The Dragon Roll and Rainbow Roll are customer favorites. All sushi comes with wasabi, ginger, and premium soy sauce.",
            "For sushi lovers, we recommend the Chef's Special Platter with a variety of nigiri, sashimi, and specialty rolls.",
            "Our Vegetarian Sushi options include Avocado Rolls, Cucumber Rolls, and the special Veggie Dragon Roll."
        ]
    },
    dessert: {
        keywords: ["dessert", "sweet", "cake", "ice cream", "chocolate", "cookie", "pie", "brownie", "cheesecake"],
        responses: [
            "Save room for our delicious desserts! The Molten Chocolate Cake and New York Cheesecake are to die for!",
            "Our dessert menu features house-made treats like Triple Chocolate Brownies and Classic Tiramisu.",
            "The Apple Pie à la Mode with vanilla ice cream is perfect for sharing. We also have seasonal fruit tarts!",
            "For chocolate lovers, our Chocolate Lava Cake with a side of premium ice cream is an absolute must-try!"
        ]
    },
    delivery: {
        keywords: ["delivery", "deliver", "bring", "shipping", "ship", "how long", "when will", "time", "fast", "quick", "soon", "wait"],
        responses: [
            "We typically deliver within 30-45 minutes of ordering. Delivery fees vary based on your location.",
            "Our delivery time is usually 30-45 minutes, depending on your distance from the restaurant.",
            "Your food will be at your doorstep within 30-45 minutes of placing the order!",
            "We pride ourselves on speedy deliveries! Most orders arrive within 30-45 minutes, and you can track your delivery in real-time.",
            "Hungry? Don't worry! Our efficient delivery team usually gets food to you in 30-45 minutes or less."
        ]
    },
    payment: {
        keywords: ["payment", "pay", "money", "cash", "card", "credit", "debit", "methods", "wallet", "online", "transaction"],
        responses: [
            "We accept credit cards, debit cards, and cash on delivery.",
            "You can pay with credit/debit cards or cash on delivery. All payment methods are secure!",
            "Payment options include all major credit/debit cards and cash on delivery.",
            "For your convenience, we accept all major credit cards, debit cards, mobile payments, and cash on delivery.",
            "Our secure payment system accepts Visa, Mastercard, American Express, and cash payments to the delivery driver."
        ]
    },
    location: {
        keywords: ["location", "where", "address", "find you", "restaurant location", "branch", "outlet", "store", "place", "situated"],
        responses: [
            "You can find our locations on the Live Map section of our website.",
            "Check out our Live Map to find the nearest Food School location to you!",
            "We have multiple locations across the city. The Live Map on our website shows all our restaurants.",
            "Food School has 8 convenient locations throughout the metropolitan area. Use our Live Map feature to find the one closest to you!",
            "We're expanding! Food School now has locations in downtown, uptown, westside, and the university district. Check the Live Map for exact addresses."
        ]
    },
    hours: {
        keywords: ["hours", "open", "close", "when", "time", "operation", "working", "schedule", "timing", "business hours"],
        responses: [
            "We're open from 10am to 10pm, seven days a week.",
            "Our restaurants operate from 10am to 10pm every day.",
            "Food School is at your service from 10am to 10pm, all week long!",
            "Craving a late dinner? We're open daily from 10am to 10pm to satisfy your hunger!",
            "Our kitchen serves delicious meals from 10am to 10pm, 365 days a year - even on holidays!"
        ]
    },
    specials: {
        keywords: ["special", "deal", "discount", "offer", "promotion", "coupon", "sale", "bargain", "cheap", "today", "limited"],
        responses: [
            "Check out our daily specials on the homepage!",
            "We have weekly specials and promotions. The current offers are displayed on our homepage.",
            "Sign up for our newsletter to receive exclusive deals and discounts!",
            "Today's special is 20% off all pasta dishes! Check our homepage regularly for new daily and weekly offers.",
            "Subscribe to our loyalty program and get a free dessert with every fifth order, plus exclusive member-only discounts!"
        ]
    },
    popular: {
        keywords: ["popular", "best", "recommended", "favorite", "top", "suggestion", "what should", "signature", "famous", "known for"],
        responses: [
            "Our most popular items are the Supreme Pizza, Gourmet Burger, and Fresh Sushi Platter.",
            "Customers love our Signature Steaks and Gourmet Burgers!",
            "I'd recommend trying our Chef's Special Pizza or the Deluxe Burger Combo!",
            "Our bestsellers include the Truffle Mushroom Pasta, Wagyu Beef Burger, and the Ultimate Meat Lover's Pizza. You can't go wrong with these!",
            "First time ordering? Our customers' all-time favorites are the BBQ Ribs, Mediterranean Grilled Salmon, and the Chocolate Lava Cake for dessert."
        ]
    },
    dietary: {
        keywords: ["vegetarian", "vegan", "gluten", "allergy", "allergic", "diet", "dietary", "restrictions", "keto", "dairy-free", "nut-free", "halal", "kosher"],
        responses: [
            "We have options for various dietary needs. Vegetarian items are marked with (V), vegan with (VG), and gluten-free with (GF).",
            "Yes, we cater to dietary restrictions! Look for items marked with (V) for vegetarian, (VG) for vegan, and (GF) for gluten-free options.",
            "Please let us know about any allergies when placing your order. We can provide allergen information for all our dishes.",
            "We take dietary needs seriously and offer a range of options. Our menu clearly marks vegetarian, vegan, gluten-free, and dairy-free options.",
            "Food School proudly serves everyone! We have keto-friendly, paleo, vegan, and gluten-free options, all prepared in dedicated cooking areas to prevent cross-contamination."
        ]
    },
    feedback: {
        keywords: ["feedback", "review", "rate", "rating", "experience", "complain", "complaint", "suggest", "suggestion", "opinion", "thought"],
        responses: [
            "We appreciate your feedback! You can leave a review on our Contact page.",
            "Your opinion matters to us! Please share your experience through the feedback form on our Contact page.",
            "We're always looking to improve! Share your thoughts through our feedback section on the Contact page.",
            "Had a great meal? We'd love to hear about it! Leave a review on our Contact page or social media channels.",
            "Your feedback helps us serve you better. Share your dining experience through our quick survey on the Contact page."
        ]
    },
    contact: {
        keywords: ["contact", "call", "phone", "email", "message", "reach", "talk", "speak", "support", "service", "chat"],
        responses: [
            "You can reach us at info@foodschool.com or call us at (555) 123-4567.",
            "For any inquiries, please email us at info@foodschool.com or call (555) 123-4567.",
            "Our customer service team is available at (555) 123-4567 or via email at info@foodschool.com.",
            "Have questions or special requests? Our friendly team is ready to help at (555) 123-4567 or info@foodschool.com.",
            "Need assistance? Our customer support team is available 7 days a week from 9am to 11pm at (555) 123-4567."
        ]
    },
    catering: {
        keywords: ["catering", "event", "party", "group", "gathering", "large order", "function", "celebration", "corporate", "bulk"],
        responses: [
            "We offer catering services for events of all sizes! Email catering@foodschool.com for a custom quote.",
            "Planning an event? Our catering team can create a custom menu for parties, corporate events, and special celebrations.",
            "From office lunches to family gatherings, we provide catering with flexible options. Contact us 48 hours in advance for best service.",
            "Our catering packages include setup, serving, and cleanup options. Call (555) 123-4569 to speak with our catering specialist."
        ]
    },
    reservation: {
        keywords: ["reservation", "reserve", "book", "table", "seating", "dine-in", "sit", "wait time", "availability"],
        responses: [
            "You can make a reservation through our website or by calling (555) 123-4567. We recommend booking at least 2 hours in advance.",
            "For parties of 6 or more, we strongly recommend reservations. You can book a table online or call us directly.",
            "Weekend reservations fill up quickly! Book your table through our website to secure your preferred time slot.",
            "Looking for a special table? Mention any preferences (window seat, quiet corner, etc.) when making your reservation."
        ]
    },
    drinks: {
        keywords: ["drink", "beverage", "soda", "juice", "water", "coffee", "tea", "alcohol", "wine", "beer", "cocktail"],
        responses: [
            "We offer a variety of beverages including soft drinks, fresh juices, coffee, tea, and a selection of alcoholic drinks.",
            "Our drink menu features craft sodas, fresh-squeezed juices, premium coffee, and a curated selection of wines and beers.",
            "Try our signature house-made lemonades and iced teas! We also have a full bar with specialty cocktails.",
            "Complement your meal with our selection of local craft beers, imported wines, or non-alcoholic options like our famous Berry Blast Smoothie."
        ]
    },
    kids: {
        keywords: ["kid", "child", "children", "family", "young", "baby", "toddler", "little one", "junior"],
        responses: [
            "We have a special Kids' Menu with smaller portions and favorites like mini pizzas, chicken tenders, and pasta.",
            "Families welcome! Our Kids' Menu includes a main dish, side, drink, and a small dessert at a great price.",
            "Children under 5 eat free with the purchase of an adult entrée on Tuesdays! Our Kids' Menu has healthy options too.",
            "Our restaurants are family-friendly with high chairs, booster seats, and activity sheets for the little ones."
        ]
    },
    gift: {
        keywords: ["gift", "card", "certificate", "present", "voucher", "coupon"],
        responses: [
            "Gift cards are available in any denomination and can be purchased online or in-restaurant.",
            "Looking for a perfect gift? Our digital gift cards can be sent instantly by email with a personalized message.",
            "Physical and digital gift cards available! They never expire and can be used for delivery, takeout, or dine-in.",
            "Surprise someone special with a Food School gift card - the gift of delicious food is always appreciated!"
        ]
    },
    app: {
        keywords: ["app", "application", "mobile", "download", "phone", "smartphone", "android", "iphone", "ios"],
        responses: [
            "Download our mobile app for exclusive offers and easy ordering! Available on iOS and Android.",
            "Our app makes ordering even easier! Plus, earn loyalty points with every purchase that you can redeem for free items.",
            "The Food School app lets you save favorite orders, track deliveries in real-time, and access app-only promotions.",
            "Order on the go with our mobile app! It remembers your preferences and makes reordering your favorites just one tap away."
        ]
    },
    covid: {
        keywords: ["covid", "coronavirus", "pandemic", "safety", "sanitary", "hygiene", "clean", "mask", "distance"],
        responses: [
            "Your safety is our priority. Our staff follows strict hygiene protocols and contactless delivery is available upon request.",
            "We maintain rigorous cleaning procedures and offer contactless options for both pickup and delivery orders.",
            "All our staff members are fully vaccinated and continue to follow health guidelines to ensure your safety.",
            "We've implemented enhanced safety measures including regular sanitization, staff health checks, and contactless service options."
        ]
    },
    ingredients: {
        keywords: ["ingredient", "fresh", "quality", "organic", "source", "local", "farm", "produce", "where from", "supplier"],
        responses: [
            "We source ingredients from local farms whenever possible, ensuring freshness and supporting our community.",
            "Quality ingredients make quality meals! We use premium products like imported Italian cheeses and locally grown produce.",
            "Our seafood is sustainably sourced, our produce is delivered daily, and we make our sauces and dressings in-house.",
            "We partner with local farmers and suppliers to bring you the freshest seasonal ingredients in all our dishes."
        ]
    },
    help: {
        keywords: ["help", "assist", "support", "guidance", "how to", "explain", "what is", "show me", "tell me", "works", "question", "confused", "unsure"],
        responses: [
            "I'm here to help! You can ask me about our menu, delivery, payment methods, locations, or placing an order.",
            "I can help you find food, check delivery times, or answer questions about our menu and services.",
            "How can I assist you today? I can provide information about our menu, delivery, payment options, and more!",
            "Need guidance? I can help with menu recommendations, ordering assistance, or answering any questions about our services.",
            "I'm your Food School assistant! Ask me anything about our menu, special dietary options, locations, or ordering process."
        ]
    },
    thanks: {
        keywords: ["thanks", "thank you", "appreciate", "grateful", "gratitude", "thx", "ty"],
        responses: [
            "You're welcome! Is there anything else I can help you with today?",
            "My pleasure! I'm here if you need any more assistance.",
            "Happy to help! Enjoy your meal from Food School!",
            "You're very welcome! Feel free to chat again if you have more questions.",
            "No problem at all! I'm here to make your Food School experience better."
        ]
    },
    goodbye: {
        keywords: ["bye", "goodbye", "see you", "later", "farewell", "good night", "cya"],
        responses: [
            "Goodbye! Enjoy your meal from Food School!",
            "See you next time! Thanks for chatting with Food School Assistant.",
            "Take care and enjoy your day! Come back anytime you're hungry.",
            "Bye for now! Remember you can order 24/7 through our website or app.",
            "Until next time! Don't forget to check our daily specials on your next visit."
        ]
    }
};

// Fallback responses for when no match is found
const fallbackResponses = [
    "I'm not sure I understand. Could you please rephrase that?",
    "I don't have information about that yet. Is there something else I can help with?",
    "I'm not quite sure what you're asking. Can you try asking in a different way?",
    "I'd like to help you better. Could you provide more details about what you're looking for?",
    "Hmm, I don't have an answer for that specific question. Can I help you with our menu, delivery options, or locations instead?",
    "I'm still learning! Could you try asking about our menu, delivery, payment options, or locations?",
    "I want to make sure I provide the right information. Could you clarify what you're looking for?",
    "I don't quite have the answer to that. Would you like to know about today's specials instead?"
];

// Conversation history
let conversationHistory = [];

// Initialize the chatbot
function initChatbot() {
    // Create chat container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    chatbotContainer.innerHTML = `
        <div class="chatbot-header">
            <h3>${config.botName}</h3>
            <button id="chatbot-toggle">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-typing" id="chatbot-typing">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
        <div class="chatbot-input">
            <input type="text" id="chatbot-message-input" placeholder="Type your message here...">
            <button id="chatbot-send">Send</button>
        </div>
    `;
    
    // Add chatbot button
    const chatbotButton = document.createElement('button');
    chatbotButton.id = 'chatbot-button';
    chatbotButton.innerHTML = '<i class="fas fa-comment"></i>';
    
    // Append to body
    document.body.appendChild(chatbotButton);
    document.body.appendChild(chatbotContainer);
    
    // Add event listeners
    document.getElementById('chatbot-button').addEventListener('click', toggleChatbot);
    document.getElementById('chatbot-toggle').addEventListener('click', toggleChatbot);
    document.getElementById('chatbot-send').addEventListener('click', sendMessage);
    document.getElementById('chatbot-message-input').addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Initially hide the chatbot and typing indicator
    chatbotContainer.classList.add('hidden');
    document.getElementById('chatbot-typing').style.display = 'none';
    
    // Add initial greeting
    setTimeout(() => {
        addMessageToChat(config.initialGreeting, 'bot');
    }, 500);
}

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    chatbotContainer.classList.toggle('hidden');
    
    // If opening the chatbot, focus the input
    if (!chatbotContainer.classList.contains('hidden')) {
        document.getElementById('chatbot-message-input').focus();
    }
}

// Send message
async function sendMessage() {
    const inputElement = document.getElementById('chatbot-message-input');
    const message = inputElement.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Save to conversation history
    conversationHistory.push({ role: "user", content: message });
    
    // Clear input
    inputElement.value = '';
    
    // Show typing indicator
    document.getElementById('chatbot-typing').style.display = 'block';
    
    try {
        let response;
        
        // Check if we should use API or local responses
        if (config.useApi && config.apiKey) {
            // Get API response with artificial delay to simulate typing
            response = await getApiResponse(message);
        } else {
            // Get local response with typing simulation
            response = getLocalResponse(message);
        }
        
        // Calculate a realistic typing delay based on response length
        const typingDelay = Math.min(
            config.typingDelay.max,
            config.typingDelay.min + (response.length * config.typingDelay.perCharacter)
        );
        
        // Simulate typing delay
        setTimeout(() => {
            // Hide typing indicator
            document.getElementById('chatbot-typing').style.display = 'none';
            
            // Add response to chat
            addMessageToChat(response, 'bot');
            
            // Save to conversation history
            conversationHistory.push({ role: "assistant", content: response });
            
            // Limit conversation history length
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }
        }, typingDelay);
    } catch (error) {
        console.error('Error getting response:', error);
        
        // Hide typing indicator after a short delay
        setTimeout(() => {
            document.getElementById('chatbot-typing').style.display = 'none';
            addMessageToChat("Sorry, I'm having trouble responding right now. Please try again later.", 'bot');
        }, 1000);
    }
}

// Add message to chat
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    messageElement.innerHTML = `
        <div class="message-content">${message}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get local response based on knowledge base
function getLocalResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check each category for matching keywords
    for (const category in knowledgeBase) {
        if (knowledgeBase.hasOwnProperty(category)) {
            for (const keyword of knowledgeBase[category].keywords) {
                if (message.includes(keyword)) {
                    // Return a random response from the matching category
                    const responses = knowledgeBase[category].responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }
    }
    
    // If no match found, return a fallback response
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// Get response from API
async function getApiResponse(userMessage) {
    try {
        let response;
        
        if (config.apiProvider === 'gemini' && config.apiKey) {
            response = await callGeminiApi(userMessage);
        } else if (config.apiProvider === 'openai' && config.apiKey) {
            response = await callOpenAiApi(userMessage);
        } else {
            throw new Error('Invalid API provider or missing API key');
        }
        
        return response;
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to local response if API fails
        return getLocalResponse(userMessage);
    }
}

// Call Gemini API
async function callGeminiApi(userMessage) {
    const apiConfig = config.apiConfig.gemini;
    
    // Prepare request data
    const requestData = {
        contents: [
            {
                role: "user",
                parts: [{ text: apiConfig.promptTemplate }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            topK: 40,
            topP: 0.95
        }
    };
    
    // Add conversation history (limited to last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const message of recentHistory) {
        requestData.contents.push({
            role: message.role === "user" ? "user" : "model",
            parts: [{ text: message.content }]
        });
    }
    
    // Add current user message
    requestData.contents.push({
        role: "user",
        parts: [{ text: userMessage }]
    });
    
    // Make the API call
    const response = await fetch(`${apiConfig.url}?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message || 'Error from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
}

// Call OpenAI API
async function callOpenAiApi(userMessage) {
    const apiConfig = config.apiConfig.openai;
    
    // Prepare messages array with system prompt
    const messages = [
        {
            role: "system",
            content: apiConfig.promptTemplate
        }
    ];
    
    // Add conversation history (limited to last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const message of recentHistory) {
        messages.push({
            role: message.role,
            content: message.content
        });
    }
    
    // Add current user message
    messages.push({
        role: "user",
        content: userMessage
    });
    
    // Make the API call
    const response = await fetch(apiConfig.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: apiConfig.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 150
        })
    });
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message || 'Error from OpenAI API');
    }
    
    return data.choices[0].message.content;
}

// Add CSS for the chatbot
function addChatbotStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #chatbot-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #ff3b3b;
            color: white;
            border: none;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.3s ease;
        }
        
        #chatbot-button:hover {
            transform: scale(1.1);
            background-color: #e62e2e;
        }
        
        #chatbot-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            z-index: 1000;
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        #chatbot-container.hidden {
            transform: translateY(20px);
            opacity: 0;
            pointer-events: none;
        }
        
        .chatbot-header {
            background-color: #ff3b3b;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chatbot-header h3 {
            margin: 0;
            font-size: 16px;
        }
        
        #chatbot-toggle {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }
        
        .chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }
        
        .message {
            max-width: 80%;
            margin-bottom: 10px;
            clear: both;
        }
        
        .user-message {
            align-self: flex-end;
        }
        
        .bot-message {
            align-self: flex-start;
        }
        
        .message-content {
            padding: 10px 15px;
            border-radius: 18px;
            display: inline-block;
            word-break: break-word;
        }
        
        .user-message .message-content {
            background-color: #ff3b3b;
            color: white;
            border-bottom-right-radius: 5px;
        }
        
        .bot-message .message-content {
            background-color: #f1f1f1;
            color: #333;
            border-bottom-left-radius: 5px;
        }
        
        .chatbot-input {
            display: flex;
            padding: 10px;
            border-top: 1px solid #eee;
        }
        
        #chatbot-message-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }
        
        #chatbot-send {
            margin-left: 10px;
            padding: 10px 15px;
            background-color: #ff3b3b;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        #chatbot-send:hover {
            background-color: #e62e2e;
        }
        
        #chatbot-typing {
            padding: 10px 15px;
            display: none;
        }
        
        .typing-indicator {
            display: inline-flex;
            align-items: center;
        }
        
        .typing-indicator span {
            height: 8px;
            width: 8px;
            background: #bbb;
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px;
            opacity: 0.4;
            animation: typing 1s infinite;
        }
        
        .typing-indicator span:nth-child(1) {
            animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typing {
            0%, 100% {
                transform: translateY(0);
                opacity: 0.4;
            }
            50% {
                transform: translateY(-5px);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addChatbotStyles();
    initChatbot();
}); 