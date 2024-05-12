import { CognitoUser, CognitoRefreshToken } from "amazon-cognito-identity-js";
import userPool from '../userpool';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from "react";

export function getSessionService() {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
        return Promise.reject(new Error("No user found"));
    }

    return new Promise((resolve, reject) => {
        cognitoUser.getSession((err, session) => {
            if (err) {
                reject(err);
                return;
            }
            if (!session || !session.isValid()) {
                reject(new Error("No valid session found"));
                return;
            }
            resolve(session);
        });
    });
}

export const useSaveRefreshTokenService = () => {
    const [cookies, setCookie] = useCookies(['refresh-token']);

    useEffect(() => {
        const saveRefreshToken = async () => {
            try {
                const session = await getSessionService();
                if (session) {
                    const refreshToken = session.getRefreshToken().getToken();
                    setCookie('refresh-token', refreshToken, { path: '/', maxAge: 3600 * 24 * 30 });
                }
            } catch (error) {
                console.error("Error saving refresh token: ", error);
            }
        };
        saveRefreshToken();
    }, [setCookie]);
}

export const useRefreshTokenService = (username) => {
    const [cookies, setCookie] = useCookies(['user-token', 'refresh-token']);
    const [lastRefresh, setLastRefresh] = useState(0);

    useEffect(() => {
        const now = Date.now();
        const oneMinute = 60 * 1000;

        if (now - lastRefresh < oneMinute) {
            return;
        }

        const refreshSession = async () => {
            console.log("Checking token...");

            if (!username) {
                console.error("No username found");
                return;
            }

            const cognitoUser = new CognitoUser({
                Username: username,
                Pool: userPool
            });

            if (!cognitoUser) {
                console.error("No user found");
                return;
            }

            const refreshTokenString = cookies['refresh-token'];

            if (!refreshTokenString) {
                console.log("No refresh token found");
                return;
            }

            const RefreshToken = new CognitoRefreshToken({ RefreshToken: refreshTokenString });

            cognitoUser.refreshSession(RefreshToken, (err, session) => {
                if (err) {
                    console.error("Error refreshing token: ", err);
                    return;
                }

                console.log("Session refreshed: ", session);
                if (session.isValid() && cookies['user-token'] != session.getAccessToken().getJwtToken()) {
                    setCookie('user-token', session.getAccessToken().getJwtToken(), { path: '/', maxAge: 3600 * 24 * 30 });
                    // console.log("Token has been successfully refreshed!");
                    // console.log("New Access Token: ", cookies['user-token']);
                    setLastRefresh(Date.now());
                    // window.location.reload(); // Added now
                }
            });
        };
        refreshSession();
    }, [username]);
}
