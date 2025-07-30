import { useMutation } from "@tanstack/react-query";
import { Download, Eye, Images, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Post, Category } from "@shared/schema";

interface PostCardProps {
  post: Post;
  categories: Category[];
}

export default function PostCard({ post, categories }: PostCardProps) {
  const { toast } = useToast();
  
  const category = categories.find(c => c.id === post.categoryId);
  const mainImage = post.images?.[0];
  const downloadCount = parseInt(post.downloadCount || "0");
  const imageCount = post.images?.length || 0;
  const fileCount = post.downloadFiles?.length || 0;

  const incrementDownloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/download`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to increment download count");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleDownload = () => {
    if (post.downloadFiles && post.downloadFiles.length > 0) {
      // Increment download count
      incrementDownloadMutation.mutate();
      
      // Download all files
      post.downloadFiles.forEach((file) => {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
      toast({
        title: "Download Started",
        description: `Downloading ${post.downloadFiles.length} file(s)`,
      });
    } else {
      toast({
        title: "No Files Available",
        description: "This post doesn't have any downloadable files",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      "Games": "bg-green-100 text-green-800",
      "Software": "bg-blue-100 text-blue-800",
      "3D Models": "bg-purple-100 text-purple-800",
      "Textures": "bg-orange-100 text-orange-800",
      "Audio": "bg-pink-100 text-pink-800",
    };
    return colors[categoryName] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 bg-slate-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <File className="w-12 h-12 text-slate-400" />
          </div>
        )}
      </div>
      
      <div className="p-6">
        {/* Category and Date */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className={category ? getCategoryColor(category.name) : ""}>
            {category?.name || "Unknown"}
          </Badge>
          <span className="text-slate-500 text-sm">
            {new Date(post.createdAt!).toLocaleDateString()}
          </span>
        </div>
        
        {/* Title and Description */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {post.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {downloadCount} downloads
            </span>
            {imageCount > 0 && (
              <span className="flex items-center gap-1">
                <Images className="w-4 h-4" />
                {imageCount} images
              </span>
            )}
          </div>
          <span className="text-lg font-semibold text-slate-900">
            {post.isFree ? "Free" : `$${post.price}`}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={!post.downloadFiles || post.downloadFiles.length === 0}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {post.isFree ? "Download" : "Purchase"}
          </Button>
          <Button variant="outline" size="icon">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
