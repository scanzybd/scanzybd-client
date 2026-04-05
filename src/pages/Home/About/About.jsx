import React from "react";

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-4xl bg-white shadow-lg rounded-2xl p-8">

                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    About QR Tag System
                </h1>

                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    QR Tag System is a modern web-based solution designed to connect
                    vehicle owners and service providers instantly using QR codes.
                    Each user or vehicle gets a unique QR tag that can be scanned
                    to access contact details or service information quickly and securely.
                </p>

                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    This system helps reduce the need to share personal phone numbers
                    directly. Instead, users can scan a QR code and initiate a call or
                    view profile information in a safe and controlled way.
                </p>

                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    Our platform is built with modern technologies like React,
                    Node.js, Express, MongoDB, and Firebase authentication to ensure
                    speed, security, and scalability.
                </p>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                        <h2 className="font-semibold text-blue-600 mb-2">
                            🔐 Secure Access
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Only verified users can create and manage QR profiles.
                        </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl">
                        <h2 className="font-semibold text-green-600 mb-2">
                            📱 Instant Contact
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Scan QR and directly connect with vehicle owners or providers.
                        </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl">
                        <h2 className="font-semibold text-purple-600 mb-2">
                            ⚡ Fast System
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Built with modern stack for fast and smooth performance.
                        </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-xl">
                        <h2 className="font-semibold text-yellow-600 mb-2">
                            🧩 Easy Management
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Users can easily update their profile and services anytime.
                        </p>
                    </div>
                </div>

               
            </div>
        </div>
    );
};

export default About;