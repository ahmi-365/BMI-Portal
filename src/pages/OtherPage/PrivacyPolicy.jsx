import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

const PRIVACY_NOTICE_TEXT = `Privacy Notice
BMI Roofing Systems Sdn. Bhd. (Registration No. 197401002179 (19163-M)) Effective:
[DATE] | Version 1.0
1. Introduction
This Privacy Notice is issued pursuant to the Personal Data Protection Act 2010 ("PDPA") and
explains how BMI Roofing Systems Sdn. Bhd. ("Company") collects, uses, discloses, and
protects your personal data in connection with the Customer Portal ("Portal"). By registering for
a Portal account, you consent to the processing of your personal data as described herein.
2. Data We Collect and Sources
2.1 We collect the following personal data:
Category Examples
Identity & Contact Name, designation, email, phone number, business address
Company Company name, registration number, customer account number
Account Username, encrypted password, preferences
Technical & Usage IP address, browser type, device info, login timestamps, access
logs, documents viewed/downloaded
2.2 Data is collected from: (a) you directly at registration or when you contact us; (b) your
employer or company administrator; and (c) automatically via server logs and cookies when you
access the Portal.
2.3 We do not collect sensitive personal data (as defined under Section 4 of the PDPA) through
the Portal.
3. Purpose of Processing
3.1 Your personal data is processed for:
(a) account creation, authentication, and administration;
(b) provision of Portal services and document access;
(c) communication regarding your account, documents, or Portal updates;
(d) security monitoring, fraud detection, and prevention of unauthorized access;
(e) compliance with legal and regulatory obligations, including LHDN requirements; and
(f) enforcement of the Portal Terms of Use.
3.2 We will not process your data for purposes beyond those stated above without your prior
consent, unless required by law.
4. Data Provision and Consequences
4.1 Personal data marked as mandatory during registration is obligatory. If not provided, we will
be unable to create your account or provide Portal access.
4.2 Data marked as optional may be withheld without affecting core Portal services.
5. Disclosure
5.1 Your personal data may be disclosed to:
(a) IT and hosting service providers — subject to confidentiality obligations;
(b) BMI Group affiliates — for group-level IT support where necessary;
(c) Professional advisors — for legal, audit, or compliance purposes;
(d) Regulatory authorities, courts, or law enforcement — where required by law.
5.2 We will not sell, rent, or trade your personal data.
6. Cross-Border Transfers
6.1 Your data may be transferred to jurisdictions where BMI Group affiliates or service providers
operate. Any such transfer will comply with Section 129 of the PDPA, with appropriate
contractual safeguards to ensure a comparable standard of protection.
7. Data Security
7.1 We implement appropriate technical and organizational measures to protect your data,
including encryption, access controls, regular security assessments, and staff training.
7.2 In the event of a data breach affecting your personal data, we will notify you and relevant
authorities as required by applicable law and take immediate steps to contain and mitigate the
breach.
8. Retention
8.1 Personal data is retained only as long as necessary to fulfil the purposes in Clause 3,
subject to:
Data Category Retention Period
Account & Communication Data Customer relationship + 7 years (per Income Tax Act
1967)
Technical & Usage Data 2 years from collection
8.2 Upon expiry, data will be securely deleted or irreversibly anonymized.
9. Your Rights
9.1 Under the PDPA, you may:
(a) request access to your personal data (Section 12);
(b) request correction of inaccurate or incomplete data (Section 34);
(c) withdraw consent to processing (Section 38); and
(d) request cessation of processing where it causes unwarranted substantial damage or distress
(Section 42).
9.2 Submit requests in writing to the Data Protection contact in Clause 12. We will respond
within 21 days. A prescribed fee may apply to access requests under the Personal Data
Protection (Fees) Regulations. We may refuse requests that are frivolous, legally restricted, or
would prejudice crime prevention, with written reasons provided.
10. Cookies
10.1 The Portal uses: (a) strictly necessary cookies for authentication and session
management; (b) functional cookies for user preferences (up to 12 months); and (c) analytics
cookies for performance monitoring (up to 24 months). No advertising or third-party tracking
cookies are used. Cookie preferences may be managed through your browser settings.
11. Changes to This Notice
11.1 We may update this Privacy Notice from time to time. Material changes will be notified via
email or Portal notification before taking effect. Continued use after the effective date constitutes
acceptance.
12. Contact and Complaints
BMI Roofing Systems Sdn. Bhd. (Registration No. 197401002179 (19163-M))
Company Address : Suite 11.02, 11th Floor, Menara JKG, No.282, Jalan raja Laut, 50350,
Kuala Lumpur.
Registered Address: 802, 8th Floor, Block C, Kelana Square, 17 Jalan SS7/26, Petaling
Jaya, 47301 Selangor
Email: invoicing.malaysia@bmigroup.com
Tel: 03-2176 0600 (Invoicing Department)
If unsatisfied with our response, you may lodge a complaint with:
Jabatan Perlindungan Data Peribadi (JPDP) Aras 6, Kompleks Kementerian
Komunikasi dan Digital 62100 Putrajaya, Malaysia Tel: 03-8000 8000 |
www.pdp.gov.my`;

