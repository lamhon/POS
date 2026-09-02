import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      display: "text-5xl font-extrabold tracking-tight lg:text-6xl",
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      body: "leading-7 [&:not(:first-child)]:mt-6",
      "body-small": "text-sm font-medium leading-none",
      caption: "text-sm text-muted-foreground",
      label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      button: "text-sm font-medium",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const elementMapping = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  "body-small": "p",
  caption: "p",
  label: "label",
  button: "span",
  code: "code",
} as const

export function Typography({
  className,
  variant,
  as,
  ...props
}: TypographyProps) {
  const defaultElement = variant ? elementMapping[variant] : "p"
  const Component = as || defaultElement

  return (
    <Component
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    />
  )
}
