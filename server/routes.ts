import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMovieSchema, insertRentalSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to handle validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw { status: 400, message: validationError.message };
      }
      throw error;
    }
  };

  // User routes
  app.get("/api/users", async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = validateRequest(insertUserSchema, req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      // Partial validation
      const userData = validateRequest(insertUserSchema.partial(), req.body);
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const success = await storage.deleteUser(userId);
    if (!success) {
      return res.status(400).json({ 
        message: "Cannot delete user with active rentals" 
      });
    }
    
    res.status(204).end();
  });

  // Movie routes
  app.get("/api/movies", async (req, res) => {
    const movies = await storage.getMovies();
    res.json(movies);
  });

  app.get("/api/movies/:id", async (req, res) => {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await storage.getMovie(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    
    res.json(movie);
  });

  app.post("/api/movies", async (req, res) => {
    try {
      const movieData = validateRequest(insertMovieSchema, req.body);
      const movie = await storage.createMovie(movieData);
      res.status(201).json(movie);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/movies/:id", async (req, res) => {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    try {
      // Partial validation
      const movieData = validateRequest(insertMovieSchema.partial(), req.body);
      const updatedMovie = await storage.updateMovie(movieId, movieData);
      
      if (!updatedMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(updatedMovie);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/movies/:id", async (req, res) => {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const success = await storage.deleteMovie(movieId);
    if (!success) {
      return res.status(400).json({ 
        message: "Cannot delete movie with active rentals" 
      });
    }
    
    res.status(204).end();
  });

  // Rental routes
  app.get("/api/rentals", async (req, res) => {
    const rentals = await storage.getRentals();
    res.json(rentals);
  });

  app.get("/api/rentals/:id", async (req, res) => {
    const rentalId = parseInt(req.params.id);
    if (isNaN(rentalId)) {
      return res.status(400).json({ message: "Invalid rental ID" });
    }

    const rental = await storage.getRental(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }
    
    res.json(rental);
  });

  app.get("/api/users/:id/rentals", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const rentals = await storage.getRentalsByUser(userId);
    res.json(rentals);
  });

  app.get("/api/movies/:id/rentals", async (req, res) => {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const rentals = await storage.getRentalsByMovie(movieId);
    res.json(rentals);
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const rentalData = validateRequest(insertRentalSchema, req.body);
      
      // Check if user exists
      const user = await storage.getUser(rentalData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if movie exists and is available
      const movie = await storage.getMovie(rentalData.movieId);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      if (!movie.available) {
        return res.status(400).json({ message: "Movie is not available for rent" });
      }
      
      const rental = await storage.createRental(rentalData);
      res.status(201).json(rental);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/rentals/:id/return", async (req, res) => {
    const rentalId = parseInt(req.params.id);
    if (isNaN(rentalId)) {
      return res.status(400).json({ message: "Invalid rental ID" });
    }

    // Get the return date or use current date
    const returnDate = req.body.returnDate ? new Date(req.body.returnDate) : new Date();
    
    const updatedRental = await storage.returnRental(rentalId, returnDate);
    if (!updatedRental) {
      return res.status(404).json({ message: "Rental not found" });
    }
    
    res.json(updatedRental);
  });

  app.delete("/api/rentals/:id", async (req, res) => {
    const rentalId = parseInt(req.params.id);
    if (isNaN(rentalId)) {
      return res.status(400).json({ message: "Invalid rental ID" });
    }

    const success = await storage.deleteRental(rentalId);
    if (!success) {
      return res.status(404).json({ message: "Rental not found" });
    }
    
    res.status(204).end();
  });

  // Stats route for dashboard
  app.get("/api/stats", async (req, res) => {
    const users = await storage.getUsers();
    const movies = await storage.getMovies();
    const rentals = await storage.getRentals();
    
    const activeRentals = rentals.filter(rental => !rental.returnedDate);
    const availableMovies = movies.filter(movie => movie.available);
    
    res.json({
      activeRentals: activeRentals.length,
      availableMovies: availableMovies.length,
      registeredUsers: users.length
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
