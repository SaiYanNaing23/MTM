import jwt from 'jsonwebtoken';

export const generateJwtToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie XSS attack
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Helps to prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;   
};