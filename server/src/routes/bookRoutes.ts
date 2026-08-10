import express from 'express';
import {
    getBooks, getExploreBooks, getBookById, createBook, updateBook, deleteBook,
    searchBooks, getCategories, getBooksByCategory, getAuthorBooks, getRelatedBooks, getRecommendations
} from '../controllers/bookController';
import { protect, authorizeLibrarian } from '../middlewares/authMiddleware';

const router = express.Router();

// Public student routes
router.get('/search', searchBooks);
router.get('/categories', getCategories);
router.get('/explore', getExploreBooks);
router.get('/category/:categoryId', getBooksByCategory);
router.get('/author/:authorId', getAuthorBooks);
router.get('/recommendations/:userId', getRecommendations);
router.get('/:id/related', getRelatedBooks);
router.get('/:id', getBookById);
router.get('/', getBooks);

// Protected librarian routes
router.post('/', protect, authorizeLibrarian, createBook);
router.put('/:id', protect, authorizeLibrarian, updateBook);
router.delete('/:id', protect, authorizeLibrarian, deleteBook);

export default router;
