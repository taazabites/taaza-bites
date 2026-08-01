import re

sidebar_file = "src/components/layout/Sidebar.tsx"
with open(sidebar_file, "r") as f:
    content = f.read()

# Let's extract the navItems list and add/update them to exactly match the requested list and order
