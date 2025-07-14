
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Weight, Package, BarChart3, Trash2 } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { GearItemForm } from '@/components/GearItemForm';
import { GearItemCard } from '@/components/GearItemCard';
import { WeightSummary } from '@/components/WeightSummary';
import type { DetailedPackingList, CreateGearItemInput } from '../../../server/src/schema';

interface PackingListDetailsProps {
  packingListId: number;
  onBack: () => void;
  onDelete: (id: number) => void;
}

export function PackingListDetails({ packingListId, onBack, onDelete }: PackingListDetailsProps) {
  const [packingList, setPackingList] = useState<DetailedPackingList | null>(null);
  const [showAddGearForm, setShowAddGearForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPackingList = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getPackingListById.query({ id: packingListId });
      setPackingList(result);
    } catch (error) {
      console.error('Failed to load packing list:', error);
    } finally {
      setIsLoading(false);
    }
  }, [packingListId]);

  useEffect(() => {
    loadPackingList();
  }, [loadPackingList]);

  const handleAddGearItem = async (input: CreateGearItemInput) => {
    try {
      await trpc.createGearItem.mutate(input);
      await loadPackingList(); // Refresh the list
      setShowAddGearForm(false);
    } catch (error) {
      console.error('Failed to add gear item:', error);
    }
  };

  const handleDeleteGearItem = async (id: number) => {
    try {
      await trpc.deleteGearItem.mutate({ id });
      await loadPackingList(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete gear item:', error);
    }
  };

  const handleDeletePackingList = async () => {
    if (packingList && window.confirm('Are you sure you want to delete this packing list? This action cannot be undone.')) {
      onDelete(packingList.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading packing list...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!packingList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Packing list not found</div>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{packingList.name}</h1>
              {packingList.description && (
                <p className="text-gray-600 mt-1">{packingList.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddGearForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gear
            </Button>
            <Button
              variant="outline"
              onClick={handleDeletePackingList}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete List
            </Button>
          </div>
        </div>

        {/* Weight Summary */}
        <WeightSummary summary={packingList.summary} />

        {/* Add Gear Form */}
        {showAddGearForm && (
          <Card className="mb-6 bg-white/90 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle>Add New Gear Item</CardTitle>
            </CardHeader>
            <CardContent>
              <GearItemForm
                packingListId={packingListId}
                onSubmit={handleAddGearItem}
                onCancel={() => setShowAddGearForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Gear Items */}
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/50">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Gear Items ({packingList.gear_items.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            {packingList.gear_items.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No gear items yet</h3>
                  <p className="text-gray-600 mb-6">
                    Add your first gear item to start tracking weight
                  </p>
                  <Button
                    onClick={() => setShowAddGearForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Gear Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {packingList.gear_items.map((item) => (
                  <GearItemCard
                    key={item.id}
                    gearItem={item}
                    onDelete={handleDeleteGearItem}
                    onUpdate={loadPackingList}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category Breakdown */}
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Weight by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {packingList.summary.category_breakdown.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {category.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {category.item_count} items
                          </span>
                        </div>
                        <div className="font-semibold">
                          {category.weight.toFixed(0)}g
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="w-5 h-5 text-blue-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average item weight:</span>
                      <span className="font-semibold">
                        {packingList.summary.total_items > 0 
                          ? (packingList.summary.total_weight / packingList.summary.total_items).toFixed(0) 
                          : 0}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heaviest category:</span>
                      <span className="font-semibold capitalize">
                        {packingList.summary.category_breakdown.length > 0
                          ? packingList.summary.category_breakdown
                              .reduce((prev, current) => prev.weight > current.weight ? prev : current)
                              .category.replace('_', ' ')
                          : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total categories:</span>
                      <span className="font-semibold">
                        {packingList.summary.category_breakdown.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
