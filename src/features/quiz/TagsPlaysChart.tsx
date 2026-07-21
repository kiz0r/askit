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
  plays: {
    label: 'Plays',
    color: 'var(--chart-1)',
  },
};

export type TagPlays = {
  readonly tag: string;
  readonly plays: number;
};

type Props = {
  readonly data: readonly TagPlays[];
};

export const TagsPlaysChart = (props: Props) => {
  if (props.data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plays by Tag</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-56 w-full'>
          <RechartsPrimitive.BarChart data={[...props.data]} margin={{ left: -20 }}>
            <RechartsPrimitive.CartesianGrid vertical={false} />
            <RechartsPrimitive.XAxis
              dataKey='tag'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <RechartsPrimitive.YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <RechartsPrimitive.Bar dataKey='plays' fill='var(--color-plays)' radius={4} />
          </RechartsPrimitive.BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