const parsePrivacyNotice = (rawText) => {
  const lines = String(rawText).split("\n");
  const sections = [];
  const headerLines = [];
  let current = null;

  lines.forEach((line) => {
    if (/^\d+\.\s/.test(line)) {
      if (current) sections.push(current);
      current = { title: line, lines: [] };
      return;
    }

    if (current) {
      current.lines.push(line);
    } else {
      headerLines.push(line);
    }
  });

  if (current) sections.push(current);
  return { headerLines, sections };
};

const renderWithLinks = (line, keyPrefix = "privacy-line") => {
  const tokens = String(line).split(
    /(www\.pdp\.gov\.my|invoicing\.malaysia@bmigroup\.com)/g,
  );

  return tokens.map((token, idx) => {
    if (token === "www.pdp.gov.my") {
      return (
        <a
          key={`${keyPrefix}-${idx}`}
          href="https://www.pdp.gov.my"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
        >
          {token}
        </a>
      );
    }

    if (token === "invoicing.malaysia@bmigroup.com") {
      return (
        <a
          key={`${keyPrefix}-${idx}`}
          href="mailto:invoicing.malaysia@bmigroup.com"
          className="font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
        >
          {token}
        </a>
      );
    }

    return <span key={`${keyPrefix}-${idx}`}>{token}</span>;
  });
};

export default function PrivacyPolicy() {
  const parsed = parsePrivacyNotice(PRIVACY_NOTICE_TEXT);

  return (
    <>
      <PageMeta
        title="Privacy Policy - BMI Invoice Management System"
        description="Privacy Notice for BMI Roofing Systems Customer Portal users."
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#f8fafc_45%,_#e2e8f0_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_#020617_45%,_#111827_100%)] sm:px-6 lg:px-8 scroll-smooth">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-blue-900/40 dark:bg-slate-900/70">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300">
              Quick Navigation
            </h2>
            <div className="mt-4 space-y-2">
              {parsed.sections.map((section, index) => (
                <a
                  key={`nav-${index}`}
                  href={`#privacy-section-${index + 1}`}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                >
                  {section.title}
                </a>
              ))}
            </div>

            <Link
              to="/user/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Back to Login
            </Link>
          </aside>

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-8 scroll-smooth">
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/40 dark:bg-blue-900/20">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Privacy Notice
              </h1>
              <div className="mt-3 space-y-1 text-sm leading-6 text-gray-700 dark:text-gray-200">
                {parsed.headerLines.map((line, idx) => (
                  <p key={`header-line-${idx}`}>
                    {renderWithLinks(line, `header-${idx}`)}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {parsed.sections.map((section, sIdx) => (
                <section
                  id={`privacy-section-${sIdx + 1}`}
                  key={`privacy-section-${sIdx}`}
                  className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <div className="mt-3 space-y-1 text-sm leading-7 text-gray-700 dark:text-gray-300">
                    {section.lines.map((line, lIdx) => (
                      <p
                        key={`privacy-line-${sIdx}-${lIdx}`}
                        className="whitespace-pre-wrap"
                      >
                        {renderWithLinks(line, `line-${sIdx}-${lIdx}`)}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
