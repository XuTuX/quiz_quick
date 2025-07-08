"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, LayoutGrid } from "lucide-react";


interface QuizPageContentProps {
  quizId: string;
  quizTitle: string;
  quizData: Record<string, any[]>;
  totalLikes: number;
  quizUserId: string | null;
  currentUserId: string | null;
  initiallyLiked: boolean;
  allQuestionsCount: number;
  categories: string[];
}

export default function QuizCategorySelectClient({
  quizId,
  quizTitle,
  quizData,
  totalLikes,
  quizUserId,
  currentUserId,
  initiallyLiked,
  allQuestionsCount,
  categories,
}: QuizPageContentProps) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (category === "all") {
        return checked ? ["all"] : [];
      } else {
        if (checked) {
          return prev.filter((cat) => cat !== "all" && cat !== category).concat(category);
        } else {
          return prev.filter((cat) => cat !== category);
        }
      }
    });
  };

  const handleStartQuiz = () => {
    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }
    if (selectedCategories.includes("all")) {
      router.push(`/quiz/${quizId}/all`);
    } else {
      const encodedCategories = selectedCategories.map(encodeURIComponent).join("/");
      router.push(`/quiz/${quizId}/${encodedCategories}`);
    }
  };

  const handleStartLearn = () => {
    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }
    if (selectedCategories.includes("all")) {
      router.push(`/quiz/${quizId}/learn/all`);
    } else {
      const encodedCategories = selectedCategories.map(encodeURIComponent).join("/");
      router.push(`/quiz/${quizId}/learn/${encodedCategories}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 md:p-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-3xl font-bold">{quizTitle}</CardTitle>
            <div className="flex items-center gap-2">
              {currentUserId === quizUserId && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/edit-quiz/${quizId}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    편집
                  </Link>
                </Button>
              )}
              <LikeButton
                quizId={quizId}
                initiallyLiked={initiallyLiked}
                initialCount={totalLikes}
              />
            </div>
          </CardHeader>

          <CardContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* All Questions Card */}
              <div
                className={`p-6 border rounded-lg transition-colors flex justify-between items-center cursor-pointer md:col-span-2 ${selectedCategories.includes("all") ? "bg-purple-600 text-white border-purple-600" : "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"}`}
                onClick={() => handleCategoryChange("all", !selectedCategories.includes("all"))}
              >
                <div className="flex items-center">
                  <LayoutGrid className="w-6 h-6 mr-3" />
                  <span className="text-xl font-semibold">전체 문제</span>
                </div>
                <Badge variant="secondary" className={`text-base ${selectedCategories.includes("all") ? "bg-purple-700 text-white" : "bg-purple-200 text-purple-800"}`}>
                  {allQuestionsCount} 문항
                </Badge>
              </div>

              {/* Category Checkboxes */}
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`p-6 border rounded-lg transition-colors flex justify-between items-center cursor-pointer ${selectedCategories.includes(cat) ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"}`}
                  onClick={() => handleCategoryChange(cat, !selectedCategories.includes(cat))}
                >
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-lg font-medium">{cat}</span>
                  </div>
                  <Badge variant="outline" className="text-base">
                    {quizData[cat].length} 문항
                  </Badge>
                </div>
              ))}
              <div className="md:col-span-2 mt-4 flex gap-2">
                <Button
                  onClick={handleStartQuiz}
                  className="flex-1 py-3 text-lg font-semibold"
                  disabled={selectedCategories.length === 0}
                >
                  시험 시작
                </Button>
                <Button
                  onClick={handleStartLearn}
                  className="flex-1 py-3 text-lg font-semibold"
                  disabled={selectedCategories.length === 0}
                  variant="outline"
                >
                  학습하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
