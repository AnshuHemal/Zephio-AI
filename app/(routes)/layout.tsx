import React from "react";

// The header is rendered per-page for the landing page.
// The /app route has its own layout without a header.
const HomeLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <>{children}</>;
};

export default HomeLayout;
