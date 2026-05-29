export const environments = {
  dummyjson: {
    baseURL: process.env.DUMMYJSON_BASE_URL ?? 'https://dummyjson.com',
  },
} as const;
