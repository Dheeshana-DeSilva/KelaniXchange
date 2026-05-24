import api from "./api";

export const createReport = async (data) => {
    const res = await api.post("/reports", data);
    return res.data;
};

export const getMyReports = async () => {
    const res = await api.get("/reports/my-reports");
    return res.data;
};
