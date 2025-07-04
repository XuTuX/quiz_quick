import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { FileText, Brain, Share2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 text-center">
      <div className="max-w-3xl w-full">
        {/* 헤더 */}
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          PDF Quiz Generator
        </h1>
        <p className="text-xl text-gray-700 mb-10">
          AI를 활용하여 PDF 문서에서 자동으로 퀴즈를 생성하고, 학습을 더욱
          효율적으로 만드세요.
        </p>

        {/* 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card icon={<FileText className="h-12 w-12 text-blue-500 mb-4" />}>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              PDF에서 퀴즈 생성
            </h3>
            <p className="text-gray-600">
              복잡한 문서도 AI가 자동으로 분석하여 퀴즈로 변환합니다.
            </p>
          </Card>

          <Card icon={<Brain className="h-12 w-12 text-green-500 mb-4" />}>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              나만의 퀴즈 관리
            </h3>
            <p className="text-gray-600">
              생성된 퀴즈를 저장하고, 언제든지 다시 풀며 학습을 반복하세요.
            </p>
          </Card>

          <Card icon={<Share2 className="h-12 w-12 text-purple-500 mb-4" />}>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              공유 퀴즈 탐색
            </h3>
            <p className="text-gray-600">
              다른 사용자들이 공유한 퀴즈를 풀고 지식을 넓히세요.
            </p>
          </Card>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-wrap justify-center gap-4">
          <SignedIn>
            <>
              <Button asChild size="lg" className="px-8 py-4 text-lg">
                <Link href="/create-quiz">새 퀴즈 만들기</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Link href="/my-quizzes">내 퀴즈 보기</Link>
              </Button>
            </>
          </SignedIn>

          <SignedOut>
            <>
              <SignInButton mode="modal">
                <Button size="lg" className="px-8 py-4 text-lg">
                  로그인
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  회원가입
                </Button>
              </SignUpButton>
            </>
          </SignedOut>

          <Button asChild variant="secondary" size="lg" className="px-8 py-4 text-lg">
            <Link href="/shared-quizzes">공유 퀴즈 탐색</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ✨ 작은 헬퍼 컴포넌트 */
function Card({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
      {icon}
      {children}
    </div>
  );
}
