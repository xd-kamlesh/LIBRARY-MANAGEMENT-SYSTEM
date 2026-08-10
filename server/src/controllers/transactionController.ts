import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Issue a book to a user (Borrow)
// @route   POST /api/transactions/issue
export const issueBook = async (req: Request, res: Response): Promise<void> => {
    const { bookId, userId, dueDate } = req.body;

    try {
        const book = await prisma.book.findUnique({ where: { id: bookId }, include: { copies: true } });
        if (!book || book.availableCopies < 1) {
            res.status(400).json({ message: 'Book is currently out of stock' });
            return;
        }

        const availableCopy = book.copies.find(c => c.isAvailable);
        if (!availableCopy) {
            res.status(400).json({ message: 'No physical copies available right now' });
            return;
        }

        const record = await prisma.borrowRecord.create({
            data: {
                bookId,
                userId,
                copyId: availableCopy.id,
                dueDate: new Date(dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
            },
        });

        await prisma.bookCopy.update({ where: { id: availableCopy.id }, data: { isAvailable: false } });
        await prisma.book.update({ where: { id: bookId }, data: { availableCopies: book.availableCopies - 1, borrowCount: book.borrowCount + 1 } });

        // Log activity
        await prisma.activityLog.create({
            data: { userId, action: 'BORROW_BOOK', entityId: bookId, entityType: 'Book', details: `Borrowed: ${book.title}` },
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Reserve a book
// @route   POST /api/transactions/reserve
export const reserveBook = async (req: Request, res: Response): Promise<void> => {
    const { bookId, userId } = req.body;
    try {
        // Check if user already has an active reservation for this book
        const existing = await prisma.reservation.findFirst({
            where: { bookId, userId, status: 'PENDING' }
        });
        if (existing) {
            res.status(400).json({ message: 'You already have an active reservation for this book' });
            return;
        }

        const reservation = await prisma.reservation.create({ data: { bookId, userId } });

        await prisma.activityLog.create({
            data: { userId, action: 'RESERVE_BOOK', entityId: bookId, entityType: 'Book' },
        });

        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Add/remove from wishlist (toggle)
// @route   POST /api/transactions/wishlist
export const toggleWishlist = async (req: Request, res: Response): Promise<void> => {
    const { bookId, userId } = req.body;
    try {
        const existing = await prisma.wishlist.findUnique({
            where: { userId_bookId: { userId, bookId } }
        });

        if (existing) {
            await prisma.wishlist.delete({ where: { id: existing.id } });
            res.status(200).json({ status: 'removed' });
        } else {
            await prisma.wishlist.create({ data: { userId, bookId } });
            res.status(201).json({ status: 'added' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Return a book
// @route   POST /api/transactions/return
export const returnBook = async (req: Request, res: Response): Promise<void> => {
    const { transactionId } = req.body;
    try {
        const record = await prisma.borrowRecord.findUnique({
            where: { id: transactionId },
            include: { book: true }
        });

        if (!record) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        // Calculate fine
        let fineAmount = 0;
        const now = new Date();
        if (record.dueDate < now && record.status !== 'RETURNED') {
            const daysLate = Math.ceil((now.getTime() - record.dueDate.getTime()) / (1000 * 3600 * 24));
            fineAmount = daysLate * 1; // Assuming $1 per day
        }

        // Use transaction to ensure data integrity
        await prisma.$transaction([
            prisma.borrowRecord.update({
                where: { id: transactionId },
                data: {
                    status: 'RETURNED',
                    returnDate: now,
                    fineAmount
                }
            }),
            prisma.bookCopy.updateMany({
                where: { bookId: record.bookId, status: 'BORROWED' }, // Approximation, just freeing up one borrowed copy
                data: { status: 'AVAILABLE', isAvailable: true }
            })
        ]);

        res.json({ message: 'Book returned successfully', fineAmount });
    } catch (error) {
        console.error("Return Book Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get user's wishlist
// @route   GET /api/transactions/wishlist/:userId
export const getWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.params.userId as string },
            include: {
                book: {
                    include: {
                        category: true,
                        authors: { include: { author: true } },
                        publisher: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(wishlist.map(w => ({
            id: w.book.id,
            title: w.book.title,
            author: w.book.authors?.map((a: any) => a.author?.name).join(', ') || 'Unknown',
            coverImageUrl: w.book.coverImage,
            description: w.book.description,
            category: w.book.category?.name || 'General',
            averageRating: w.book.averageRating,
            addedAt: w.createdAt,
        })));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get user's borrow history
// @route   GET /api/transactions/history/:userId
export const getBorrowHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const records = await prisma.borrowRecord.findMany({
            where: { userId: req.params.userId as string },
            include: {
                book: {
                    include: {
                        category: true,
                        authors: { include: { author: true } },
                    }
                }
            },
            orderBy: { borrowDate: 'desc' },
        });

        res.json(records.map(r => ({
            id: r.id,
            bookId: r.bookId,
            title: r.book.title,
            author: r.book.authors?.map((a: any) => a.author?.name).join(', ') || 'Unknown',
            coverImageUrl: r.book.coverImage,
            status: r.status,
            borrowDate: r.borrowDate,
            dueDate: r.dueDate,
            returnDate: r.returnDate,
            category: r.book.category?.name || 'General',
        })));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Track recently viewed book
// @route   POST /api/transactions/view
export const trackView = async (req: Request, res: Response): Promise<void> => {
    const { bookId, userId } = req.body;
    try {
        await prisma.readingHistory.upsert({
            where: { userId_bookId: { userId, bookId } },
            create: { userId, bookId, pagesRead: 0, completionRate: 0 },
            update: { lastReadDate: new Date() },
        });

        await prisma.activityLog.create({
            data: { userId, action: 'VIEW_BOOK', entityId: bookId, entityType: 'Book' },
        });

        res.json({ status: 'tracked' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get recently viewed books
// @route   GET /api/transactions/recent/:userId
export const getRecentlyViewed = async (req: Request, res: Response): Promise<void> => {
    try {
        const history = await prisma.readingHistory.findMany({
            where: { userId: req.params.userId as string },
            include: {
                book: {
                    include: {
                        category: true,
                        authors: { include: { author: true } },
                    }
                }
            },
            orderBy: { lastReadDate: 'desc' },
            take: 10,
        });

        res.json(history.map(h => ({
            id: h.book.id,
            title: h.book.title,
            author: h.book.authors?.map((a: any) => a.author?.name).join(', ') || 'Unknown',
            coverImageUrl: h.book.coverImage,
            description: h.book.description,
            category: h.book.category?.name || 'General',
            lastViewedAt: h.lastReadDate,
        })));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get user stats (for profile)
// @route   GET /api/transactions/stats/:userId
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId as string;

        const [totalBorrows, activeBorrows, totalWishlist, totalReviews] = await Promise.all([
            prisma.borrowRecord.count({ where: { userId } }),
            prisma.borrowRecord.count({ where: { userId, status: 'ACTIVE' } }),
            prisma.wishlist.count({ where: { userId } }),
            prisma.review.count({ where: { userId } }),
        ]);

        res.json({
            totalBorrows,
            activeBorrows,
            totalWishlist,
            totalReviews,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Submit a review
// @route   POST /api/transactions/review
export const submitReview = async (req: Request, res: Response): Promise<void> => {
    const { bookId, userId, content, score } = req.body;
    try {
        const review = await prisma.review.create({ data: { bookId, userId, content } });

        if (score) {
            await prisma.rating.upsert({
                where: { userId_bookId: { userId, bookId } },
                create: { userId, bookId, score: parseInt(score) },
                update: { score: parseInt(score) },
            });
        }

        // Update book review count
        await prisma.book.update({
            where: { id: bookId },
            data: { reviewCount: { increment: 1 } },
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get librarian dashboard stats
// @route   GET /api/transactions/librarian/stats
export const getLibrarianStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalCopiesAgg,
            availableCopiesAgg,
            totalBookTitles,
            activeIssues,
            overdueBorrows,
            totalMembers,
            totalReservations,
            recentAdditions,
            recentTransactionsRaw,
            overdueRecordsRaw
        ] = await Promise.all([
            prisma.book.aggregate({ _sum: { totalCopies: true } }),
            prisma.book.aggregate({ _sum: { availableCopies: true } }),
            prisma.book.count(),
            prisma.borrowRecord.count({ where: { status: 'ACTIVE' } }),
            prisma.borrowRecord.count({ where: { status: 'ACTIVE', dueDate: { lt: now } } }),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.reservation.count({ where: { status: 'PENDING' } }),
            prisma.book.count({ where: { dateAdded: { gte: thirtyDaysAgo } } }),
            prisma.borrowRecord.findMany({
                take: 10,
                orderBy: { borrowDate: 'desc' },
                include: { user: true, book: true },
            }),
            prisma.borrowRecord.findMany({
                where: { status: 'ACTIVE', dueDate: { lt: now } },
                take: 5,
                orderBy: { dueDate: 'asc' },
                include: { user: true, book: true },
            })
        ]);

        const totalBooks = totalCopiesAgg._sum.totalCopies || 0;
        const availableBooks = availableCopiesAgg._sum.availableCopies || 0;
        const borrowedBooks = totalBooks - availableBooks;

        const recentTransactions = recentTransactionsRaw.map(tx => ({
            id: tx.id,
            student: tx.user?.name || 'Unknown',
            book: tx.book?.title || 'Unknown',
            action: tx.status === 'RETURNED' ? 'Return' : 'Borrow',
            borrowDate: tx.borrowDate.toISOString().split('T')[0],
            dueDate: tx.dueDate.toISOString().split('T')[0],
            returnDate: tx.returnDate ? tx.returnDate.toISOString().split('T')[0] : null,
            status: tx.status === 'ACTIVE' && tx.dueDate < now ? 'OVERDUE' : tx.status,
        }));

        const overdueRecords = overdueRecordsRaw.map(tx => {
            const daysOverdue = Math.ceil((now.getTime() - tx.dueDate.getTime()) / (1000 * 3600 * 24));
            return {
                id: tx.id,
                student: tx.user?.name || 'Unknown',
                book: tx.book?.title || 'Unknown',
                dueDate: tx.dueDate.toISOString().split('T')[0],
                daysOverdue,
            };
        });

        // Real chart data - Fetching efficiently in memory for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentBorrowsForChart = await prisma.borrowRecord.findMany({
            where: { borrowDate: { gte: sixMonthsAgo } },
            select: { borrowDate: true }
        });

        // 7 Days
        const chartData7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const name = d.toLocaleDateString('en-US', { weekday: 'short' });
            const count = recentBorrowsForChart.filter(b => b.borrowDate.toDateString() === d.toDateString()).length;
            chartData7Days.push({ name, borrowings: count });
        }

        // 30 Days
        const chartData30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const name = d.getDate().toString(); // Just the date number
            const count = recentBorrowsForChart.filter(b => b.borrowDate.toDateString() === d.toDateString()).length;
            chartData30Days.push({ name, borrowings: count });
        }

        // 6 Months
        const chartData6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            const name = d.toLocaleDateString('en-US', { month: 'short' });
            const count = recentBorrowsForChart.filter(b => b.borrowDate.getMonth() === d.getMonth() && b.borrowDate.getFullYear() === d.getFullYear()).length;
            chartData6Months.push({ name, borrowings: count });
        }

        // Popular Categories
        const categoriesRaw = await prisma.category.findMany({
            include: { books: { select: { borrowCount: true } } }
        });
        const popularCategories = categoriesRaw.map(cat => ({
            name: cat.name,
            borrows: cat.books.reduce((sum, book) => sum + book.borrowCount, 0)
        })).sort((a, b) => b.borrows - a.borrows).slice(0, 5);

        // Book Inventory Preview
        const inventoryPreviewRaw = await prisma.book.findMany({
            take: 6,
            orderBy: { dateAdded: 'desc' },
            include: {
                authors: { include: { author: true } },
                category: true
            }
        });

        const inventoryPreview = inventoryPreviewRaw.map(b => ({
            id: b.id,
            title: b.title,
            author: b.authors.map((a: any) => a.author.name).join(', ') || 'Unknown',
            category: b.category?.name || 'Uncategorized',
            availableCopies: b.availableCopies,
            totalCopies: b.totalCopies,
            status: b.availableCopies > 0 ? 'In Stock' : 'Out of Stock'
        }));

        res.json({
            stats: {
                totalBooks,
                availableBooks,
                borrowedBooks,
                totalBookTitles,
                activeIssues,
                overdueBorrows,
                totalMembers,
                totalReservations,
                recentAdditions,
                availablePercent: totalBooks > 0 ? Math.round((availableBooks / totalBooks) * 100) : 100,
            },
            chartData: {
                '7d': chartData7Days,
                '30d': chartData30Days,
                '6m': chartData6Months
            },
            popularCategories,
            inventoryPreview,
            recentTransactions,
            overdueRecords,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
