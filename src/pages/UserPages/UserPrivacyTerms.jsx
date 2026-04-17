import { BookOpen, FileText, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

const TERMS_TEXT = `Customer Portal Terms of Use
BMI Roofing Systems Sdn. Bhd. Effective Date: [DATE] | Version 1.0
1. Acceptance of Terms
1.1 These Terms of Use ("Terms"), effective [DATE] (Version 1.0), govern the use of the
Customer Portal ("Portal") provided by BMI Roofing Systems Sdn. Bhd. (Registration No.
197401002179 (19163-M)) ("Company"). "User" or "you" refers to any authorized individual or
entity accessing the Portal on behalf of a customer.
1.2 By clicking "I Accept" or registering for an account, you confirm that you have read,
understood, and agree to be bound by these Terms. If you do not agree, do not access or use
the Portal.
2. Purpose of the Portal and Permitted Use
2.1 The Portal enables authorized customers to access and download financial and
transaction-related documents issued by the Company, including but not limited to:
(a) Invoices (including LHDN-compliant e-Invoices);
(b) Credit Notes;
(c) Debit Notes;
(d) Statements of Account; and
(e) Prompt Payment Incentives.
2.2 Documents accessible via the Portal are provided in compliance with the requirements of
the Inland Revenue Board of Malaysia ("LHDN") where applicable. The Portal is intended solely
for use by customers of the Company in connection with their business transactions with the
Company.
2.3 Documents are for reference, record-keeping, and internal business purposes. Users must
not:
(a) alter, manipulate, or misrepresent any documents;
(b) use documents for fraudulent or unlawful purposes; or
(c) distribute documents to third parties except for accounting, auditing, LHDN tax compliance,
or as required by law.
3. User Access and Account Responsibility
3.1 Access is provided through user accounts created by the Company. An initial username and
password will be assigned to the customer by the Company.
3.2 Users must change their password upon first login. Users agree to:
(a) keep their login credentials confidential;
(b) not share account access with unauthorized persons;
(c) be responsible for all activities conducted under their account; and
(d) notify the Company immediately upon suspecting unauthorized access.
3.3 The Company shall not be liable for unauthorized access caused by the customer's failure to
safeguard login credentials. The Company reserves the right to suspend or terminate accounts
suspected of misuse or violation of these Terms, with reasonable prior notice where practicable.
3.6 Personal data collected for account creation and management shall be processed in
accordance with the Personal Data Protection Act 2010 ("PDPA") and the Company's Privacy
Notice, which is available at [URL/link] and will be provided to Users at the point of account
registration.
4. Accuracy of Information
4.1 The Company makes reasonable efforts to ensure the accuracy of information available on
the Portal but does not guarantee that all documents are free from errors or omissions. In the
event of a discrepancy, the Company's official records shall prevail. The Company will notify the
affected customer of the discrepancy within a reasonable time of discovery and provide
corrected documents promptly.
5. System Availability
5.1 The Company aims to ensure the Portal is accessible at all times but may experience
downtime due to:
(a) scheduled maintenance;
(b) technical issues;
(c) security updates; or
(d) Force Majeure Events (as defined in Clause 10).
5.2 The Company is not liable for losses from temporary unavailability, except to the extent
caused by the Company's wilful default or gross negligence.
6. Data Security and Personal Data Protection
6.1 Users must ensure that downloaded documents are stored securely within their own
systems. The Company will implement appropriate technical and organizational measures to
protect the Portal and personal data in accordance with the Security Principle under the PDPA.
In the event of a data breach affecting User personal data, the Company will notify affected
Users and relevant authorities as required by applicable law. The Company does not guarantee
absolute protection against unauthorized access or cyber threats.
6.2 The Company collects, processes, and stores personal data in connection with Portal
access and use, including but not limited to: name, email address, contact number, company
name, designation, login credentials, and usage logs.
6.3 Personal data is collected for the following purposes:
(a) account creation, authentication, and administration;
(b) provision of Portal services and document access;
(c) communication regarding the Portal, documents, or the customer relationship;
(d) security monitoring and fraud prevention; and
(e) compliance with legal and regulatory obligations, including requirements of the LHDN.
6.4 The Company will not disclose personal data to third parties except:
(a) to service providers engaged by the Company for Portal hosting, maintenance, or support,
subject to appropriate confidentiality obligations;
(b) where required by law, regulation, or court order; or
(c) with the User's consent.
6.5 Users have the right under the PDPA to:
(a) request access to their personal data held by the Company;
(b) request correction of personal data that is inaccurate, incomplete, or misleading; and
(c) withdraw consent to the processing of personal data, subject to any legal or contractual
restrictions.
6.6 Requests under Clause 6.5 may be directed to the Company contact detailed in Clause 14.
The Company will respond to such requests within 21 days of receipt, or such longer period as
permitted under the PDPA.
6.7 The Company will retain personal data only for as long as necessary to fulfil the purposes
set out in Clause 6.3, or as required by applicable law. Upon account termination, personal data
will be securely deleted or anonymized within 90 days, unless retention is required for legal,
regulatory, or audit purposes.
6.8 For further details, Users are directed to the Company's Privacy Notice available at
[URL/link].
7. Intellectual Property
7.1 All Portal design, software, and systems are and remain the intellectual property of the
Company. Users are granted a limited, non-exclusive, non-transferable right to access and
download documents for legitimate business use.
8. Suspension and Termination
8.1 The Company may suspend or terminate Portal access if:
(a) the User breaches these Terms and fails to remedy such breach within 14 days of written
notice;
(b) unauthorized or suspicious activity is detected, in which case immediate suspension without
notice is permitted; or
(c) the customer relationship with the Company ends.
8.2 Upon termination, Users will be given 30 days to download their documents before access is
permanently revoked.
9. Limitation of Liability
9.1 The Company's total aggregate liability arising out of or in connection with the Portal shall
not exceed the total fees paid by the customer to the Company in the preceding 12 months, or
RM10,000, whichever is greater.
9.2 The Company shall not be liable for indirect, consequential, or incidental loss, including loss
of profit, revenue, or data.
9.3 Nothing in these Terms excludes liability for: (a) death or personal injury from negligence; (b)
fraud; (c) wilful default or gross negligence; or (d) any liability that cannot be excluded under
Malaysian law.
10. Force Majeure
10.1 Neither party is liable for failure or delay caused by events beyond reasonable control,
including natural disasters, pandemics, war, government orders, telecommunications failure,
cyberattacks (provided reasonable security was maintained), or power outages ("Force Majeure
Event").
10.2 The affected party must notify the other promptly and take reasonable steps to mitigate. If a
Force Majeure Event continues for more than 60 days, either party may terminate by 14 days'
written notice.
11. Amendments
11.1 The Company may amend these Terms from time to time. Users will be notified of material
changes via email or Portal notification before the updated Terms take effect. Users who
disagree may discontinue use and request account closure.
12. Governing Law and Disputes
12.1 These Terms shall be governed by and interpreted in accordance with the laws of
Malaysia.
12.2 Any disputes arising from the use of the Portal shall be subject to the exclusive
jurisdiction of the courts of Malaysia.
13. General
13.1 Severability: If any provision is found invalid or unenforceable, it shall be severed and the
remaining provisions continue in full force.
13.2 Entire Agreement: These Terms and the Company's Privacy Notice constitute the entire
agreement regarding Portal use and supersede all prior representations or agreements. Nothing
in this clause excludes liability for fraudulent misrepresentation.
13.3 Notices: Notices must be in writing, delivered by email (to the User's registered email or to
Company's email. Email notices are deemed received the next business day.
14. Contact Information
BMI Roofing Systems Sdn. Bhd. (Registration No. 197401002179 (19163-M))
Registered Address: 802, 8th Floor, Block C, Kelana Square, 17 Jalan SS7/26, Petaling
Jaya, 47301 Selangor
Email: invoicing.malaysia@bmigroup.com
Tel: 03-2176 0600 (Invoicing Department)`;

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

const parseDocument = (rawText) => {
  const lines = String(rawText)
    .split("\n")
    .map((line) => line.trim());
  const header = [];
  const sections = [];
  let current = null;

  lines.forEach((line) => {
    if (!line) return;
    if (/^\d+\.\s/.test(line)) {
      if (current) sections.push(current);
      current = { title: line, lines: [] };
      return;
    }
    if (current) current.lines.push(line);
    else header.push(line);
  });

  if (current) sections.push(current);
  return { header, sections };
};

const renderLinkedText = (line) => {
  const tokens = String(line).split(
    /(www\.pdp\.gov\.my|invoicing\.malaysia@bmigroup\.com)/g,
  );

  return tokens.map((token, index) => {
    if (token === "www.pdp.gov.my") {
      return (
        <a
          key={`pdp-${index}`}
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
          key={`mail-${index}`}
          href="mailto:invoicing.malaysia@bmigroup.com"
          className="font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
        >
          {token}
        </a>
      );
    }

    return <span key={`plain-${index}`}>{token}</span>;
  });
};

const SectionCard = ({ section, idPrefix }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/70">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
      {section.title}
    </h3>
    <div className="mt-3 space-y-2 text-sm leading-7 text-gray-700 dark:text-gray-300">
      {section.lines.map((line, idx) => {
        const isBullet = /^\([a-z]\)/i.test(line);
        const isSubClause = /^\d+\.\d+/.test(line);

        if (isBullet) {
          return (
            <div
              key={`${idPrefix}-bullet-${idx}`}
              className="flex items-start gap-2"
            >
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-blue-500" />
              <p>{renderLinkedText(line)}</p>
            </div>
          );
        }

        if (isSubClause) {
          return (
            <p
              key={`${idPrefix}-sub-${idx}`}
              className="font-medium text-gray-800 dark:text-gray-100"
            >
              {renderLinkedText(line)}
            </p>
          );
        }

        return (
          <p key={`${idPrefix}-line-${idx}`} className="whitespace-pre-wrap">
            {renderLinkedText(line)}
          </p>
        );
      })}
    </div>
  </section>
);

export default function UserPrivacyTerms() {
  const [activeTab, setActiveTab] = useState("terms");

  const legalDocs = useMemo(() => {
    const terms = parseDocument(TERMS_TEXT);
    const privacy = parseDocument(PRIVACY_NOTICE_TEXT);
    return { terms, privacy };
  }, []);

  const activeDoc = activeTab === "terms" ? legalDocs.terms : legalDocs.privacy;
  const activeLabel =
    activeTab === "terms" ? "Customer Portal Terms of Use" : "Privacy Notice";
  const activeIcon = activeTab === "terms" ? BookOpen : ShieldCheck;
  const ActiveIcon = activeIcon;

  return (
    <>
      <PageMeta
        title="Privacy Terms - BMI Invoice Management System"
        description="Customer Portal Terms of Use and Privacy Notice."
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#f8fafc_45%,_#e2e8f0_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_#020617_45%,_#111827_100%)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-blue-900/40 dark:bg-slate-900/70 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  <FileText className="h-3.5 w-3.5" />
                  Portal Legal Center
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Privacy Terms
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Review the Customer Portal Terms of Use and the Privacy Notice
                  in one place.
                </p>
              </div>

              <Link
                to="/user/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Back to Dashboard
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("terms")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === "terms"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Terms of Use
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("privacy")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === "privacy"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Privacy Notice
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <ActiveIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {activeLabel}
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Quick navigation for the currently selected document.
              </p>
              <div className="mt-4 space-y-2">
                {activeDoc.sections.map((section, index) => (
                  <a
                    key={`${activeTab}-nav-${index}`}
                    href={`#${activeTab}-section-${index + 1}`}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </aside>

            <main className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/40 dark:bg-blue-900/20">
                <div className="flex items-center gap-2">
                  <ActiveIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {activeLabel}
                  </h2>
                </div>
                <div className="mt-3 space-y-1 text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {activeDoc.header.map((line, idx) => (
                    <p key={`${activeTab}-header-${idx}`}>
                      {renderLinkedText(line)}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-5 max-h-[70vh] space-y-4 overflow-y-auto pr-1 scroll-smooth custom-scrollbar">
                {activeDoc.sections.map((section, index) => (
                  <div
                    id={`${activeTab}-section-${index + 1}`}
                    key={`${activeTab}-section-${index}`}
                  >
                    <SectionCard
                      section={section}
                      idPrefix={`${activeTab}-${index}`}
                    />
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
