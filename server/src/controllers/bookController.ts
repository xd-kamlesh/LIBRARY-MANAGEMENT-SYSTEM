import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Premium abstract images to replace the generic placeholder rectangles globally
const PREMIUM_COVERS = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1634128221889-82ed6ef827ce?q=80&w=800&auto=format&fit=crop',
];

// Helper to map a raw Prisma book to the frontend shape
const mapBook = (b: any) => {
    let displayCover = b.coverImage;
    if (displayCover && displayCover.includes('dummyimage.com')) {
        const titleTitle = b.title || '';
        const hash = (titleTitle.length + (titleTitle.charCodeAt(0) || 0) + (titleTitle.charCodeAt(titleTitle.length - 1) || 0)) % PREMIUM_COVERS.length;
        displayCover = PREMIUM_COVERS[hash];
    }

    return {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        author: b.authors?.map((a: any) => a.author?.name).join(', ') || 'Unknown',
        authorIds: b.authors?.map((a: any) => a.author?.id) || [],
        coverImageUrl: displayCover,
        description: b.description,
        isbn: b.isbn,
        publicationYear: b.publicationYear,
        language: b.language,
        edition: b.edition,
        shelfLocation: b.shelfLocation,
        availableCopies: b.availableCopies,
        totalCopies: b.totalCopies,
        averageRating: b.averageRating,
        reviewCount: b.reviewCount,
        borrowCount: b.borrowCount,
        popularityScore: b.popularityScore,
        category: b.category?.name || 'General',
        categoryId: b.categoryId,
        publisher: b.publisher?.name || 'Unknown',
        publisherId: b.publisherId,
    };
};

const bookInclude = {
    category: true,
    authors: { include: { author: true } },
    publisher: true,
};

// @desc    Search books with full-text keyword, category filter, language filter, and pagination
// @route   GET /api/books/search?q=&category=&language=&page=&limit=
export const searchBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = (req.query.q as string) || '';
        const categoryId = typeof req.query.category === 'string' ? req.query.category : undefined;
        const language = typeof req.query.language === 'string' ? req.query.language : undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (q) {
            where.OR = [
                { title: { contains: q } },
                { description: { contains: q } },
                { isbn: { contains: q } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (language) {
            where.language = language;
        }

        const [books, total] = await Promise.all([
            prisma.book.findMany({
                where,
                include: bookInclude,
                skip,
                take: limit,
                orderBy: { popularityScore: 'desc' },
            }),
            prisma.book.count({ where }),
        ]);

        res.json({
            books: books.map(mapBook),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Search API Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all categories with book counts
// @route   GET /api/books/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { books: true } } },
            orderBy: { name: 'asc' },
        });
        res.json(categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            bookCount: c._count.books,
        })));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get books by category
// @route   GET /api/books/category/:categoryId
export const getBooksByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const [books, total, category] = await Promise.all([
            prisma.book.findMany({
                where: { categoryId: categoryId as string },
                include: bookInclude,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { popularityScore: 'desc' },
            }),
            prisma.book.count({ where: { categoryId: categoryId as string } }),
            prisma.category.findUnique({ where: { id: categoryId as string } }),
        ]);

        res.json({
            category: category?.name || 'Unknown',
            books: books.map(mapBook),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get author details + their books
// @route   GET /api/books/author/:authorId
export const getAuthorBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { authorId } = req.params;
        const author = await prisma.author.findUnique({
            where: { id: authorId as string },
            include: {
                books: {
                    include: {
                        book: { include: bookInclude }
                    }
                }
            }
        });

        if (!author) {
            res.status(404).json({ message: 'Author not found' });
            return;
        }

        res.json({
            id: author.id,
            name: author.name,
            bio: author.bio,
            books: (author as any).books.map((ba: any) => mapBook(ba.book)),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get related books for a given book (same category, excluding self)
// @route   GET /api/books/:id/related
export const getRelatedBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: req.params.id as string },
            select: { categoryId: true, id: true },
        });

        if (!book) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }

        const related = await prisma.book.findMany({
            where: {
                categoryId: book.categoryId,
                id: { not: book.id },
            },
            include: bookInclude,
            take: 10,
            orderBy: { popularityScore: 'desc' },
        });

        res.json(related.map(mapBook));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get AI-style recommendations based on user's borrow history categories
