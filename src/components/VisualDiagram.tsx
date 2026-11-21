import React from 'react';

interface VisualDiagramProps {
  diagramId: 'water' | 'safety' | 'network' | 'climate' | 'acoustic' | 'gate' | 'wiring';
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ diagramId }) => {
  switch (diagramId) {
    case 'water':
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full" role="img" aria-label="Automated overhead and sump water tank control diagram">
          <rect width="360" height="220" fill="var(--orbi-sky)" />
          {/* Terrace & Ground */}
          <rect x="36" y="148" width="288" height="8" rx="2" fill="var(--orbi-roof)" opacity="0.2" />
          {/* Overhead Tank */}
          <rect x="64" y="34" width="84" height="72" rx="10" fill="var(--orbi-card)" stroke="var(--orbi-navy)" strokeWidth="2.5" />
          <rect x="72" y="56" width="68" height="42" rx="4" fill="#3cc3c0" opacity="0.85" />
          <line x1="106" y1="34" x2="106" y2="54" stroke="var(--orbi-teal)" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="106" cy="56" r="4" fill="var(--orbi-teal)" />
          <text x="106" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--orbi-ink)">Overhead Tank · 85%</text>
          {/* Pipe to Sump */}
          <path d="M148 88 H216 V158" fill="none" stroke="var(--orbi-teal)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Sump & Pump */}
          <rect x="200" y="156" width="96" height="44" rx="8" fill="var(--orbi-card)" stroke="var(--orbi-navy)" strokeWidth="2.5" />
          <rect x="208" y="170" width="80" height="22" rx="4" fill="#3d8fd6" opacity="0.65" />
          <circle cx="182" cy="128" r="14" fill="var(--orbi-teal)" />
          <text x="182" y="132" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#ffffff">AUTO</text>
          <text x="248" y="146" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--orbi-ink)">Underground Sump</text>
          {/* Phone Indicator */}
          <rect x="240" y="36" width="76" height="66" rx="10" fill="var(--orbi-navy)" />
          <text x="278" y="58" textAnchor="middle" fontSize="10" fill="#a3b9ca">Pump Status</text>
          <text x="278" y="76" textAnchor="middle" fontSize="12" fontWeight="700" fill="#3cc3c0">Auto · Safe</text>
          <text x="278" y="92" textAnchor="middle" fontSize="9" fill="#d6e5ef">No Overflow</text>
        </svg>
      );

    case 'safety':
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full" role="img" aria-label="Gas leak, smoke detection, and elder SOS alert diagram">
          <rect width="360" height="220" fill="var(--orbi-sky)" />
          {/* Three clear nodes */}
          <g transform="translate(26, 40)">
            <rect width="94" height="136" rx="12" fill="var(--orbi-card)" stroke="var(--orbi-line)" strokeWidth="1.5" />
            <circle cx="47" cy="48" r="22" fill="#fff1ec" stroke="#d9532f" strokeWidth="2" />
            <path d="M47 36c6 8 9 13 9 18a9 9 0 0 1-18 0c0-5 3-10 9-18z" fill="#d9532f" />
            <text x="47" y="94" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--orbi-ink)">Gas &amp; Smoke</text>
            <text x="47" y="112" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">Instant siren +</text>
            <text x="47" y="124" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">exhaust fan on</text>
          </g>
          <g transform="translate(133, 40)">
            <rect width="94" height="136" rx="12" fill="var(--orbi-card)" stroke="var(--orbi-line)" strokeWidth="1.5" />
            <circle cx="47" cy="48" r="22" fill="#e6f6f6" stroke="var(--orbi-teal)" strokeWidth="2" />
            <path d="M47 35c5 7 9 13 9 19a9 9 0 0 1-18 0c0-6 4-12 9-19z" fill="var(--orbi-teal)" />
            <text x="47" y="94" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--orbi-ink)">Water Leak</text>
            <text x="47" y="112" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">Detects wet floor</text>
            <text x="47" y="124" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">&amp; closes valve</text>
          </g>
          <g transform="translate(240, 40)">
            <rect width="94" height="136" rx="12" fill="var(--orbi-card)" stroke="var(--orbi-line)" strokeWidth="1.5" />
            <circle cx="47" cy="48" r="22" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
            <text x="47" y="53" textAnchor="middle" fontSize="13" fontWeight="800" fill="#b45309">SOS</text>
            <text x="47" y="94" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--orbi-ink)">Elder Alert</text>
            <text x="47" y="112" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">Bedside button</text>
            <text x="47" y="124" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">notifies family</text>
          </g>
        </svg>
      );

    case 'network':
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full" role="img" aria-label="Whole-home wired Cat6 Wi-Fi access points across floors">
          <rect width="360" height="220" fill="var(--orbi-sky)" />
          {/* Two-floor house outline */}
          <rect x="46" y="34" width="268" height="156" rx="10" fill="var(--orbi-card)" stroke="var(--orbi-navy)" strokeWidth="2.5" />
          <line x1="46" y1="112" x2="314" y2="112" stroke="var(--orbi-line)" strokeWidth="3" />
          {/* Cat6 vertical trunk */}
          <line x1="72" y1="54" x2="72" y2="168" stroke="var(--orbi-navy)" strokeWidth="3" />
          <rect x="56" y="152" width="32" height="24" rx="4" fill="var(--orbi-navy)" />
          <text x="72" y="167" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#ffffff">RACK</text>
          {/* Upper Floor AP */}
          <line x1="72" y1="54" x2="210" y2="54" stroke="var(--orbi-teal)" strokeWidth="2.5" strokeDasharray="4 3" />
          <circle cx="210" cy="54" r="7" fill="var(--orbi-teal)" />
          <path d="M188 68a32 32 0 0 1 44 0" fill="none" stroke="var(--orbi-teal)" strokeWidth="2" />
          <path d="M174 80a50 50 0 0 1 72 0" fill="none" stroke="var(--orbi-teal)" strokeWidth="2" opacity="0.6" />
          <text x="274" y="76" textAnchor="end" fontSize="10.5" fontWeight="600" fill="var(--orbi-ink)">Upper Floor AP</text>
          {/* Ground Floor AP */}
          <line x1="72" y1="128" x2="210" y2="128" stroke="var(--orbi-teal)" strokeWidth="2.5" strokeDasharray="4 3" />
          <circle cx="210" cy="128" r="7" fill="var(--orbi-teal)" />
          <path d="M188 142a32 32 0 0 1 44 0" fill="none" stroke="var(--orbi-teal)" strokeWidth="2" />
          <path d="M174 154a50 50 0 0 1 72 0" fill="none" stroke="var(--orbi-teal)" strokeWidth="2" opacity="0.6" />
          <text x="274" y="152" textAnchor="end" fontSize="10.5" fontWeight="600" fill="var(--orbi-ink)">Ground Floor AP</text>
        </svg>
      );

    case 'climate':
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full" role="img" aria-label="Smart climate control, AC scheduling, and fresh-air ventilation diagram">
          <rect width="360" height="220" fill="var(--orbi-sky)" />
          <rect x="44" y="34" width="272" height="152" rx="12" fill="var(--orbi-card)" stroke="var(--orbi-line)" strokeWidth="2" />
          {/* Split/Concealed AC */}
          <rect x="74" y="54" width="124" height="32" rx="6" fill="var(--orbi-navy)" />
          <line x1="88" y1="76" x2="184" y2="76" stroke="#3cc3c0" strokeWidth="2.5" />
          <text x="136" y="69" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#ffffff">AC · 24°C Pre-Cool</text>
          {/* Cool airflow */}
          <path d="M104 98q6 14 0 28" fill="none" stroke="var(--orbi-teal)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M136 98q6 14 0 28" fill="none" stroke="var(--orbi-teal)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M168 98q6 14 0 28" fill="none" stroke="var(--orbi-teal)" strokeWidth="2.4" strokeLinecap="round" />
          {/* Door interlock & Fresh Air */}
          <rect x="220" y="54" width="74" height="106" rx="8" fill="var(--orbi-surface)" stroke="var(--orbi-line)" />
          <text x="257" y="84" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--orbi-ink)">Balcony Door</text>
          <text x="257" y="102" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">Open &gt; 2 min</text>
          <rect x="230" y="114" width="54" height="24" rx="5" fill="var(--orbi-teal)" />
          <text x="257" y="130" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#ffffff">AC Pauses</text>
          <text x="136" y="160" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--orbi-ink)">Fresh-Air &amp; Heat Pump Ready</text>
        </svg>
      );

    case 'acoustic':
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full" role="img" aria-label="Room acoustic soundproofing and echo absorption diagram">
          <rect width="360" height="220" fill="var(--orbi-sky)" />
          <rect x="34" y="34" width="292" height="152" rx="12" fill="var(--orbi-card)" stroke="var(--orbi-line)" strokeWidth="2" />
          {/* Outside noise waves */}
          <text x="64" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#b45309">Traffic</text>
          <path d="M52 84q8 14 0 28" fill="none" stroke="#d97706" strokeWidth="2.4" />
          <path d="M68 78q10 20 0 40" fill="none" stroke="#d97706" strokeWidth="2.4" />
          {/* Acoustic wall barrier */}
          <rect x="110" y="50" width="22" height="120" rx="4" fill="var(--orbi-navy)" />
          <text x="121" y="114" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" transform="rotate(-90 121 114)">MMT ACOUSTIX</text>
          {/* Quiet interior */}
          <g fill="var(--orbi-teal)" opacity="0.22">
            <polygon points="184,78 198,70 212,78 212,94 198,102 184,94" />
            <polygon points="216,78 230,70 244,78 244,94 230,102 216,94" />
            <polygon points="200,106 214,98 228,106 228,122 214,130 200,122" />
          </g>
          <text x="226" y="152" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--orbi-ink)">Calm Bedroom &amp; Clear Audio</text>
          <text x="226" y="168" textAnchor="middle" fontSize="9.5" fill="var(--orbi-mute)">Blocks external dB &amp; internal echo</text>
        </svg>
      );

    case 'gate':
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full" role="img" aria-label="Automated sliding gate and garage shutter phone control diagram">
          <rect width="360" height="220" fill="var(--orbi-sky)" />
          <rect y="164" width="360" height="56" fill="var(--orbi-grass)" />
          {/* Pillars */}
          <rect x="58" y="88" width="20" height="82" rx="3" fill="var(--orbi-navy)" />
          <rect x="222" y="88" width="20" height="82" rx="3" fill="var(--orbi-navy)" />
          {/* Sliding Gate */}
          <rect x="86" y="102" width="128" height="60" rx="4" fill="var(--orbi-card)" stroke="var(--orbi-navy)" strokeWidth="2.5" />
          <line x1="112" y1="102" x2="112" y2="162" stroke="var(--orbi-line)" strokeWidth="3" />
          <line x1="138" y1="102" x2="138" y2="162" stroke="var(--orbi-line)" strokeWidth="3" />
          <line x1="164" y1="102" x2="164" y2="162" stroke="var(--orbi-line)" strokeWidth="3" />
          <line x1="190" y1="102" x2="190" y2="162" stroke="var(--orbi-line)" strokeWidth="3" />
          {/* Motor + Arrow */}
          <rect x="200" y="144" width="34" height="24" rx="4" fill="var(--orbi-teal)" />
          <text x="217" y="159" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#ffffff">MOTOR</text>
          <path d="M126 74 H176" stroke="var(--orbi-teal)" strokeWidth="3" strokeLinecap="round" />
          <polyline points="166,66 178,74 166,82" fill="none" stroke="var(--orbi-teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Phone open */}
          <rect x="266" y="54" width="66" height="94" rx="10" fill="var(--orbi-navy)" />
          <rect x="274" y="68" width="50" height="32" rx="4" fill="var(--orbi-teal)" />
          <text x="299" y="88" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">OPEN</text>
          <text x="299" y="122" textAnchor="middle" fontSize="9" fill="#d6e5ef">Car / Delivery</text>
          <text x="299" y="135" textAnchor="middle" fontSize="9" fill="#d6e5ef">Remote Access</text>
        </svg>
      );

    case 'wiring':
      return (
        <svg viewBox="0 0 560 150" className="w-full h-auto" role="img" aria-label="Comparison between wired KNX conduits during construction and wireless retrofit in finished homes">
          <rect width="560" height="150" rx="12" fill="var(--orbi-surface)" />
          {/* Left: Wired */}
          <rect x="16" y="16" width="256" height="118" rx="10" fill="var(--orbi-card)" stroke="var(--orbi-teal)" strokeWidth="1.5" />
          <text x="32" y="42" fontSize="13" fontWeight="700" fill="var(--orbi-teal)">Walls Open / Construction</text>
          <text x="32" y="62" fontSize="11.5" fill="var(--orbi-ink)">Wired KNX / Lutron Bus</text>
          <line x1="32" y1="80" x2="250" y2="80" stroke="var(--orbi-teal)" strokeWidth="3" />
          <circle cx="64" cy="80" r="6" fill="var(--orbi-navy)" />
          <circle cx="140" cy="80" r="6" fill="var(--orbi-navy)" />
          <circle cx="216" cy="80" r="6" fill="var(--orbi-navy)" />
          <text x="32" y="106" fontSize="10.5" fill="var(--orbi-mute)">Conduits + designer keypads · zero battery maintenance</text>
          {/* Right: Retrofit */}
          <rect x="288" y="16" width="256" height="118" rx="10" fill="var(--orbi-card)" stroke="var(--orbi-line)" strokeWidth="1.5" />
          <text x="304" y="42" fontSize="13" fontWeight="700" fill="var(--orbi-ink)">Walls Finished / Ready Home</text>
          <text x="304" y="62" fontSize="11.5" fill="var(--orbi-ink)">Wireless Retrofit Modules</text>
          <path d="M324 88q12-16 24 0" fill="none" stroke="var(--orbi-teal)" strokeWidth="2.5" />
          <path d="M316 80q20-26 40 0" fill="none" stroke="var(--orbi-teal)" strokeWidth="2" opacity="0.6" />
          <rect x="378" y="68" width="44" height="22" rx="4" fill="var(--orbi-navy)" />
          <text x="400" y="83" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">RELAY</text>
          <text x="304" y="106" fontSize="10.5" fill="var(--orbi-mute)">Fits behind existing switch plates · no wall chasing</text>
        </svg>
      );
  }
};
