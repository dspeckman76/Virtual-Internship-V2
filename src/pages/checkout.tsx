// Checkout page - mock Stripe-style payment page
// Reached from /choose-plan when user clicks subscribe
// Reads the ?plan= query param to show the right price/copy
// On submit, fakes a payment delay then saves subscription to Redux and redirects to /for-you
// In a real app the form would POST to a backend that calls the Stripe API

import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setSubscription } from "@/store/authSlice";
import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

export default function Checkout() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const { plan } = router.query; // "yearly" or "monthly" passed as ?plan=

  const [loading, setLoading] = useState(false);  // true while faking payment processing
  const [error, setError]     = useState("");      // validation error message

  // controlled form state - all card fields in one object
  const [form, setForm] = useState({
    email:      "",
    cardNumber: "",
    expiry:     "",
    cvc:        "",
    name:       "",
  });

  // formats card number as "1234 5678 9012 3456", expiry as "MM / YY", cvc as 3 digits
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").slice(0, 16);         // digits only, max 16
      value = value.replace(/(.{4})/g, "$1 ").trim();        // add space every 4 digits
    }
    if (name === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);          // digits only, max 4
      if (value.length >= 2) value = value.slice(0, 2) + " / " + value.slice(2); // add " / " after month
    }
    if (name === "cvc") {
      value = value.replace(/\D/g, "").slice(0, 3);          // digits only, max 3
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // validates fields, fakes a 1.5s delay, then dispatches subscription and redirects
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // basic required field check
    if (!form.email || !form.cardNumber || !form.expiry || !form.cvc || !form.name) {
      setError("Please fill in all fields.");
      return;
    }
    // card number must be 16 digits (spaces stripped)
    if (form.cardNumber.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid card number.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); // fake processing delay

    // save plan to Redux - premium-plus for yearly, premium for monthly
    dispatch(setSubscription(plan === "yearly" ? "premium-plus" : "premium"));
    router.push("/for-you");
  };

  const isYearly = plan === "yearly"; // used throughout to swap copy and prices

  return (
    <div className="checkout__page">
      <div className="checkout__wrapper">

        {/* back button - returns to for-you page */}
        <div className="checkout__back" onClick={() => router.push("/for-you")}>
        <IoArrowBack />
          Back
        </div>

        {/* left panel - order summary */}
        <div className="checkout__summary">
          <div className="checkout__summary--merchant">Summarist</div>
          <div className="checkout__summary--plan">
            {isYearly ? "Premium Plus Yearly" : "Premium Monthly"}
          </div>
          <div className="checkout__summary--price">
            {isYearly ? "$99.99" : "$9.99"}
            <span className="checkout__summary--interval">
              {isYearly ? "/year" : "/month"}
            </span>
          </div>

          {/* trial notice - only shown for yearly plan */}
          {isYearly && (
            <div className="checkout__summary--trial">
              ✓ 7-day free trial included. Cancel anytime before trial ends and you won't be charged.
            </div>
          )}

          <hr className="checkout__summary--divider" />

          {/* price breakdown */}
          <div className="checkout__summary--row">
            <span>Subtotal</span>
            <span>{isYearly ? "$99.99" : "$9.99"}</span>
          </div>
          {/* yearly shows $0 today because of the free trial */}
          <div className="checkout__summary--total">
            <span>Total due today</span>
            <span>{isYearly ? "$0.00" : "$9.99"}</span>
          </div>
        </div>

        {/* right panel - payment form */}
        <div className="checkout__form--panel">
          <div className="checkout__form--heading">Contact information</div>

          <form className="checkout__form" onSubmit={handleSubmit}>

            {/* email field */}
            <div className="checkout__field">
              <label className="checkout__label">Email</label>
              <input
                className="checkout__input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="checkout__form--subheading">Payment method</div>

            {/* card number - auto-formatted with spaces */}
            <div className="checkout__field">
              <label className="checkout__label">Card number</label>
              <input
                className="checkout__input"
                name="cardNumber"
                placeholder="1234 1234 1234 1234"
                value={form.cardNumber}
                onChange={handleChange}
              />
            </div>

            {/* expiry and cvc side by side */}
            <div className="checkout__field--row">
              <div className="checkout__field">
                <label className="checkout__label">Expiry</label>
                <input
                  className="checkout__input"
                  name="expiry"
                  placeholder="MM / YY"
                  value={form.expiry}
                  onChange={handleChange}
                />
              </div>
              <div className="checkout__field">
                <label className="checkout__label">CVC</label>
                <input
                  className="checkout__input"
                  name="cvc"
                  placeholder="CVC"
                  value={form.cvc}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* cardholder name */}
            <div className="checkout__field">
              <label className="checkout__label">Cardholder name</label>
              <input
                className="checkout__input"
                name="name"
                placeholder="Full name on card"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* validation error - only visible when error state is set */}
            {error && (
              <div className="checkout__error">{error}</div>
            )}

            {/* submit button - dims and shows "Processing..." while loading */}
            <button
              className="checkout__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Processing..." : isYearly ? "Start free trial" : "Subscribe"}
            </button>

            {/* legal copy */}
            <div className="checkout__legal">
              By subscribing, you authorize Summarist to charge you according to the terms until you cancel.
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}