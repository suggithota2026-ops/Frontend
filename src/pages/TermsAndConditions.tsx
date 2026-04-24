import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-50 selection:text-blue-900">
      <WebsiteHeader />

      <main className="pt-40 pb-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
          
          {/* Header Section */}
          <header className="mb-24 border-b border-slate-100 pb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
              Terms & Conditions
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Legal Guidelines</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden md:block" />
              <span>Last updated: December 2024</span>
            </div>
          </header>

          {/* Standard Paragraph Layout */}
          <div className="space-y-16">
            
            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Acceptance of Terms</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                By downloading, installing, or using the Suggi Thota mobile application ("App"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our App.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Description of Service</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                Suggi Thota is a mobile application that connects users with local farmers and vendors to purchase fresh fruits and vegetables. Our services include:
              </p>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>Online ordering of fresh produce</li>
                <li>Home delivery services</li>
                <li>Real-time order tracking</li>
                <li>Customer support and assistance</li>
                <li>Promotional offers and discounts</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">User Account</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                To use our services, you must create an account:
              </p>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>You must provide accurate, complete, and current information</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 13 years of age to create an account</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Orders and Payments</h2>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>All orders are subject to product availability</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be made at the time of ordering</li>
                <li>We accept various payment methods as displayed in the App</li>
                <li>All payments are processed securely through third-party payment providers</li>
                <li>Order confirmation will be sent via email or SMS</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Delivery</h2>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>Delivery is available within specified service areas</li>
                <li><strong>Order Time / Cut-off Time:</strong> Orders are accepted and processed between 7:00 AM and 1:00 AM</li>
                <li>Delivery times are estimates and may vary due to traffic, weather, or other factors</li>
                <li>Someone must be available to receive the delivery</li>
                <li>We are not responsible for deliveries left unattended</li>
                <li>Delivery charges may apply based on order value and location</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Product Quality and Returns</h2>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>We strive to deliver the freshest produce available</li>
                <li>All products are quality-checked before delivery</li>
                <li>Returns are accepted within 24 hours of delivery for quality issues</li>
                <li>Refunds will be processed within 5-7 business days</li>
                <li>Damaged products will be replaced or refunded at our discretion</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">User Conduct</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6 text-left">You agree not to:</p>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>Use the App for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the App or servers</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Post or transmit harmful, offensive, or inappropriate content</li>
                <li>Use the App to harass, abuse, or harm others</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Intellectual Property</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                All content, features, and functionality of the App are owned by Suggi Thota By PRK Smile and are protected by copyright, trademark, and other intellectual property laws. You may not:
              </p>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>Reproduce, distribute, or create derivative works</li>
                <li>Use our trademarks or branding without permission</li>
                <li>Copy or reverse engineer the App or its content</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Privacy</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our App, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Limitation of Liability</h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                To the fullest extent permitted by law, Suggi Thota By PRK Smile shall not be liable for:
              </p>
              <ul className="space-y-4 list-disc pl-5 text-slate-600 text-lg">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Product quality variations due to natural factors</li>
                <li>Delivery delays beyond our reasonable control</li>
                <li>Third-party service provider failures</li>
              </ul>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Indemnification</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                You agree to indemnify and hold Suggi Thota By PRK Smile harmless from any claims, damages, or expenses arising from your use of the App or violation of these Terms.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Termination</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach the Terms. Upon termination, your right to use the App will cease immediately.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Governing Law</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </section>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Changes to Terms</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting in the App. Your continued use of the App after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="pt-24 border-t border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight text-center md:text-left">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Official Address</p>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                      Site No.954, 5th Cross Road, Vijayabank Layout, Bilekahalli Village, Begur Hobli, Bilekahalli, Bengaluru, Karnataka-560076
                    </p>
                 </div>
                 <div className="space-y-8 text-center md:text-left">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Communication Channels</p>
                      <p className="text-lg text-slate-900 font-black">8884672766 / 9606670144</p>
                      <p className="text-lg text-slate-900 font-black">prksmilegroups2020@gmail.com</p>
                    </div>
                    <div className="bg-slate-900 text-white p-10 rounded-3xl">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Customer Care Line</p>
                      <p className="text-3xl font-black">9606670144</p>
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

export default TermsAndConditions;
