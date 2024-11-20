import axios from "axios";
import Cookies from "js-cookie";

const nodeService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVICE_BASE_URL,
});

const refreshAuthToken = async () => {
  try {
    const response = await axios.post("/api/jwt/refreshToken", null, {
      headers: {
        Authorization: `Bearer ${Cookies.get("refresh-token")}`,
      },
    });
    Cookies.set("access-token", response.data.accessToken, {
      secure: true,
      expires: 7,
    });
    return response.data.accessToken;
  } catch (error) {
    throw error;
  }
};

const requestConfig = (request) => {
  const accessToken = Cookies.get("access-token");
  if (accessToken) request.headers.Authorization = `Bearer ${accessToken}`;

  return request;
};

const requestErrorHandler = (error) => {
  return Promise.reject(error);
};

const responseConfig = (response) => {
  return response;
};

const responseErrorHandler = async (error) => {
  const originalRequest = error.config;
  if (
    error.response &&
    error.response.status === 403 &&
    !originalRequest._retry
  ) {
    originalRequest._retry = true;
    try {
      const newAccessToken = await refreshAuthToken();
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return nodeService(originalRequest);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return Promise.reject(error);
};

nodeService.interceptors.request.use(requestConfig, requestErrorHandler);
nodeService.interceptors.response.use(responseConfig, responseErrorHandler);

export default nodeService;
