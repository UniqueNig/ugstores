// import { jwtDecode } from "jwt-decode";

// type TokenPayload = {
//   exp: number;
// };

// export const isTokenExpired = (token: string) => {
//   try {
//     const decoded = jwtDecode<TokenPayload>(token);

//     const currentTime = Date.now() / 1000;

//     return decoded.exp < currentTime;
//   } catch (err) {
//     return true; // invalid token = treat as expired
//   }
// };

import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  exp: number;
};

export const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};