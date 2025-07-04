import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">PDF Quiz Generator에 오신 것을 환영합니다!</h1>
      <p className="text-lg text-gray-600 mb-8">
        AI를 사용하여 PDF 문서에서 자동으로 퀴즈를 생성하고 관리하세요.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/create-quiz">새 퀴즈 만들기</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/my-quizzes">내 퀴즈 보기</Link>
        </Button>
      </div>
    </div>
  );
}