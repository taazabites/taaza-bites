# Taaza Bites Admin Redesign

- Upgraded global CSS variables to perfectly match the Premium SaaS dark theme.
- Configured a lightweight global utility map in `index.css` to seamlessly migrate existing hardcoded Tailwind zinc colors to standard semantic tokens without touching legacy logic.
- Rewrote `Card` component for glassmorphism panels, subtle borders, and `shadow-sm`.
- Replaced `Dialog` base classes with framer-motion-like slide-up animations, backdrop blur, and improved corner radii.
- Reconfigured `Button`, `Input`, `Textarea`, `Select` for increased touch area (h-10), modern outline rings (`focus-visible:ring-primary`), and crisp transitions.
- Enhanced `Table` component with sticky headers, sticky backdrops (`backdrop-blur-md`), and selected-state highlights.
- Implemented a universal `EmptyState` component with generic illustration framing, deployed dynamically to Orders, Customers, and Finance.
- Verified build and stability.
