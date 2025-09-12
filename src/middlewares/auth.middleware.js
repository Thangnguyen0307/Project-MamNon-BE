import { jwtUtils } from "../utils/jwt.util.js";    

//How to use: 
// 1. Authenticate user: app.use(authenticate);
// 2. Authorize user: app.use(authorize(['admin', 'user']));

// Middleware to authenticate user by verifying JWT token
export const authenticate = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    if ( !authHeader) {
        return res.status(401).json({ message: "Thiếu token" });
    }

    // Bearer tokenString
    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwtUtils.verifyAccessToken(token);
        // Attach user info to request
        req.payload = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};


// Middleware to authorize user based on roles
export const authorize = ( roles = [] ) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.payload || !req.payload.role) {
            return res.status(403).json({ message: "Không có quyền truy cập" });
        }

        // Check if user role is authorized
        if (roles.length && !roles.includes(req.payload.role)) {
            return res.status(403).json({ message: "Không có quyền truy cập" });
        }
        next();
    }
};