import React, { useState } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PrivacyCommitment } from '../components/landing/PrivacyCommitment';
import { Footer } from '../components/landing/Footer';
import { ReportModal } from '../components/reporting/ReportModal';
import { Report } from '../lib/types';

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onAddReport?: (report: Report) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDashboard, onAddReport }) => {
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        onNavigateToDashboard={onNavigateToDashboard}
        onOpenReportModal={() => setIsReportOpen(true)}
      />
      <main className="flex-1">
        <Hero onNavigateToDashboard={onNavigateToDashboard} />
        <HowItWorks />
        <PrivacyCommitment />
      </main>
      <Footer onNavigateToDashboard={onNavigateToDashboard} />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={(report) => {
          if (onAddReport) onAddReport(report);
          onNavigateToDashboard();
        }}
      />
    </div>
  );
};
