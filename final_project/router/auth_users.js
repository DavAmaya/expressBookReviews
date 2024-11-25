const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => {
    if (isValid(username)) {
        // Filter the users array for any user with the same username and password
        let validusers = users.filter((user) => {
            return (user.username === username && user.password === password);
        });
        // Return true if any valid user is found, otherwise false
        if (validusers.length > 0) {
            return true;
        } else {
            return false;
        }
    }
    return false
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.query.review;
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (username && isbn) {
         // Check if the book exists in the collection
         if (books[isbn]) {
            if (!books[isbn].review) {
                books[isbn].review = {};
            }

            // Add or update the review for the user
            books[isbn].review[username] = review;

            return res.send(`The review for the book with ISBN ${isbn} has been added/updated.`)
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } else {
        return res.status(403).json({ message: "Customer not logged in" });
    }
});

//DELETE user review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (username && isbn) {
        // Check if the book exists in the collection
        if (books[isbn]) {
            delete books[isbn].reviews[username];
       return res.send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`)
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } else {
        return res.status(403).json({ message: "Customer not logged in" });
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