// @route   GET /api/books/recommendations/:userId
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // 1. Find categories the user has borrowed from
        const borrowedBooks = await prisma.borrowRecord.findMany({
            where: { userId: userId as string },
            include: { book: { select: { categoryId: true, id: true } } },
        });

        const borrowedBookIds = borrowedBooks.map((b: any) => b.book.id);
        const categoryIds = [...new Set(borrowedBooks.map((b: any) => b.book.categoryId).filter(Boolean))] as string[];

        let recommendedBooks;
        if (categoryIds.length > 0) {
            // Recommend books from same categories user has borrowed, excluding already borrowed
            recommendedBooks = await prisma.book.findMany({
                where: {
                    categoryId: { in: categoryIds },
                    id: { notIn: borrowedBookIds },
                },
                include: bookInclude,
                take: 20,
                orderBy: { popularityScore: 'desc' },
            });
        } else {
            // Fallback: top-rated books
            recommendedBooks = await prisma.book.findMany({
                include: bookInclude,
                take: 20,
                orderBy: { averageRating: 'desc' },
            });
        }

        res.json(recommendedBooks.map(mapBook));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get the Explore dashboard state (bucketed data for the Netflix-style home)
// @route   GET /api/books/explore
export const getExploreBooks = async (_req: Request, res: Response): Promise<void> => {
    try {
        const books = await prisma.book.findMany({
            include: bookInclude,
            take: 200,
            orderBy: { popularityScore: 'desc' },
        });

        const formatted = books.map(mapBook);

        // Algorithmic bucketing
        const trending = formatted.slice(0, 12);
        const recentlyAdded = [...formatted].sort(() => 0.5 - Math.random()).slice(0, 10);
        const mostBorrowed = [...formatted].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 10);
        const aiRecs = [...formatted].sort(() => 0.5 - Math.random()).slice(0, 8);
        const continueReading = formatted.slice(0, 5);
        const newReleases = [...formatted].sort((a, b) => b.publicationYear - a.publicationYear).slice(0, 10);

        // Category bucketing
        const programming = formatted.filter(b => b.category === 'Technology' || b.category === 'Web Development');
        const science = formatted.filter(b => b.category === 'Science');
        const fantasy = formatted.filter(b => b.category === 'Fantasy');
        const history = formatted.filter(b => b.category === 'History');
        const selfHelp = formatted.filter(b => b.category === 'Self Help');

        res.json({
            trending,
            recentlyAdded,
            mostBorrowed,
            aiRecs,
            continueReading,
            newReleases,
            programming: programming.length > 0 ? programming.slice(0, 8) : formatted.slice(0, 6),
            science: science.length > 0 ? science.slice(0, 8) : formatted.slice(0, 6),
            fantasy: fantasy.length > 0 ? fantasy.slice(0, 8) : formatted.slice(0, 6),
            history: history.length > 0 ? history.slice(0, 8) : formatted.slice(0, 6),
            selfHelp: selfHelp.length > 0 ? selfHelp.slice(0, 8) : formatted.slice(0, 6),
        });
    } catch (error) {
        console.error("Explore API Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get book by ID with full details
// @route   GET /api/books/:id
export const getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: req.params.id as string },
            include: {
                ...bookInclude,
                galleryImages: true,
                reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
                ratings: true,
            }
        });
        if (book) {
            res.json({
                ...mapBook(book),
                reviews: book.reviews.map(r => ({
                    id: r.id,
                    content: r.content,
                    userName: r.user.name,
                    createdAt: r.createdAt,
                })),
                galleryImages: book.galleryImages.map(g => g.imageUrl),
            });
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all raw books (librarian use)
// @route   GET /api/books
export const getBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const keyword = req.query.keyword as string;
        const queryArgs: any = keyword ? {
            where: {
                OR: [
                    { title: { contains: keyword } },
                    { description: { contains: keyword } },
                ]
            }
        } : undefined;
        const books = await prisma.book.findMany({ ...queryArgs, include: bookInclude, take: 50 });
        res.json(books.map(mapBook));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Create a new book
// @route   POST /api/books
export const createBook = async (req: Request, res: Response): Promise<void> => {
    const { title, description, isbn, publicationYear, language, shelfLocation, coverImage } = req.body;
    try {
        const book = await prisma.book.create({
            data: { title, description, isbn, publicationYear, language, shelfLocation, coverImage, totalCopies: 1, availableCopies: 1 },
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update a book
// @route   PUT /api/books/:id
export const updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const book = await prisma.book.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
        await prisma.book.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Book removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
