import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-green-50 selection:text-green-900">
      <WebsiteHeader />

      <main className="pt-40 pb-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
          
          {/* Header Section */}
          <header className="mb-24 border-b border-slate-100 pb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
              Privacy Policy
            </h1>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Suggi Thota By PRK Smile</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span>Last updated: December 2024</span>
            </div>
          </header>

          {/* Standard Paragraph Layout */}
          <div className="space-y-16">
            
            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Introduction</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                At Suggi Thota By PRK Smile, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Information We Collect</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6 font-medium italic">
                We collect several types of information for various purposes to provide and improve our service to you:
              </p>
              <ul className="space-y-4 list-none p-0">
                {[
                  { t: "Personal Information", d: "Name, email address, phone number, delivery address" },
                  { t: "Usage Data", d: "How you use our app, features accessed, time spent" },
                  { t: "Device Information", d: "Device type, operating system, unique device identifiers" },
                  { t: "Location Data", d: "Your delivery location for order fulfillment" },
                  { t: "Payment Information", d: "Payment method details (processed securely by third-party providers)" }
                ].map((item, i) => (
                  <li key={i} className="flex flex-col gap-1 py-4 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-black uppercase tracking-widest text-slate-900">{item.t}</span>
                    <span className="text-lg text-slate-500 leading-relaxed">{item.d}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">How We Use Your Information</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                Suggi Thota By PRK Smile uses the collected information for various purposes:
              </p>
              <div className="space-y-6">
                {[
                  { t: "Service Provision", d: "To process and deliver your orders (Order Time: 7:00 AM to 1:00 AM)" },
                  { t: "Communication", d: "To send order updates, promotional offers, and customer support" },
                  { t: "Improvement", d: "To analyze usage patterns and improve our services" },
                  { t: "Security", d: "To detect and prevent fraud, and ensure platform security" },
                  { t: "Personalization", d: "To provide personalized recommendations and offers" },
                  { t: "Legal Compliance", d: "To comply with applicable laws and regulations" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-3 shrink-0" />
                    <p className="text-lg text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-900">{item.t}:</span> {item.d}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Data Sharing and Disclosure</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                We may share your information in the following circumstances:
              </p>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li><strong>Service Providers:</strong> With trusted third-party service providers (payment processors, delivery partners)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li><strong>Safety:</strong> To protect our rights, property, or safety, and that of our users</li>
              </ul>
              <div className="mt-10 p-8 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-lg font-bold text-green-900">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </div>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Data Security</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="space-y-3 list-disc pl-5 text-slate-600 text-lg">
                <li><strong>Encryption:</strong> All sensitive data is encrypted using industry-standard protocols</li>
                <li><strong>Access Control:</strong> Limited access to personal information based on job requirements</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                <li><strong>Secure Infrastructure:</strong> Use of secure servers and cloud infrastructure</li>
              </ul>
              <p className="mt-6 text-slate-400 italic text-sm">
                However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Data Retention</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                We retain your personal information only as long as necessary:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   { t: "Account Information", d: "Until you delete your account" },
                   { t: "Order History", d: "For 7 years to comply with legal requirements" },
                   { t: "Communication Records", d: "For 2 years for customer service purposes" },
                   { t: "Analytics Data", d: "In anonymized form for business analysis" }
                 ].map((item, i) => (
                   <div key={i} className="p-6 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.t}</p>
                      <p className="text-base font-bold text-slate-900">{item.d}</p>
                   </div>
                 ))}
              </div>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Your Rights</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                You have the following rights regarding your personal information:
              </p>
              <ul className="space-y-3 list-disc pl-5 text-slate-600 text-lg mb-8">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-lg text-slate-600">
                To exercise these rights, contact us at <span className="font-bold text-slate-900 underline decoration-slate-200">privacy@prksmile.com</span>
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Cookies and Tracking</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                We use cookies and similar tracking technologies:
              </p>
              <ul className="space-y-3 list-disc pl-5 text-slate-600 text-lg">
                <li><strong>Essential Cookies:</strong> Required for basic app functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand how you use our app</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
              <p className="mt-6 text-slate-400 text-sm">You can control cookie settings through your device preferences.</p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Children's Privacy</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from children under 13, we will take steps to delete such information immediately.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Changes to This Policy</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                We may update our Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg mb-8">
                <li>Posting the new Privacy Policy in this location</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice in our app</li>
              </ul>
              <p className="text-lg text-slate-600 font-bold">
                Your continued use of our services after any changes constitutes acceptance of the new policy.
              </p>
            </section>

            <section className="pt-24 border-t border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight text-center md:text-left">Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Official Address</p>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                      Site No.954, 5th Cross Road, Vijayabank Layout, Bilekahalli Village, Begur Hobli, Bilekahalli, Bengaluru, Karnataka-560076
                    </p>
                 </div>
                 <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Communication Channels</p>
                      <p className="text-lg text-slate-900 font-black">8884672766 / 9606670144</p>
                      <p className="text-lg text-slate-900 font-black">prksmilegroups2020@gmail.com</p>
                    </div>
                    <div className="bg-slate-900 text-white p-10 rounded-3xl">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 text-center md:text-left">Customer Care Line</p>
                      <p className="text-3xl font-black text-center md:text-left">9606670144</p>
                      <p className="text-[10px] text-slate-400 mt-4 text-center md:text-left uppercase tracking-widest font-bold italic">Response within 30 days</p>
                    </div>
                 </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default PrivacyPolicy;
