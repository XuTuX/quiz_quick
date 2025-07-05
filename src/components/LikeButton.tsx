"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";

interface Props {
    quizId: string;
    initiallyLiked: boolean;
    initialCount: number;
}

export default function LikeButton({
    quizId,
    initiallyLiked,
    initialCount,
}: Props) {
    // ① 실제 상태
    const [liked, setLiked] = useState(initiallyLiked);
    const [count, setCount] = useState(initialCount);

    // ② optimistic 상태
    const [optimisticLiked, setOptimisticLiked] = useOptimistic(
        liked,
        (_, v: boolean) => v
    );
    const [isPending, startTransition] = useTransition();

    function toggle() {
        // 모든 optimistic 업데이트를 transition 안에서
        startTransition(() => {
            setOptimisticLiked(!optimisticLiked);
            setCount((c) => c + (optimisticLiked ? -1 : 1));
        });

        // 실제 API 호출
        fetch(`/api/quizzes/${quizId}/toggle-like`, { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                setLiked(data.liked);
                setCount(data.totalLikes);
            })
            .catch(() => {
                /* TODO: 오류 처리 */
            });
    }

    return (
        <button
            onClick={toggle}
            disabled={isPending}
            className="flex items-center gap-1 disabled:opacity-40 group"
        >
            {/* 로딩 중엔 스피너 */}
            {isPending ? (
                <Loader2 className="animate-spin w-5 h-5 text-red-600" />
            ) : (
                <Heart
                    className={`
            w-5 h-5
            ${optimisticLiked ? "fill-red-600 stroke-red-600" : "stroke-gray-400 group-hover:stroke-red-600"}
          `}
                />
            )}
            {/* 좋아요 수는 그대로 표시 – 필요 없으면 지우세요 */}
            <span className="text-sm">{count}</span>
        </button>
    );
}
