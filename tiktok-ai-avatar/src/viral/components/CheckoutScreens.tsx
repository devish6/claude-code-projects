import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  BORDER,
  CARD,
  GOLD,
  GOLD_TEXT,
  GREEN,
  GREEN_FG,
  INK,
  MUTED,
  SANS,
  SERIF,
} from "../../lib/brand";
import { Snap, useSpringAt } from "../motion";

/**
 * The four screens that appear inside <PhoneFrame>, recreating numevix.com.
 *
 * ⚠️ These use the APP's cream-and-gold tokens from lib/brand.ts, NOT the viral
 * system's sage palette. That is deliberate and the two must not be unified:
 * everything inside the phone is supposed to look like the real product, and
 * everything outside it is the video. Making the screens sage would turn the
 * proof back into a graphic.
 *
 * ⚠️ ALL COPY HERE IS ENGLISH IN BOTH LANGUAGE CUTS. The real payment page is
 * English — messages/hi.json says so to Hindi users in as many words
 * ("सुरक्षित भुगतान पृष्ठ English में खुलेगा। आपकी रिपोर्ट हिंदी में ही रहेगी।").
 * Only the caption above the phone is translated. Do not "finish the job" by
 * translating these strings; it would advertise a Hindi checkout we don't have.
 *
 * Prices are the GST-inclusive figures the site displays and Dodo charges:
 * INDIA_PLAN_INR.monad.month is 30000 paise, and indiaGrossPaise(30000) is
 * 35400 paise = ₹354. See upi-templates.test.ts, which re-derives it.
 */

const RUPEES = "354";
const PRICE = `₹${RUPEES}`;

/**
 * The price at display size.
 *
 * The ₹ gets its own span with a margin because Georgia's rupee glyph is wide
 * and its crossbars run right into the following digit at 128px — set as one
 * string it reads as a rendering fault rather than a price. At the 30-40px
 * sizes elsewhere the plain string is fine.
 */
const BigPrice: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <span
    style={{
      fontFamily: SERIF,
      fontSize: 128,
      fontWeight: 700,
      color: GOLD,
      lineHeight: 1,
      transform: `scale(${scale})`,
      transformOrigin: "left bottom",
      display: "inline-block",
    }}
  >
    <span style={{ marginRight: 12 }}>₹</span>
    {RUPEES}
  </span>
);

