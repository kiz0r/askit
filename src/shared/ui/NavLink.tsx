import { Link, type LinkProps } from '@tanstack/react-router';
import { cn } from '@/shared/utils';

type Props = LinkProps & { readonly className?: string };

export const NavLink = (props: Props) => {
  const { className, ...restProps } = props;

  return (
    <Link
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors',
        'hover:text-foreground',
        '[&.active]:text-foreground',
        className
      )}
      activeProps={{ className: 'active' }}
      {...restProps}
    />
  );
};
