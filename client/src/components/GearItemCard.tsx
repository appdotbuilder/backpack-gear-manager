
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Plus, Weight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlternateProductForm } from '@/components/AlternateProductForm';
import { AlternateProductCard } from '@/components/AlternateProductCard';
import { trpc } from '@/utils/trpc';
import type { GearItem, CreateAlternateProductInput } from '../../../server/src/schema';

interface GearItemCardProps {
  gearItem: GearItem & { 
    total_weight: number; 
    alternate_products: Array<{
      id: number;
      gear_item_id: number;
      name: string;
      weight: number;
      product_link: string | null;
      notes: string | null;
      created_at: Date;
    }>
  };
  onDelete: (id: number) => void;
  onUpdate: () => void;
}

export function GearItemCard({ gearItem, onDelete, onUpdate }: GearItemCardProps) {
  const [showAlternateForm, setShowAlternateForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddAlternate = async (input: CreateAlternateProductInput) => {
    try {
      await trpc.createAlternateProduct.mutate(input);
      onUpdate();
      setShowAlternateForm(false);
    } catch (error) {
      console.error('Failed to add alternate product:', error);
    }
  };

  const handleDeleteAlternate = async (id: number) => {
    try {
      await trpc.deleteAlternateProduct.mutate({ id });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete alternate product:', error);
    }
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
    return `${weight.toFixed(0)}g`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      shelter: 'bg-blue-100 text-blue-800',
      sleep_system: 'bg-purple-100 text-purple-800',
      cooking: 'bg-orange-100 text-orange-800',
      clothing: 'bg-green-100 text-green-800',
      navigation: 'bg-yellow-100 text-yellow-800',
      safety: 'bg-red-100 text-red-800',
      hygiene: 'bg-pink-100 text-pink-800',
      electronics: 'bg-indigo-100 text-indigo-800',
      food: 'bg-amber-100 text-amber-800',
      water: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-200 hover:border-green-300 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-gray-800 mb-2">
              {gearItem.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(gearItem.category)}>
                {gearItem.category.replace('_', ' ')}
              </Badge>
              <span className="text-sm text-gray-600">
                Qty: {gearItem.quantity}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Weight className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Individual:</span>
                <span className="font-medium">{formatWeight(gearItem.individual_weight)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-green-600">
                  {formatWeight(gearItem.total_weight)}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(gearItem.id)}
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
        {gearItem.notes && (
          <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
            {gearItem.notes}
          </p>
        )}

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <span className="text-sm font-medium">
                Alternate Products ({gearItem.alternate_products.length})
              </span>
              <Plus className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-3">
            {gearItem.alternate_products.map((alternate) => (
              <AlternateProductCard
                key={alternate.id}
                alternateProduct={alternate}
                onDelete={handleDeleteAlternate}
              />
            ))}
            
            {showAlternateForm ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <AlternateProductForm
                  gearItemId={gearItem.id}
                  onSubmit={handleAddAlternate}
                  onCancel={() => setShowAlternateForm(false)}
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlternateForm(true)}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Alternate Product
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
