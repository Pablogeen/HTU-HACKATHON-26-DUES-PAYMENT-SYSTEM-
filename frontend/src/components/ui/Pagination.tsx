import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, hasMore, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <Button variant="secondary" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="font-mono-num text-sm text-slate-500">Page {page + 1}</span>
      <Button variant="secondary" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
