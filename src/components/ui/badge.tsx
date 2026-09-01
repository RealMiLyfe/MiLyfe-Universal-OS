import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
 {
 variants: {
 variant: {
 default: 'bg-teal-100 text-teal-800 ',
 secondary: 'bg-gray-100 text-gray-700 ',
 mly: 'bg-mly-100 text-mly-800 ',
 harbor: 'bg-harbor-100 text-harbor-800 ',
 destructive: 'bg-red-100 text-red-800 ',
 success: 'bg-green-100 text-green-800 ',
 live: 'bg-teal-100 text-teal-800 animate-pulse-soft',
 pulse: 'bg-mly-100 text-mly-800 animate-pulse-soft',
 },
 },
 defaultVariants: {
 variant: 'default',
 },
 }
);

interface BadgeProps
 extends React.HTMLAttributes<HTMLSpanElement>,
 VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
 return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
