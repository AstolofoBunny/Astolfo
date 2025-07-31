import { useState } from "react";
import Auth from "@/components/Auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import PostCard from "@/components/post-card";
import NewsCard from "@/components/news-card";
import type { Post, Category, NewsArticle } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", selectedCategory === "all" ? undefined : selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("categoryId", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const { data: news = [], isLoading: newsLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return parseInt(b.downloadCount || "0") - parseInt(a.downloadCount || "0");
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

       <Auth />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {categoriesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-white"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-900">Latest Posts</h2>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort by Latest</SelectItem>
                <SelectItem value="popular">Sort by Popular</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {postsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))
          ) : sortedPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">No posts found. Try adjusting your search or filters.</p>
            </div>
          ) : (
            sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} categories={categories} />
            ))
          )}
        </div>

        {/* News Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Latest News</h2>
            <Link href="/news" className="text-primary hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-l-4 border-primary pl-4">
                  <Skeleton className="w-full h-32 rounded-lg mb-3" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : news.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-slate-600">No news articles available.</p>
              </div>
            ) : (
              news.slice(0, 3).map((article) => (
                <NewsCard key={article.id} article={article} />
              ))
            )}
          </div>
        </div>

        {/* Load More Button */}
        {!postsLoading && sortedPosts.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="px-6 py-3">
              Load More Posts
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">ContentHub</h3>
              <p className="text-slate-600 text-sm">Your one-stop platform for creative assets, software tools, and digital resources.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Categories</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className="hover:text-slate-900"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-slate-900">License Info</a></li>
                <li><a href="#" className="hover:text-slate-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-slate-600">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-600">
                  <i className="fab fa-discord text-xl"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-600">
                  <i className="fab fa-github text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>&copy; 2024 ContentHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
