"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NicknameGuard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    const run = async () => {
      if (isSignedIn && user) {
        try {
          const res = await fetch("/api/user/profile");
          if (res.ok) {
            const { userProfile } = await res.json();
            const hasNickname = userProfile?.nickname?.trim();

            if (!hasNickname && pathname !== "/set-nickname") {
              router.replace("/set-nickname");
            }
          } else {
            // 프로필을 가져오지 못했지만 로그인 상태라면 닉네임 설정 페이지로 리디렉션
            if (pathname !== "/set-nickname") {
              router.replace("/set-nickname");
            }
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
          // 오류 발생 시에도 닉네임 설정 페이지로 리디렉션
          if (pathname !== "/set-nickname") {
            router.replace("/set-nickname");
          }
        }
      } else if (!isSignedIn && pathname !== "/sign-in" && pathname !== "/sign-up" && pathname !== "/" && !pathname.startsWith("/shared-quizzes")) {
        // 로그인되지 않았고, 로그인/회원가입/홈/공유 퀴즈 페이지가 아닌 경우 로그인 페이지로 리디렉션
        router.replace("/sign-in");
      }
    };
    run();
  }, [isLoaded, isSignedIn, user, pathname, router]);

  return null; // 레이아웃 안에서 가드 역할만 함
}
