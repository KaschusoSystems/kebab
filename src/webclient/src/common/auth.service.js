const TOKEN_KEY = "jwtToken";

export const getToken = () => {
    return window.localStorage.getItem(TOKEN_KEY);
};

export const setToken = token => {
    return window.localStorage.setItem(TOKEN_KEY, token);
};

export const purgeToken = () => {
    return window.localStorage.removeItem(TOKEN_KEY);
};

export default {
    getToken, setToken, purgeToken
};