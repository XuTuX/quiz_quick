"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { quizByCategory } from "@/lib/questions"
import { ChevronRight } from "lucide-react"

const majorCategories = Object.keys(quizByCategory)

export default function CreateQuizPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        퀴즈 카테고리 선택
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                        {majorCategories.map(major => (
                            <Link
                                key={major}
                                href={`/create-quiz/${encodeURIComponent(
                                    major,
                                )}`}
                                passHref
                            >
                                <Button
                                    variant="outline"
                                    className="w-full h-16 text-lg justify-between items-center"
                                >
                                    <span>{major}</span>
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}