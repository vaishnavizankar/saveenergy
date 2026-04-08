import { signIn, confirmSignIn, signOut, fetchAuthSession } from 'aws-amplify/auth';

/**
 * AWS Cognito Authentication Service
 * Supports MFA, Multi-User Roles, and Secure Session Management
 */
export const awsAuthService = {
  
  // 1. Multi-User Login with MFA Support
  login: async (email, password) => {
    try {
      console.log(`[Cognito] Attempting login for: ${email}`);
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      return { isSignedIn, nextStep }; 
      // nextStep will be 'CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE' if MFA is enabled
    } catch (error) {
      console.error('[Auth Error]', error);
      throw error;
    }
  },

  // 2. MFA Challenge Verification
  confirmMFA: async (challengeResponse) => {
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse });
      return { isSignedIn, nextStep };
    } catch (error) {
      console.error('[MFA Error]', error);
      throw error;
    }
  },

  // 3. User Attribute & Role Mapping
  getUserRole: async () => {
    try {
      const session = await fetchAuthSession();
      const groups = session.tokens.idToken.payload['cognito:groups'] || [];
      return groups.includes('Admins') ? 'admin' : 'viewer';
    } catch (error) {
      return 'viewer';
    }
  },

  // 4. Secure Session Termination
  logout: async () => {
    await signOut();
    localStorage.removeItem('user_role');
  }
};
