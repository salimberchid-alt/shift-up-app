"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Modal } from "@/components/dashboard/shared";
import { requestPaymentIntent, reflectPaymentLocally, type PaymentPlan } from "@/lib/liveData";

// Same test-mode publishable key already used by the ShiftUp mobile app
// (shiftup-app/.env EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) — publishable keys
// are meant to ship client-side, this is not a secret.
const STRIPE_PUBLISHABLE_KEY = "pk_test_51Tw1Dm7v3pyeA3Fl2TkvaidpkVS3QYov1iMfTSkqXvghn8oVPXDdqBCWsPlVSyM4AQIi9v9cyVFxnRS6i5Eil4Yj00gzXiMMcT";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  return stripePromise;
}

function CheckoutForm({
  onSuccess,
  onCancel,
  isFr,
  ctaLabel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
  isFr: boolean;
  ctaLabel: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    setSubmitting(false);
    if (confirmError) {
      setError(confirmError.message ?? (isFr ? "Le paiement a échoué." : "Payment failed."));
      return;
    }
    onSuccess();
  };

  return (
    <>
      <PaymentElement />
      {error && <p className="text-[12px] text-[#FF4D6D] mt-3">{error}</p>}
      <div className="flex gap-2.5 mt-5">
        <button onClick={onCancel} className="flex-1 py-3 rounded-[11px] bg-white/[0.05] border border-white/10 text-white/60 text-[13px] font-bold cursor-pointer hover:text-white transition-colors">
          {isFr ? "Annuler" : "Cancel"}
        </button>
        <button
          onClick={submit}
          disabled={!stripe || submitting}
          className="flex-[2] py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (isFr ? "Traitement…" : "Processing…") : ctaLabel}
        </button>
      </div>
    </>
  );
}

export function StripeCheckoutModal({
  plan,
  title,
  ctaLabel,
  opts,
  onClose,
  onSuccess,
  isFr,
}: {
  plan: PaymentPlan;
  title: string;
  ctaLabel: string;
  opts?: { matchId?: string; candidateId?: string };
  onClose: () => void;
  onSuccess: () => void;
  isFr: boolean;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    requestPaymentIntent(plan, opts).then((res) => {
      if (cancelled) return;
      if (res.clientSecret) setClientSecret(res.clientSecret);
      else setError(res.error ?? (isFr ? "Impossible de démarrer le paiement." : "Couldn't start payment."));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuccess = async () => {
    await reflectPaymentLocally(plan, opts);
    onSuccess();
  };

  return (
    <Modal onClose={onClose} maxWidth={440} ariaLabel={title}>
      <h3 className="font-display text-xl font-extrabold text-white mb-5">{title}</h3>
      {error && <p className="text-[13px] text-[#FF4D6D]">{error}</p>}
      {!error && !clientSecret && <p className="text-sm text-white/50 py-6 text-center">{isFr ? "Chargement du paiement…" : "Loading payment…"}</p>}
      {clientSecret && (
        <Elements stripe={getStripe()} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#8B7CFF" } } }}>
          <CheckoutForm onSuccess={handleSuccess} onCancel={onClose} isFr={isFr} ctaLabel={ctaLabel} />
        </Elements>
      )}
    </Modal>
  );
}
