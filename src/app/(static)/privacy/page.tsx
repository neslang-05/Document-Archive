export default function PrivacyPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        At MTU Academic Archive, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
      </p>
      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly to us, such as when you create an account, upload resources, or contact us. This may include your name, email address, and academic details.
      </p>
      <h2>How We Use Your Information</h2>
      <p>
        We use your information to provide and improve our services, communicate with you, and ensure the security of our platform.
      </p>
      <h2>Data Security</h2>
      <p>
        We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
      </p>
      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at privacy@mtu.ac.in.
      </p>
    </div>
  )
}
