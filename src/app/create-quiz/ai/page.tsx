'use client';

import { useRouter } from 'next/navigation';
import { useState } from "react";
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, File as FileIcon, XCircle, ArrowLeft, Wand2, Edit, Ticket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

type UploadStatus = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

export default function CreateQuizPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const { data: swrTicketData, mutate: mutateTickets } = useSWR(
        '/api/user/tickets',
        (url) => fetch(url, { credentials: 'include' }).then((res) => res.json())
    );
    const ticketBalance = swrTicketData?.ticketBalance ?? null;

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
        if (ticketBalance === null) {
            setErrorMessage('티켓 잔액을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        if (ticketBalance <= 0) {
            setErrorMessage('티켓이 부족합니다. 티켓을 구매해주세요.');
            return;
        }
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
                credentials: 'include',
            });

            clearInterval(interval);
            setUploadProgress(100);

            if (!response.ok) {
                const errorText = await response.text();
                let parsedError = "";
                try {
                    const errorJson = JSON.parse(errorText);
                    parsedError = errorJson.error || errorText;
                } catch {
                    parsedError = errorText;
                }
                throw new Error(parsedError || '퀴즈 생성에 실패했습니다.');
            }

            const data = await response.json();
            toast.success('퀴즈가 성공적으로 생성되었습니다!');
            // After successful generation, trigger SWR revalidation for ticket balance
            mutateTickets();
            router.push(`/quiz/${data.quizId}`);

        } catch (error: any) {
            setUploadStatus('error');
            setErrorMessage(error.message || '알 수 없는 오류가 발생했습니다.');
            toast.error(`오류: ${error.message}`);
        }
    };

    const renderAiCreationScreen = () => (
        <div className="w-full max-w-lg">
            <Button variant="ghost" onClick={() => router.push('/create-quiz')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로가기
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">PDF로 AI 퀴즈 만들기</CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        퀴즈를 만들 PDF 파일을 업로드해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {ticketBalance !== null && (
                        <div className="flex items-center justify-center gap-2 mb-4 text-lg font-semibold text-gray-700">
                            <Ticket className="w-6 h-6 text-purple-600" />
                            <span>남은 티켓: {ticketBalance}개</span>
                        </div>
                    )}

                    {ticketBalance !== null && ticketBalance <= 0 && (
                        <Alert variant="destructive" className="mb-4">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                티켓이 부족합니다. AI 퀴즈를 생성하려면 티켓이 필요합니다.
                                <Button asChild variant="link" className="p-0 h-auto text-base align-baseline">
                                    <Link href="/pricing?tab=tickets">티켓 구매하기</Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div
                        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}
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

                        {file && !['uploading', 'generating'].includes(uploadStatus) && (
                            <div className="text-center">
                                <FileIcon className="w-12 h-12 text-purple-500 mx-auto" />
                                <p className="mt-2 text-sm font-medium">{file.name}</p>
                                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>파일 변경</Button>
                            </div>
                        )}

                        {(uploadStatus === 'uploading' || uploadStatus === 'generating') && (
                            <div className="w-full text-center">
                                <p className="text-lg font-semibold mb-2">{uploadStatus === 'generating' ? 'AI가 퀴즈를 생성 중입니다...' : '파일 업로드 중...'}</p>
                                <p className="text-sm text-gray-500 mb-4">잠시만 기다려주세요.</p>
                                <Progress value={uploadProgress} className="w-full" />
                            </div>
                        )}
                    </div>

                    {errorMessage && (
                        <Alert variant="destructive" className="mt-4">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-6">
                        <Button
                            onClick={handleFileUpload}
                            disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'generating' || ticketBalance === null || ticketBalance <= 0}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            퀴즈 생성하기
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="flex flex-col items-center justify-center flex-1 p-4">
                {renderAiCreationScreen()}
            </main>
        </div>
    );
}
