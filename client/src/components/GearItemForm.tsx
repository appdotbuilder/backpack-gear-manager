
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CreateGearItemInput, GearCategory } from '../../../server/src/schema';

interface GearItemFormProps {
  packingListId: number;
  onSubmit: (data: CreateGearItemInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateGearItemInput>;
  isLoading?: boolean;
}

const gearCategories: { value: GearCategory; label: string }[] = [
  { value: 'shelter', label: 'Shelter' },
  { value: 'sleep_system', label: 'Sleep System' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'safety', label: 'Safety' },
  { value: 'hygiene', label: 'Hygiene' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food', label: 'Food' },
  { value: 'water', label: 'Water' },
  { value: 'other', label: 'Other' }
];

export function GearItemForm({ 
  packingListId, 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false 
}: GearItemFormProps) {
  const [formData, setFormData] = useState<CreateGearItemInput>({
    packing_list_id: packingListId,
    name: initialData?.name || '',
    individual_weight: initialData?.individual_weight || 0,
    quantity: initialData?.quantity || 1,
    category: initialData?.category || 'other',
    notes: initialData?.notes || null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateGearItemInput) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Tent, Sleeping Bag, Backpack"
            required
            className="focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category || 'other'}
            onValueChange={(value: GearCategory) =>
              setFormData((prev: CreateGearItemInput) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger className="focus:border-green-500">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {gearCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Individual Weight (grams)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.individual_weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateGearItemInput) => ({ 
                ...prev, 
                individual_weight: parseFloat(e.target.value) || 0 
              }))
            }
            placeholder="0"
            min="0"
            step="0.1"
            required
            className="focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateGearItemInput) => ({ 
                ...prev, 
                quantity: parseInt(e.target.value) || 1 
              }))
            }
            placeholder="1"
            min="1"
            required
            className="focus:border-green-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateGearItemInput) => ({
              ...prev,
              notes: e.target.value || null
            }))
          }
          placeholder="Add any additional notes about this item..."
          className="min-h-[80px] focus:border-green-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || !formData.name.trim() || formData.individual_weight <= 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Adding...' : 'Add Item'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
