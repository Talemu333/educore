import axios from "axios";

const api = axios.create({
    baseURL: "https://educore-api-7e1v.onrender.com/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;

// import axios from "axios";

// const api = axios.create({
//     baseURL: "http://localhost:5000/api",
//     withCredentials: true,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// export default api;