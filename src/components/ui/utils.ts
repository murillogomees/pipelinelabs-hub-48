// Common UI utilities and types for component composition

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Common size variants used across components
export const sizeVariants = {
  sm: "h-8 px-3 text-xs",
  default: "h-10 px-4 py-2",
  md: "h-10 px-4 py-2", // alias for default
  lg: "h-11 px-8",
  icon: "h-10 w-10",
} as const;

// Common color variants
export const colorVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
} as const;

// Common spacing classes
export const spacingClasses = {
  none: "",
  xs: "p-2",
  sm: "p-3", 
  md: "p-4",
  lg: "p-6",
  xl: "p-8"
} as const;

// Common border radius classes
export const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full"
} as const;

// Base component variant creator
export const createComponentVariants = (
  baseClasses: string,
  variants: Record<string, Record<string, string>>,
  defaultVariants?: Record<string, string>
) => {
  return cva(baseClasses, { variants, defaultVariants });
};

// Common prop interfaces
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SizeVariantProps {
  size?: keyof typeof sizeVariants;
}

export interface ColorVariantProps {
  variant?: keyof typeof colorVariants;
}

export interface CommonVariantProps extends SizeVariantProps, ColorVariantProps {}

// Common forwardRef wrapper utility
export const createComponentWrapper = <T extends HTMLElement>(
  displayName: string,
  Component: React.ForwardRefExoticComponent<any>
) => {
  Component.displayName = displayName;
  return Component;
};

// Animation utility classes
export const animationClasses = {
  fadeIn: "animate-fade-in",
  scaleIn: "animate-scale-in", 
  slideInRight: "animate-slide-in-right",
  enter: "animate-enter",
  exit: "animate-exit",
  hover: "hover-scale",
  pulse: "animate-pulse"
} as const;

// Common container classes
export const containerClasses = {
  page: "space-mobile",
  card: "card-mobile", 
  header: "heading-mobile font-bold",
  text: "text-mobile text-muted-foreground",
  grid: "grid gap-4",
  flex: "flex items-center gap-2",
  stack: "space-y-4"
} as const;