/** Shared page chrome — a status bar, so the screen reads as a phone screen. */
const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(180deg, #F8F4EA 0%, #F2F0E6 100%)",
      paddingTop: 58,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0 44px 18px",
        fontFamily: SANS,
        fontSize: 26,
        fontWeight: 700,
        color: MUTED,
      }}
    >
      <span>9:41</span>
      <span>numevix.com</span>
    </div>
    {/* Content is vertically CENTRED, not top-aligned. These screens carry far
        less than a real page does, so anchoring them to the top left the lower
        half of the phone as dead cream — which reads as a half-loaded page
        rather than a product. */}
    <div
      style={{
        flex: 1,
        padding: "10px 40px 40px",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  </div>
);

const Card: React.FC<{
  children: React.ReactNode;
  featured?: boolean;
  style?: React.CSSProperties;
}> = ({ children, featured, style }) => (
  <div
    style={{
      background: CARD,
      border: `2px solid ${featured ? GOLD : BORDER}`,
      borderRadius: 30,
      padding: "34px 34px",
      boxShadow: featured
        ? "0 22px 46px -26px oklch(0.72 0.10 80 / 0.55)"
        : "0 14px 32px -24px oklch(0.24 0.012 60 / 0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ── 1. Pricing ──────────────────────────────────────────────────────────────
/**
 * The plan card, in rupees. The price itself lands on a spring a few frames
 * after the card so the eye is already on the card when the number arrives.
 */
export const PricingScreen: React.FC = () => {
  const priceSpring = useSpringAt(14, "burst");
  const priceScale = interpolate(priceSpring, [0, 1], [1.5, 1]);

  return (
    <Screen>
      <Snap delay={0} y={26} from={0.92}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            background: "oklch(0.96 0.008 85)",
            border: `2px solid ${BORDER}`,
            borderRadius: 999,
            padding: 8,
            marginBottom: 26,
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 28,
              fontWeight: 700,
              color: INK,
              background: "oklch(0.72 0.10 80 / 0.18)",
              border: `2px solid oklch(0.72 0.10 80 / 0.45)`,
              borderRadius: 999,
              padding: "10px 34px",
            }}
          >
            Monthly
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 28,
              fontWeight: 700,
              color: MUTED,
              padding: "10px 34px",
            }}
          >
            Yearly
          </span>
        </div>
      </Snap>

      <Snap delay={6} y={40} from={0.9}>
        <Card featured>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: GOLD_TEXT,
            }}
          >
            Most popular
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 60,
              fontWeight: 700,
              color: INK,
              marginTop: 8,
            }}
          >
            Monad
          </div>

          <div style={{ display: "flex", alignItems: "baseline", marginTop: 14 }}>
            <BigPrice scale={priceScale} />
            <span
              style={{
                fontFamily: SANS,
                fontSize: 40,
                fontWeight: 700,
                color: MUTED,
                marginLeft: 10,
              }}
            >
              /mo
            </span>
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            {["Unlimited charts", "Full history", "20% off Readings"].map((h, i) => (
              <Snap key={h} delay={22 + i * 5} y={14} from={0.96}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 32,
                    fontWeight: 600,
                    color: INK,
                    display: "flex",
                    gap: 14,
                  }}
                >
                  <span style={{ color: GREEN, fontWeight: 900 }}>✓</span>
                  {h}
                </div>
              </Snap>
            ))}
          </div>
        </Card>
      </Snap>

      {/* The India badge, verbatim from messages/en.json pricing.indiaBadge. */}
      <Snap delay={30} y={16} from={0.96}>
        <div
          style={{
            marginTop: 26,
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 28,
            fontWeight: 700,
            color: GOLD_TEXT,
            lineHeight: 1.3,
          }}
        >
          Prices shown and billed in ₹ for India.
        </div>
      </Snap>
    </Screen>
  );
};

// ── 2. Payment methods ──────────────────────────────────────────────────────
const UPI_APPS = ["GPay", "PhonePe", "Paytm", "BHIM"];
const OTHER_METHODS = ["Cards", "Netbanking", "Wallets"];

/**
 * The method list, UPI selected. The four app chips stagger in one after
 * another — that stagger is the beat that sells "your app works", so it is the
 * one piece of motion on this screen that must not be sped up further.
 */
export const MethodsScreen: React.FC = () => (
  <Screen>
    <Snap delay={0} y={20} from={0.94}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        Secure checkout
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 74,
          fontWeight: 700,
          color: INK,
          marginTop: 6,
        }}
      >
        Pay {PRICE}
      </div>
    </Snap>

    <Snap delay={6} y={34} from={0.92} style={{ marginTop: 26 }}>
      <Card featured style={{ padding: "30px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: `8px solid ${GREEN}`,
              background: CARD,
            }}
          />
          <div
            style={{
              fontFamily: SANS,
              fontSize: 46,
              fontWeight: 900,
              color: INK,
              letterSpacing: 1,
            }}
          >
            UPI
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: SANS,
              fontSize: 24,
              fontWeight: 800,
              color: GREEN_FG,
              background: GREEN,
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            INSTANT
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
          {UPI_APPS.map((app, i) => (
            <Snap key={app} delay={16 + i * 7} y={0} from={0.72}>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 30,
                  fontWeight: 700,
                  color: INK,
                  background: "oklch(0.72 0.10 80 / 0.14)",
                  border: `2px solid oklch(0.72 0.10 80 / 0.4)`,
                  borderRadius: 16,
                  padding: "12px 22px",
                }}
              >
                {app}
              </div>
            </Snap>
          ))}
        </div>
      </Card>
    </Snap>

    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      {OTHER_METHODS.map((m, i) => (
        <Snap key={m} delay={48 + i * 4} y={12} from={0.97}>
          <div
            style={{
              background: CARD,
              border: `2px solid ${BORDER}`,
              borderRadius: 22,
              padding: "22px 30px",
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: 0.75,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `3px solid ${BORDER}`,
              }}
            />
            <span style={{ fontFamily: SANS, fontSize: 34, fontWeight: 600, color: MUTED }}>
              {m}
            </span>
          </div>
        </Snap>
      ))}
    </div>
  </Screen>
);

