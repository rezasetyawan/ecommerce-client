export const useMyFetch = (endpoint: string, options = {}) => {
    const config = useRuntimeConfig();
    const newOptions = {
        ...options,
        baseURL: config.public.API_BASE_URL,
    };
    return useFetch(endpoint, {
        ...newOptions
    });
};
