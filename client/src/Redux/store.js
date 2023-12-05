import { configureStore } from "@reduxjs/toolkit";

import authSliceReducer from './Slice/AuthSlice';
import courseSliceReducer from './Slice/CourseSlice'
const store  = configureStore({
    reducer: {
        auth: authSliceReducer,
        course: courseSliceReducer
    },
    devTools: true
});

export default store;