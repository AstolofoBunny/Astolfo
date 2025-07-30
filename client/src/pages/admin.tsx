import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import FileUpload from "@/components/file-upload";
import type { Post, Category, NewsArticle } from "@shared/schema";

const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.string().min(0, "Price must be 0 or greater"),
});

const newsFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
});

export default function Admin() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateNewsOpen, setIsCreateNewsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const { toast } = useToast();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: news = [], isLoading: newsLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsCreatePostOpen(false);
      toast({ title: "Success", description: "Post created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditingPost(null);
      toast({ title: "Success", description: "Post updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Success", description: "Post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/news", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to create news article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setIsCreateNewsOpen(false);
      toast({ title: "Success", description: "News article created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create news article", variant: "destructive" });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update news article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setEditingNews(null);
      toast({ title: "Success", description: "News article updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update news article", variant: "destructive" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete news article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News article deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete news article", variant: "destructive" });
    },
  });

  const PostForm = ({ post, onClose }: { post?: Post; onClose: () => void }) => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const form = useForm<z.infer<typeof postFormSchema>>({
      resolver: zodResolver(postFormSchema),
      defaultValues: {
        title: post?.title || "",
        description: post?.description || "",
        categoryId: post?.categoryId || "",
        price: post?.price?.toString() || "0",
      },
    });

    const onSubmit = (values: z.infer<typeof postFormSchema>) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("categoryId", values.categoryId);
      formData.append("price", values.price);

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (post) {
        updatePostMutation.mutate({ id: post.id, formData });
      } else {
        createPostMutation.mutate(formData);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter post title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Write post description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Images</FormLabel>
            <FileUpload
              accept="image/*"
              multiple
              onFilesSelected={setSelectedImages}
              description="Supports JPEG, PNG, WebP (max 10MB each)"
            />
          </div>

          <div>
            <FormLabel>Downloadable Files</FormLabel>
            <FileUpload
              multiple
              onFilesSelected={setSelectedFiles}
              description="Supports ZIP, RAR, PDF, and more (max 100MB each)"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={createPostMutation.isPending || updatePostMutation.isPending}
            >
              {post ? "Update Post" : "Create Post"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  const NewsForm = ({ article, onClose }: { article?: NewsArticle; onClose: () => void }) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const form = useForm<z.infer<typeof newsFormSchema>>({
      resolver: zodResolver(newsFormSchema),
      defaultValues: {
        title: article?.title || "",
        content: article?.content || "",
        excerpt: article?.excerpt || "",
      },
    });

    const onSubmit = (values: z.infer<typeof newsFormSchema>) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("excerpt", values.excerpt);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      if (article) {
        updateNewsMutation.mutate({ id: article.id, formData });
      } else {
        createNewsMutation.mutate(formData);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter article title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Brief summary..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Write article content..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Featured Image</FormLabel>
            <FileUpload
              accept="image/*"
              onFilesSelected={(files) => setSelectedImage(files[0] || null)}
              description="Supports JPEG, PNG, WebP (max 10MB)"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
            >
              {article ? "Update Article" : "Create Article"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <h1 className="text-2xl font-semibold text-slate-900">Admin Panel</h1>
          </div>

          <Tabs defaultValue="posts" className="p-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Manage Posts</h2>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                    </DialogHeader>
                    <PostForm onClose={() => setIsCreatePostOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              {postsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => {
                        const category = categories.find(c => c.id === post.categoryId);
                        return (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-slate-900">{post.title}</div>
                                <div className="text-sm text-slate-500">
                                  Created {new Date(post.createdAt!).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{category?.name || "Unknown"}</Badge>
                            </TableCell>
                            <TableCell>{post.downloadCount || "0"}</TableCell>
                            <TableCell>${post.price || "0"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Published</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingPost(post)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePostMutation.mutate(post.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="news" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Manage News</h2>
                <Dialog open={isCreateNewsOpen} onOpenChange={setIsCreateNewsOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Article</DialogTitle>
                    </DialogHeader>
                    <NewsForm onClose={() => setIsCreateNewsOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              {newsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {news.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-900">{article.title}</div>
                              <div className="text-sm text-slate-500">{article.excerpt}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(article.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Published</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingNews(article)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNewsMutation.mutate(article.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Manage Categories</h2>
              </div>

              {categoriesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-medium text-slate-900">{category.name}</h3>
                      <p className="text-sm text-slate-600">Slug: {category.slug}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <PostForm post={editingPost} onClose={() => setEditingPost(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit News Dialog */}
      <Dialog open={!!editingNews} onOpenChange={() => setEditingNews(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {editingNews && (
            <NewsForm article={editingNews} onClose={() => setEditingNews(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
