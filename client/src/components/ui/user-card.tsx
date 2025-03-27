import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail } from "lucide-react";

interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  // Generate user initials for avatar
  const initials = user.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Generate a predictable color based on user ID
  const colors = [
    "bg-primary text-white", 
    "bg-secondary text-white",
    "bg-green-500 text-white",
    "bg-orange-500 text-white"
  ];
  const colorIndex = user.id % colors.length;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-start">
          <div className={`w-12 h-12 ${colors[colorIndex]} rounded-full flex-shrink-0 flex items-center justify-center font-medium`}>
            {initials}
          </div>
          
          <div className="ml-4 flex-grow">
            <h3 className="font-medium text-lg">{user.name}</h3>
            
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-neutral-600">
                <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center text-sm text-neutral-600">
                  <Phone className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-3 border-t bg-neutral-50 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(user)}
            className="text-neutral-700"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(user)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
