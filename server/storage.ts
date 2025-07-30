import { type User, type InsertUser, type Category, type InsertCategory, type Post, type InsertPost, type NewsArticle, type InsertNewsArticle } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Post methods
  getPosts(categoryId?: string): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  incrementDownloadCount(id: string): Promise<void>;
  searchPosts(query: string): Promise<Post[]>;

  // News methods
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticleById(id: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private posts: Map<string, Post>;
  private newsArticles: Map<string, NewsArticle>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.posts = new Map();
    this.newsArticles = new Map();

    // Initialize with default categories
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultCategories = [
      { slug: "games", name: "Games" },
      { slug: "software", name: "Software" },
      { slug: "3d-models", name: "3D Models" },
      { slug: "textures", name: "Textures" },
      { slug: "audio", name: "Audio" },
    ];

    defaultCategories.forEach(cat => {
      const id = randomUUID();
      const category: Category = { ...cat, id };
      this.categories.set(id, category);
    });
  }

  // User methods (existing)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated: Category = { ...existing, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Post methods
  async getPosts(categoryId?: string): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values());
    if (categoryId) {
      return allPosts.filter(post => post.categoryId === categoryId);
    }
    return allPosts.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPostById(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      createdAt: new Date(),
      downloadCount: "0",
      images: (insertPost.images as string[]) || [],
      downloadFiles: (insertPost.downloadFiles as { name: string; url: string; size: number }[]) || [],
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const existing = this.posts.get(id);
    if (!existing) return undefined;
    
    const updated: Post = { 
      ...existing, 
      ...updates,
      images: updates.images !== undefined ? (updates.images as string[]) : existing.images,
      downloadFiles: updates.downloadFiles !== undefined ? (updates.downloadFiles as { name: string; url: string; size: number }[]) : existing.downloadFiles,
    };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      const count = parseInt(post.downloadCount || "0") + 1;
      post.downloadCount = count.toString();
      this.posts.set(id, post);
    }
  }

  async searchPosts(query: string): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values());
    const searchTerm = query.toLowerCase();
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm)
    );
  }

  // News methods
  async getNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getNewsArticleById(id: string): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const id = randomUUID();
    const article: NewsArticle = {
      ...insertArticle,
      id,
      createdAt: new Date(),
      image: insertArticle.image || null,
    };
    this.newsArticles.set(id, article);
    return article;
  }

  async updateNewsArticle(id: string, updates: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const existing = this.newsArticles.get(id);
    if (!existing) return undefined;
    
    const updated: NewsArticle = { ...existing, ...updates };
    this.newsArticles.set(id, updated);
    return updated;
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    return this.newsArticles.delete(id);
  }
}

export const storage = new MemStorage();
