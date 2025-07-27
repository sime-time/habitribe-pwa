import { ref } from "vue";
import { defineStore } from "pinia";
import { createAuthClient } from "better-auth/vue";
import { emailOTPClient } from "better-auth/client/plugins";
import { useToast } from "vue-toastification";
import type { User } from "better-auth";
import router from "~/router";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [emailOTPClient()],
});

export const useAuthStore = defineStore("useAuthStore", () => {
  const toast = useToast();

  const authenticated = ref(false);
  const user = ref<User | null>(null);
  const loading = ref(false);

  function setAuth(isAuthenticated: boolean, userData: User | null) {
    authenticated.value = isAuthenticated;
    user.value = userData;
  }

  async function checkAuthStatus() {
    try {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        setAuth(true, session.user);
        console.log("User is authenticated");
      } else {
        setAuth(false, null);
        console.log("User is not authenticated");
      }
    } catch (err) {
      console.error("Error initializing auth client:", err);
      setAuth(false, null);
    }
  }

  async function signIn(email: string, password: string) {
    if (!email || !password) {
      return toast.error("Please fill in all fields");
    }

    loading.value = true;

    try {
      const signInAttempt = await authClient.signIn.email({
        email,
        password,
      });

      if (signInAttempt.error) {
        console.error("Sign-in failed:", signInAttempt.error);
        return toast.error(
          signInAttempt.error.message || "Internal Server Error",
        );
      }

      // if email is still not verified, send verification email again
      if (signInAttempt.data.user.emailVerified) {
        setAuth(true, signInAttempt.data.user as User);
        router.push("/");
      } else {
        router.push(`/verify-email?address=${signInAttempt.data.user.email}`);
      }
    } catch (error) {
      console.error("Error", error);
      toast.error("Something went wrong...");
    } finally {
      loading.value = false;
    }
  }

  async function signUp(name: string, email: string, password: string) {
    if (!email || !password) {
      return toast.error("Please fill in all fields");
    }

    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    loading.value = true;

    try {
      // create new user
      const signUpAttempt = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (signUpAttempt.error) {
        console.error("Sign-up failed:", signUpAttempt.error);
        return toast.error(
          signUpAttempt.error.message || "Internal Server Error",
        );
      }
      setAuth(true, signUpAttempt.data.user as User);
      router.push(`/verify-email?address=${signUpAttempt.data.user.email}`);
    } catch (error) {
      console.error("Error", error);
      toast.error("Something went wrong...");
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    loading.value = true;
    console.log("Signing out...");

    const signOutAttempt = await authClient.signOut();

    if (signOutAttempt.error) {
      console.error("Sign-out failed:", signOutAttempt.error);
      return toast.error(
        signOutAttempt.error.message || "Internal Server Error",
      );
    }
    setAuth(false, null);

    await router.push("/sign-in");
    loading.value = false;
  }

  async function sendCodeToEmail(email: string, resend?: boolean) {
    // send verification code to user email
    const sendEmailAttempt = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (sendEmailAttempt.error) {
      console.error(sendEmailAttempt.error);
      return toast.error("Failed to send verification email.");
    }

    if (resend) {
      return toast.info(`Sent code to ${email}`);
    }
  }

  async function verifyEmailCode(email: string, code: number) {
    loading.value = true;
    try {
      // use the code input to attempt verification
      const verifyEmailAttempt = await authClient.emailOtp.verifyEmail({
        email: email,
        otp: code.toString(),
      });

      if (verifyEmailAttempt.error) {
        return toast.error("Verification failed. Please try again.");
      }

      console.log("email verified!");
      setAuth(true, verifyEmailAttempt.data.user as User);
      router.push("/");
    } catch (error) {
      console.error("Error", error);
      toast.error("Something went wrong...");
    } finally {
      loading.value = false;
    }
  }

  return {
    authenticated,
    user,
    loading,
    checkAuthStatus,
    signIn,
    signUp,
    signOut,
    sendCodeToEmail,
    verifyEmailCode,
    setAuth,
  };
});
