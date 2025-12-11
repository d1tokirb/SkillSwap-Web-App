"use client";

export default function TermsPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto glass-panel p-8 sm:p-12 rounded-2xl border border-white/10">
                <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-white/10">Terms of Service</h1>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using SkillSwap, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. User Conduct</h2>
                        <p>You agree to use SkillSwap only for lawful purposes. You agree not to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                            <li>Harass, abuse, or harm another person.</li>
                            <li>Provide false or misleading information.</li>
                            <li>Use the service for any illegal or unauthorized purpose.</li>
                            <li>Attempt to disrupt or compromise the integrity of our systems.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. User Content</h2>
                        <p>You retain all rights to any content you submit, post or display on or through the services. You grant us a worldwide, non-exclusive license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Disclaimers</h2>
                        <p>The service is provided on an "AS IS" and "AS AVAILABLE" basis. SkillSwap makes no warranties, expressed or implied, regarding the reliability, accuracy, or quality of the skills taught by users.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Termination</h2>
                        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </section>

                    <div className="pt-8 text-sm text-gray-500 border-t border-white/10">
                        Last updated: December 11, 2025
                    </div>
                </div>
            </div>
        </div>
    );
}
