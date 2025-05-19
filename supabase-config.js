// Supabase configuration
const supabaseUrl = 'https://psyaqtxljrwwkeyqpocb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeWFxdHhsanJ3d2tleXFwb2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NjMzNjAsImV4cCI6MjA2MzIzOTM2MH0.Ea_9EvuJpK6R5ncPuL8jce5hOsRrPAf9dY3cGZSOFKc';

// Initialize the Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Export the supabase client
window.supabaseClient = supabase; 