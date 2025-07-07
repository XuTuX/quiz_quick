// /Users/kik/next_project/quizpick/src/app/create-quiz/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, File as FileIcon, XCircle } from 'lucide-react';
import { QuizData } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type UploadStatus = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

export default function CreateQuizPage() {
  const router = useRouter();
  const [creationMethod, setCreationMethod] = useState<'select' | 'ai' | 'manual'>('select');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage('');
      e.dataTransfer.clearData();
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setErrorMessage('파일을 선택해주세요.');
      return;
    }
    if (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) {
      setErrorMessage('10MB 이하의 PDF 파일만 업로드할 수 있습니다.');
      setFile(null);
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');
    const formData = new FormData();
    formData.append('file', file);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 90) {
        clearInterval(interval);
        setUploadStatus('generating');
      }
    }, 200);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        toast.success('퀴즈가 성공적으로 생성되어 저장되었습니다!');
        router.push(`/quiz/${data.quizId}`);
      } else {
        const textError = await response.text();
        throw new Error(response.statusText || textError.substring(0, 100) || '알 수 없는 서버 오류');
      }

    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.message || String(error));
      toast.error(`퀴즈 생성 중 오류가 발생했습니다: ${error.message || String(error)}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {creationMethod === 'select' && '퀴즈 생성 방식 선택'}
            {creationMethod === 'ai' && 'PDF로 AI 퀴즈 만들기'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creationMethod === 'select' && (
            <div className="flex flex-col space-y-4">
              <Button onClick={() => setCreationMethod('ai')} className="w-full py-6 text-lg">
                AI로 퀴즈 만들기 (PDF)
              </Button>
              <Button onClick={() => router.push('/create-quiz/manual')} className="w-full py-6 text-lg" variant="outline">
                직접 퀴즈 만들기
              </Button>
            </div>
          )}

          {creationMethod === 'ai' && (
            <>
              <div
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                {uploadStatus === 'idle' && !file && (
                  <>
                    <UploadCloud className="w-12 h-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-xs text-gray-500">PDF, MAX 10MB</p>
                    <input type="file" onChange={handleFileChange} accept="application/pdf" className="hidden" id="file-upload" />
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>파일 선택</Button>
                  </>
                )}

                {file && uploadStatus !== 'uploading' && uploadStatus !== 'generating' && (
                  <div className="text-center"><FileIcon className="w-12 h-12 text-blue-500 mx-auto" /><p className="mt-2 text-sm font-medium">{file.name}</p><Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>파일 변경</Button></div>
                )}

                {(uploadStatus === 'uploading' || uploadStatus === 'generating') && (
                  <div className="w-full text-center">
                    <p className="text-lg font-semibold mb-2">{uploadStatus === 'generating' ? 'AI가 퀴즈를 생성 중입니다...' : '파일 업로드 중...'}</p>
                    <p className="text-sm text-gray-500 mb-4">잠시만 기다려주세요.</p>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </div>

              {errorMessage && (<div className="mt-4 flex items-center text-red-600"><XCircle className="w-4 h-4 mr-2" /><p className="text-sm">{errorMessage}</p></div>)}

              <div className="mt-6 flex justify-center">
                <Button onClick={handleFileUpload} disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'generating'} className="w-full">
                  퀴즈 생성하기
                </Button>
              </div>
              <div className="mt-4 text-center">
                <Button onClick={() => setCreationMethod('select')} variant="link">뒤로 가기</Button>
              </div>
            </>
          )}

          <div className="mt-4 text-center">
            <Link href="/my-quizzes">
              <Button variant="link">내 퀴즈 관리하기</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
