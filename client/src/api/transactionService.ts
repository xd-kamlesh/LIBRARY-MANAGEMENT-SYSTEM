import apiClient from './index';

// Borrow a book
export const issueBook = async (bookId: string, userId: string, dueDate?: string) => {
    const response = await apiClient.post('/transactions/issue', { bookId, userId, dueDate });
    return response.data;
};

// Reserve a book
export const reserveBook = async (bookId: string, userId: string) => {
    const response = await apiClient.post('/transactions/reserve', { bookId, userId });
    return response.data;
};

// Toggle wishlist
export const toggleWishlist = async (bookId: string, userId: string) => {
    const response = await apiClient.post('/transactions/wishlist', { bookId, userId });
    return response.data;
};

// Get user's wishlist
export const getWishlist = async (userId: string) => {
    const response = await apiClient.get(`/transactions/wishlist/${userId}`);
    return response.data;
};

// Return a book
export const returnBook = async (transactionId: string) => {
    const response = await apiClient.post('/transactions/return', { transactionId });
    return response.data;
};

// Get borrow history
export const getBorrowHistory = async (userId: string) => {
    const response = await apiClient.get(`/transactions/history/${userId}`);
    return response.data;
};

// Track a book view
export const trackBookView = async (bookId: string, userId: string) => {
    const response = await apiClient.post('/transactions/view', { bookId, userId });
    return response.data;
};

// Get recently viewed books
export const getRecentlyViewed = async (userId: string) => {
    const response = await apiClient.get(`/transactions/recent/${userId}`);
    return response.data;
};

// Get user stats
export const getUserStats = async (userId: string) => {
    const response = await apiClient.get(`/transactions/stats/${userId}`);
    return response.data;
};

// Submit a review
export const submitReview = async (bookId: string, userId: string, content: string, score?: number) => {
    const response = await apiClient.post('/transactions/review', { bookId, userId, content, score });
    return response.data;
};

// Get librarian dashboard stats
export const getLibrarianStats = async () => {
    const response = await apiClient.get('/transactions/librarian/stats');
    return response.data;
};
