const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

// Fixed: Changed middleware path from "/customer" to "/auth/*" to match the route structure
regd_users.use("/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Fixed: Use 400 for bad request instead of 404
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        
        req.session.authorization = {
            accessToken, 
            username
        }
        return res.status(200).json({ 
            message: "User successfully logged in",
            token: accessToken
        });
    } else {
        // Fixed: Use 401 (Unauthorized) instead of 208 for invalid credentials
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;
    
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
    
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }
    
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    // Initialize reviews object if it doesn't exist
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    
    // Check if the user already has a review for this book
    if (books[isbn].reviews[username]) {
        // Modify existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `Review modified for ISBN ${isbn}` });
    } else {
        // Add new review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `Review added for ISBN ${isbn}` });
    }
});

// Delete a book review (Task 9)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
    
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
    
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found or you don't have permission to delete this review" });
    }
    
    // Delete the user's review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `Review deleted for ISBN ${isbn}` });
});

// Get all reviews for a specific book (bonus endpoint)
regd_users.get("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    const reviews = books[isbn].reviews || {};
    return res.status(200).json({ 
        isbn: isbn,
        book: books[isbn].title,
        reviews: reviews 
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;