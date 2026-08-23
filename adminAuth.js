const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                message: 'נדרש טוקן התחברות'
            });

        }


        if (!authHeader.startsWith('Bearer ')) {

            return res.status(401).json({
                message: 'פורמט טוקן לא תקין'
            });

        }


        const token =
            authHeader.split(' ')[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.admin = decoded;


        next();

    } catch (error) {

        console.error(
            'Admin authentication error:',
            error
        );


        return res.status(401).json({

            message: 'טוקן לא תקין או שפג תוקפו'

        });

    }

};


module.exports = adminAuth;