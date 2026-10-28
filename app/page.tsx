'use client';

import { useState, useEffect } from 'react';
import { INITIAL_GUIDES } from '@/data/initialGuides';
import { OAuthGuide } from '@/types/guide';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Bot, 
  User, 
  ExternalLink, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Info,
  Link as LinkIcon,
  FileText,
  Check
} from 'lucide-react';

export default function Home() {
  const [guides, setGuides] = useState<Record<string, OAuthGuide>>(INITIAL_GUIDES);
  const [selectedSlug, setSelectedSlug] = useState<string>('slack');
  const [inputAppName, setInputAppName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  // Sync URL query param on mount and when slug changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app');
      if (appParam && guides[appParam]) {
        setSelectedSlug(appParam);
      }
    }
  }, []);

  const selectApp = (slug: string) => {
    setSelectedSlug(slug);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('app', slug);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const currentGuide = guides[selectedSlug];

  // Reliable clipboard copy with fallback
  async function safeCopyToClipboard(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback to execCommand
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    } catch {
      return false;
    }
  }

  async function handleCopyLink() {
    if (typeof window === 'undefined' || !currentGuide) return;
    const url = `${window.location.origin}${window.location.pathname}?app=${currentGuide.slug}`;
    const ok = await safeCopyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  async function handleCopyMarkdown() {
    if (!currentGuide) return;
    const shareText = `### ${currentGuide.appName} OAuth Setup Guide (${currentGuide.complexity} Complexity)
- **Portal:** ${currentGuide.developerPortalUrl}
- **Dev Setup Time:** ${currentGuide.estimatedEffort.setupTime}
- **Approval Wait Time:** ${currentGuide.estimatedEffort.approvalWaitTime}

#### Prerequisites:
- Paid Account: ${currentGuide.prerequisites.requiresPaidAccount ? 'Yes' : 'No'}
- Domain Verification: ${currentGuide.prerequisites.requiresDomainVerification ? 'Yes' : 'No'}
- Privacy Policy: ${currentGuide.prerequisites.requiresPrivacyPolicyUrl ? 'Yes' : 'No'}
- Video Demo: ${currentGuide.prerequisites.requiresVideoDemo ? 'Yes' : 'No'}

#### Division of Labor:
- **Agent can automate:** ${currentGuide.divisionOfLabor.agentCanAutomate.join(', ')}
- **Human required:** ${currentGuide.divisionOfLabor.humanRequired.join(', ')}

#### Steps:
${currentGuide.steps.map(s => `${s.stepNumber}. **${s.title}**: ${s.instructions} (${s.gotchas})`).join('\n')}

*Generated via Composio OAuth Navigator*`;

    const ok = await safeCopyToClipboard(shareText);
    if (ok) {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  }

  async function handleInvestigate(e: React.FormEvent) {
    e.preventDefault();
    if (!inputAppName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: inputAppName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to investigate app');

      const newGuide: OAuthGuide = data.guide;
      setGuides((prev) => ({ [newGuide.slug]: newGuide, ...prev }));
      selectApp(newGuide.slug);
      setInputAppName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const getComplexityBadge = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'High': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Gatekept': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" /> OAuth Approval Navigator
            </h1>
            <p className="text-xs text-slate-500">Live Agentic OAuth Readiness & Setup Playbook</p>
          </div>

          <form onSubmit={handleInvestigate} className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Submit any app (e.g. Miro, HubSpot)..."
                value={inputAppName}
                onChange={(e) => setInputAppName(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={loading || !inputAppName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Investigate'}
            </button>
          </form>
        </div>
      </header>

      {error && (
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="space-y-2">
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Available Playbooks</h2>
          {Object.values(guides).map((g) => (
            <button
              key={g.slug}
              onClick={() => selectApp(g.slug)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center justify-between ${
                selectedSlug === g.slug 
                  ? 'bg-indigo-50 border-indigo-300 font-semibold text-indigo-900 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span>{g.appName}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${getComplexityBadge(g.complexity)}`}>
                {g.complexity}
              </span>
            </button>
          ))}
        </aside>

        <section className="md:col-span-3 space-y-6">
          {currentGuide ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{currentGuide.appName}</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getComplexityBadge(currentGuide.complexity)}`}>
                      {currentGuide.complexity} Complexity
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{currentGuide.category}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium border border-slate-300 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Link Copied!' : 'Copy Link'}
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium border border-slate-300 transition"
                  >
                    {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
                    {copiedMd ? 'Markdown Copied!' : 'Export Guide'}
                  </button>

                  <a 
                    href={currentGuide.developerPortalUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium ml-1"
                  >
                    Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Developer Setup Time</div>
                    <div className="text-sm font-semibold mt-0.5">{currentGuide.estimatedEffort.setupTime}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Approval & Review Wait Time</div>
                    <div className="text-sm font-semibold mt-0.5">{currentGuide.estimatedEffort.approvalWaitTime}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Prerequisites Checklist</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className={`p-3 rounded-lg border flex flex-col gap-1 ${currentGuide.prerequisites.requiresPaidAccount ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <span className="text-slate-500">Paid Account:</span>
                    <span className="font-semibold">{currentGuide.prerequisites.requiresPaidAccount ? 'Required' : 'Free / Not needed'}</span>
                  </div>
                  <div className={`p-3 rounded-lg border flex flex-col gap-1 ${currentGuide.prerequisites.requiresDomainVerification ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <span className="text-slate-500">Domain Verify:</span>
                    <span className="font-semibold">{currentGuide.prerequisites.requiresDomainVerification ? 'Mandatory' : 'None'}</span>
                  </div>
                  <div className={`p-3 rounded-lg border flex flex-col gap-1 ${currentGuide.prerequisites.requiresPrivacyPolicyUrl ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <span className="text-slate-500">Privacy Policy:</span>
                    <span className="font-semibold">{currentGuide.prerequisites.requiresPrivacyPolicyUrl ? 'Public URL Required' : 'Optional in dev'}</span>
                  </div>
                  <div className={`p-3 rounded-lg border flex flex-col gap-1 ${currentGuide.prerequisites.requiresVideoDemo ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <span className="text-slate-500">Video Demo:</span>
                    <span className="font-semibold">{currentGuide.prerequisites.requiresVideoDemo ? 'Screen Record Required' : 'Not required'}</span>
                  </div>
                </div>
              </div>

              <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4">
                <h3 className="text-sm font-bold text-indigo-950 mb-3">Division of Labor: Who Does What?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-lg border border-indigo-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-2">
                      <Bot className="w-4 h-4" /> What an AI Agent Can Automate
                    </div>
                    <ul className="space-y-1.5 text-slate-600">
                      {currentGuide.divisionOfLabor.agentCanAutomate.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                      <User className="w-4 h-4" /> Human Action Items Required
                    </div>
                    <ul className="space-y-1.5 text-slate-600">
                      {currentGuide.divisionOfLabor.humanRequired.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Step-by-Step Execution</h3>
                <div className="space-y-3">
                  {currentGuide.steps.map((s) => (
                    <div key={s.stepNumber} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                          {s.stepNumber}
                        </span>
                        <h4 className="text-sm font-semibold">{s.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 ml-7">{s.instructions}</p>
                      {s.gotchas && (
                        <div className="ml-7 mt-2 p-2 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 mt-0.5 text-amber-700 flex-shrink-0" />
                          <span><strong>Watch out:</strong> {s.gotchas}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Verification Confidence:</span>
                  <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {currentGuide.evidence.confidenceLevel}
                  </span>
                </div>
                {currentGuide.evidence.uncertainties.length > 0 && (
                  <div className="text-slate-500">
                    <strong>Known Uncertainties:</strong> {currentGuide.evidence.uncertainties.join(' ')}
                  </div>
                )}
                {currentGuide.evidence.verifiedSources.length > 0 && (
                  <div className="text-slate-400 truncate">
                    <strong>Sources:</strong> {currentGuide.evidence.verifiedSources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select or investigate an app to view its guide.</div>
          )}
        </section>
      </div>
    </main>
  );
}