// Supabase client initialization and authentication functions
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables or use placeholders
// You should replace these with your actual values in production
const supabaseUrl = 'https://apexmqhfzzsykjwanjfx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZXhtcWhmenpzeWtqd2FuamZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzUwNzEsImV4cCI6MjA2MjA1MTA3MX0.C5FIERevPeBTEkFdsysc4jZJ7R7hGfmQbf7aiHoqO-c';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication functions
async function signUp(email, password, userData = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    ...userData,
                    created_at: new Date().toISOString()
                }
            }
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error signing up:', error.message);
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error signing in:', error.message);
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error.message);
        return { success: false, error: error.message };
    }
}

async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error.message);
        return null;
    }
}

// Profile functions
async function getProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting profile:', error.message);
        return null;
    }
}

async function updateProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating profile:', error.message);
        return { success: false, error: error.message };
    }
}

// Order functions
async function createOrder(orderData) {
    try {
        // Insert the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([orderData])
            .select();

        if (orderError) throw orderError;

        return { success: true, data: order[0] };
    } catch (error) {
        console.error('Error creating order:', error.message);
        return { success: false, error: error.message };
    }
}

async function getOrders(userId) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting orders:', error.message);
        return [];
    }
}

async function createOrderItems(orderItems) {
    try {
        const { data, error } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating order items:', error.message);
        return { success: false, error: error.message };
    }
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (user) {
        // User is signed in
        console.log('User is signed in:', user);
        // Update UI based on authentication status
        updateAuthUI(true);
    } else {
        // User is not signed in
        console.log('User is not signed in');
        updateAuthUI(false);
    }
});

// Helper function to update UI based on authentication status
function updateAuthUI(isAuthenticated) {
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const profileLinks = document.querySelectorAll('.profile-link');
    
    if (isAuthenticated) {
        // Hide login links, show profile links
        loginLinks.forEach(link => {
            link.textContent = 'My Account';
            link.href = 'profile.html';
        });
        
        profileLinks.forEach(link => {
            link.style.display = 'block';
        });
    } else {
        // Show login links, hide profile links
        loginLinks.forEach(link => {
            link.textContent = 'Login';
            link.href = 'login.html';
        });
        
        profileLinks.forEach(link => {
            link.style.display = 'none';
        });
    }
}

// Export functions
export {
    supabase,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getProfile,
    updateProfile,
    createOrder,
    getOrders,
    createOrderItems
}; 