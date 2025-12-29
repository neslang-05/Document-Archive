export default function TermsPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        By accessing or using MTU Academic Archive, you agree to be bound by these Terms of Service.
      </p>
      <h2>Use of the Platform</h2>
      <p>
        You agree to use the platform only for lawful purposes and in accordance with these Terms. You must not upload any content that violates intellectual property rights or is harmful, offensive, or illegal.
      </p>
      <h2>User Contributions</h2>
      <p>
        By uploading resources, you grant us a license to use, reproduce, and distribute your contributions in connection with the platform. You represent that you own or have the necessary rights to your contributions.
      </p>
      <h2>Disclaimer</h2>
      <p>
        The materials on MTU Academic Archive are provided "as is". We make no warranties, expressed or implied, regarding the accuracy or reliability of the materials.
      </p>
    </div>
  )
}
