import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import userPool from '../userpool';
import { useCookies } from 'react-cookie';


export const authenticate = (username, password) => {
    return new Promise((resolve, reject) => {
        const user = new CognitoUser({
            Username: username,
            Pool: userPool
        });

        const authDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });

        user.authenticateUser(authDetails, {
            onSuccess: (result) => {
                console.log('login result:', result);
                resolve(result);
            },
            onFailure: (err) => {
                console.error('onFailure:', err);
                reject(err);
            },
        });
    });

};

// export const refreshAccessToken = async () => {
//     const currentUser = userPool.getCurrentUser();
//     const [token, setToken] = useCookies(['user-token']);
  
//     if (currentUser != null) {
//       currentUser.getSession(async (err, session) => {
//         if (err) {
//           console.error("Error getting session: ", err);
//           return;
//         }
  
//         if (session.isValid()) {
//           console.log("Session is valid!");
//         } else {
//           currentUser.refreshSession(session.getRefreshToken(), (err, session) => {
//             if (err) {
//               console.error("Error refreshing token: ", err);
//             } else {
//               console.log("Access token has been successfully refreshed!");
//               setToken('accessToken', session.getAccessToken().getJwtToken(), { path: '/', maxAge: 3600 * 24 * 30 });
//             }
//           });
//         }
//       });
//     }
//   };


// export const logout = () => {
//     const user = userPool.getCurrentUser();
//     user.signOut();
//     window.location.href = '/';
// }