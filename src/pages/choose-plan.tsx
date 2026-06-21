// Choose Plan page - the sales/pricing page
// Has a dark header, feature icons, two plan cards, a sticky CTA, and an FAQ accordion
// Clicking subscribe redirects to /checkout with the selected plan as a query param
// /checkout handles the mock payment flow before saving the plan to Redux

import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import { AiFillFileText } from "react-icons/ai";
import { GiPlantSeed } from "react-icons/gi";
import { FaHandshake } from "react-icons/fa";

// FAQ items - static data
const faqs = [
  {
    question: "How does the free 7-day trial work?",
    answer: "Begin your complimentary 7-day trial with a vi-v2 annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.",
  },
  {
    question: "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
    answer: "While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.",
  },
  {
    question: "What's included in the Premium plan?",
    answer: "Premium membership provides you with the ultimate vi-v2 experience, including unrestricted entry to many best-selling books high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.",
  },
  {
    question: "Can I cancel during my trial or subscription?",
    answer: "You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire vi-v2 library, you can still expand your knowledge with one curated book per day.",
  },
];

export default function ChoosePlan() {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly"); // which plan card is active
  const [openFaq, setOpenFaq]           = useState<number | null>(0);               // which FAQ is open (null = all closed)

  // redirects to mock checkout page with the selected plan as a query param
  // in production this would call the Stripe API to create a checkout session
  const handleSubscribe = () => {
    router.push(`/checkout?plan=${selectedPlan}`);
  };

  return (
    <div className="plan">

      {/* dark blue header - the curved bottom comes from CSS ::before */}
      <div className="plan__header--wrapper">
        <div className="plan__header">
          <div className="plan__title">Get unlimited access to many amazing books to read</div>
          <div className="plan__sub--title">Turn ordinary moments into amazing learning opportunities</div>
          <figure className="plan__img--mask">
            <Image src="/assets/pricing-top.png" alt="pricing" width={860} height={722} />
          </figure>
        </div>
      </div>

      <div className="row">
        <div className="container">

          {/* feature icons row */}
          <div className="plan__features--wrapper">
            <div>
              <figure className="plan__features--icon"><AiFillFileText /></figure>
              <div className="plan__features--text"><b>Key ideas in few min</b> with many books to read</div>
            </div>
            <div>
              <figure className="plan__features--icon"><GiPlantSeed /></figure>
              <div className="plan__features--text"><b>3 million</b> people growing with vi-v2 everyday</div>
            </div>
            <div>
              <figure className="plan__features--icon"><FaHandshake /></figure>
              <div className="plan__features--text"><b>Precise recommendations</b> collections curated by experts</div>
            </div>
          </div>

          <div className="section__title">Choose the plan that fits you</div>

          {/* yearly plan card - selected by default */}
          <div
            className={`plan__card ${selectedPlan === "yearly" ? "plan__card--active" : ""}`}
            onClick={() => setSelectedPlan("yearly")}
          >
            <div className="plan__card--circle">
              {selectedPlan === "yearly" && <div className="plan__card--dot" />}
            </div>
            <div className="plan__card--content">
              <div className="plan__card--title">Premium Plus Yearly</div>
              <div className="plan__card--price">$99.99/year</div>
              <div className="plan__card--text">7-day free trial included</div>
            </div>
          </div>

          <div className="plan__card--separator">or</div>

          {/* monthly plan card */}
          <div
            className={`plan__card ${selectedPlan === "monthly" ? "plan__card--active" : ""}`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <div className="plan__card--circle">
              {selectedPlan === "monthly" && <div className="plan__card--dot" />}
            </div>
            <div className="plan__card--content">
              <div className="plan__card--title">Premium Monthly</div>
              <div className="plan__card--price">$9.99/month</div>
              <div className="plan__card--text">No trial included</div>
            </div>
          </div>

          {/* sticky CTA button - sticks to bottom as user scrolls through FAQs */}
          <div className="plan__card--cta">
            <button
              className="btn"
              style={{ width: "300px" }}
              onClick={handleSubscribe}
            >
              <span>
                {selectedPlan === "yearly"
                  ? "Start your free 7-day trial"
                  : "Start Premium Monthly"}
              </span>
            </button>
            <div className="plan__disclaimer">
              {selectedPlan === "yearly"
                ? "Cancel your trial at any time before it ends, and you won't be charged."
                : "No trial. $9.99/month. Cancel anytime."}
            </div>
          </div>

          {/* FAQ accordion - clicking a question toggles it open/closed */}
          <div className="faq__wrapper">
            {faqs.map((faq, i) => (
              <div key={i} className="accordion__card">
                <div
                  className="accordion__header"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="accordion__title">{faq.question}</div>
                  {/* chevron rotates when the item is open */}
                  <svg
                    stroke="currentColor" fill="currentColor" strokeWidth="0"
                    viewBox="0 0 16 16"
                    className={`accordion__icon ${openFaq === i ? "accordion__icon--rotate" : ""}`}
                    height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"></path>
                  </svg>
                </div>
                <div className={`collapse ${openFaq === i ? "show" : ""}`}>
                  <div className="accordion__body">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* footer */}
      <section id="footer">
        <div className="container">
          <div className="row">
            <div className="footer__top--wrapper">
              <div className="footer__block">
                <div className="footer__link--title">Actions</div>
                <div>
                  <div className="footer__link--wrapper"><a className="footer__link">vi-v2 Magazine</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Cancel Subscription</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Help</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Contact us</a></div>
                </div>
              </div>
              <div className="footer__block">
                <div className="footer__link--title">Useful Links</div>
                <div>
                  <div className="footer__link--wrapper"><a className="footer__link">Pricing</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">vi-v2 Business</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Gift Cards</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Authors & Publishers</a></div>
                </div>
              </div>
              <div className="footer__block">
                <div className="footer__link--title">Company</div>
                <div>
                  <div className="footer__link--wrapper"><a className="footer__link">About</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Careers</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Partners</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Code of Conduct</a></div>
                </div>
              </div>
              <div className="footer__block">
                <div className="footer__link--title">Other</div>
                <div>
                  <div className="footer__link--wrapper"><a className="footer__link">Sitemap</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Legal Notice</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Terms of Service</a></div>
                  <div className="footer__link--wrapper"><a className="footer__link">Privacy Policies</a></div>
                </div>
              </div>
            </div>
            <div className="footer__copyright--wrapper">
              <div className="footer__copyright">Copyright &copy; 2026 vi-v2.</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}