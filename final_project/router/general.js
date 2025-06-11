const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(409).json({message: "User already exists!"});
        }
    }
    return res.status(400).json({message: "Username and password are required"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Send JSON response with formatted books data
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Retrieve the isbn parameter from the request URL and send the corresponding book's details
    const isbn = req.params.isbn;
    
    // Fixed: Add error handling for non-existent books
    if (books[isbn]) {
        res.send(books[isbn]);
    } else {
        res.status(404).json({message: "Book not found"});
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
    
    // Iterate over all books
    for (const isbn in books) {
        if (books[isbn].author === author) {
            // Fixed: Include ISBN in the response for better identification
            matchingBooks.push({...books[isbn], isbn: isbn});
        }
    }
    
    if (matchingBooks.length > 0) {
        res.status(200).json({ booksByAuthor: matchingBooks });
    } else {
        res.status(404).json({ message: "No books found by this author." });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];

    // Iterate over all books
    for (const isbn in books) {
        if (books[isbn].title === title) {
            // Fixed: Include ISBN in the response for better identification
            matchingBooks.push({...books[isbn], isbn: isbn});
        }
    }
    
    if (matchingBooks.length > 0) {
        res.status(200).json({ booksByTitle: matchingBooks });
    } else {
        res.status(404).json({ message: "No books found by this title." });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn]) {
        // Fixed: Handle case where reviews might be undefined
        const reviews = books[isbn].reviews || {};
        res.status(200).json({ reviews: reviews });
    } else {
        res.status(404).json({ message: "Book not found." });
    }
});

// Get all books using async callback function
public_users.get('/async/books', function (req, res) {
    // Simulate async operation with Promise
    const getAllBooksAsync = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(books);
                } catch (error) {
                    reject(error);
                }
            }, 100);
        });
    };
    
    getAllBooksAsync()
        .then(booksData => {
            res.status(200).json(booksData);
        })
        .catch(error => {
            res.status(500).json({message: "Error fetching books"});
        });
});

// Get book details based on ISBN using async callback
public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    const getBookByISBNAsync = (isbn) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject(new Error("Book not found"));
                }
            }, 100);
        });
    };
    
    getBookByISBNAsync(isbn)
        .then(book => {
            res.status(200).json(book);
        })
        .catch(error => {
            res.status(404).json({message: error.message});
        });
});

// Get book details based on Author using async callback
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const getBooksByAuthorAsync = (author) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const matchingBooks = [];
                    for (const isbn in books) {
                        if (books[isbn].author === author) {
                            matchingBooks.push({...books[isbn], isbn: isbn});
                        }
                    }
                    if (matchingBooks.length > 0) {
                        resolve(matchingBooks);
                    } else {
                        reject(new Error("No books found by this author"));
                    }
                }, 100);
            });
        };
        
        const matchingBooks = await getBooksByAuthorAsync(author);
        res.status(200).json({ booksByAuthor: matchingBooks });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Get book details based on Title using async callback
public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    
    try {
        const getBooksByTitleAsync = (title) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const matchingBooks = [];
                    for (const isbn in books) {
                        if (books[isbn].title === title) {
                            matchingBooks.push({...books[isbn], isbn: isbn});
                        }
                    }
                    if (matchingBooks.length > 0) {
                        resolve(matchingBooks);
                    } else {
                        reject(new Error("No books found by this title"));
                    }
                }, 100);
            });
        };
        
        const matchingBooks = await getBooksByTitleAsync(title);
        res.status(200).json({ booksByTitle: matchingBooks });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports.general = public_users;