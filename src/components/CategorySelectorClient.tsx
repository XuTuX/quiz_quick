'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QuizData } from '@/lib/types';

type Props = {
    quizId: string;
    categories: string[];
    quizData: Record<string, QuizData[]>;
};

export default function CategorySelectorClient({
    quizId,
    categories,
    quizData,
}: Props) {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (cat: string) => {
        // 'all' 선택 시 다른 건 해제, 개별 선택 시 'all' 해제
        if (cat === 'all') {
            setSelected(prev =>
                prev.includes('all') ? [] : ['all']
            );
        } else {
            setSelected(prev => {
                const next = prev.includes(cat)
                    ? prev.filter(c => c !== cat)
                    : [...prev.filter(c => c !== 'all'), cat];
                return next;
            });
        }
    };

    const startQuiz = () => {
        // 아무 것도 선택 안 한 경우 → 전체
        const cats = selected.length > 0 ? selected : ['all'];
        const path = cats.map(encodeURIComponent).join('/');
        router.push(`/quiz/${quizId}/${path}`);
    };

    // 전체 개수 계산
    const totalCount = categories.reduce(
        (sum, c) => sum + (quizData[c]?.length || 0),
        0
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 전체 문제 카드 */}
                <div
                    onClick={() => toggle('all')}
                    className={[
                        'p-6 border rounded-lg flex justify-between items-center cursor-pointer',
                        selected.includes('all')
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-100'
                    ].join(' ')}
                >
                    <div className="flex items-center">
                        <LayoutGrid className="w-6 h-6 mr-2" />
                        <span className="font-medium">전체 문제</span>
                    </div>
                    <Badge variant="secondary">{totalCount}개</Badge>
                </div>

                {/* 개별 카테고리 카드 */}
                {categories.map(cat => (
                    <div
                        key={cat}
                        onClick={() => toggle(cat)}
                        className={[
                            'p-6 border rounded-lg flex justify-between items-center cursor-pointer',
                            selected.includes(cat)
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:bg-gray-100'
                        ].join(' ')}
                    >
                        <div className="flex items-center">
                            <BookOpen className="w-5 h-5 mr-2" />
                            <span className="font-medium">{cat}</span>
                        </div>
                        <Badge variant="outline">{quizData[cat]?.length || 0}개</Badge>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <Button onClick={startQuiz} size="lg">
                    퀴즈 풀기 ({selected.length > 0 ? selected.join(', ') : '전체'})
                </Button>
            </div>
        </div>
    );
}
