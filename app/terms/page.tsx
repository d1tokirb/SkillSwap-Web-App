"use client";

export default function TermsPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto glass-panel p-8 sm:p-12 rounded-2xl border border-white/10">
                <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-white/10">Terms of Service</h1>

                <div className="space-y-10 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>By creating an account and accessing SkillSwap, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. User Conduct & Safety</h2>
                        <p className="mb-4">You agree to use SkillSwap only for lawful purposes and to treat all members with respect. You explicitly agree NOT to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400 text-sm">
                            <li>Harass, abuse, defame, or harm another person.</li>
                            <li>Post or share inappropriate, offensive, or illegal content.</li>
                            <li>Provide false or misleading personal information.</li>
                            <li>Attempt to disrupt the integrity of our systems or scrape data.</li>
                        </ul>
                        <p className="mt-4 text-sm text-yellow-500/80">Violation of these rules will result in immediate account suspension or termination.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. User Content & Licensing</h2>
                        <p>You retain all rights to any content (skills, descriptions, photos) you submit. By posting, you grant SkillSwap a worldwide, non-exclusive license to use, adapt, and display such content for the purpose of operating the platform. You represent that you own or have the necessary rights to share this content.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Disclaimers & Liability</h2>
                        <p>The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. SkillSwap connects users but does not employ them. We verify email addresses but cannot guarantee the accuracy of user-provided skills, the quality of instruction, or user conduct off-platform. Interact with others at your own risk and please follow our Safety Guidelines.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. Account Termination</h2>
                        <p>We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. Governing Law</h2>
                        <p>These Terms shall be governed by the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these terms will be resolved in the appropriate courts.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">7. Changes to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the date at the bottom of this page or by sending you an email. Your continued use of SkillSwap after any changes constitutes acceptance of the new terms.</p>
                    </section>

                    <div className="pt-8 text-sm text-gray-500 border-t border-white/10">
                        Last updated: December 11, 2025
                    </div>
                </div>
            </div>
        </div>
    );
}
