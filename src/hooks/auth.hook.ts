import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getMe,
  googleOAuth,
  requestPasswordReset,
  resetPassword,
  userLogin,
  userLogout,
  userRegistration,
  verifyAccount,
} from "@/api";

export function useLogin() {
  return useMutation({
    mutationFn: userLogin,
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: verifyAccount,
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: userLogout,
  });
}

export function useGoogleOAuth() {
  return useMutation({
    mutationFn: googleOAuth,
  });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    retry: false,
  });
}
