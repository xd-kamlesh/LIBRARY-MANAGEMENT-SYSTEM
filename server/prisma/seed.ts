import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generatePlaceholder = (text: string, categoryIndex: number) => {
    const colors = [
        '1d4ed8', '047857', 'b45309', '6d28d9', 'be123c', '0f172a', '8b5cf6', '0ea5e9', 'd97706', '10b981', '7c3aed', 'db2777'
    ];
    const c = colors[categoryIndex % colors.length];
    return `https://placehold.co/800x1200/${c}/fff?text=${encodeURIComponent(text)}`;
};

async function main() {
    console.log("Wiping existing database to ensure pure seed states...");
    await prisma.borrowRecord.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.bookCopy.deleteMany();
    await prisma.bookAuthor.deleteMany();
    await prisma.review.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.readingHistory.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.category.deleteMany();
    await prisma.publisher.deleteMany();
    await prisma.user.deleteMany();

    console.log("Spawning Users...");
    const admin = await prisma.user.create({
        data: { name: 'Librarian Head', email: 'admin@lumina.edu', password: 'password123', role: 'LIBRARIAN' }
    });

    const student = await prisma.user.create({
        data: { name: 'Alex Mercer', email: 'alex@lumina.edu', password: 'password123', role: 'STUDENT' }
    });

    console.log("Generating 25 Categories...");
    const categoryNames = [
        'Technology', 'Science', 'Fantasy', 'Artificial Intelligence', 'Web Development',
        'History', 'Self Help', 'Psychology', 'Biotechnology', 'Cybersecurity',
        'Romance', 'Mystery', 'Thriller', 'Horror', 'Cookbooks',
        'Philosophy', 'Economics', 'Art & Design', 'Architecture', 'Astronomy',
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Literature'
    ];
    const createdCategories = await Promise.all(categoryNames.map(name => prisma.category.create({ data: { name } })));

    console.log("Generating 150 Authors...");
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Edward', 'Stephanie'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

    const authorsData = [];
    for (let i = 0; i < 150; i++) {
        authorsData.push({
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            bio: "A highly acclaimed author known for significant contributions to literature."
        });
    }

    // We need their IDs, so we insert one by one or createMany and fetch. Let's create one by one using map Promise.all (it's fast enough for 150)
    const createdAuthors = await Promise.all(authorsData.map(a => prisma.author.create({ data: a })));

    console.log("Generating 50 Publishers...");
    const pubWords1 = ['Global', 'Pioneer', 'Horizon', 'Summit', 'Apex', 'Core', 'Prime', 'Zenith', 'NextGen', 'Quantum'];
    const pubWords2 = ['Press', 'Media', 'Publishing', 'Books', 'House', 'Group', 'Publications'];

    const publishersData = [];
    for (let i = 0; i < 50; i++) {
        publishersData.push({
            name: `${pubWords1[Math.floor(Math.random() * pubWords1.length)]} ${pubWords2[Math.floor(Math.random() * pubWords2.length)]}`,
            location: "New York, USA"
        });
    }
    const createdPublishers = await Promise.all(publishersData.map(p => prisma.publisher.create({ data: p })));

    console.log("Loading Real Books...");
    const realBooksData = require('./realBooks.json');
    const langs = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Hindi'];

    const booksToCreate = [];
    for (let i = 0; i < realBooksData.length; i++) {
        const row = realBooksData[i];
        const cat = createdCategories.find(c => c.name.includes(row.category)) || createdCategories[Math.floor(Math.random() * createdCategories.length)];
        const pub = createdPublishers[Math.floor(Math.random() * createdPublishers.length)];

        // Generate specific cover URL using Open Library
        const coverImageUrl = row.isbn ? `https://covers.openlibrary.org/b/isbn/${row.isbn}-L.jpg` : ``;

        booksToCreate.push({
            id: crypto.randomUUID(),
            title: row.title,
            description: `A critically acclaimed essential read. ${row.title} by ${row.author} sits among the greatest works in the ${row.category} genre.`,
            isbn: row.isbn,
            publicationYear: row.year,
            language: 'English',
            shelfLocation: `${row.category.substring(0, 1).toUpperCase()}-${Math.floor(Math.random() * 100)}`,
            coverImage: coverImageUrl,
            popularityScore: Math.random() * 10,
            averageRating: Number((Math.random() * 1 + 4).toFixed(1)), // 4.0 to 5.0
            reviewCount: Math.floor(Math.random() * 200),
            borrowCount: Math.floor(Math.random() * 500),
            categoryId: (cat?.id) as string,
            publisherId: (pub?.id) as string,
            totalCopies: 0,
            availableCopies: 0
        });
    }

    // Insert books using createMany
    console.log("Inserting Books Batch...");
    const CHUNK_SIZE = 250;
    for (let i = 0; i < booksToCreate.length; i += CHUNK_SIZE) {
        await prisma.book.createMany({
            data: booksToCreate.slice(i, i + CHUNK_SIZE)
        });
    }

    console.log("Generating Relations: BookAuthors, BookCopies...");
    const bookAuthorsToCreate = [];
    const bookCopiesToCreate = [];

    let copyIdCounter = 1;
    for (const book of booksToCreate) {
        // Link 1 to 3 authors
        const numAuthors = Math.floor(Math.random() * 3) + 1;
        const assignedAuthors = new Set();
        for (let a = 0; a < numAuthors; a++) {
            const author = createdAuthors[Math.floor(Math.random() * createdAuthors.length)];
            if (author && !assignedAuthors.has(author.id)) {
                assignedAuthors.add(author.id);
                bookAuthorsToCreate.push({ bookId: book.id, authorId: author.id });
            }
        }

        // Create 1 to 5 copies
        const numCopies = Math.floor(Math.random() * 5) + 1;
        book.totalCopies = numCopies;
        book.availableCopies = numCopies;

        for (let c = 0; c < numCopies; c++) {
            bookCopiesToCreate.push({
                id: crypto.randomUUID(),
                bookId: book.id,
                condition: Math.random() > 0.8 ? 'NEW' : 'GOOD',
                isAvailable: true
            });
        }
    }

    console.log("Inserting BookAuthors...");
    for (let i = 0; i < bookAuthorsToCreate.length; i += CHUNK_SIZE) {
        await prisma.bookAuthor.createMany({ data: bookAuthorsToCreate.slice(i, i + CHUNK_SIZE) });
    }

    console.log("Inserting BookCopies...");
    for (let i = 0; i < bookCopiesToCreate.length; i += CHUNK_SIZE) {
        await prisma.bookCopy.createMany({ data: bookCopiesToCreate.slice(i, i + CHUNK_SIZE) });
    }

    // Update books with their copy counts
    console.log("Updating Book copy counts...");
    // We update individually but concurrently using Promise.all in batches
    for (let i = 0; i < booksToCreate.length; i += CHUNK_SIZE) {
        await Promise.all(
            booksToCreate.slice(i, i + CHUNK_SIZE).map(b =>
                prisma.book.update({
                    where: { id: b.id },
                    data: { totalCopies: b.totalCopies, availableCopies: b.availableCopies }
                })
            )
        );
    }

    console.log("Generating Interactions: Reviews, BorrowRecords, etc.");
    const reviewsToCreate = [];
    const borrowsToCreate = [];
    const wishlistsToCreate = [];

    // Taking all books to generate heavy interaction data
    const activeBooks = booksToCreate;

    for (const book of activeBooks) {
        // Reviews
        const numReviews = Math.floor(Math.random() * 3);
        const reviewText = ["Great book!", "Highly recommended.", "A bit dry, but informative.", "Must read.", "Changed my perspective."];
        for (let r = 0; r < numReviews; r++) {
            reviewsToCreate.push({
                content: reviewText[Math.floor(Math.random() * reviewText.length)] || "Great book",
                userId: Math.random() > 0.5 ? admin.id : student.id,
                bookId: book.id
            });
        }

        // Borrow Records
        const copiesForThisBook = bookCopiesToCreate.filter(c => c.bookId === book.id);
        if (copiesForThisBook.length > 0) {
            const numBorrows = Math.floor(Math.random() * 2);
            for (let b = 0; b < numBorrows; b++) {
                borrowsToCreate.push({
                    userId: student.id,
                    bookId: book.id,
                    copyId: (copiesForThisBook[Math.floor(Math.random() * copiesForThisBook.length)]?.id) as string,
                    status: 'RETURNED',
                    borrowDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                    dueDate: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
                    returnDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
                });
            }
        }

        // Wishlists
        if (Math.random() > 0.8) {
            wishlistsToCreate.push({
                userId: student.id,
                bookId: book.id
            });
        }
    }

    if (reviewsToCreate.length > 0) {
        await prisma.review.createMany({ data: reviewsToCreate });
    }

    if (borrowsToCreate.length > 0) {
        await prisma.borrowRecord.createMany({ data: borrowsToCreate });
    }

    if (wishlistsToCreate.length > 0) {
        await prisma.wishlist.createMany({ data: wishlistsToCreate });
    }

    console.log("Database perfectly seeded with 1000 realistic records!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
