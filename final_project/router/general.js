const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "Customer already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});



// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    let fetchBooks = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(JSON.stringify(books, null, 4))
        }, 1000)
    })
    
    fetchBooks
        .then(bookList => {
            res.send(bookList);
        })
        .catch(err => {
            res.status(404).send("Error fetching books: ", err);
        });
});


function fetchBooksByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books[isbn]) {
                resolve(JSON.stringify(books[isbn], null, 4));
            } else {
                reject("Book not found");
            }
        }, 1000);
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn
    fetchBooksByISBN(isbn)
        .then(books => {
            res.send(books);
        })
        .catch(err => {
            res.status(404).send(`Error fetching books by ISBN: ${err}`);
        });
});

function fetchBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let booksByAuthor = [];

            for (const isbn in books) {
                if (books[isbn].author === author) {
                    booksByAuthor.push({
                        isbn: isbn,
                        title: books[isbn].title,
                        reviews: books[isbn].reviews
                    })
                }
            }

            if (booksByAuthor.length > 0) {
                resolve({ booksByAuthor: booksByAuthor })
            }

            reject({ message: "The author could not be found." })
        }, 1000);
    });
}

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    fetchBooksByAuthor(author)
        .then(books => {
            res.send(books)
        }).catch(err => {
            res.status(404).json(err)
        })
});

function fetchBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let booksByTitle = [];

            for (const isbn in books) {
                if (books[isbn].title === title) {
                    booksByTitle.push({
                        isbn: isbn,
                        author: books[isbn].author,
                        reviews: books[isbn].reviews
                    })
                }
            }

            if (booksByTitle.length > 0) {
                resolve({ booksByTitle: booksByTitle })
            }

            reject({ message: "The book title could not be found." })
        }, 1000)
    })
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    fetchBooksByTitle(title).then(books => {
        res.send(books);
    }).catch(err => {
        res.status(404).json(err)
    })

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const review = books[isbn].reviews

    return res.send(review)
});



module.exports.general = public_users;
