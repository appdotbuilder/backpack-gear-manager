
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, ListChecks } from 'lucide-react';
import { PackingListForm } from '@/components/PackingListForm';
import { PackingListCard } from '@/components/PackingListCard';
import { PackingListDetails } from '@/components/PackingListDetails';
import type { PackingList } from '../../server/src/schema';

function App() {
  const [packingLists, setPackingLists] = useState<PackingList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPackingLists = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getPackingLists.query();
      setPackingLists(result);
    } catch (error) {
      console.error('Failed to load packing lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackingLists();
  }, [loadPackingLists]);

  const handleCreatePackingList = async (input: { name: string; description: string | null }) => {
    try {
      const newList = await trpc.createPackingList.mutate(input);
      setPackingLists((prev: PackingList[]) => [...prev, newList]);
      setShowCreateForm(false);
      setSelectedListId(newList.id);
    } catch (error) {
      console.error('Failed to create packing list:', error);
    }
  };

  const handleDeletePackingList = async (id: number) => {
    try {
      await trpc.deletePackingList.mutate({ id });
      setPackingLists((prev: PackingList[]) => prev.filter(list => list.id !== id));
      if (selectedListId === id) {
        setSelectedListId(null);
      }
    } catch (error) {
      console.error('Failed to delete packing list:', error);
    }
  };

  // Show detailed view when a packing list is selected
  if (selectedListId) {
    return (
      <PackingListDetails
        packingListId={selectedListId}
        onBack={() => setSelectedListId(null)}
        onDelete={handleDeletePackingList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">🎒 Backpacking Gear Manager</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track your gear weight and optimize your pack for every adventure
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-green-600" />
              Your Packing Lists
            </CardTitle>
            <CardDescription>
              Manage and track weight for all your adventures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{packingLists.length}</div>
                  <div className="text-sm text-gray-600">Total Lists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {packingLists.filter(list => list.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Packing List
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-8 bg-white/90 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle>Create New Packing List</CardTitle>
              <CardDescription>
                Start planning your next adventure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PackingListForm
                onSubmit={handleCreatePackingList}
                onCancel={() => setShowCreateForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Packing Lists Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading your packing lists...</div>
          </div>
        ) : packingLists.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No packing lists yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first packing list to start tracking your gear weight
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packingLists.map((list: PackingList) => (
              <PackingListCard
                key={list.id}
                packingList={list}
                onSelect={() => setSelectedListId(list.id)}
                onDelete={handleDeletePackingList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
