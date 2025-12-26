import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold font-fredoka transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-foreground",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-cartoon-sm hover:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-cartoon-sm hover:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
        outline:
          "bg-background text-foreground shadow-cartoon-sm hover:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-secondary active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-cartoon-sm hover:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
        ghost: 
          "border-transparent hover:bg-accent hover:text-accent-foreground shadow-none",
        link: 
          "text-primary underline-offset-4 hover:underline border-transparent shadow-none",
        accent:
          "bg-accent text-accent-foreground shadow-cartoon-sm hover:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
        highlight:
          "bg-highlight text-highlight-foreground shadow-cartoon-sm hover:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2 rounded-xl",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
