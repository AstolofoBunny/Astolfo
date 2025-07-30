import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import NewsCard from "@/components/news-card";
import type { NewsArticle } from "@shared/schema";

export default function News() {
  const { data: news = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Latest News & Updates</h1>
          <p className="text-slate-600">Stay up to date with the latest platform updates and community highlights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))
          ) : news.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No news articles yet</h3>
              <p className="text-slate-600">Check back later for the latest updates and announcements.</p>
            </div>
          ) : (
            news.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      {new Date(article.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">{article.title}</h2>
                  <p className="text-slate-600 mb-4">{article.excerpt}</p>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-700 line-clamp-3">{article.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
