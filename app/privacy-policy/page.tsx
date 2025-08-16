import React from "react";
import Head from "next/head";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Privacy Policy - BookMyChamber</title>
        <meta name="description" content="BookMyChamber Privacy Policy" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy</h1>

      <p className="text-lg mb-4">
        Last updated: <strong>December 2024</strong>
      </p>

      <p className="text-lg mb-4">
        At <strong>BookMyChamber</strong>, we are committed to protecting your
        privacy. This Privacy Policy explains how we collect, use, and safeguard
        your personal data when you use our app and services.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        Information We Collect
      </h2>
      <p className="text-lg mb-4">
        We collect personal information such as your name, contact details,
        medical history, and appointment data to provide our services. This
        information is collected when you sign up, book appointments, or
        interact with the app.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        How We Use Your Information
      </h2>
      <p className="text-lg mb-4">
        We use the information we collect to:
        <ul className="list-disc pl-6">
          <li>Provide medical appointments and services.</li>
          <li>
            Send reminders and notifications regarding appointments and
            prescriptions.
          </li>
          <li>Improve app functionality and user experience.</li>
          <li>
            Communicate with you regarding customer support or any changes to
            the app.
          </li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        Data Sharing and Disclosure
      </h2>
      <p className="text-lg mb-4">
        We do not sell, rent, or share your personal information with third
        parties, except in the following cases:
        <ul className="list-disc pl-6">
          <li>
            To comply with legal obligations or requests from authorities.
          </li>
          <li>
            To third-party service providers who assist us in operating the app
            and providing our services (e.g., payment processors, healthcare
            providers).
          </li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Data Security</h2>
      <p className="text-lg mb-4">
        We implement robust security measures to protect your personal data.
        However, no method of transmission over the internet or method of
        electronic storage is 100% secure. We cannot guarantee the absolute
        security of your information.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Your Rights</h2>
      <p className="text-lg mb-4">
        You have the right to:
        <ul className="list-disc pl-6">
          <li>Access your personal data stored in our app.</li>
          <li>Request correction or deletion of your personal data.</li>
          <li>Withdraw consent for data processing, where applicable.</li>
        </ul>
        To exercise any of these rights, please contact us through the app or at{" "}
        <strong>support@BookMyChamberapp.com</strong>.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        Changes to This Privacy Policy
      </h2>
      <p className="text-lg mb-4">
        We may update this Privacy Policy from time to time. Any changes will be
        posted on this page with an updated revision date. Please review this
        Privacy Policy regularly to stay informed.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Contact Us</h2>
      <p className="text-lg mb-4">
        If you have any questions or concerns about this Privacy Policy or how
        we handle your personal data, please contact us at:
      </p>
      <p className="text-lg">
        <strong>Email:</strong> support@BookMyChamberapp.com
      </p>
    </div>
  );
};

export default PrivacyPolicy;
