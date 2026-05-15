/**
 * Typography utility classes for consistent font usage across the application
 */

export const typography = {
  h1: "font-heading text-4xl md:text-5xl font-bold tracking-tight",
  h2: "font-heading text-3xl md:text-4xl font-bold tracking-tight",
  h3: "font-heading text-2xl md:text-3xl font-semibold tracking-tight",
  h4: "font-heading text-xl md:text-2xl font-semibold",
  h5: "font-heading text-lg md:text-xl font-semibold",
  h6: "font-heading text-base md:text-lg font-semibold",
  
  body: "font-sans text-base leading-relaxed",
  bodyLarge: "font-sans text-lg leading-relaxed",
  bodySmall: "font-sans text-sm leading-relaxed",
  
  label: "font-sans text-sm font-medium leading-none",
  caption: "font-sans text-xs text-muted-foreground",
  code: "font-mono text-sm",
  
  button: "font-sans text-sm font-medium",
  buttonLarge: "font-sans text-base font-medium",
  
  cardTitle: "font-heading text-xl font-semibold tracking-tight",
  cardDescription: "font-sans text-sm text-muted-foreground",
} as const;
