// Settings page - shows the user's account info
// If not logged in, shows a prompt to log in
// If logged in but on basic plan, shows an upgrade button

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { openModal } from "@/store/modalSlice";
import { useRouter } from "next/router";
import { SettingsSkeleton } from "@/components/Skeleton";

export default function Settings() {
  const { user, loading, subscription } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router   = useRouter();

  // show skeleton while Firebase resolves auth on first load
  if (loading) return <SettingsSkeleton />;

  // not logged in - show login prompt
  if (!user) {
    return (
      <div className="settings__login--wrapper">
        <img src="/assets/login.png" alt="Login" />
        <p className="settings__login--text">
          Log in to your account to see your details.
        </p>
        <button
          className="btn settings__login--btn"
          onClick={() => dispatch(openModal())}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="container">
        <h1 className="section__title page__title">Settings</h1>

        {/* subscription info */}
        <div className="setting__content">
          <div className="settings__sub--title">Your Subscription plan</div>
          <div className="settings__text">{subscription}</div>
          {/* only show upgrade button for free users */}
          {subscription === "basic" && (
            <button
              className="btn settings__upgrade--btn"
              onClick={() => router.push("/choose-plan")}
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* email info */}
        <div className="setting__content">
          <div className="settings__sub--title">Email</div>
          <div className="settings__text">{user.email}</div>
        </div>

      </div>
    </div>
  );
}
