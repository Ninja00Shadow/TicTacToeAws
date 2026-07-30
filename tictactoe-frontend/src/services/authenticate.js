import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import userPool from '../userpool';

export const authenticate = (username, password) => new Promise((resolve, reject) => {
  const user = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  user.authenticateUser(authDetails, {
    onSuccess: resolve,
    onFailure: reject,
  });
});
