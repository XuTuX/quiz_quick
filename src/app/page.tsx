"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, File as FileIcon, XCircle } from 'lucide-react';
import { QuizData } from '@/lib/types';
import QuizSession from '@/components/QuizSession'; // 잠시 후 생성할 컴포넌트

type UploadStatus = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizData | null>(null);
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

  // page.tsx 파일 안에 있는 handleFileUpload 함수를 아래 코드로 교체하세요.

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

    // ... (진행률 시뮬레이션 코드는 동일)
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

      // ✅ [방어 코드] 응답이 정말 JSON인지 먼저 확인
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setGeneratedQuiz(data.quizData);
        setUploadStatus('success');
      } else {
        // JSON이 아니라면, 에러 메시지를 텍스트로 읽어서 보여줌
        const textError = await response.text();
        // HTML 태그는 사용자에게 보여줄 필요 없으므로 간단히 처리
        throw new Error(response.statusText || textError.substring(0, 100) || '알 수 없는 서버 오류');
      }

    } catch (error: any) {
      setUploadStatus('error');
      // 에러 객체에 message가 있으면 그걸 쓰고, 없으면 그냥 문자열로 변환
      setErrorMessage(error.message || String(error));
    }
  };

  const resetState = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setGeneratedQuiz(null);
  };

  if (uploadStatus === 'success' && generatedQuiz) {
    return <QuizSession initialQuizData={generatedQuiz} onReset={resetState} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader><CardTitle className="text-2xl font-bold text-center">PDF로 AI 퀴즈 만들기</CardTitle></CardHeader>
        <CardContent>
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

          <div className="mt-6 flex justify-center"><Button onClick={handleFileUpload} disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'generating'} className="w-full">퀴즈 생성하기</Button></div>
        </CardContent>
      </Card>
    </main>
  );
}