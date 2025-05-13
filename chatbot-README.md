# Food School Chatbot

This folder contains three different implementations of a chatbot for the Food School website. Each implementation offers different features and complexity levels.

## Overview of Implementations

### 1. Simple Chatbot (`chatbot.js`)
A basic chatbot with predefined responses based on keyword matching. This implementation doesn't require any external API and works completely client-side.

**Key Features:**
- Lightweight and fast
- No API dependencies
- Simple keyword-based matching
- Predefined responses for common questions
- Easy to customize responses

### 2. Gemini-Powered Chatbot (`chatbot-gemini.js`)
An advanced chatbot that uses Google's Gemini AI model to generate more natural and contextual responses. This requires a Gemini API key to work but falls back to simple responses if no key is provided.

**Key Features:**
- Natural language understanding
- Context-aware conversations
- Maintains conversation history
- Typing indicators for a more natural feel
- Fallback mode for when API is unavailable

### 3. Enhanced Hybrid Chatbot (`chatbot-enhanced.js`)
A flexible solution that can work with either local responses or connect to AI APIs (Gemini or OpenAI). This is the most configurable option with realistic typing simulation and support for multiple AI providers.

**Key Features:**
- Configurable to use either local responses or AI APIs
- Support for both Gemini and OpenAI
- Realistic typing simulation based on message length
- Structured knowledge base with multiple categories
- Fallback to local responses if API fails
- Conversation history management

## How to Use

### Basic Setup (No API)

To use the simple keyword-based chatbot without any API:

1. Add the script to your HTML file:
```html
<script src="chatbot.js"></script>
```

2. That's it! The chatbot will initialize automatically when the page loads.

### Using with Gemini API

To use the Gemini-powered chatbot:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Open `chatbot-gemini.js` and replace:
```javascript
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual key
```

3. Add the script to your HTML file:
```html
<script src="chatbot-gemini.js"></script>
```

### Using the Enhanced Hybrid Chatbot

For the most flexible option:

1. Open `chatbot-enhanced.js` and configure the settings at the top:
```javascript
const config = {
    useApi: false, // Set to true to use API integration
    apiKey: "", // Your API key here
    apiProvider: "gemini", // gemini, openai, etc.
    // ... other settings
};
```

2. If using an API, provide your API key and set `useApi` to `true`.

3. Add the script to your HTML file:
```html
<script src="chatbot-enhanced.js"></script>
```

## Customizing Responses

### Simple and Enhanced Chatbots

Both the simple and enhanced chatbots use a knowledge base of predefined responses. You can customize these by editing the response arrays in the respective JavaScript files:

```javascript
// In chatbot.js
const chatbotResponses = {
    "hello": ["Hi there!", "Hello! How can I help?"],
    // Add or modify keywords and responses
};

// In chatbot-enhanced.js
const knowledgeBase = {
    greetings: {
        keywords: ["hello", "hi", "hey"],
        responses: ["Hi there!", "Hello!"]
    },
    // Add or modify categories, keywords and responses
};
```

## Appearance Customization

The chatbot's appearance can be customized by modifying the CSS in the `addChatbotStyles` function in each implementation.

## Troubleshooting

- **API Not Working**: Check that your API key is correct and that you've set `useApi` to `true` (for enhanced chatbot)
- **Chatbot Not Appearing**: Make sure the script is loaded after DOM content is loaded
- **Styling Issues**: Check if there are CSS conflicts with your website's existing styles

## Which Implementation to Choose?

- **Basic Website with Limited Budget**: Use `chatbot.js` for a simple solution with no ongoing costs
- **Enhanced Experience, No Budget**: Use `chatbot-enhanced.js` with `useApi: false`
- **Full AI Experience**: Use `chatbot-gemini.js` or `chatbot-enhanced.js` with `useApi: true`

---

For further customization or issues, please contact the development team. 