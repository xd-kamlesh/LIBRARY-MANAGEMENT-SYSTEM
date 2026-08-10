import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'premium_lms_super_secret_key_2024';

export const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ id: userId, role }, JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
};
