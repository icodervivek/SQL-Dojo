// Styling for Clerk's components (sign-in, sign-up, account settings), matched to the app.
// Colors point at the app's CSS variables (globals.css), so light and dark mode follow
// automatically. Class names in `elements` are regular Tailwind classes.

/** Used everywhere through <ClerkProvider>, including the "Account settings" window. */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#a21caf",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "var(--panel-solid)",
    colorForeground: "var(--fg)",
    colorMutedForeground: "var(--muted)",
    // Must be opaque: Clerk paints whole areas with it (e.g. the Account settings sidebar).
    colorMuted: "var(--panel-muted)",
    colorInput: "var(--panel-solid)",
    colorInputForeground: "var(--fg)",
    colorNeutral: "var(--fg)",
    colorBorder: "var(--border)",
    colorRing: "#c026d3",
    colorDanger: "var(--danger)",
    colorSuccess: "var(--success)",
    colorModalBackdrop: "rgba(7, 7, 14, 0.82)",
    fontFamily: "var(--font-jakarta)",
    fontFamilyButtons: "var(--font-jakarta)",
    borderRadius: "0.75rem",
  },
  // `!` (important) is needed where Clerk's built-in styles would otherwise win.
  elements: {
    formButtonPrimary: "btn-primary !shadow-lg normal-case text-sm",
    socialButtonsBlockButton:
      "!h-11 !border !border-border !bg-panel-2 !shadow-none transition-colors hover:!border-fuchsia-500/50 hover:!bg-fuchsia-500/10",
    socialButtonsBlockButtonText: "!font-semibold",
    formFieldInput:
      "!h-11 !border !border-border !bg-panel-2 !shadow-none focus:!border-fuchsia-500/60 focus:!ring-2 focus:!ring-fuchsia-500/30",
    formFieldLabel: "!font-semibold",
    dividerLine: "!bg-border",
    // Account settings window
    modalBackdrop: "backdrop-blur-sm",
    badge: "!bg-fuchsia-500/15 !text-fuchsia-500 !font-semibold",
    footerActionLink: "!text-fuchsia-500 hover:!text-fuchsia-400 font-semibold",
  },
};

/**
 * Extra styling for the full-page sign-in/sign-up forms: no card of its own (the page provides
 * the frame), and no duplicate title (the page has its own heading).
 */
export const authPageAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full !shadow-none !border-0 !bg-transparent",
    card: "!bg-transparent !shadow-none !border-0 !p-0",
    header: "!hidden",
    footer: "!bg-transparent !bg-none",
    // The page shows its own "Don't have an account? Sign up" link.
    footerAction: "!hidden",
  },
};
