/**
 * 卡片组件
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white',
      elevated: 'bg-white shadow-lg',
      outlined: 'bg-white border border-gray-200',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          'rounded-xl',
          variants[variant],
          paddings[padding],
          hoverable && 'transition-shadow duration-200 hover:shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  title?: string;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, title, action, className, ...props }, ref) => {
    if (title || action) {
      return (
        <div
          ref={ref}
          className={twMerge(
            'flex items-center justify-between mb-4',
            className
          )}
          {...props}
        >
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {action}
          {children}
        </div>
      );
    }

    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={twMerge('', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('mt-4 pt-4 border-t border-gray-100', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
