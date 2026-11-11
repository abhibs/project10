import Link from "next/link";
import { getPageSeoMetadata } from "@/lib/seo-metadata";
import styles from "./privacy.module.css";
export async function generateMetadata() {
  return getPageSeoMetadata("/privacy-policy", {title: "Privacy Policy | Aryan Gold Attendance", description: "Read the Aryan Gold Attendance privacy policy covering attendance data, permissions, security and your rights."});
}
export default function PrivacyPolicyPage() {
  return <section className={styles.page}>
    <div className={styles.inner}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Privacy Policy</span></nav>
      <article className={styles.policy}>
            <h1>Privacy Policy</h1>
            <p className={styles.subtitle}>Aryan Gold Attendance</p>
            <p className={styles.updated}>Last updated: April 8, 2026</p>

            <p>
                This Privacy Policy describes how Aryan Gold Attendance (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) collects, uses, and
                protects your information when you use our mobile application.
            </p>

            <h2>1. Information We Collect</h2>

            <h3>a) Personal Information</h3>
            <ul>
                <li>Full name</li>
                <li>Employee ID </li>
            </ul>

            <h3>b) Attendance Data</h3>
            <ul>
                <li>Check-in and check-out timestamps</li>
                <li>Face photographs captured at check-in and check-out</li>
                <li>GPS location coordinates at check-in and check-out</li>
            </ul>

            <h3>c) Authentication Data</h3>
            <ul>
                <li>Login session tokens (stored locally on your device)</li>
                <li>Session data for auto-login</li>
            </ul>

            <h3>d) Device &amp; Usage Data</h3>
            <ul>
                <li>GPS/location data (latitude and longitude)</li>
                <li>Camera access for face photo capture</li>
            </ul>

            <h2>2. Permissions We Request</h2>

            <h3>a) CAMERA (android.permission.CAMERA)</h3>
            <ul>
                <li>Used to capture your face photo during attendance check-in and check-out to verify your presence.</li>
                <li>Photos are uploaded to the company server as part of the attendance record.</li>
            </ul>

            <h3>b) LOCATION (ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION)</h3>
            <ul>
                <li>Used to verify that you are within the allowed radius (500 meters) of your assigned branch before marking attendance.</li>
                <li>Location coordinates are recorded and sent to the server along with your attendance entry.</li>
            </ul>

            <h3>c) INTERNET</h3>
            <ul>
                <li>Used to communicate with the company backend server for login, attendance submission, profile retrieval, and reports.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <ul>
                <li>To authenticate you and manage your session securely</li>
                <li>To record and verify attendance check-in and check-out</li>
                <li>To validate your physical proximity to your assigned branch</li>
                <li>To display your attendance history and reports</li>
                <li>To maintain your employee profile</li>
                <li>To calculate worked hours and generate attendance summaries</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <ul>
                <li>Your session token and basic profile data are stored locally on your device using secure shared preferences.</li>
                <li>Attendance records, face photos, and location data are transmitted to and stored on our backend server (attendance.aryangold.in).</li>
                <li>All data transmission is performed over HTTPS where possible.</li>
                <li>We take reasonable measures to protect your data from unauthorized access, loss, or misuse.</li>
            </ul>

            <h2>5. Data Sharing</h2>
            <ul>
                <li>Your data is shared only with your employer/branch manager for attendance management purposes.</li>
                <li>We do not sell, rent, or share your personal data with any third parties for marketing or advertising purposes.</li>
                <li>Data may be disclosed if required by law or legal proceedings.</li>
            </ul>

            <h2>6. Data Retention</h2>
            <ul>
                <li>Attendance records and associated photos are retained for as long as required by your employer or applicable labor laws.</li>
                <li>You may request deletion of your data by contacting your system administrator.</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to employer policy)</li>
                <li>Withdraw consent for location or camera usage at any time (note: this may prevent the app from functioning correctly)</li>
            </ul>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
                This app is intended for use by employees only and is not directed at children under the age of 13. We do
                not knowingly collect data from children.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. Any changes will be reflected with an updated date
                at the top of this document. Continued use of the app after changes constitutes acceptance of the updated
                policy.
            </p>

            <h2>10. Contact Us</h2>
            <p>
                If you have any questions or concerns about this Privacy Policy, please contact your system administrator
                or reach us at:
            </p>
            <p>Website: <a href="https://aryangoldbuyers.com/">https://aryangoldbuyers.com/</a></p>
            <p>Call Us: <a href="tel:+919117125555">9117 125 555</a></p>
        </article>
    </div>
  </section>;
}
