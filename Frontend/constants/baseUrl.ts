import Constants from "expo-constants";

export const getDevServerUrl = () => {
    // const manifest = Constants.manifest2 || Constants.manifest;
    // const hostUri = (manifest as any)?.extra?.expoClient?.hostUri;
    // if (hostUri) {
    //     const devServer = hostUri.split(':').slice(0, -1).join(':');
    //     return `http://3.87.239.199:4000/`;
    // }
    return 'http://3.87.239.199:4000';
};


export const getDevServerUrlAI = () => {
    // const manifest = Constants.manifest2 || Constants.manifest;
    // const hostUri = (manifest as any)?.extra?.expoClient?.hostUri;
    // if (hostUri) {
    //     const devServer = hostUri.split(':').slice(0, -1).join(':');
    //     return `http://http://44.201.123.56:5000/`;
    // }
    return "http://44.201.123.56:5000"
};

export const BASE_URL = getDevServerUrl();

export const BASE_URL_AI = getDevServerUrlAI();

