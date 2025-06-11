const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
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
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Send JSON response with formatted books data
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // Retrieve the isbn parameter from the request URL and send the corresponding book's details
    const isbn = req.params.isbn;
    res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
    // Iterate over all books
    for (const isbn in books) {
        if (books[isbn].author === author) {
            matchingBooks.push(books[isbn]);
        }
    }
    if (matchingBooks.length > 0) {
        res.status(200).json({ booksByAuthor: matchingBooks });
    } else {
        res.status(404).json({ message: "No books found by this author." });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];

    // Iterate over all books
    for (const isbn in books) {
        if (books[isbn].title === title) {
            matchingBooks.push(books[isbn]);
        }
    }
    if (matchingBooks.length > 0) {
        res.status(200).json({ booksByTitle: matchingBooks });
    } else {
        res.status(404).json({ message: "No books found by this title." });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn]) {
        const reviews = books[isbn].reviews;
        res.status(200).json({ reviews: reviews });
    } else {
        res.status(404).json({ message: "Book not found." });
    }
});



module.exports.general = public_users;
