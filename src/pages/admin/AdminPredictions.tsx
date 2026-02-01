import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminPredictions } from '@/hooks/useAdminData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getSportEmoji } from '@/lib/sportEmoji';
import { cn } from '@/lib/utils';

type SortField = 'sport' | 'confidence' | 'gameTime';
type SortDirection = 'asc' | 'desc';

export default function AdminPredictions() {
  const { predictions, loading, refetch } = useAdminPredictions();
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('gameTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...predictions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.homeTeam.toLowerCase().includes(query) ||
        p.awayTeam.toLowerCase().includes(query) ||
        p.sport.toLowerCase().includes(query)
      );
    }

    // Sport filter
    if (sportFilter !== 'all') {
      result = result.filter(p => p.sport.toLowerCase() === sportFilter.toLowerCase());
    }

    // Result filter
    if (resultFilter !== 'all') {
      if (resultFilter === 'win') {
        result = result.filter(p => p.isCorrect === true);
      } else if (resultFilter === 'loss') {
        result = result.filter(p => p.isCorrect === false);
      } else if (resultFilter === 'pending') {
        result = result.filter(p => p.isCorrect === null);
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'sport') {
        comparison = a.sport.localeCompare(b.sport);
      } else if (sortField === 'confidence') {
        comparison = a.confidence - b.confidence;
      } else if (sortField === 'gameTime') {
        comparison = new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [predictions, searchQuery, sportFilter, resultFilter, sortField, sortDirection]);

  const uniqueSports = useMemo(() => {
    const sports = new Set(predictions.map(p => p.sport));
    return Array.from(sports);
  }, [predictions]);

  return (
    <AdminLayout title="Predictions" description="View and manage all predictions">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {uniqueSports.map(sport => (
              <SelectItem key={sport} value={sport.toLowerCase()}>
                {getSportEmoji(sport)} {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="win">Wins</SelectItem>
            <SelectItem value="loss">Losses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('sport')}
                  className="gap-1 font-medium"
                >
                  Sport
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Predicted Winner</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('confidence')}
                  className="gap-1 font-medium"
                >
                  Confidence
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Result</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('gameTime')}
                  className="gap-1 font-medium"
                >
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredAndSorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No predictions found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSorted.map((prediction) => (
                <TableRow key={prediction.id}>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {getSportEmoji(prediction.sport)} {prediction.sport}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {prediction.homeTeam} vs {prediction.awayTeam}
                  </TableCell>
                  <TableCell>{prediction.predictedWinner}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'font-mono font-bold',
                        prediction.confidence >= 70 && 'text-success',
                        prediction.confidence >= 55 && prediction.confidence < 70 && 'text-warning',
                        prediction.confidence < 55 && 'text-orange'
                      )}
                    >
                      {prediction.confidence.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {prediction.isCorrect === null ? (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        Pending
                      </Badge>
                    ) : prediction.isCorrect ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Win
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        Loss
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {prediction.gameTime
                      ? format(new Date(prediction.gameTime), 'MMM d, yyyy')
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredAndSorted.length} of {predictions.length} predictions
      </div>
    </AdminLayout>
  );
}
