"use client";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto glass-panel p-8 sm:p-12 rounded-2xl border border-white/10">
                <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-white/10">Privacy Policy</h1>

                <div className="space-y-10 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="text-blue-500">1.</span> Information We Collect</h2>
                        <p className="mb-4">We collect information you provide directly to us to create a seamless learning experience.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400 text-sm">
                            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and profile photo to create your unique user identity.</li>
                            <li><strong>Skills Profile:</strong> Information about the skills you want to teach or learn ("Offers" and "Requests").</li>
                            <li><strong>Communications:</strong> Messages and requests sent through our secure in-app messaging system.</li>
                            <li><strong>Usage Data:</strong> We monitor platform activity to ensure safety and improve performance.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="text-purple-500">2.</span> How We Use Your Information</h2>
                        <p>We use the information we collect to facilitate the peer-to-peer learning experience and maintain platform integrity, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400 text-sm">
                            <li>Connecting you with other students based on matching skill interests.</li>
                            <li>Providing personalized recommendations for mentors or learners.</li>
                            <li>Sending you important updates, security alerts, and support messages.</li>
                            <li>Detecting and preventing fraud, abuse, and security incidents.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="text-green-500">3.</span> Information Sharing</h2>
                        <p className="mb-4">We respect your privacy and do not sell your data. Information is shared only as follows:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400 text-sm">
                            <li><strong>With Other Users:</strong> Your name, general location (if applicable), profile picture, reviews, and listed skills are visible to other verified users to facilitate connections.</li>
                            <li><strong>For Legal Reasons:</strong> We may share info if required by law or to protect the rights and safety of our community.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="text-pink-500">4.</span> Your Choices & Rights</h2>
                        <p className="mb-4">You have control over your personal information:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400 text-sm">
                            <li><strong>Access & Update:</strong> You can edit your profile information at any time via the Settings page.</li>
                            <li><strong>Blocking:</strong> You can block specific users from contacting you.</li>
                            <li><strong>Deletion:</strong> You may delete your account and associated data through the Delete Account option in Settings.</li>
                        </ul>
                    </section>

                    <div className="pt-8 text-sm text-gray-500 border-t border-white/10">
                        Last updated: December 11, 2025 • Contact us at support@skillswap.app
                    </div>
                </div>
            </div>
        </div>
    );
}
