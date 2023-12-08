import { configureStore } from "@reduxjs/toolkit";

import authSliceReducer from './Slice/AuthSlice';
import courseSliceReducer from './Slice/CourseSlice';
import razorpaySliceReducer from './Slice/RazorpaySlice';
const store  = configureStore({
    reducer: {
        auth: authSliceReducer,
        course: courseSliceReducer,
        razorpay: razorpaySliceReducer,
    },
    devTools: true
});

export default store;