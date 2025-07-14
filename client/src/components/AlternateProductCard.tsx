
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Weight } from 'lucide-react';

interface AlternateProductCardProps {
  alternateProduct: {
    id: number;
    gear_item_id: number;
    name: string;
    weight: number;
    product_link: string | null;
    notes: string | null;
    created_at: Date;
  };
  onDelete: (id: number) => void;
}

export function AlternateProductCard({ alternateProduct, onDelete }: AlternateProductCardProps) {
  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
    return `${weight.toFixed(0)}g`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{alternateProduct.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              <Weight className="w-3 h-3 mr-1" />
              {formatWeight(alternateProduct.weight)}
            </Badge>
            {alternateProduct.product_link && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-6 px-2 text-xs"
              >
                <a
                  href={alternateProduct.product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Link
                </a>
              </Button>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(alternateProduct.id)}
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      
      {alternateProduct.notes && (
        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          {alternateProduct.notes}
        </p>
      )}
    </div>
  );
}
