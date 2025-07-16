'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wand2, Edit } from 'lucide-react';



export default function SelectQuizPage() {
  const router = useRouter();


  const renderSelectionScreen = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">퀴즈 생성 방식 선택</CardTitle>
        <CardDescription className="text-center text-gray-600">
          어떻게 퀴즈를 만들고 싶으신가요?
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
        <div
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center"
          onClick={() => router.push('/create-quiz/ai')}
        >
          <Wand2 className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI로 만들기 (PDF)</h3>
          <p className="text-gray-500">PDF 파일을 업로드하면 AI가 자동으로 퀴즈를 생성합니다.</p>
        </div>
        <div
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center"
          onClick={() => router.push('/create-quiz/manual')}
        >
          <Edit className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">직접 만들기</h3>
          <p className="text-gray-500">문제와 선택지를 직접 입력하여 퀴즈를 만듭니다.</p>
        </div>
      </CardContent>
    </Card>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex flex-col items-center justify-center flex-1 p-4">
        {renderSelectionScreen()}
      </main>
    </div>
  );
}
