import { useMemo, useState } from "react";
import api from "@/api/axios";
import { WebsiteHeader } from "@/components/website/WebsiteHeader";

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
      await api.post("/contact/send-message", {
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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <WebsiteHeader />

      <main>
        {/* Hero */}
        <section className="relative flex h-[520px] items-center overflow-hidden pt-24 bg-[url('/top-view-tasty-fruits-arrangement.jpg')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/60" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <h1 className="font-heading text-5xl font-bold leading-tight md:text-6xl">
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
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              {isSubmitted ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-gray-900">
                    Message Received
                  </h2>
                  <p className="mt-3 text-lg text-gray-600">
                    Thank you for contacting PRK Smile. We have received your
                    message and will get back to you within 24-48 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-heading text-2xl font-semibold text-gray-900">
                    Send us a message
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Please fill out the details below.
                  </p>

                  {submitError ? (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {submitError}
                    </div>
                  ) : null}

                  <form onSubmit={submit} className="mt-8 space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={formData.hotelName}
                        onChange={onChange("hotelName")}
                        className={[
                          "w-full rounded-lg border px-4 py-3 transition-colors duration-200",
                          errors.hotelName ? "border-red-500" : "border-gray-300",
                          "focus:border-green-500 focus:ring-2 focus:ring-green-500",
                        ].join(" ")}
                        placeholder="Enter your name"
                      />
                      {errors.hotelName ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.hotelName}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={formData.contactNumber}
                        onChange={onChange("contactNumber")}
                        inputMode="numeric"
                        className={[
                          "w-full rounded-lg border px-4 py-3 transition-colors duration-200",
                          errors.contactNumber ? "border-red-500" : "border-gray-300",
                          "focus:border-green-500 focus:ring-2 focus:ring-green-500",
                        ].join(" ")}
                        placeholder="Enter contact number"
                      />
                      {errors.contactNumber ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contactNumber}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={onChange("email")}
                        className={[
                          "w-full rounded-lg border px-4 py-3 transition-colors duration-200",
                          errors.email ? "border-red-500" : "border-gray-300",
                          "focus:border-green-500 focus:ring-2 focus:ring-green-500",
                        ].join(" ")}
                        placeholder="Enter your email address"
                      />
                      {errors.email ? (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={formData.address}
                        onChange={onChange("address")}
                        className={[
                          "w-full rounded-lg border px-4 py-3 transition-colors duration-200",
                          errors.address ? "border-red-500" : "border-gray-300",
                          "focus:border-green-500 focus:ring-2 focus:ring-green-500",
                        ].join(" ")}
                        placeholder="Enter your address"
                      />
                      {errors.address ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          PIN Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={formData.pinCode}
                          onChange={onChange("pinCode")}
                          inputMode="numeric"
                          className={[
                            "w-full rounded-lg border px-4 py-3 transition-colors duration-200",
                            errors.pinCode ? "border-red-500" : "border-gray-300",
                            "focus:border-green-500 focus:ring-2 focus:ring-green-500",
                          ].join(" ")}
                          placeholder="Enter your PIN code"
                          maxLength={6}
                        />
                        {errors.pinCode ? (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.pinCode}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={formData.city}
                          onChange={onChange("city")}
                          className={[
                            "w-full rounded-lg border px-4 py-3 transition-colors duration-200",
                            errors.city ? "border-red-500" : "border-gray-300",
                            "focus:border-green-500 focus:ring-2 focus:ring-green-500",
                          ].join(" ")}
                          placeholder="Enter your city name"
                        />
                        {errors.city ? (
                          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Landmark (optional)
                      </label>
                      <input
                        value={formData.landmark}
                        onChange={onChange("landmark")}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                        placeholder="Nearby landmark"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={6}
                        value={formData.message}
                        onChange={onChange("message")}
                        className={[
                          "w-full resize-none rounded-lg border px-4 py-3 transition-colors duration-200",
                          errors.message ? "border-red-500" : "border-gray-300",
                          "focus:border-green-500 focus:ring-2 focus:ring-green-500",
                        ].join(" ")}
                        placeholder="Tell us how we can help you..."
                      />
                      {errors.message ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.message}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </>
              )}
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
                <div className="space-y-1 font-medium leading-relaxed text-gray-600">
                  <p className="mb-2 font-bold text-green-700">PRK SMILE ID GREENS</p>
                  <p>Site No.954, 5th Cross Road,</p>
                  <p>Vijayabank Layout,</p>
                  <p>Bilekahalli Village,</p>
                  <p>Begur Hobli, Bilekahalli,</p>
                  <p>Bengaluru, Karnataka - 560076</p>
                </div>
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
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="mb-1 text-xs font-bold uppercase text-red-500">
                      Customer Care
                    </p>
                    <a
                      href="tel:9606670144"
                      className="block font-bold text-yellow-600"
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
                    &quot;Reach out for bulk orders, feedback, or any query. We respond
                    within 24 hours.&quot;
                  </p>
                </div>
              </div>

              {/* Online Presence */}
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-900">
                  Online Presence
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Our Website
                </p>
                <a
                  href="/"
                  className="mt-2 inline-block border-b-2 border-blue-100 pb-1 text-lg font-black text-blue-600 transition-colors hover:text-blue-800"
                >
                  www.suggithota.com
                </a>
                <p className="mt-4 text-xs text-gray-400">
                  Browse our fresh catalog and order online today!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 py-10 text-sm text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Suggi Thota. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteContact;

