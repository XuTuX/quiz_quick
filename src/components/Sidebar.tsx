'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Quiz {
  id: string;
  title: string;
}

export default function Sidebar() {
  const { user } = useUser();
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [sharedQuizzes, setSharedQuizzes] = useState<Quiz[]>([]); // 공유 퀴즈 상태 추가
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(true);
  const [loadingSharedQuizzes, setLoadingSharedQuizzes] = useState(false); // 공유 퀴즈 로딩 상태
  const [errorMyQuizzes, setErrorMyQuizzes] = useState<string | null>(null);
  const [errorSharedQuizzes, setErrorSharedQuizzes] = useState<string | null>(null); // 공유 퀴즈 에러 상태
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가

  // 내 퀴즈 가져오기
  useEffect(() => {
    if (user) {
      const fetchMyQuizzes = async () => {
        try {
          const response = await fetch("/api/quizzes/my-quizzes");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setMyQuizzes(data.quizzes);
        } catch (err: any) {
          setErrorMyQuizzes(err.message);
        } finally {
          setLoadingMyQuizzes(false);
        }
      };
      fetchMyQuizzes();
    } else {
      setLoadingMyQuizzes(false);
    }
  }, [user]);

  // 공유 퀴즈 검색 (디바운싱 적용)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setLoadingSharedQuizzes(true);
        setErrorSharedQuizzes(null);
        try {
          const response = await fetch(`/api/quizzes/shared?query=${encodeURIComponent(searchQuery)}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setSharedQuizzes(data.quizzes);
        } catch (err: any) {
          setErrorSharedQuizzes(err.message);
        } finally {
          setLoadingSharedQuizzes(false);
        }
      } else {
        setSharedQuizzes([]); // 검색어가 없으면 공유 퀴즈 목록 초기화
      }
    }, 500); // 500ms 디바운스

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white h-screen p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Button className="flex-grow" asChild>
          <Link href="/create-quiz">퀴즈 만들기</Link>
        </Button>
        <Input
          placeholder="퀴즈 검색..."
          className="flex-grow bg-gray-700 border-gray-600 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <nav className="flex-grow overflow-y-auto">
        <Link href="/my-quizzes" className="block text-lg font-semibold mb-2 hover:text-gray-300">
  내 퀴즈
</Link>
        {loadingMyQuizzes && <p>로딩 중...</p>}
        {errorMyQuizzes && <p className="text-red-400">오류: {errorMyQuizzes}</p>}
        {!loadingMyQuizzes && myQuizzes.length === 0 && <p className="text-gray-400 text-sm">아직 퀴즈가 없습니다.</p>}
        <ul className="space-y-2 mb-4">
          {myQuizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link href={`/quiz/${quiz.id}`} className="block p-2 rounded hover:bg-gray-700">
                {quiz.title}
              </Link>
            </li>
          ))}
        </ul>

        {searchQuery.trim() !== "" && ( // 검색어가 있을 때만 공유 퀴즈 섹션 표시
          <>
            <h2 className="text-lg font-semibold mb-2">공유 퀴즈 검색 결과</h2>
            {loadingSharedQuizzes && <p>로딩 중...</p>}
            {errorSharedQuizzes && <p className="text-red-400">오류: {errorSharedQuizzes}</p>}
            {!loadingSharedQuizzes && sharedQuizzes.length === 0 && <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>}
            <ul className="space-y-2">
              {sharedQuizzes.map((quiz) => (
                <li key={quiz.id}>
                  <Link href={`/quiz/${quiz.id}`} className="block p-2 rounded hover:bg-gray-700">
                    {quiz.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </div>
  );
}