// ── 3. Approve ──────────────────────────────────────────────────────────────
/** A tap ripple + the wait state. Nothing here claims a speed we can't meet. */
export const ApproveScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const ripple = interpolate(frame, [8, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dots = Math.floor(frame / 9) % 4;

  return (
    <Screen>
      <Snap delay={0} y={20} from={0.94}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          UPI
        </div>
        <div
          style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 700, color: INK, marginTop: 6 }}
        >
          Pay {PRICE}
        </div>
      </Snap>

      <Snap delay={5} y={30} from={0.93} style={{ marginTop: 30 }}>
        <Card>
          <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: MUTED }}>
            UPI ID
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 44,
              fontWeight: 700,
              color: INK,
              marginTop: 8,
            }}
          >
            9876543210@upi
            <span style={{ color: GOLD, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>
          </div>
        </Card>
      </Snap>

      {/* Pay button with a tap ripple expanding from its centre. */}
      <Snap delay={10} y={24} from={0.94} style={{ marginTop: 30 }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: GREEN,
            borderRadius: 26,
            padding: "30px 0",
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 44,
            fontWeight: 900,
            color: GREEN_FG,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 700 * ripple,
              height: 700 * ripple,
              marginLeft: -350 * ripple,
              marginTop: -350 * ripple,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.34)",
              opacity: 1 - ripple,
            }}
          />
          <span style={{ position: "relative" }}>Pay {PRICE}</span>
        </div>
      </Snap>

      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 34,
          fontWeight: 700,
          color: MUTED,
        }}
      >
        Approve in your UPI app{".".repeat(dots)}
      </div>
    </Screen>
  );
};

// ── 4. Paid ─────────────────────────────────────────────────────────────────
/**
 * The receipt. "Reading unlocked" is the honest payoff — the entitlement lands
 * on payment; it does not claim the report itself is already written.
 */
export const PaidScreen: React.FC = () => {
  const ring = useSpringAt(2, "burst");

  return (
    <Screen>
      {/* Vertical centring now comes from <Screen>; this only handles the
          horizontal axis. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: GREEN,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${interpolate(ring, [0, 1], [0.3, 1])})`,
            boxShadow: "0 24px 60px -22px oklch(0.52 0.085 158 / 0.75)",
          }}
        >
          <span style={{ fontSize: 130, color: GREEN_FG, fontWeight: 900, lineHeight: 1 }}>
            ✓
          </span>
        </div>

        <Snap delay={10} y={26} style={{ marginTop: 44 }}>
          <div style={{ fontFamily: SERIF, fontSize: 82, fontWeight: 700, color: INK }}>
            Paid {PRICE}
          </div>
        </Snap>

        <Snap delay={18} y={18} from={0.94}>
          <div
            style={{
              marginTop: 14,
              fontFamily: SANS,
              fontSize: 38,
              fontWeight: 700,
              color: GOLD_TEXT,
            }}
          >
            Paid by UPI · GST included
          </div>
        </Snap>

        <Snap delay={26} y={18} from={0.94}>
          <div
            style={{
              marginTop: 34,
              fontFamily: SANS,
              fontSize: 34,
              fontWeight: 600,
              color: MUTED,
            }}
          >
            Your reading is unlocked
          </div>
        </Snap>
      </div>
    </Screen>
  );
};
