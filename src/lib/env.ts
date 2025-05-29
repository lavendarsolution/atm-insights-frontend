const env = {
  BACKEND_URL: import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000",
};

export default env;
