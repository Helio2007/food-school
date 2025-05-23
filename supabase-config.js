// Supabase configuration
const supabaseUrl = 'https://psyaqtxljrwwkeyqpocb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeWFxdHhsanJ3d2tleXFwb2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NjMzNjAsImV4cCI6MjA2MzIzOTM2MH0.Ea_9EvuJpK6R5ncPuL8jce5hOsRrPAf9dY3cGZSOFKc';

// Initialize the Supabase client
window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Gemini API configuration
window.config = {
    apiConfig: {
        gemini: {
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
            promptTemplate: 'You are a nutrition expert. Analyze this food image and provide detailed nutrition information. Please format your response as follows:\n{\n  "foodName": "Name of the food",\n  "calories": "XXX kcal",\n  "protein": "XX g",\n  "carbs": "XX g",\n  "fat": "XX g",\n  "fiber": "XX g",\n  "additionalInfo": "Any additional nutritional information"\n}'
        }
    },
    apiKey: 'AIzaSyBY-5LCDfpb3E-EM6dg22-VUIAxOFk1VUk' // You need to put your Google API key here
}; 