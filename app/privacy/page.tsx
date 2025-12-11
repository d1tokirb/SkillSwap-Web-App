"use client";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto glass-panel p-8 sm:p-12 rounded-2xl border border-white/10">
                <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-white/10">Privacy Policy</h1>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, profile picture, and skills information.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
                        <p>We use the information we collect to facilitate the peer-to-peer learning experience, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                            <li>Connecting you with other students based on skills.</li>
                            <li>Sending you updates, security alerts, and support messages.</li>
                            <li>Improving and personalizing our services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Information Sharing</h2>
                        <p>We do not share your personal information with third parties for marketing purposes. Your profile information (name, skills, rating) is visible to other verified users on the platform to facilitate connections.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Your Choices</h2>
                        <p>You may update, correct, or delete information about you at any time by logging into your online account. If you wish to delete your account entirely, please contact us or use the delete function in your profile settings.</p>
                    </section>

                    <div className="pt-8 text-sm text-gray-500 border-t border-white/10">
                        Last updated: December 11, 2025
                    </div>
                </div>
            </div>
        </div>
    );
}
