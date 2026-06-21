// Layout - wraps all pages except home, choose-plan, and checkout
// Adds the sidebar and the top search bar to every inner page
import { useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import { RxHamburgerMenu } from "react-icons/rx";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // tracks if mobile sidebar is open
  const router = useRouter();

  // these pages have their own full-page layout so skip the sidebar/topbar
  const noLayoutPages = ["/", "/choose-plan", "/checkout"];
  if (noLayoutPages.includes(router.pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      {/* dark overlay behind sidebar on mobile - click to close */}
      <div
        className={`sidebar__overlay ${sidebarOpen ? "" : "sidebar__overlay--hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="wrapper">
        {/* top bar with search input */}
        <div className="search__background">
          <div className="search__wrapper">
            {/* marginLeft auto pushes search to the right side */}
            <div style={{ marginLeft: "auto" }} className="search__content">
              <SearchBar />
            </div>
            {/* hamburger only shows on mobile via CSS */}
            <div
              className="sidebar__toggle--btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <RxHamburgerMenu />
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}