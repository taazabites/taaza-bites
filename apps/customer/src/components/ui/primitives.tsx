import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

// Button
const buttonVariants = cva(
 "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
 {
 variants: {
 variant: {
 default: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
 primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
 destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
 outline: "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200",
 secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700",
 ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white",
 link: "text-emerald-600 underline-offset-4 hover:underline",
 },
 size: {
 default: "h-11 px-5 py-2",
 sm: "h-9 rounded-md px-3 text-xs",
 md: "h-11 px-5 py-2",
 lg: "h-12 rounded-xl px-8 text-base",
 icon: "h-10 w-10",
 },
 },
 defaultVariants: { variant: "default", size: "default" },
 }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
 asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : "button";
 return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
 }
);
Button.displayName = "Button";

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
 ({ className, type, ...props }, ref) => {
 return (
 <input
 type={type}
 className={cn(
 "flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-800 dark:text-zinc-100 ",
 className
 )}
 ref={ref}
 {...props}
 />
 );
 }
);
Input.displayName = "Input";

// Textarea
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
 ({ className, ...props }, ref) => {
 return (
 <textarea
 className={cn(
 "flex min-h-[80px] w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm ring-offset-background placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-800 dark:text-zinc-100 ",
 className
 )}
 ref={ref}
 {...props}
 />
 );
 }
);
Textarea.displayName = "Textarea";

// Label
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
 ({ className, ...props }, ref) => (
 <label
 ref={ref}
 className={cn(
 "text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
 className
 )}
 {...props}
 />
 )
);
Label.displayName = "Label";

// Card Components
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(
 "rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs",
 className
 )}
 {...props}
 />
 )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (<div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />)
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
 ({ className, ...props }, ref) => (<h3 ref={ref} className={cn("text-2xl font-bold tracking-tight text-zinc-900 dark:text-white", className)} {...props} />)
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
 ({ className, ...props }, ref) => (<p ref={ref} className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)} {...props} />)
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />)
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (<div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />)
);
CardFooter.displayName = "CardFooter";
