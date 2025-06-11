# 📚 Book Review RESTful API

A complete Node.js/Express RESTful web service for managing books and user reviews with JWT authentication and session management.

## 🎯 Learning Objectives

This project demonstrates:
- **Session & JWT Authentication** - Secure user registration, login, and authorization for protected operations
- **RESTful Web Services** - Complete CRUD operations following REST principles using Express framework
- **Asynchronous Programming** - Implementation of Promises, callbacks, and async/await for concurrent user interactions

## 🚀 Features

### Public Endpoints (No Authentication Required)
- ✅ View all books
- ✅ Search books by ISBN
- ✅ Search books by Author
- ✅ Search books by Title
- ✅ View book reviews
- ✅ User registration

### Protected Endpoints (Authentication Required)
- 🔐 User login with JWT token generation
- 🔐 Add book reviews
- 🔐 Modify existing reviews
- 🔐 Delete user's own reviews

### Asynchronous Operations
- ⚡ Promise-based book searches
- ⚡ Async/await implementations
- ⚡ Concurrent user support

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Session Management**: express-session
- **Async Programming**: Promises, async/await
- **Data Storage**: In-memory (can be extended to database)

## 📁 Project Structure

```
expressBookReviews/
├── index.js                 # Main server file
├── router/
│   ├── auth_users.js        # Authentication routes
│   ├── general.js           # Public routes
│   └── booksdb.js          # Book data
├── package.json
└── README.md
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rsebany/expressBookReviews
   cd expressBookReviews
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Server runs on**
   ```
   http://localhost:3000
   ```

## 📚 API Documentation

### Authentication Flow

#### 1. Register a New User
```http
POST /register
Content-Type: application/json

{
  "username": "romu",
  "password": "secure123"
}
```

#### 2. Login
```http
POST /customer/login
Content-Type: application/json

{
  "username": "romu",
  "password": "secure123"
}
```

**Response:**
```json
{
  "message": "User successfully logged in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all books |
| GET | `/isbn/:isbn` | Get book by ISBN |
| GET | `/author/:author` | Get books by author |
| GET | `/title/:title` | Get books by title |
| GET | `/review/:isbn` | Get reviews for a book |

### Asynchronous Endpoints (Promise-based)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/async/books` | Get all books (async) |
| GET | `/async/isbn/:isbn` | Get book by ISBN (Promise) |
| GET | `/async/author/:author` | Get books by author (async/await) |
| GET | `/async/title/:title` | Get books by title (async/await) |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/customer/auth/review/:isbn?review=text` | Add/modify review |
| DELETE | `/customer/auth/review/:isbn` | Delete user's review |

## 🔐 Authentication & Authorization Implementation

### Session Management
```javascript
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true, 
    saveUninitialized: true
}));
```

### JWT Token Verification
```javascript
app.use("/customer/auth/*", function auth(req, res, next) {
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
```

## ⚡ Asynchronous Programming Examples

### Using Promises (.then/.catch)
```javascript
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
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({message: error.message}));
```

### Using Async/Await
```javascript
public_users.get('/async/author/:author', async function (req, res) {
    try {
        const matchingBooks = await getBooksByAuthorAsync(author);
        res.status(200).json({ booksByAuthor: matchingBooks });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});
```

## 🧪 Testing the API

### 1. Test User Registration
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### 2. Test User Login
```bash
curl -X POST http://localhost:3000/customer/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  -c cookies.txt
```

### 3. Test Adding a Review (Authenticated)
```bash
curl -X PUT "http://localhost:3000/customer/auth/review/1?review=Excellent%20book!" \
  -b cookies.txt
```

### 4. Test Async Book Search
```bash
curl http://localhost:3000/async/isbn/1
curl http://localhost:3000/async/author/Chinua%20Achebe
```

## 🔄 RESTful Design Principles

| HTTP Method | Operation | Example |
|-------------|-----------|---------|
| GET | Read | `GET /books` - Retrieve all books |
| POST | Create | `POST /register` - Create new user |
| PUT | Update | `PUT /auth/review/:isbn` - Update review |
| DELETE | Delete | `DELETE /auth/review/:isbn` - Delete review |

## 🏗️ Architecture Highlights

### 1. **Separation of Concerns**
- `index.js` - Server setup and middleware configuration
- `auth_users.js` - Authentication logic and protected routes
- `general.js` - Public routes and async implementations

### 2. **Security Features**
- JWT token-based authentication
- Session management for stateful operations
- Route protection middleware
- Input validation

### 3. **Concurrent User Support**
- Non-blocking asynchronous operations
- Promise-based database simulations
- Session isolation per user

## 🚦 HTTP Status Codes Used

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful operations |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Authentication required |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | User already exists |

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Password hashing with bcrypt
- [ ] Rate limiting
- [ ] API versioning
- [ ] Comprehensive unit tests
- [ ] Docker containerization
- [ ] Swagger/OpenAPI documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@rsebany]([https://github.com/yourusername](https://github.com/rsebany))
- LinkedIn: [my LinkedIn](https://www.linkedin.com/in/romualdo-sebany/)

---

⭐ **Star this repository if you found it helpful!**
