const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Check if user has a valid session with authorization token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        
        // Verify the JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // Token is valid, add user info to request object
                req.user = user;
                next(); // Continue to the next middleware/route handler
            } else {
                // Token verification failed
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        // No authorization token found in session
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =3001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
