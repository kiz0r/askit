import * as React from 'react';
import { GameHistoryList, type RoleFilter, roleFilterOptions } from '@/features/user';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

export const HistoryPage = () => {
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>('all');

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Game History</h1>
          <p className='text-muted-foreground'>Your past games as host and player.</p>
        </div>

        <Select value={roleFilter} onValueChange={(value: RoleFilter) => setRoleFilter(value)}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Filter' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {roleFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <GameHistoryList role={roleFilter} />
    </div>
  );
};
