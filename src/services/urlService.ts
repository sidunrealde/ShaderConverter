export const UrlService = {
    encode: (code: string) => {
        return btoa(code); // Simple Base64 for now
    },
    decode: (hash: string) => {
        try {
            return atob(hash);
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};
