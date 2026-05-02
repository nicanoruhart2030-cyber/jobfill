"use client";

/** CSS-only 3D card stack for landing hero */
export function HeroCssCards() {
  return (
    <div
      style={{
        perspective: "1000px",
        width: "320px",
        height: "420px",
        margin: "0 auto",
      }}
    >
      <div
        className="hero-css-cards-root"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
      >
      {/* Back card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg-elevated)",
          border: "0.5px solid var(--border)",
          borderRadius: "16px",
          transform: "translateZ(-40px) rotateY(-6deg) rotateZ(5deg) scale(0.9)",
          padding: "24px",
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Cohere</div>
        <div
          style={{
            fontSize: "14px",
            color: "var(--text-2)",
            fontFamily: "var(--font-body)",
            marginTop: "4px",
          }}
        >
          ML Engineer Intern
        </div>
      </div>

      {/* Mid card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg-surface)",
          border: "0.5px solid var(--border-hover)",
          borderRadius: "16px",
          transform: "translateZ(-20px) rotateY(-6deg) rotateZ(-2deg) scale(0.95)",
          padding: "24px",
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Wealthsimple</div>
        <div
          style={{
            fontSize: "14px",
            color: "var(--text-2)",
            fontFamily: "var(--font-body)",
            marginTop: "4px",
          }}
        >
          Frontend Developer
        </div>
      </div>

      {/* Front card */}
      <div
        className="hero-css-cards-front"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-hover)",
          borderTop: "2px solid var(--accent)",
          borderRadius: "16px",
          transform: "rotateY(-6deg) rotateZ(2deg)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          animation: "heroFloat 4s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "var(--accent-dim)",
              border: "0.5px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--accent)",
              fontFamily: "var(--font-display)",
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--accent)",
              border: "0.5px solid var(--border-accent)",
              borderRadius: "999px",
              padding: "3px 10px",
            }}
          >
            94% match
          </div>
        </div>
        <div>
          <div style={{ fontSize: "13px", color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Shopify</div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--text-1)",
              fontFamily: "var(--font-display)",
              marginTop: "2px",
            }}
          >
            Software Engineer
          </div>
        </div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 500,
            color: "var(--accent)",
            fontFamily: "var(--font-mono)",
          }}
        >
          $95–120k
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["React", "TypeScript", "Remote"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-body)",
                border: "0.5px solid var(--border)",
                color: "var(--text-2)",
                borderRadius: "6px",
                padding: "3px 8px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: "12px",
            color: "var(--text-3)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
          }}
        >
          Join the team building commerce infrastructure for millions of merchants worldwide.
        </div>
      </div>
    </div>
    </div>
  );
}
