import axios from 'axios';

const API = axios.create({
    baseURL: 'https://swiftparker-e2e14-default-rtdb.firebaseio.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default API;