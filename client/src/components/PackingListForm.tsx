
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CreatePackingListInput } from '../../../server/src/schema';

interface PackingListFormProps {
  onSubmit: (data: CreatePackingListInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreatePackingListInput>;
  isLoading?: boolean;
}

export function PackingListForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false 
}: PackingListFormProps) {
  const [formData, setFormData] = useState<CreatePackingListInput>({
    name: initialData?.name || '',
    description: initialData?.description || null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Packing List Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreatePackingListInput) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g., 3-Day Backpacking Trip, Weekend Camping"
          required
          className="focus:border-green-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreatePackingListInput) => ({
              ...prev,
              description: e.target.value || null
            }))
          }
          placeholder="Add details about your trip, weather conditions, or special requirements..."
          className="min-h-[100px] focus:border-green-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Creating...' : 'Create List'}
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
