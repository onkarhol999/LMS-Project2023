import { configureStore } from "@reduxjs/toolkit";

import authSliceReducer from './Slice/AuthSlice';
import courseSliceReducer from './Slice/CourseSlice';
import razorpaySliceReducer from './Slice/RazorpaySlice';
import stateSliceReducer from './Slice/StatSlice';
const store  = configureStore({
    reducer: {
        auth: authSliceReducer,
        course: courseSliceReducer,
        razorpay: razorpaySliceReducer,
        stat:stateSliceReducer
    },
    devTools: true
});

export default store;