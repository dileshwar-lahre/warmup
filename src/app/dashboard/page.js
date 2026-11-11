'use client';

import { useState } from 'react';
import { Mail, Send, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Sliders, Sparkles, Server } from 'lucide-react';

export default function Dashboard() {
  const initialEmails = [
    'un30151@gmail.com',
    'dhhj9695@gmail.com',
    'stonenox82@gmail.com',
    'alex.stonenoxtech@gmail.com',
    'ryan.stonenoxtech@gmail.com',
    'david.stonenoxtech@gmail.com',
    'lucas.stonenoxtech@gmail.com',
    'sam.stonenoxtech@gmail.com',
    'leo.stonenoxtech@gmail.com',
    'max.stonenoxtech@gmail.com',
    'noah.stonenoxtech@gmail.com',
    'jack.stonenoxtech@gmail.com'
  ].join('\n');

  const [emails, setEmails] = useState(initialEmails);
  const [subject, setSubject] = useState(''); // Blank = Auto 50+ Pool Rotation
  const [message, setMessage] = useState(''); // Blank = Auto 50+ Template Rotation
  
  // Settings Controls (Default: Safe 30 Mins Gap & Max 3 per box)
  const [maxPerBox, setMaxPerBox] = useState(3); 
  const [minDelay, setMinDelay] = useState(30);  
  const [maxDelay, setMaxDelay] = useState(35);  

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [mailboxCounts, setMailboxCounts] = useState({});

  const handleStartCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setMailboxCounts({});

    const recipientList = emails
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    try {
      const res = await fetch('/api/warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipientList,
          customSubject: subject,
          customMessage: message,
          maxPerBox: Number(maxPerBox),
          minDelay: Number(minDelay),
          maxDelay: Number(maxDelay),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setLogs(data.results);
        setMailboxCounts(data.mailboxCounts || {});
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      setLoading(false);
      alert('Network request failed!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-cyan-400">⚡ Smart Warmup & Anti-Bounce Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Hostinger Mailboxes (15 Active) | 50+ Rotational Templates & 30-Min Safe Delay</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Anti-Ban & Auto-Shield Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Configuration Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <form onSubmit={handleStartCampaign} className="space-y-4">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Sliders className="w-4 h-4" /> Timing & Rotation Controls (Fully Editable)
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Max Mails / Box</label>
                    <input
                      type="number"
                      value={maxPerBox}
                      onChange={(e) => setMaxPerBox(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Min Delay (Mins)</label>
                    <input
                      type="number"
                      value={minDelay}
                      onChange={(e) => setMinDelay(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Max Delay (Mins)</label>
                    <input
                      type="number"
                      value={maxDelay}
                      onChange={(e) => setMaxDelay(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                  <span>Subject Line</span>
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Blank = Auto 50+ Pool Rotation
                  </span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm"
                  placeholder="Leave blank for automatic changing subjects"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Target Gmail Accounts ({emails.split('\n').filter(Boolean).length} Loaded)
                </label>
                <textarea
                  rows="5"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                  <span>Message Body</span>
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Blank = Auto 50+ Template Rotation
                  </span>
                </label>
                <textarea
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm"
                  placeholder="Leave blank for automatic changing templates"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Running Rotation Engine (30m Gaps)...' : 'Start Safe Rotating Batch'}
              </button>
            </form>
          </div>

          {/* Right Panel: Live Delivery Logs & Mailbox Stats */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col h-[650px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" /> Live Delivery Logs & Routing
              </h2>
              <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-cyan-300 font-mono">
                Total Sent: {logs.length}
              </span>
            </div>

            {/* Mailbox Usage Summary Box */}
            {Object.keys(mailboxCounts).length > 0 && (
              <div className="mb-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
                  <Server className="w-3.5 h-3.5" /> Mailbox Dispatch Summary:
                </div>
                <div className="grid grid-cols-2 gap-1 font-mono text-[11px] text-slate-300">
                  {Object.entries(mailboxCounts).map(([box, count], i) => (
                    <div key={i} className="truncate">
                      <span className="text-slate-500">[{count}]</span> {box.split('@')[0]}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-3 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-28">
                  No batch running yet.<br/>Click start to begin round-robin rotation!
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                      <span className="text-cyan-400 font-bold truncate max-w-[180px]" title={log.sentFrom}>
                        From: {log.sentFrom}
                      </span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Target Gmail:</span>
                      <div className="text-slate-200 font-bold">{log.email}</div>
                    </div>
                    <div className="text-[11px] text-cyan-300 truncate" title={log.usedSubject}>
                      Subject: {log.usedSubject}
                    </div>
                    {log.error && (
                      <div className="text-[10px] text-rose-400">Error: {log.error}</div>
                    )}
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Box Count: #{log.boxSentCount || 1}</span>
                      {log.status === 'Success' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Delivered OK
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}