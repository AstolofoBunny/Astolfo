import { Calendar } from "lucide-react";
import type { NewsArticle } from "@shared/schema";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="border-l-4 border-primary pl-4">
      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500">
          {new Date(article.createdAt!).toLocaleDateString()}
        </span>
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{article.title}</h3>
      <p className="text-sm text-slate-600">{article.excerpt}</p>
    </article>
  );
}
