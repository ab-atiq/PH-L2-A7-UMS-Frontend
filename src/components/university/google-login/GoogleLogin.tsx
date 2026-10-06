"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/api";
import { toast } from "@/components/ui/toast";
import { useGoogleOAuth } from "@/hooks";

export default function GoogleLoginComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: googleLogin } = useGoogleOAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.add({
        title: "Google OAuth Failed",
        description: "Something went wrong. Please try again",
        type: "error",
      });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ["user"] });
          toast.add({
            title: "Logged in Successfully",
            description: "Welcome back",
            type: "success",
          });
          router.push("/dashboard");
        },
        onError: (err) => {
          toast.add({
            title: "Google OAuth Failed",
            description: getApiErrorMessage(err),
            type: "error",
          });
        },
      },
    );
  };

  const handleGoogleError = () => {
    toast.add({
      title: "Google OAuth Failed",
      description: "Something went wrong. Please try again",
      type: "error",
    });
  };

  if (!clientId) return null;

  return (
    <GoogleLogin
      theme="outline"
      shape="pill"
      text="continue_with"
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
    />
  );
}
