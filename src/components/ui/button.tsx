import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-nova-mid to-nova-outer text-white shadow-[0_0_30px_rgba(200,75,255,0.4)] hover:shadow-[0_0_50px_rgba(200,75,255,0.7)] hover:-translate-y-0.5",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-nova-mid/60 text-[var(--text-white)] hover:bg-nova-mid/15 hover:border-nova-mid hover:shadow-[0_0_20px_rgba(200,75,255,0.3)]",
        secondary: "bg-white/5 text-[var(--text-white)] border border-[var(--border)] hover:bg-white/10",
        ghost: "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-white)]",
        link: "text-nova-mid underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(buttonVariants({ variant, size, className }), (children as React.ReactElement).props?.className),
      });
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
