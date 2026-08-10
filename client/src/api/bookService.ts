import apiClient from './index';

export interface BookPayload {
    title: string;
    description: string;
    isbn: string;
    publicationYear: number;
    language: string;
    shelfLocation: string;
    coverImage?: string;
}

// Explore dashboard buckets
export const getExploreBooks = async () => {
    const response = await apiClient.get('/books/explore');
    return response.data;
};

// Full-text search with filters
export const searchBooks = async (params: { q?: string; category?: string; language?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category) query.set('category', params.category);
    if (params.language) query.set('language', params.language);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const response = await apiClient.get(`/books/search?${query.toString()}`);
    return response.data;
};

// All categories
export const getCategories = async () => {
    const response = await apiClient.get('/books/categories');
    return response.data;
};

// Books by category
export const getBooksByCategory = async (categoryId: string, page = 1) => {
    const response = await apiClient.get(`/books/category/${categoryId}?page=${page}`);
    return response.data;
};

// Author profile + books
export const getAuthorBooks = async (authorId: string) => {
    const response = await apiClient.get(`/books/author/${authorId}`);
    return response.data;
};

// Related books
export const getRelatedBooks = async (bookId: string) => {
    const response = await apiClient.get(`/books/${bookId}/related`);
    return response.data;
};

// Recommendations
export const getRecommendations = async (userId: string) => {
    const response = await apiClient.get(`/books/recommendations/${userId}`);
    return response.data;
};

// Single book details
export const getBookById = async (id: string) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
};

// Raw books (librarian)
export const getBooks = async (keyword?: string) => {
    const response = await apiClient.get(keyword ? `/books?keyword=${keyword}` : '/books');
    return response.data;
};

// CRUD
export const createBook = async (data: BookPayload) => {
    const response = await apiClient.post('/books', data);
    return response.data;
};

export const updateBook = async (id: string, data: Partial<BookPayload>) => {
    const response = await apiClient.put(`/books/${id}`, data);
    return response.data;
};

export const deleteBook = async (id: string) => {
    const response = await apiClient.delete(`/books/${id}`);
    return response.data;
};
