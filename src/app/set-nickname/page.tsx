'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function SetNicknamePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // 이미 닉네임이 설정되어 있으면 메인 페이지로 리디렉션
      // 이 로직은 /api/user/profile에서 닉네임을 가져와 확인해야 함
      // 현재는 간단하게 구현하고, 추후 프로필 API 연동 후 수정
      const checkNickname = async () => {
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            if (data.userProfile && data.userProfile.nickname) {
              router.push('/my-quizzes'); // 닉네임이 있으면 메인 페이지로
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      };
      checkNickname();
    }
  }, [user, isLoaded, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/user/set-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '닉네임 설정에 실패했습니다.');
      }

      toast.success('닉네임이 성공적으로 설정되었습니다!');
      router.push('/my-quizzes'); // 닉네임 설정 후 이동할 페이지
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">닉네임 설정</h1>
        <p className="text-gray-600 mb-6">퀴즈 서비스를 이용하기 위해 닉네임을 설정해주세요.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={20}
          />
          <Button type="submit" className="w-full" disabled={loading || nickname.trim() === ''}>
            {loading ? '설정 중...' : '닉네임 설정'}
          </Button>
        </form>
      </div>
    </div>
  );
}
