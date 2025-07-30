import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertNewsArticleSchema, insertCategorySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve uploaded files statically
  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
  app.use("/uploads", express.static(uploadsDir));

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { categoryId, search } = req.query;
      
      let posts;
      if (search) {
        posts = await storage.searchPosts(search as string);
      } else {
        posts = await storage.getPosts(categoryId as string);
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", upload.fields([
    { name: "images", maxCount: 10 },
    { name: "files", maxCount: 5 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Process uploaded images
      const images: string[] = [];
      if (files.images) {
        files.images.forEach(file => {
          const filename = `${Date.now()}-${file.originalname}`;
          const newPath = path.join(uploadsDir, filename);
          fs.renameSync(file.path, newPath);
          images.push(`/uploads/${filename}`);
        });
      }

      // Process uploaded files
      const downloadFiles: { name: string; url: string; size: number }[] = [];
      if (files.files) {
        files.files.forEach(file => {
          const filename = `${Date.now()}-${file.originalname}`;
          const newPath = path.join(uploadsDir, filename);
          fs.renameSync(file.path, newPath);
          downloadFiles.push({
            name: file.originalname,
            url: `/uploads/${filename}`,
            size: file.size
          });
        });
      }

      // Debug logging
      console.log("Raw req.body:", req.body);
      console.log("Price value:", req.body.price, "Type:", typeof req.body.price);

      const postData = {
        ...req.body,
        price: String(req.body.price || "0"),
        isFree: !req.body.price || req.body.price === "0" || req.body.price === 0,
        images,
        downloadFiles
      };

      console.log("Processed postData:", postData);
      const validatedData = insertPostSchema.parse(postData);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", upload.fields([
    { name: "images", maxCount: 10 },
    { name: "files", maxCount: 5 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const existingPost = await storage.getPostById(req.params.id);
      
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      let images = existingPost.images || [];
      let downloadFiles = existingPost.downloadFiles || [];

      // Process new uploaded images
      if (files.images) {
        files.images.forEach(file => {
          const filename = `${Date.now()}-${file.originalname}`;
          const newPath = path.join(uploadsDir, filename);
          fs.renameSync(file.path, newPath);
          images.push(`/uploads/${filename}`);
        });
      }

      // Process new uploaded files
      if (files.files) {
        files.files.forEach(file => {
          const filename = `${Date.now()}-${file.originalname}`;
          const newPath = path.join(uploadsDir, filename);
          fs.renameSync(file.path, newPath);
          downloadFiles.push({
            name: file.originalname,
            url: `/uploads/${filename}`,
            size: file.size
          });
        });
      }

      const updateData = {
        ...req.body,
        price: String(req.body.price !== undefined ? req.body.price : existingPost.price),
        isFree: !req.body.price || req.body.price === "0" || req.body.price === 0,
        images,
        downloadFiles
      };

      const post = await storage.updatePost(req.params.id, updateData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post("/api/posts/:id/download", async (req, res) => {
    try {
      await storage.incrementDownloadCount(req.params.id);
      res.status(200).json({ message: "Download count incremented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment download count" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const articles = await storage.getNewsArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/news", upload.single("image"), async (req, res) => {
    try {
      let image = "";
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const newPath = path.join(uploadsDir, filename);
        fs.renameSync(req.file.path, newPath);
        image = `/uploads/${filename}`;
      }

      const articleData = {
        ...req.body,
        image
      };

      const validatedData = insertNewsArticleSchema.parse(articleData);
      const article = await storage.createNewsArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      res.status(400).json({ message: "Failed to create article" });
    }
  });

  app.put("/api/news/:id", upload.single("image"), async (req, res) => {
    try {
      const existingArticle = await storage.getNewsArticleById(req.params.id);
      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      let image = existingArticle.image;
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const newPath = path.join(uploadsDir, filename);
        fs.renameSync(req.file.path, newPath);
        image = `/uploads/${filename}`;
      }

      const updateData = {
        ...req.body,
        image
      };

      const article = await storage.updateNewsArticle(req.params.id, updateData);
      res.json(article);
    } catch (error) {
      res.status(400).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNewsArticle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
