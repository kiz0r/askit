import * as RechartsPrimitive from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/ui';

const chartConfig: ChartConfig = {
  count: {
    label: 'Games hosted',
    color: 'var(--chart-1)',
  },
};

export type ActivityPoint = {
  readonly date: string;
  readonly label: string;
  readonly count: number;
};

type Props = {
  readonly data: readonly ActivityPoint[];
  readonly headerAction?: React.ReactNode;
  readonly note?: string;
};

export const ActivityChart = (props: Props) => {
  if (props.data.length === 0) {
    return null;
  }

  // Thin out x-axis labels so they don't overlap on wider date ranges.
  const tickInterval = Math.max(0, Math.ceil(props.data.length / 10) - 1);

  return (
    <Card>
      <CardHeader className='flex items-center justify-between'>
        <CardTitle>Activity</CardTitle>
        {props.headerAction}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-56 w-full'>
          <RechartsPrimitive.AreaChart data={[...props.data]} margin={{ left: -20 }}>
            <RechartsPrimitive.CartesianGrid vertical={false} />
            <RechartsPrimitive.XAxis
              dataKey='label'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={tickInterval}
            />
            <RechartsPrimitive.YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <RechartsPrimitive.Area
              dataKey='count'
              type='monotone'
              fill='var(--color-count)'
              fillOpacity={0.15}
              stroke='var(--color-count)'
              strokeWidth={2}
            />
          </RechartsPrimitive.AreaChart>
        </ChartContainer>
        {props.note !== undefined ? (
          <p className='text-xs text-muted-foreground mt-2'>{props.note}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};
