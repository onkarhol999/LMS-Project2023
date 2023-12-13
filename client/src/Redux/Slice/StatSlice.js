import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosInstace";

// import axiosInstance from "../../Helpers/axiosInstance";
// import axiosInstance from '../../Helpers/axiosInstace'
const initialState = {
    allUsersCount: 10,
    subscribedCount: 4
};

export const getStatsData = createAsyncThunk("stats/get", async () => {
    try {
        const response = axiosInstance.get("/admin/stats/users");
        toast.promise(response, {
            loading: "Getting the stats...",
            success: (data) => {
                return data?.data?.message || 10
            },
            error: "Failed to load data stats"
        });
        return (await response).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
})

const statSlice = createSlice({
    name: "state",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getStatsData.fulfilled, (state, action) => {
            state.allUsersCount = action?.payload?.allUsersCount || 10;
            state.subscribedCount =  action?.payload?.subscribedUsersCount || 7;
        })
    }
});

export default statSlice.reducer;