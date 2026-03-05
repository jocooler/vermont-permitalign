import { useState } from "react";
import { X, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

export default function ApplicantFeeModal({ permit, project, onClose, onPaymentComplete }) {
  const [step, setStep] = useState("summary"); // summary, payment, confirmation
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvc: "" });
  const [processing, setProcessing] = useState(false);

  // Simulated fee calculation based on permit type
  const calculateFee = () => {
    const baseFeatures = {
      "Wastewater System & Potable Water Supply Permit": 350,
      "Stormwater General Permits for Construction": 275,
      "Stormwater Permit - New Development & Redevelopment": 400,
      "Act 250 Land Use Permit": Math.min(7.4 * (project?.unit_count || 0) * 1000 / 1000, 2000),
      "Fire Prevention & Building Permit": 8 * (project?.unit_count ? project.unit_count * 2500 : 5000) / 1000,
    };
    return baseFeatures[permit.name] || 250;
  };

  const fee = calculateFee();
  const total = fee + 15; // $15 processing fee

  const handlePayment = async () => {
    if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvc) {
      alert("Please fill in all payment details");
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setStep("confirmation");
    }, 1500);
  };

  if (step === "summary") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Application Fee</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-sm font-semibold text-slate-700 mb-1">{permit.name}</div>
            <div className="text-xs text-slate-500">{permit.agency}</div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Application Fee</span>
              <span className="text-sm font-semibold text-slate-900">${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Processing Fee</span>
              <span className="text-sm font-semibold text-slate-900">$15.00</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-semibold text-slate-900">Total Due</span>
              <span className="text-lg font-bold text-green-700">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Payment is required before submitting your application to the agency. This is a simulated payment for testing purposes.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep("payment")}
              className="flex-1 px-4 py-2.5 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={16} /> Pay Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Payment Details</h3>
            <button onClick={() => setStep("summary")} className="p-1 rounded hover:bg-slate-100">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Number</label>
              <input
                type="text"
                placeholder="4532 1234 5678 9010"
                maxLength="19"
                value={cardInfo.number}
                onChange={e => {
                  let val = e.target.value.replace(/\s/g, "");
                  val = val.replace(/(\d{4})/g, "$1 ").trim();
                  setCardInfo({ ...cardInfo, number: val });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={cardInfo.expiry}
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                    setCardInfo({ ...cardInfo, expiry: val });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength="3"
                  value={cardInfo.cvc}
                  onChange={e => setCardInfo({ ...cardInfo, cvc: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                This is a simulated payment. Use any valid test card number.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("summary")}
              disabled={processing}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 px-4 py-2.5 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {processing ? "Processing..." : `Pay $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="text-center mb-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} className="text-green-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Payment Successful</h3>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Permit:</span>
              <span className="font-semibold text-slate-900">{permit.sheet}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Amount Paid:</span>
              <span className="font-semibold text-green-700">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Transaction ID:</span>
              <span className="font-mono text-xs text-slate-500">TXN{Date.now().toString().slice(-8)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center mb-6">
            Your application is ready to be submitted. The applicant fee has been recorded.
          </p>

          <button
            onClick={() => {
              onPaymentComplete();
              onClose();
            }}
            className="w-full px-4 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors"
          >
            Continue with Application
          </button>
        </div>
      </div>
    );
  }
}