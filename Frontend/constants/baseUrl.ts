import Constants from "expo-constants";

export const getDevServerUrl = () => {
    const manifest = Constants.manifest2 || Constants.manifest;
    const hostUri = (manifest as any)?.extra?.expoClient?.hostUri;
    if (hostUri) {
        const devServer = hostUri.split(':').slice(0, -1).join(':');
        return `http://${devServer}:5000`;
    }
    return 'http://192.168.1.100:5000';  // Replace with actual IP
};

export const BASE_URL = getDevServerUrl();
