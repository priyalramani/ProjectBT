import React from 'react';

const PrivacyPolicy = () => {
  const sectionStyle = {
    marginBottom: '20px',
  };

  const headingStyle = {
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px',
    marginBottom: '10px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px',height:"100vh",overflow:"scroll" }}>
      <h1>Privacy Policy</h1>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>1. Overview</h2>
        <p>
          Thank you for using our service. This Privacy Policy is designed to
          help you understand how we collect, use, and safeguard your personal
          information. By using our application, you agree to the terms outlined
          in this policy.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>2. Information We Collect</h2>
        <div style={{ paddingLeft: '20px' }}>
          <h3 style={headingStyle}>2.1 Personal Information:</h3>
          <p>
            We may collect personal information such as your name, phone number,
            email address, and other relevant details when you register or use our
            services.
          </p>
          <h3 style={headingStyle}>2.2 Non-Personal Information:</h3>
          <p>
            We may also collect non-personal information, such as device
            information, usage statistics, and technical details to enhance the
            functionality of our app.
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>3. How We Use Your Information</h2>
        <div style={{ paddingLeft: '20px' }}>
          <h3 style={headingStyle}>3.1 Providing Services:</h3>
          <p>
            We use the collected information to provide and improve our services,
            including caller identification and related features.
          </p>
          <h3 style={headingStyle}>3.2 Communication:</h3>
          <p>
            We may use your contact information to send you important updates,
            announcements, and marketing materials. You can opt-out of these
            communications at any time.
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>4. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information
          to third parties without your explicit consent, except as required by
          law.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>5. Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal
          information from unauthorized access, disclosure, alteration, and
          destruction.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>6. Changes to This Privacy Policy</h2>
        <p>
          We reserve the right to modify this Privacy Policy at any time. Changes
          will be effective immediately upon posting on our app. Your continued use
          of the app after the changes constitutes acceptance of the updated
          policy.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>7. Contact Us</h2>
        <p>
          If you have any questions or concerns about our Privacy Policy, please
          contact us.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
