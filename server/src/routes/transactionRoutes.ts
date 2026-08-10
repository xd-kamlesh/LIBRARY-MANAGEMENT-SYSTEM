import express from 'express';
import {
    issueBook, returnBook, reserveBook, toggleWishlist, getWishlist,
    getBorrowHistory, trackView, getRecentlyViewed, getUserStats, submitReview, getLibrarianStats
} from '../controllers/transactionController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

// Write operations
router.post('/issue', issueBook);
router.post('/return', returnBook);
router.post('/reserve', reserveBook);
router.post('/wishlist', toggleWishlist);
router.post('/view', trackView);
router.post('/review', submitReview);

// Read operations
router.get('/wishlist/:userId', getWishlist);
router.get('/history/:userId', getBorrowHistory);
router.get('/recent/:userId', getRecentlyViewed);
router.get('/stats/:userId', getUserStats);
router.get('/librarian/stats', getLibrarianStats);

export default router;
