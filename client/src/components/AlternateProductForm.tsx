
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CreateAlternateProductInput } from '../../../server/src/schema';

interface AlternateProductFormProps {
  gearItemId: number;
  onSubmit: (data: CreateAlternateProductInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateAlternateProductInput>;
  isLoading?: boolean;
}

export function AlternateProductForm({ 
  gearItemId, 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false 
}: AlternateProductFormProps) {
  const [formData, setFormData] = useState<CreateAlternateProductInput>({
    gear_item_id: gearItemId,
    name: initialData?.name || '',
    weight: initialData?.weight || 0,
    product_link: initialData?.product_link || null,
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
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateAlternateProductInput) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Ultralight Tent Model X"
            required
            className="focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (grams)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateAlternateProductInput) => ({ 
                ...prev, 
                weight: parseFloat(e.target.value) || 0 
              }))
            }
            placeholder="0"
            min="0"
            step="0.1"
            required
            className="focus:border-green-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_link">Product Link (Optional)</Label>
        <Input
          id="product_link"
          type="url"
          value={formData.product_link || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateAlternateProductInput) => ({
              ...prev,
              product_link: e.target.value || null
            }))
          }
          placeholder="https://example.com/product"
          className="focus:border-green-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateAlternateProductInput) => ({
              ...prev,
              notes: e.target.value || null
            }))
          }
          placeholder="Add any additional notes about this alternate product..."
          className="min-h-[60px] focus:border-green-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading || !formData.name.trim() || formData.weight <= 0}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Adding...' : 'Add Alternate'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
