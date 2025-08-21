const jwt = require('jsonwebtoken');

const validateToken = async (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({
            message: "Token is Missing"
        })
    }

    try {
        const decoded = await jwt.verify(token, process.env.FORGOT_PASSWORD_SECRET);
        req.userId = decoded.userId;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(498).json({ message: "Your session has expired. Please request a new password reset link." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(498).json({ message: "The password reset token is invalid. Please ensure you have the correct link or request a new one." });
        } else {
            return res.status(498).json({ message: "An error occurred while processing your request. Please try again later." });
        }

    }
}

module.exports = validateToken