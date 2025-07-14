
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Weight, Package, BarChart3 } from 'lucide-react';
import type { PackingListSummary } from '../../../server/src/schema';

interface WeightSummaryProps {
  summary: PackingListSummary;
}

export function WeightSummary({ summary }: WeightSummaryProps) {
  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
    return `${weight.toFixed(0)}g`;
  };

  const getWeightCategory = (weight: number) => {
    if (weight < 9000) return { label: 'Ultralight', color: 'bg-green-100 text-green-800' };
    if (weight < 14000) return { label: 'Lightweight', color: 'bg-blue-100 text-blue-800' };
    if (weight < 20000) return { label: 'Traditional', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Heavy', color: 'bg-red-100 text-red-800' };
  };

  const weightCategory = getWeightCategory(summary.total_weight);

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {/* Total Weight */}
      <Card className="bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Weight className="w-5 h-5 text-green-600" />
            Total Weight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {formatWeight(summary.total_weight)}
          </div>
          <Badge className={weightCategory.color}>
            {weightCategory.label}
          </Badge>
        </CardContent>
      </Card>

      {/* Total Items */}
      <Card className="bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-blue-600" />
            Total Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {summary.total_items}
          </div>
          <div className="text-sm text-gray-600">
            {summary.category_breakdown.length} categories
          </div>
        </CardContent>
      </Card>

      {/* Average Weight */}
      <Card className="bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Average Weight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {summary.total_items > 0 
              ? formatWeight(summary.total_weight / summary.total_items)
              : '0g'
            }
          </div>
          <div className="text-sm text-gray-600">per item</div>
        </CardContent>
      </Card>
    </div>
  );
}
