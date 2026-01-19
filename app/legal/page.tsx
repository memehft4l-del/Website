"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Legal & Terms
            </h1>
            <p className="text-xl text-slate-400">Terms of Service, Privacy Policy, and Disclaimers</p>
          </div>

          {/* Terms of Service */}
          <section className="glass rounded-3xl p-8 sm:p-10 md:p-12 mb-8 card-modern">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h2>
            </div>
            
            <div className="space-y-6 text-slate-300 leading-relaxed">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-sm sm:text-base">
                  By accessing and using Elixir Pump ("the Platform"), you accept and agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, you must not use the Platform.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">2. Platform Description</h3>
                <p className="text-sm sm:text-base">
                  Elixir Pump is a token-gated tournament platform for Clash Royale. The Platform facilitates competitive gaming 
                  tournaments where participants must hold $ELIXIR tokens to participate. The Platform is not affiliated with, 
                  endorsed by, or connected to Supercell or Clash Royale.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">3. Eligibility</h3>
                <p className="text-sm sm:text-base">
                  You must be at least 18 years old to use the Platform. You must have the legal capacity to enter into binding 
                  agreements. By using the Platform, you represent and warrant that you meet these eligibility requirements.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">4. Token Holdings and Tournament Participation</h3>
                <p className="text-sm sm:text-base">
                  Participation in tournaments requires holding the minimum required amount of $ELIXIR tokens for your chosen tier. 
                  You must maintain the required token balance throughout the entire tournament duration. Failure to maintain the 
                  required balance will result in disqualification and voiding of any prizes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">5. Prize Pool and Distribution</h3>
                <p className="text-sm sm:text-base">
                  Prize pools are funded by transaction fees from the $ELIXIR token. Prize distribution is determined by tournament 
                  performance and is subject to verification of token holdings. Prizes may be voided if participants fail to meet 
                  token holding requirements or violate tournament rules.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">6. User Conduct</h3>
                <p className="text-sm sm:text-base">
                  You agree not to: (a) engage in any fraudulent, deceptive, or illegal activity; (b) manipulate token balances or 
                  tournament results; (c) use automated systems or bots; (d) violate any applicable laws or regulations; (e) infringe 
                  on the rights of others.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">7. Disclaimer of Warranties</h3>
                <p className="text-sm sm:text-base">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                  WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h3>
                <p className="text-sm sm:text-base">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, ELIXIR PUMP, ITS OPERATORS, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE 
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF 
                  PROFITS, DATA, OR USE, ARISING OUT OF OR RELATING TO YOUR USE OF THE PLATFORM.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">9. Indemnification</h3>
                <p className="text-sm sm:text-base">
                  You agree to indemnify, defend, and hold harmless Elixir Pump, its operators, affiliates, and partners from any 
                  claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Platform 
                  or violation of these Terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">10. Modifications to Terms</h3>
                <p className="text-sm sm:text-base">
                  We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes 
                  acceptance of the modified Terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">11. Termination</h3>
                <p className="text-sm sm:text-base">
                  We reserve the right to suspend or terminate your access to the Platform at any time, with or without cause, 
                  with or without notice, for any reason including violation of these Terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">12. Governing Law</h3>
                <p className="text-sm sm:text-base">
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of 
                  law principles.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer Section */}
          <section className="glass rounded-3xl p-8 sm:p-10 md:p-12 mb-8 card-modern border border-yellow-500/20">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Important Disclaimers</h2>
            </div>
            
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-sm sm:text-base font-semibold text-yellow-200 mb-2">
                  ⚠️ Cryptocurrency Risk Warning
                </p>
                <p className="text-sm sm:text-base">
                  Cryptocurrency investments carry significant risk. The value of $ELIXIR tokens can fluctuate dramatically. 
                  You may lose your entire investment. Only invest what you can afford to lose.
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm sm:text-base font-semibold text-red-200 mb-2">
                  ⚠️ No Guarantee of Returns
                </p>
                <p className="text-sm sm:text-base">
                  Participation in tournaments does not guarantee any returns or prizes. Tournament outcomes depend on skill, 
                  performance, and other factors beyond our control.
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-sm sm:text-base font-semibold text-purple-200 mb-2">
                  ⚠️ Not Financial Advice
                </p>
                <p className="text-sm sm:text-base">
                  Nothing on this Platform constitutes financial, investment, or legal advice. All information is provided for 
                  informational purposes only. Consult with qualified professionals before making financial decisions.
                </p>
              </div>

              <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-4">
                <p className="text-sm sm:text-base font-semibold text-white mb-2">
                  ⚠️ Third-Party Services
                </p>
                <p className="text-sm sm:text-base">
                  The Platform integrates with third-party services including Solana wallets, Supabase, and external APIs. 
                  We are not responsible for the availability, security, or functionality of these third-party services.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="glass rounded-3xl p-8 sm:p-10 md:p-12 mb-8 card-modern">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h2>
            </div>
            
            <div className="space-y-6 text-slate-300 leading-relaxed">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Data Collection</h3>
                <p className="text-sm sm:text-base">
                  We collect wallet addresses, Clash Royale usernames, tournament signup information, and usage data. 
                  This data is stored securely in Supabase and used solely for tournament management and platform operation.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">Data Usage</h3>
                <p className="text-sm sm:text-base">
                  Your data is used to: verify tournament eligibility, manage signups, distribute prizes, and improve the Platform. 
                  We do not sell your personal data to third parties.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">Data Security</h3>
                <p className="text-sm sm:text-base">
                  We implement industry-standard security measures to protect your data. However, no system is 100% secure. 
                  You use the Platform at your own risk.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">Cookies and Tracking</h3>
                <p className="text-sm sm:text-base">
                  The Platform may use cookies and similar technologies to enhance user experience and analyze usage patterns. 
                  You can control cookie preferences through your browser settings.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="glass rounded-3xl p-8 sm:p-10 md:p-12 card-modern">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Contact</h2>
            <p className="text-slate-300 text-sm sm:text-base mb-4">
              For questions about these Terms or the Platform, please contact us through our official channels.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

