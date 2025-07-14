
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Trash2, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { PackingList } from '../../../server/src/schema';

interface PackingListCardProps {
  packingList: PackingList;
  onSelect: () => void;
  onDelete: (id: number) => void;
}

export function PackingListCard({ packingList, onSelect, onDelete }: PackingListCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isRecent = (date: Date) => {
    const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-green-200 hover:border-green-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate text-gray-800">
              {packingList.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDate(packingList.created_at)}
              </span>
              {isRecent(packingList.created_at) && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  New
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(packingList.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {packingList.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {packingList.description}
          </p>
        )}
        
        {/* Placeholder for quick stats - would be populated from API */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="text-xs text-gray-500">Quick Stats</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-700">-</div>
              <div className="text-gray-500">Items</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">-</div>
              <div className="text-gray-500">Weight</div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onSelect}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          View & Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
