// Sidebar - the left nav panel
// Shows navigation links, login/logout, and a font size picker on the player page
// On mobile it slides in when the hamburger is clicked

import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { openModal, setFontSize } from "@/store/modalSlice";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setUser } from "@/store/authSlice";
import Image from "next/image";
import { AiFillHome, AiFillBook } from "react-icons/ai";
import { BsPencilSquare, BsSearch, BsGear } from "react-icons/bs";
import { BiHelpCircle, BiLogOut, BiLogIn } from "react-icons/bi";

interface SidebarProps {
  isOpen: boolean;   // true = sidebar slides in on mobile
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router   = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const fontSize = useSelector((state: RootState) => state.modal.fontSize); // current font size from Redux

  // only show the font size buttons when on the player page
  const isPlayerPage = router.pathname.startsWith("/player");

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(setUser(null));
    router.push("/");
  };

  const handleLogin = () => {
    dispatch(openModal());
  };

  // used to highlight the active nav link
  const isActive = (path: string) => router.pathname === path;

  return (
    <div className={`sidebar ${isOpen ? "sidebar--opened" : ""}`}>

      {/* logo at the top of the sidebar */}
      <div className="sidebar__logo">
        <Image
          src="/assets/logo.png"
          alt="vi-v2 logo"
          width={160}
          height={40}
          style={{ width: "auto", height: "40px" }}
        />
      </div>

      <div className="sidebar__wrapper">

        {/* top nav links */}
        <div className="sidebar__top">

          <Link href="/for-you" className="sidebar__link--wrapper">
            <div className={`sidebar__link--line ${isActive("/for-you") ? "active--tab" : ""}`} />
            <div className="sidebar__icon--wrapper"><AiFillHome /></div>
            <div className="sidebar__link--text">For you</div>
          </Link>

          <Link href="/library" className="sidebar__link--wrapper">
            <div className={`sidebar__link--line ${isActive("/library") ? "active--tab" : ""}`} />
            <div className="sidebar__icon--wrapper"><AiFillBook /></div>
            <div className="sidebar__link--text">My Library</div>
          </Link>

          {/* not implemented - cursor not-allowed */}
          <div className="sidebar__link--wrapper sidebar__link--not-allowed">
            <div className="sidebar__link--line" />
            <div className="sidebar__icon--wrapper"><BsPencilSquare /></div>
            <div className="sidebar__link--text">Highlights</div>
          </div>

          {/* not implemented - cursor not-allowed */}
          <div className="sidebar__link--wrapper sidebar__link--not-allowed">
            <div className="sidebar__link--line" />
            <div className="sidebar__icon--wrapper"><BsSearch /></div>
            <div className="sidebar__link--text">Search</div>
          </div>

          {/* font size buttons - only show on player page */}
          {isPlayerPage && (
            <div className="sidebar__link--wrapper sidebar__font--size-wrapper">
              {/* small - 16px */}
              <div
                className={`sidebar__link--text sidebar__font--size-icon ${fontSize === 16 ? "sidebar__font--size-icon--active" : ""}`}
                onClick={() => dispatch(setFontSize(16))}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="sidebar__font--size-icon-small" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <g><path fill="none" d="M0 0h24v24H0z"></path><path d="M11.246 15H4.754l-2 5H.6L7 4h2l6.4 16h-2.154l-2-5zm-.8-2L8 6.885 5.554 13h4.892zM21 12.535V12h2v8h-2v-.535a4 4 0 1 1 0-6.93zM19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></g>
                </svg>
              </div>
              {/* medium - 18px */}
              <div
                className={`sidebar__link--text sidebar__font--size-icon ${fontSize === 18 ? "sidebar__font--size-icon--active" : ""}`}
                onClick={() => dispatch(setFontSize(18))}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="sidebar__font--size-icon-medium" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <g><path fill="none" d="M0 0h24v24H0z"></path><path d="M11.246 15H4.754l-2 5H.6L7 4h2l6.4 16h-2.154l-2-5zm-.8-2L8 6.885 5.554 13h4.892zM21 12.535V12h2v8h-2v-.535a4 4 0 1 1 0-6.93zM19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></g>
                </svg>
              </div>
              {/* large - 20px */}
              <div
                className={`sidebar__link--text sidebar__font--size-icon ${fontSize === 20 ? "sidebar__font--size-icon--active" : ""}`}
                onClick={() => dispatch(setFontSize(20))}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="sidebar__font--size-icon-large" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <g><path fill="none" d="M0 0h24v24H0z"></path><path d="M11.246 15H4.754l-2 5H.6L7 4h2l6.4 16h-2.154l-2-5zm-.8-2L8 6.885 5.554 13h4.892zM21 12.535V12h2v8h-2v-.535a4 4 0 1 1 0-6.93zM19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></g>
                </svg>
              </div>
              {/* xlarge - 22px */}
              <div
                className={`sidebar__link--text sidebar__font--size-icon ${fontSize === 22 ? "sidebar__font--size-icon--active" : ""}`}
                onClick={() => dispatch(setFontSize(22))}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="sidebar__font--size-icon-xlarge" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <g><path fill="none" d="M0 0h24v24H0z"></path><path d="M11.246 15H4.754l-2 5H.6L7 4h2l6.4 16h-2.154l-2-5zm-.8-2L8 6.885 5.554 13h4.892zM21 12.535V12h2v8h-2v-.535a4 4 0 1 1 0-6.93zM19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></g>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* bottom nav links */}
        <div className="sidebar__bottom">

          <Link href="/settings" className="sidebar__link--wrapper">
            <div className={`sidebar__link--line ${isActive("/settings") ? "active--tab" : ""}`} />
            <div className="sidebar__icon--wrapper"><BsGear /></div>
            <div className="sidebar__link--text">Settings</div>
          </Link>

          {/* not implemented */}
          <div className="sidebar__link--wrapper sidebar__link--not-allowed">
            <div className="sidebar__link--line" />
            <div className="sidebar__icon--wrapper"><BiHelpCircle /></div>
            <div className="sidebar__link--text">Help &amp; Support</div>
          </div>

          {/* show logout if logged in, login button if not */}
          {user ? (
            <div className="sidebar__link--wrapper" onClick={handleLogout}>
              <div className="sidebar__link--line" />
              <div className="sidebar__icon--wrapper"><BiLogOut /></div>
              <div className="sidebar__link--text">Logout</div>
            </div>
          ) : (
            <div className="sidebar__link--wrapper" onClick={handleLogin}>
              <div className="sidebar__link--line" />
              <div className="sidebar__icon--wrapper"><BiLogIn /></div>
              <div className="sidebar__link--text">Login</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
