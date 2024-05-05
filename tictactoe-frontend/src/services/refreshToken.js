import { CognitoUser, CognitoUserSession, AuthenticationDetails } from "amazon-cognito-identity-js";
import userPool from '../userpool';
import { useCookies } from 'react-cookie';
import { useEffect } from "react";

// export function getSessionService() {
//     const cognitoUser = userPool.getCurrentUser();
//     return new Promise<CognitoUserSession>((resolve, reject) => {
//       if (!cognitoUser) {
//         reject(new Error("No user found"));
//         return;
//       }
//       cognitoUser.getSession((err, session) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         if (!session) {
//           reject(new Error("No session found"));
//           return;
//         }
//         resolve(session);
//       })
//     })
//   }
  
  export const useRefreshTokenService = (username) => {
    const [cookies, setCookie] = useCookies(['user-token', 'refresh-token']);


    useEffect(() => {
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

            cognitoUser.getSession(async (err, session) => {
                console.log("Session: ", session);
                if (err) {
                    console.log("Error getting session: ", err);
                    return;
                }

                if (!session.isValid() || cookies['user-token'] !== session.getAccessToken().getJwtToken()) {
                    const refreshToken = session.getRefreshToken();

                    if (!refreshToken) {
                        console.log("No refresh token found");
                        return;
                    }

                    cognitoUser.refreshSession(refreshToken, (err, session) => {
                        if (err) {
                            console.log("Error refreshing token: ", err);
                            return;
                        }
                        console.log("Access token has been successfully refreshed!");
                        setCookie('user-token', session.getAccessToken().getJwtToken(), { path: '/', maxAge: 3600 * 24 * 30 });
                    });
                }
                else {
                    console.log("Session is valid");
                }
            });
    };
    refreshSession();
    }, [username, cookies, setCookie]);
  }