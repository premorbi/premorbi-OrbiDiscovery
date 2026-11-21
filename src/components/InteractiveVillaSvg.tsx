import React from 'react';
import { CATEGORIES } from '../data/discoveryConfig';
import type { CategoryPriority } from '../utils/discoveryLogic';

interface InteractiveVillaSvgProps {
  cats: Record<string, CategoryPriority>;
  onSelectCategory?: (categoryId: string) => void;
  compact?: boolean;
}

export const InteractiveVillaSvg: React.FC<InteractiveVillaSvgProps> = ({
  cats,
  onSelectCategory,
  compact = false,
}) => {
  const activeClasses = CATEGORIES.filter((c) => (cats[c.id] || 0) > 0)
    .map((c) => c.svgClass)
    .join(' ');

  const handleZoneClick = (id: string) => {
    if (onSelectCategory) onSelectCategory(id);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-sky)] ${
        compact ? 'h-48' : 'h-72'
      }`}
      aria-label="Interactive home cross-section that illuminates as you select features"
    >
      <svg
        viewBox="0 0 400 290"
        preserveAspectRatio="xMidYMax meet"
        role="img"
        className={`w-full h-full block ${activeClasses}`}
      >
        <title>Your home cross-section illustrating selected smart features</title>
        <rect width="400" height="290" fill="var(--orbi-sky)" />
        <rect y="262" width="400" height="28" fill="var(--orbi-grass)" />
        <polygon points="20,290 96,262 216,262 150,290" fill="var(--orbi-s7)" />

        {/* Facade uplight beams */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('outdoor')}
        >
          <polygon
            className="villa-part villa-fx villa-beam"
            points="114,262 124,262 136,196 104,196"
            fill="var(--orbi-glow)"
          />
          <polygon
            className="villa-part villa-fx villa-beam"
            points="296,262 306,262 316,196 284,196"
            fill="var(--orbi-glow)"
          />
        </g>

        {/* Main house structure */}
        <rect
          x="108"
          y="120"
          width="204"
          height="142"
          fill="var(--orbi-wall)"
          stroke="var(--orbi-line)"
        />
        <rect x="262" y="120" width="50" height="142" fill="#0f2a44" opacity="0.06" />
        <line x1="108" y1="190" x2="312" y2="190" stroke="var(--orbi-line)" strokeWidth="3" />
        <rect x="102" y="110" width="216" height="12" rx="2" fill="var(--orbi-roof)" />

        {/* Solar roof */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('energy')}
        >
          <title>Solar &amp; Energy</title>
          <g className="villa-part villa-sol" fill="var(--orbi-s2)">
            <polygon points="116,110 140,110 148,90 124,90" />
            <polygon points="146,110 170,110 178,90 154,90" />
            <polygon points="176,110 200,110 208,90 184,90" />
          </g>
          <g stroke="var(--orbi-roof)" strokeWidth="2">
            <line x1="128" y1="100" x2="128" y2="110" />
            <line x1="158" y1="100" x2="158" y2="110" />
            <line x1="188" y1="100" x2="188" y2="110" />
          </g>
        </g>

        {/* Whole-home Wi-Fi */}
        <g
          className={`villa-part villa-fx villa-wifi ${onSelectCategory ? 'cursor-pointer' : ''}`}
          fill="none"
          stroke="var(--orbi-teal)"
          strokeWidth="2.4"
          strokeLinecap="round"
          onClick={() => handleZoneClick('network')}
        >
          <title>Wi-Fi Everywhere</title>
          <path d="M224 100a10 10 0 0 1 14 0" />
          <path d="M219 95a17 17 0 0 1 24 0" />
          <path d="M214 90a24 24 0 0 1 34 0" />
          <circle cx="231" cy="104" r="2" fill="var(--orbi-teal)" />
        </g>

        {/* Overhead water tank */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('water')}
        >
          <title>Water Management</title>
          <rect x="262" y="72" width="38" height="38" rx="7" fill="var(--orbi-s0)" />
          <rect className="villa-part villa-lvl" x="267" y="78" width="28" height="28" rx="3" />
          <rect x="262" y="72" width="38" height="6" rx="3" fill="#444" />
        </g>

        {/* Bedroom + Motorized curtains */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('shades')}
        >
          <title>Curtains &amp; Blinds</title>
          <rect className="villa-win" x="122" y="136" width="58" height="40" rx="2" />
          <rect className="villa-part villa-cur villa-cur-l" x="122" y="136" width="29" height="40" />
          <rect className="villa-part villa-cur villa-cur-r" x="151" y="136" width="29" height="40" />
          <rect x="120" y="132" width="62" height="4" fill="var(--orbi-roof)" />
        </g>

        {/* Climate & AC */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('climate')}
        >
          <title>Climate &amp; Fresh Air</title>
          <rect
            x="190"
            y="140"
            width="38"
            height="12"
            rx="3"
            fill="var(--orbi-s9)"
            stroke="var(--orbi-line)"
          />
          <g
            className="villa-part villa-fx villa-air"
            stroke="var(--orbi-teal)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          >
            <path d="M196 157q3 5 0 10" />
            <path d="M209 157q3 5 0 10" />
            <path d="M222 157q3 5 0 10" />
          </g>
        </g>

        {/* Acoustic study */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('acoustic')}
        >
          <title>Acoustic Comfort</title>
          <rect className="villa-win" x="238" y="136" width="58" height="40" rx="2" />
          <g className="villa-part villa-fx villa-hex" fill="var(--orbi-s3)">
            <polygon points="250,150 256,146 262,150 262,157 256,161 250,157" />
            <polygon points="263,157 269,153 275,157 275,164 269,168 263,164" />
            <polygon points="276,150 282,146 288,150 288,157 282,161 276,157" />
          </g>
        </g>

        {/* Living Room + AV + Lighting */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('av')}
        >
          <title>Home Theatre &amp; Music</title>
          <rect className="villa-win" x="120" y="204" width="86" height="44" rx="2" />
          <rect className="villa-part villa-tv" x="144" y="220" width="38" height="22" rx="2" fill="#1a2733" />
          <g
            className="villa-part villa-fx villa-wave"
            fill="none"
            stroke="#4fb7ff"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M188 226q4 5 0 10" />
            <path d="M193 222q7 9 0 18" />
          </g>
        </g>

        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('lighting')}
        >
          <title>Lighting &amp; Scenes</title>
          <line x1="163" y1="204" x2="163" y2="211" stroke="var(--orbi-roof)" strokeWidth="1.5" />
          <path className="villa-part villa-lamp" d="M156 216h14l-3-6h-8z" fill="var(--orbi-s5)" />
        </g>

        {/* Main Door + Security */}
        <rect x="214" y="210" width="26" height="52" rx="2" fill="var(--orbi-roof)" />
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('security')}
        >
          <title>Security &amp; Entry</title>
          <circle className="villa-part villa-bell" cx="246" cy="232" r="3" fill="var(--orbi-s6)" />
          <circle cx="234" cy="238" r="2" fill="#fff" />
          <polygon className="villa-part villa-fx villa-cone" points="314,198 352,236 330,250" fill="var(--orbi-teal)" />
          <rect
            x="306"
            y="192"
            width="12"
            height="7"
            rx="2"
            fill="var(--orbi-s8)"
            stroke="var(--orbi-line)"
          />
          <circle className="villa-part villa-camlight" cx="316" cy="195.5" r="1.8" fill="#8aa3b5" />
        </g>

        {/* Kitchen + Safety */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('safety')}
        >
          <title>Safety Sensors</title>
          <rect className="villa-win" x="252" y="206" width="46" height="30" rx="2" />
          <circle className="villa-part villa-smoke" cx="275" cy="200" r="3.2" fill="var(--orbi-s6)" />
        </g>

        {/* Driveway Gate */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('gate')}
        >
          <title>Gate &amp; Garage</title>
          <g fill="var(--orbi-s1)">
            <rect x="16" y="232" width="6" height="30" />
            <rect x="94" y="232" width="6" height="30" />
          </g>
          <g className="villa-part villa-gate" stroke="var(--orbi-s1)" strokeWidth="2.4">
            <line x1="26" y1="240" x2="90" y2="240" />
            <line x1="26" y1="258" x2="90" y2="258" />
            <line x1="32" y1="238" x2="32" y2="260" />
            <line x1="44" y1="238" x2="44" y2="260" />
            <line x1="56" y1="238" x2="56" y2="260" />
            <line x1="68" y1="238" x2="68" y2="260" />
            <line x1="80" y1="238" x2="80" y2="260" />
          </g>
        </g>

        {/* Garden & Sprinklers */}
        <g
          className={onSelectCategory ? 'cursor-pointer' : ''}
          onClick={() => handleZoneClick('outdoor')}
        >
          <title>Garden &amp; Facade</title>
          <rect x="350" y="226" width="8" height="36" fill="var(--orbi-s4)" />
          <circle cx="354" cy="210" r="22" fill="var(--orbi-leaf)" />
          <circle cx="340" cy="224" r="13" fill="var(--orbi-leaf)" />
          <circle cx="368" cy="224" r="13" fill="var(--orbi-leaf)" />
          <g
            className="villa-part villa-fx villa-spr"
            fill="none"
            stroke="#4fb7ff"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M330 262q8-14 16 0" />
            <path d="M326 262q12-22 24 0" />
          </g>
        </g>
      </svg>
      {onSelectCategory && (
        <div className="absolute bottom-2.5 right-3 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--orbi-card)]/90 text-[var(--orbi-ink)] border border-[var(--orbi-line)] pointer-events-none">
          Tap any zone to jump
        </div>
      )}
    </div>
  );
};
