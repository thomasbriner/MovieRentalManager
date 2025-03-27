import { 
  users, type User, type InsertUser,
  movies, type Movie, type InsertMovie,
  rentals, type Rental, type InsertRental,
  type RentalWithDetails
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Movie operations
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movieData: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<boolean>;

  // Rental operations
  getRentals(): Promise<RentalWithDetails[]>;
  getRental(id: number): Promise<RentalWithDetails | undefined>;
  getRentalsByUser(userId: number): Promise<RentalWithDetails[]>;
  getRentalsByMovie(movieId: number): Promise<RentalWithDetails[]>;
  createRental(rental: InsertRental): Promise<RentalWithDetails>;
  returnRental(id: number, returnedDate: Date): Promise<RentalWithDetails | undefined>;
  deleteRental(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private rentals: Map<number, Rental>;
  private userCurrentId: number;
  private movieCurrentId: number;
  private rentalCurrentId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.rentals = new Map();
    this.userCurrentId = 1;
    this.movieCurrentId = 1;
    this.rentalCurrentId = 1;

    // Add some initial data
    this.initializeData();
  }

  private initializeData() {
    // Add some initial users
    const initialUsers: InsertUser[] = [
      { name: "John Smith", email: "john.smith@example.com", phone: "555-123-4567" },
      { name: "Jane Cooper", email: "jane.cooper@example.com", phone: "555-987-6543" },
      { name: "Robert Johnson", email: "robert.j@example.com", phone: "555-456-7890" },
      { name: "Anna Davis", email: "anna.davis@example.com", phone: "555-789-1234" }
    ];

    // Add some initial movies
    const initialMovies: InsertMovie[] = [
      { title: "Inception", director: "Christopher Nolan", year: 2010, genre: "Sci-Fi", description: "A thief who steals corporate secrets through the use of dream-sharing technology.", available: true },
      { title: "The Matrix", director: "Lana Wachowski", year: 1999, genre: "Sci-Fi", description: "A computer hacker learns about the true nature of reality and his role in the war against the controllers.", available: true },
      { title: "The Shawshank Redemption", director: "Frank Darabont", year: 1994, genre: "Drama", description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", available: true },
      { title: "Interstellar", director: "Christopher Nolan", year: 2014, genre: "Sci-Fi", description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", available: true },
      { title: "Pulp Fiction", director: "Quentin Tarantino", year: 1994, genre: "Crime/Drama", description: "The lives of two mob hitmen, a boxer, a gangster and his wife intersect in four tales of violence and redemption.", available: true },
      { title: "The Godfather", director: "Francis Ford Coppola", year: 1972, genre: "Crime/Drama", description: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.", available: true },
      { title: "Parasite", director: "Bong Joon Ho", year: 2019, genre: "Drama/Thriller", description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", available: true }
    ];

    // Add users
    initialUsers.forEach(user => this.createUser(user));
    
    // Add movies
    initialMovies.forEach(movie => this.createMovie(movie));

    // Add some initial rentals
    const today = new Date();
    
    // Create rental 1: Inception for John Smith (Active)
    this.createRental({
      userId: 1,
      movieId: 1,
      rentedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      notes: "First rental"
    });
    
    // Update movie availability
    this.updateMovie(1, { available: false });

    // Create rental 2: The Matrix for Jane Cooper (Due Today)
    this.createRental({
      userId: 2,
      movieId: 2,
      rentedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      notes: "Please return on time"
    });
    
    // Update movie availability
    this.updateMovie(2, { available: false });

    // Create rental 3: The Shawshank Redemption for Robert Johnson (Overdue)
    this.createRental({
      userId: 3,
      movieId: 3,
      rentedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
      dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
      notes: "Extended rental"
    });
    
    // Update movie availability
    this.updateMovie(3, { available: false });
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }

    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    // Check if user has active rentals
    const userRentals = Array.from(this.rentals.values()).filter(
      rental => rental.userId === id && !rental.returnedDate
    );

    if (userRentals.length > 0) {
      return false; // Can't delete user with active rentals
    }

    return this.users.delete(id);
  }

  // Movie operations
  async getMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.movieCurrentId++;
    const now = new Date();
    const movie: Movie = { ...insertMovie, id, createdAt: now };
    this.movies.set(id, movie);
    return movie;
  }

  async updateMovie(id: number, movieData: Partial<InsertMovie>): Promise<Movie | undefined> {
    const existingMovie = this.movies.get(id);
    if (!existingMovie) {
      return undefined;
    }

    const updatedMovie: Movie = { ...existingMovie, ...movieData };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<boolean> {
    // Check if movie has active rentals
    const movieRentals = Array.from(this.rentals.values()).filter(
      rental => rental.movieId === id && !rental.returnedDate
    );

    if (movieRentals.length > 0) {
      return false; // Can't delete movie with active rentals
    }

    return this.movies.delete(id);
  }

  // Rental operations
  async getRentals(): Promise<RentalWithDetails[]> {
    return Array.from(this.rentals.values()).map(rental => this.enrichRental(rental));
  }

  async getRental(id: number): Promise<RentalWithDetails | undefined> {
    const rental = this.rentals.get(id);
    if (!rental) {
      return undefined;
    }
    return this.enrichRental(rental);
  }

  async getRentalsByUser(userId: number): Promise<RentalWithDetails[]> {
    return Array.from(this.rentals.values())
      .filter(rental => rental.userId === userId)
      .map(rental => this.enrichRental(rental));
  }

  async getRentalsByMovie(movieId: number): Promise<RentalWithDetails[]> {
    return Array.from(this.rentals.values())
      .filter(rental => rental.movieId === movieId)
      .map(rental => this.enrichRental(rental));
  }

  async createRental(insertRental: InsertRental): Promise<RentalWithDetails> {
    const id = this.rentalCurrentId++;
    const now = new Date();
    const rental: Rental = { ...insertRental, id, createdAt: now };
    
    // Set the movie as unavailable
    const movie = await this.getMovie(insertRental.movieId);
    if (movie) {
      await this.updateMovie(movie.id, { available: false });
    }
    
    this.rentals.set(id, rental);
    return this.enrichRental(rental);
  }

  async returnRental(id: number, returnedDate: Date): Promise<RentalWithDetails | undefined> {
    const rental = this.rentals.get(id);
    if (!rental) {
      return undefined;
    }

    // Update rental with returned date
    const updatedRental: Rental = { ...rental, returnedDate };
    this.rentals.set(id, updatedRental);

    // Set the movie as available again
    const movie = await this.getMovie(rental.movieId);
    if (movie) {
      await this.updateMovie(movie.id, { available: true });
    }

    return this.enrichRental(updatedRental);
  }

  async deleteRental(id: number): Promise<boolean> {
    const rental = this.rentals.get(id);
    if (rental) {
      // If the movie is not returned yet, make it available again
      if (!rental.returnedDate) {
        const movie = await this.getMovie(rental.movieId);
        if (movie) {
          await this.updateMovie(movie.id, { available: true });
        }
      }
    }

    return this.rentals.delete(id);
  }

  // Helper to add user and movie details to rental
  private enrichRental(rental: Rental): RentalWithDetails {
    const user = this.users.get(rental.userId);
    const movie = this.movies.get(rental.movieId);

    if (!user || !movie) {
      throw new Error(`Rental ${rental.id} has invalid user or movie references`);
    }

    return {
      ...rental,
      user,
      movie,
    };
  }
}

export const storage = new MemStorage();
