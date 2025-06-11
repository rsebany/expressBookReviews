const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Middleware to authenticate requests to protected endpoints
regd_users.use(function auth(req, res, next)  {
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

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({ 
            message: "User successfully logged in",
            token: accessToken
        });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.session.authorization?.username;

    // Validation checks
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
    
    if (!reviewText || reviewText.trim() === "") {
        return res.status(400).json({ message: "Review content is required" });
    }
    
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Initialize reviews object if it doesn't exist
    books[isbn].reviews = books[isbn].reviews || {};

    // Check for existing review by this user
    const existingReview = books[isbn].reviews[username];
    books[isbn].reviews[username] = reviewText.trim();

    const response = {
        isbn: isbn,
        username: username,
        review: reviewText.trim()
    };

    if (existingReview) {
        return res.status(200).json({
            message: "Review modified successfully",
            data: response
        });
    } else {
        return res.status(201).json({
            message: "Review added successfully",
            data: response
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;