'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function UserProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentNickname, setCurrentNickname] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const fetchUserProfile = async () => {
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            if (data.userProfile) {
              setCurrentNickname(data.userProfile.nickname);
              setNickname(data.userProfile.nickname || '');
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          toast.error('프로필 정보를 가져오는 데 실패했습니다.');
        }
      };
      fetchUserProfile();
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
    }
  }, [user, isLoaded, isSignedIn, router]);

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
        throw new Error(errorData.error || '닉네임 업데이트에 실패했습니다.');
      }

      toast.success('닉네임이 성공적으로 업데이트되었습니다!');
      setCurrentNickname(nickname);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">프로필 설정</h1>
        <p className="text-gray-600 mb-6">여기에서 닉네임을 변경할 수 있습니다.</p>
        {currentNickname && (
          <p className="text-gray-700 mb-4">현재 닉네임: <span className="font-semibold">{currentNickname}</span></p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="새 닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={20}
          />
          <Button type="submit" className="w-full" disabled={loading || nickname.trim() === '' || nickname.trim() === currentNickname}>
            {loading ? '업데이트 중...' : '닉네임 업데이트'}
          </Button>
        </form>
      </div>
    </div>
  );
}
