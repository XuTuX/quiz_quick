"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Quiz {
  id: string;
  title: string;
}

/**
 * Light sidebar – matches the new UI palette (bg-white / subtle border).
 * Hidden on mobile (`hidden md:flex`). Fetches user's quizzes + search shared quizzes.
 */
export default function Sidebar() {
  const { user } = useUser();

  /* ---------------- state ---------------- */
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [shared, setShared] = useState<Quiz[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingShared, setLoadingShared] = useState(false);
  const [errMy, setErrMy] = useState<string | null>(null);
  const [errShared, setErrShared] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  /* ---------------- fetch my quizzes ---------------- */
  useEffect(() => {
    if (!user) {
      setLoadingMy(false);
      return;
    }
    fetch("/api/quizzes/my-quizzes")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setMyQuizzes(d.quizzes))
      .catch((e) => setErrMy(String(e)))
      .finally(() => setLoadingMy(false));
  }, [user]);

  /* ---------------- debounced search ---------------- */
  useEffect(() => {
    const id = setTimeout(() => {
      if (!query.trim()) {
        setShared([]);
        return;
      }
      setLoadingShared(true);
      fetch(`/api/quizzes/shared?query=${encodeURIComponent(query.trim())}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
        .then((d) => setShared(d.quizzes))
        .catch((e) => setErrShared(String(e)))
        .finally(() => setLoadingShared(false));
    }, 400);
    return () => clearTimeout(id);
  }, [query]);

  /* ---------------- UI ---------------- */
  return (
    <aside
      className="hidden md:flex md:w-72 flex-col border-r border-gray-200 bg-white/90 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      aria-label="사이드바"
    >
      {/* create-quiz & search */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          asChild
          className="h-10 flex-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white"
        >
          <Link href="/create-quiz">
            <Plus className="h-4 w-4 mr-1" />
            새 퀴즈
          </Link>
        </Button>

      </div>

      {/* 내 퀴즈 */}
      <section aria-labelledby="my-heading" className="mb-8">
        {/* 헤더 전체를 링크로 감싸 클릭 시 /my-quizzes 이동 */}
        <Link
          href="/my-quizzes"
          className="flex items-center gap-2 mb-3 group"
          aria-label="내 퀴즈 페이지로 이동"
        >
          <h2
            id="my-heading"
            className="text-sm font-semibold text-gray-700 group-hover:text-purple-700"
          >
            내 퀴즈
          </h2>
          <Badge
            variant="outline"
            className="text-xs border-2 border-gray-300 group-hover:border-purple-700"
          >
            {myQuizzes.length}
          </Badge>
        </Link>

        {loadingMy && <p className="text-xs text-gray-500">로딩 중…</p>}
        {errMy && <p className="text-xs text-red-500">오류: {errMy}</p>}
        {!loadingMy && myQuizzes.length === 0 && (
          <p className="text-xs text-gray-500">아직 퀴즈가 없습니다.</p>
        )}
        <ul className="space-y-1">
          {myQuizzes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/quiz/${q.id}`}
                className="block truncate rounded-lg px-3 py-2 text-sm hover:bg-purple-50 hover:text-purple-700"
              >
                {q.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 검색 결과 */}
      {query.trim() && (
        <section aria-labelledby="shared-heading">
          <h2
            id="shared-heading"
            className="text-sm font-semibold text-gray-700 mb-3"
          >
            공유 퀴즈
          </h2>
          {loadingShared && <p className="text-xs text-gray-500">로딩 중…</p>}
          {errShared && (
            <p className="text-xs text-red-500">오류: {errShared}</p>
          )}
          {!loadingShared && shared.length === 0 && (
            <p className="text-xs text-gray-500">검색 결과가 없습니다.</p>
          )}
          <ul className="space-y-1">
            {shared.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/quiz/${q.id}`}
                  className="block truncate rounded-lg px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {q.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
