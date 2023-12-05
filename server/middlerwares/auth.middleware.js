import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if(!token){
        return next(new AppError('Unauthenticated , Please login again',402))
    }

    const userDetails  = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();
}
const authorizedRoles = (...roles) => async(req,res,next) =>{
   const currentUserRole = req.user.roles;
   if(roles.includes(currentUserRole)){
    return next(new AppError('You do not have permission to access this',403))
   }
   next();
}

const authorizeSubscriber = async(req,res,next) => {

     const subscription = req.user.subscription;
     const currentUserRole = req.user.roles;
     if(currentUserRole !== 'ADMIN' && subscription !== 'active'){
        return next(new AppError('Please Subscribe to access this route..',403))
     }
     next();
}


export{
    isLoggedIn,
    authorizedRoles,
    authorizeSubscriber
}