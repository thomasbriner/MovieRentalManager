import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Film, 
  Users, 
  Eye, 
  CornerDownLeft, 
  Plus, 
  ArrowRight 
} from "lucide-react";
import RentalModal from "@/components/ui/rental-modal";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, isAfter, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function Dashboard() {
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });

  // Fetch rentals
  const { data: rentals, isLoading: isLoadingRentals } = useQuery({
    queryKey: ['/api/rentals'],
  });

  // Fetch movies
  const { data: movies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['/api/movies'],
  });

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  const statsData: Stat[] = [
    {
      label: "Active Rentals",
      value: stats?.activeRentals || 0,
      icon: <ClipboardList className="h-6 w-6" />,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      label: "Available Movies",
      value: stats?.availableMovies || 0,
      icon: <Film className="h-6 w-6" />,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      label: "Registered Users",
      value: stats?.registeredUsers || 0,
      icon: <Users className="h-6 w-6" />,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500"
    }
  ];

  // Get the 3 most recent active rentals
  const recentRentals = rentals
    ? rentals
        .filter((rental: any) => !rental.returnedDate)
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3)
    : [];

  // Get available movies (up to 4)
  const availableMovies = movies
    ? movies
        .filter((movie: any) => movie.available)
        .slice(0, 4)
    : [];

  // Function to determine rental status
  const getRentalStatus = (rental: any) => {
    const dueDate = new Date(rental.dueDate);
    const today = new Date();
    
    if (isAfter(today, dueDate)) {
      return { label: "Overdue", color: "bg-red-500/10 text-red-500" };
    } else if (isToday(dueDate)) {
      return { label: "Due Today", color: "bg-amber-500/10 text-amber-500" };
    } else {
      return { label: "Active", color: "bg-green-500/10 text-green-500" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-800">Dashboard</h2>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button 
            variant="default" 
            onClick={() => setIsRentalModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Rental</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingStats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Recent Rentals */}
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-base font-medium">Recent Rentals</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Movie</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">User</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Rented On</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Due Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingRentals ? (
                <>
                  <RentalRowSkeleton />
                  <RentalRowSkeleton />
                  <RentalRowSkeleton />
                </>
              ) : recentRentals.length > 0 ? (
                recentRentals.map((rental: any) => {
                  const status = getRentalStatus(rental);
                  return (
                    <tr key={rental.id} className="border-b hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 rounded bg-neutral-200 flex-shrink-0" />
                          <span>{rental.movie.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{rental.user.name}</td>
                      <td className="px-6 py-4 text-sm">{format(new Date(rental.rentedDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm">{format(new Date(rental.dueDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Return">
                            <CornerDownLeft className="h-4 w-4 text-neutral-500 hover:text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Details">
                            <Eye className="h-4 w-4 text-neutral-500 hover:text-primary" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">
                    No active rentals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 flex justify-center">
          <Link href="/rentals">
            <Button variant="link" className="text-primary hover:text-primary/80">
              <span>View All Rentals</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Available Movies & Users Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Movies */}
        <Card>
          <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Available Movies</CardTitle>
            <Link href="/movies">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary">
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
            {isLoadingMovies ? (
              <>
                <MovieCardSkeleton />
                <MovieCardSkeleton />
                <MovieCardSkeleton />
                <MovieCardSkeleton />
              </>
            ) : availableMovies.length > 0 ? (
              availableMovies.map((movie: any) => (
                <div key={movie.id} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-md transition-colors">
                  <div className="w-10 h-12 rounded bg-neutral-200 flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-sm truncate">{movie.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span>{movie.genre}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-sm font-medium">
                    <span className="text-green-500">Available</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-neutral-500">
                No available movies
              </div>
            )}
          </CardContent>
          <div className="px-6 py-3 flex justify-center border-t">
            <Link href="/movies">
              <Button variant="link" className="text-primary hover:text-primary/80">
                <span>View All Movies</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Registered Users */}
        <Card>
          <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Registered Users</CardTitle>
            <Link href="/users">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary">
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
            {isLoadingUsers ? (
              <>
                <UserCardSkeleton />
                <UserCardSkeleton />
                <UserCardSkeleton />
                <UserCardSkeleton />
              </>
            ) : users && users.length > 0 ? (
              users.slice(0, 4).map((user: any) => {
                const initials = user.name
                  .split(' ')
                  .map((part: string) => part[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2);
                
                const colors = [
                  "bg-primary text-white", 
                  "bg-secondary-light text-white",
                  "bg-green-500 text-white",
                  "bg-primary-light text-white"
                ];
                const colorIndex = user.id % colors.length;
                
                return (
                  <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-md transition-colors">
                    <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center flex-shrink-0`}>
                      <span>{initials}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{user.name}</h4>
                      <div className="text-xs text-neutral-500 mt-1">{user.email}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-neutral-500"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-neutral-500">
                No users found
              </div>
            )}
          </CardContent>
          <div className="px-6 py-3 flex justify-center border-t">
            <Link href="/users">
              <Button variant="link" className="text-primary hover:text-primary/80">
                <span>View All Users</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Rental Modal */}
      <RentalModal 
        isOpen={isRentalModalOpen} 
        onClose={() => setIsRentalModalOpen(false)}
        onSubmit={() => setIsRentalModalOpen(false)}
      />
    </div>
  );
}

function StatCard({ label, value, icon, iconBg, iconColor }: Stat) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">{label}</p>
            <h3 className="text-2xl font-medium mt-1">{value}</h3>
          </div>
          <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 mt-2" />
          </div>
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function RentalRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-10 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </td>
    </tr>
  );
}

function MovieCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2">
      <Skeleton className="w-10 h-12 rounded" />
      <div className="flex-grow">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-grow">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
}
