import { useMemo, useState } from "react";
import publicApi from "@/api/publicApi";
import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";
import { OptimizedHero } from "@/components/website/OptimizedHero";

const CONTACT_HERO_BASE = "top-view-tasty-fruits-arrangement-optimized";

type ContactFormState = {
  hotelName: string;
  contactNumber: string;
  email: string;
  address: string;
  pinCode: string;
  city: string;
  landmark: string;
  message: string;
};

type FormErrors = Partial<Record<keyof ContactFormState, string>>;

const initialState: ContactFormState = {
  hotelName: "",
  contactNumber: "",
  email: "",
  address: "",
  pinCode: "",
  city: "",
  landmark: "",
  message: "",
};

const WebsiteContact = () => {
  const [formData, setFormData] = useState<ContactFormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isValidEmail = useMemo(
    () => (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    []
  );

  const normalizeDigits = (value: string) => value.replace(/\D/g, "");

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!formData.hotelName.trim() || formData.hotelName.trim().length < 2) {
      e.hotelName = "Name must be at least 2 characters";
    }

    const contact = normalizeDigits(formData.contactNumber).trim();
    if (!/^[0-9]{10}$/.test(contact)) {
      e.contactNumber = "Contact number must be 10 digits";
    }

    // Backend allows `email` to be omitted; only validate format if provided.
    const email = formData.email.trim();
    if (email && !isValidEmail(email)) {
      e.email = "Please enter a valid email";
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      e.address = "Address must be at least 5 characters";
    }

    const pin = normalizeDigits(formData.pinCode).trim();
    if (!/^[0-9]{6}$/.test(pin)) {
      e.pinCode = "PIN code must be 6 digits";
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      e.city = "City must be at least 2 characters";
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      e.message = "Message must be at least 10 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange =
    (key: keyof ContactFormState) =>
    (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const rawValue = evt.target.value;
      const value =
        key === "contactNumber"
          ? normalizeDigits(rawValue).slice(0, 10)
          : key === "pinCode"
            ? normalizeDigits(rawValue).slice(0, 6)
            : rawValue;
      setFormData((p) => ({ ...p, [key]: value }));
      setSubmitError(null);
      if (errors[key]) {
        setErrors((p) => ({ ...p, [key]: undefined }));
      }
    };

  const submit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await publicApi.post("/contact/send-message", {
        hotelName: formData.hotelName.trim(),
        contactNumber: normalizeDigits(formData.contactNumber).trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        pinCode: normalizeDigits(formData.pinCode).trim(),
        landmark: formData.landmark.trim() || undefined,
        email: formData.email.trim() || undefined,
        message: formData.message.trim(),
      });

      setIsSubmitted(true);
      setFormData(initialState);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (hasError?: boolean) =>
    [
      "w-full rounded-xl border bg-[#f8fbf6] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400",
      "outline-none transition-all duration-200",
      "focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-600/15",
      hasError ? "border-red-400 bg-red-50/50" : "border-green-100 hover:border-green-300",
    ].join(" ");

  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <WebsiteHeader />

      <main>
        {/* Hero */}
        <section className="relative flex h-[520px] items-center overflow-hidden pt-24">
          <OptimizedHero
            base={CONTACT_HERO_BASE}
            width={1280}
            height={720}
            sizes="100vw"
            priority
            className="absolute inset-0 h-full w-full object-cover object-center"
            pictureClassName="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/60" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Contact PRK Smile
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-200">
                We&apos;d love to hear from you. Send us a message and we&apos;ll
                respond as soon as possible.
              </p>

              <div className="mx-auto mt-8 max-w-md rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-medium text-green-300">Email Us Directly</p>
                <a
                  href="mailto:prksmilegroups2020@gmail.com"
                  className="mt-2 block break-words text-xl font-bold text-white transition-colors hover:text-green-200 md:text-2xl"
                >
                  prksmilegroups2020@gmail.com
                </a>
                <p className="mt-2 text-sm text-gray-300">
                  Quick response guaranteed within 24 hours
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="relative overflow-hidden bg-[#f3f7f1] py-10 sm:py-14">
          <div className="pointer-events-none absolute -left-24 top-10 h-48 w-48 rounded-full bg-green-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-lime-200/30 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-green-100/80 bg-white/95 shadow-[0_16px_40px_-24px_rgba(22,101,52,0.35)]">
              <div className="flex flex-col gap-1 border-b border-green-100 bg-gradient-to-r from-green-800 to-green-600 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-green-100">
                    Get in touch
                  </p>
                  <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                    Send us a message
                  </h2>
                </div>
                <p className="text-xs text-green-50/90 sm:max-w-xs sm:text-right sm:text-sm">
                  We usually reply within 24 hours.
                </p>
              </div>

              <div className="p-5 sm:p-7 lg:p-8">
                {isSubmitted ? (
                  <div className="mx-auto max-w-lg py-4 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      Message received
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Thank you for contacting PRK Smile. We&apos;ll get back to you within
                      24–48 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-4 rounded-full bg-green-700 px-6 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-green-800"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    {submitError ? (
                      <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {submitError}
                      </div>
                    ) : null}

                    <form onSubmit={submit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className={labelClass}>
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={formData.hotelName}
                            onChange={onChange("hotelName")}
                            className={fieldClass(!!errors.hotelName)}
                            placeholder="Your full name"
                          />
                          {errors.hotelName ? (
                            <p className="mt-1 text-xs text-red-600">{errors.hotelName}</p>
                          ) : null}
                        </div>

                        <div>
                          <label className={labelClass}>
                            Contact Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={formData.contactNumber}
                            onChange={onChange("contactNumber")}
                            inputMode="numeric"
                            className={fieldClass(!!errors.contactNumber)}
                            placeholder="10-digit mobile"
                          />
                          {errors.contactNumber ? (
                            <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>
                          ) : null}
                        </div>

                        <div>
                          <label className={labelClass}>
                            Email <span className="font-normal text-slate-400">(optional)</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={onChange("email")}
                            className={fieldClass(!!errors.email)}
                            placeholder="you@example.com"
                          />
                          {errors.email ? (
                            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                          ) : null}
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className={labelClass}>
                            Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={formData.address}
                            onChange={onChange("address")}
                            className={fieldClass(!!errors.address)}
                            placeholder="Street, area, building"
                          />
                          {errors.address ? (
                            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                          ) : null}
                        </div>

                        <div>
                          <label className={labelClass}>
                            PIN Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={formData.pinCode}
                            onChange={onChange("pinCode")}
                            inputMode="numeric"
                            maxLength={6}
                            className={fieldClass(!!errors.pinCode)}
                            placeholder="6-digit PIN"
                          />
                          {errors.pinCode ? (
                            <p className="mt-1 text-xs text-red-600">{errors.pinCode}</p>
                          ) : null}
                        </div>

                        <div>
                          <label className={labelClass}>
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={formData.city}
                            onChange={onChange("city")}
                            className={fieldClass(!!errors.city)}
                            placeholder="Your city"
                          />
                          {errors.city ? (
                            <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                          ) : null}
                        </div>

                        <div>
                          <label className={labelClass}>
                            Landmark{" "}
                            <span className="font-normal text-slate-400">(optional)</span>
                          </label>
                          <input
                            value={formData.landmark}
                            onChange={onChange("landmark")}
                            className={fieldClass(false)}
                            placeholder="Nearby landmark"
                          />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className={labelClass}>
                            Message <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={formData.message}
                            onChange={onChange("message")}
                            className={`${fieldClass(!!errors.message)} min-h-[110px] resize-y`}
                            placeholder="How can we help — bulk orders, delivery, partnership…"
                          />
                          {errors.message ? (
                            <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-green-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500 sm:text-sm">
                          Prefer chat? Use the WhatsApp button anytime.
                        </p>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center rounded-full bg-green-700 px-10 py-3 text-sm font-bold text-white shadow-md shadow-green-700/20 transition-all hover:scale-[1.02] hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {isSubmitting ? "Sending…" : "Send Message"}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Official Contact Details */}
        <section className="relative overflow-hidden bg-gray-50 py-24">
          <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100 opacity-30 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="font-heading text-4xl font-extrabold text-gray-900">
                Official Contact Details
              </h2>
              <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-green-500" />
              <p className="mx-auto mt-6 max-w-2xl text-xl font-light italic text-gray-600">
                &quot;Connecting farmers to your doorstep with integrity and professional
                care.&quot;
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Address */}
              <div className="group rounded-3xl border-b-4 border-green-500 bg-white p-8 shadow-md transition-all duration-500 hover:shadow-2xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-all duration-300 group-hover:bg-green-600 group-hover:text-white">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-900">
                  Our Address
                </h3>
                <address className="not-italic">
                  <p className="mb-3 text-sm font-bold uppercase tracking-wide text-green-700">
                    PRK Smile ID Greens
                  </p>
                  <p className="text-sm leading-6 text-gray-600">
                    Site No. 954, 5th Cross Road
                    <br />
                    Vijayabank Layout, Bilekahalli Village
                    <br />
                    Begur Hobli, Bengaluru
                    <br />
                    <span className="font-semibold text-gray-800">Karnataka 560076</span>
                  </p>
                </address>
              </div>

              {/* Call */}
              <div className="group rounded-3xl border-b-4 border-yellow-400 bg-white p-8 shadow-md transition-all duration-500 hover:shadow-2xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 transition-all duration-300 group-hover:bg-yellow-400 group-hover:text-white">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-900">
                  Call Us
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Main Line
                    </p>
                    <a
                      href="tel:8884672766"
                      className="block text-xl font-black text-gray-700 transition-colors hover:text-green-600"
                    >
                      8884672766
                    </a>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Backup
                    </p>
                    <a
                      href="tel:9606670144"
                      className="block text-xl font-black text-gray-700 transition-colors hover:text-green-600"
                    >
                      9606670144
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group rounded-3xl border-b-4 border-red-500 bg-white p-8 shadow-md transition-all duration-500 hover:shadow-2xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-900">
                  Email Us
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Official Support
                </p>
                <a
                  href="mailto:prksmilegroups2020@gmail.com"
                  className="mt-2 block break-words font-bold text-gray-700 transition-colors hover:text-green-600"
                >
                  prksmilegroups2020@gmail.com
                </a>
                <div className="mt-6 rounded-2xl bg-green-50 p-4">
                  <p className="text-xs italic leading-relaxed text-green-700">
                    &quot;For bulk orders, feedback, or any query — drop us a note. We
                    respond within 24 hours.&quot;
                  </p>
                </div>
              </div>

              {/* Download App */}
              <div className="group rounded-3xl border-b-4 border-blue-500 bg-white p-8 shadow-md transition-all duration-500 hover:shadow-2xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-900">
                  Download App
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Get It On Google Play
                </p>
                <a
                  href="https://play.google.com/store/apps/details?id=com.prksmile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block border-b-2 border-blue-100 pb-1 text-lg font-black text-blue-600 transition-colors hover:text-blue-800"
                >
                  Download Now
                </a>
                <p className="mt-4 text-xs text-gray-400">
                  Order fresh fruits and vegetables anytime from our mobile app.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/918884672766"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp at 8884672766"
        title="WhatsApp — 8884672766"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};

export default WebsiteContact;

