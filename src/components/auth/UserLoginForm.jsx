import { ArrowDown, Eye, EyeOff, FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAuthAPI } from "../../services/api";
import { userAuth } from "../../services/auth";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

const TERMS_ACCEPTED_KEY = "bmi_user_terms_accepted";

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

export default function UserLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // Keep me logged in
  const [tcChecked, setTcChecked] = useState(() => {
    try {
      return localStorage.getItem(TERMS_ACCEPTED_KEY) === "true";
    } catch (e) {
      return false;
    }
  }); // Terms & Conditions
  const [showTcModal, setShowTcModal] = useState(false); // T&C Modal state
  const [canAcceptTc, setCanAcceptTc] = useState(false); // Tracks if scrolled to bottom

  const [identity, setidentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const tcScrollRef = useRef(null);

  // Check if T&C content requires scrolling when modal opens
  useEffect(() => {
    if (showTcModal && tcScrollRef.current) {
      const { scrollHeight, clientHeight } = tcScrollRef.current;
      // If content is shorter than the container, allow accepting immediately
      if (scrollHeight <= clientHeight) {
        setCanAcceptTc(true);
      } else {
        setCanAcceptTc(false);
      }
    }
  }, [showTcModal]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Add a small 2px buffer to prevent fractional pixel rounding issues on certain zoom levels
    if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 2) {
      setCanAcceptTc(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!tcChecked) {
      setError("Please read and accept the Terms and Conditions to continue.");
      return;
    }

    await performLogin();
  };

  const performLogin = async () => {
    setLoading(true);
    try {
      const res = await userAuthAPI.login(identity, password);
      const token = res?.token || res?.data?.token;
      if (token) {
        userAuth.setToken(token);
        setTimeout(() => {
          navigate("/user/dashboard", { replace: true });
        }, 0);
      } else {
        setError("No token received from server");
        setLoading(false);
      }
    } catch (err) {
      let errorMessage = err.message || "Login failed";
      try {
        if (errorMessage.includes("API Error:")) {
          const jsonPart = errorMessage.substring(errorMessage.indexOf("{"));
          const parsed = JSON.parse(jsonPart);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } else if (errorMessage.startsWith("{")) {
          const parsed = JSON.parse(errorMessage);
          errorMessage = parsed.message || parsed.error || errorMessage;
        }
      } catch (e) {
        // Fallback to original
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleTcCheckboxChange = (val) => {
    if (val) {
      setShowTcModal(true);
    } else {
      setTcChecked(false);
    }
  };

  const handleAcceptTc = () => {
    setTcChecked(true);
    localStorage.setItem(TERMS_ACCEPTED_KEY, "true");
    setShowTcModal(false);
    setError("");
  };

  const renderLinkedText = (text, keyPrefix = "terms-link") => {
    const chunks = String(text).split("[URL/link]");
    return chunks.map((chunk, index) => (
      <span key={`${keyPrefix}-${index}`}>
        {chunk}
        {index < chunks.length - 1 && (
          <Link
            to="/privacy-policy"
            className="font-medium text-blue-600 underline decoration-blue-400 underline-offset-4 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => setShowTcModal(false)}
          >
            /privacy-policy
          </Link>
        )}
      </span>
    ));
  };

  const parseTerms = (text) => {
    const lines = String(text)
      .split("\n")
      .map((line) => line.trim());

    const lead = [];
    const sections = [];
    let current = null;

    lines.forEach((line) => {
      if (!line) return;

      if (/^\d+\.\s/.test(line)) {
        if (current) sections.push(current);
        current = { title: line, lines: [] };
        return;
      }

      if (current) {
        current.lines.push(line);
      } else {
        lead.push(line);
      }
    });

    if (current) sections.push(current);

    const normalizeSectionLines = (lines) => {
      const merged = [];

      lines.forEach((line) => {
        const isClause = /^\d+\.\d+/.test(line);
        const isAlphaItem = /^\([a-z]\)/i.test(line);

        if (isClause || isAlphaItem || merged.length === 0) {
          merged.push(line);
          return;
        }

        merged[merged.length - 1] = `${merged[merged.length - 1]} ${line}`;
      });

      return merged;
    };

    const normalizedSections = sections.map((section) => ({
      ...section,
      lines: normalizeSectionLines(section.lines),
    }));

    return { lead, sections: normalizedSections };
  };

  const termsContent = parseTerms(TERMS_TEXT);

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Customer Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your Customer Number/Email and password to access your
              account!
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5"></div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Customer Number / Email{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your customer number"
                    value={identity}
                    onChange={(e) => setidentity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <Eye className="text-gray-500 dark:text-gray-400 size-5" />
                      ) : (
                        <EyeOff className="text-gray-500 dark:text-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Keep me logged in */}
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <Checkbox
                        checked={tcChecked}
                        onChange={handleTcCheckboxChange}
                      />
                    </div>
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400 leading-tight">
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTcModal(true)}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        Terms and Conditions
                      </button>
                      <span className="text-error-500 ml-1">*</span>
                    </span>
                  </div>
                </div>

                <div>
                  {/* Login Button - DISABLED if T&C not checked */}
                  <Button
                    type="submit"
                    className={`w-full ${!tcChecked ? "opacity-50 cursor-not-allowed" : ""}`}
                    size="sm"
                    disabled={loading || !tcChecked}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Terms and Conditions Modal --- */}
      {showTcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Terms and Conditions
                </h3>
              </div>
              <button
                onClick={() => setShowTcModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Container with onScroll event */}
            <div
              ref={tcScrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto scroll-smooth p-6 text-sm text-gray-600 dark:text-gray-300 custom-scrollbar"
            >
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-900/15">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Customer Portal Legal Terms
                </p>
                <div className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {termsContent.lead.map((line, idx) => (
                    <p key={`terms-lead-${idx}`}>
                      {renderLinkedText(line, `lead-${idx}`)}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {termsContent.sections.map((section, sIdx) => (
                  <article
                    key={`terms-section-${sIdx}`}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-blue-800"
                  >
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h4>
                    <div className="mt-3 space-y-2.5 text-[13px] leading-6 text-gray-700 dark:text-gray-300">
                      {section.lines.map((line, lIdx) => {
                        const isSubClause = /^\d+\.\d+/.test(line);
                        const isAlphaItem = /^\([a-z]\)/i.test(line);

                        if (isSubClause) {
                          return (
                            <p
                              key={`terms-line-${sIdx}-${lIdx}`}
                              className="font-medium text-gray-800 dark:text-gray-100"
                            >
                              {renderLinkedText(line, `sub-${sIdx}-${lIdx}`)}
                            </p>
                          );
                        }

                        if (isAlphaItem) {
                          return (
                            <div
                              key={`terms-line-${sIdx}-${lIdx}`}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <p>
                                {renderLinkedText(line, `item-${sIdx}-${lIdx}`)}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <p key={`terms-line-${sIdx}-${lIdx}`}>
                            {renderLinkedText(line, `line-${sIdx}-${lIdx}`)}
                          </p>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50 flex justify-between items-center gap-3">
              {/* Contextual instruction message */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                {!canAcceptTc && (
                  <>
                    <ArrowDown className="h-3.5 w-3.5 animate-bounce text-blue-500" />
                    Please scroll to the bottom to accept
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTcModal(false)}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>

                {/* Conditionally render the accept button */}
                {canAcceptTc ? (
                  <button
                    type="button"
                    onClick={handleAcceptTc}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors animate-in fade-in duration-300"
                  >
                    Continue & Accept
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-lg bg-gray-300 px-5 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  >
                    Continue & Accept
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
