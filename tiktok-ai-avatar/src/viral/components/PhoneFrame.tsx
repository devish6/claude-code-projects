import React from "react";
import { AbsoluteFill } from "remotion";
import { useCameraDrift, useFloat } from "../motion";

/**
 * A phone shell to put product screens inside. Knows nothing about what it
 * contains — it is a device, not a checkout.
 *
 * Why a device frame at all: these screens are recreations of numevix.com, and
 * a bare card floating on the sage ground reads as "a graphic about the site".
 * Inside a phone it reads as "the site", which is the whole claim the video is
 * making. Same reason src/promos/ProductDemo.tsx recreates the app rather than
 * screenshotting it — a screenshot from this machine would show C$ prices,
 * because country comes from the Vercel edge geo header and cannot be forced.
 *
 * Sized so the screen fills most of a 1080x1920 frame while leaving room for a
 * caption line above it. The body drifts and floats so no frame is ever static.
 */
export const PhoneFrame: React.FC<{
  /** Held for the whole scene — drives the slow zoom. */
  durationInFrames: number;
  children: React.ReactNode;
}> = ({ durationInFrames, children }) => {
  const scale = useCameraDrift(durationInFrames, 1, 1.05);
  const y = useFloat(10, 3.2);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 150,
      }}
    >
      <div
        style={{
          transform: `translateY(${y}px) scale(${scale})`,
          width: 760,
          height: 1300,
          borderRadius: 76,
          padding: 18,
          background: "linear-gradient(160deg, #3B3A31 0%, #26251F 100%)",
          boxShadow:
            "0 50px 90px -30px rgba(40,34,14,0.62), 0 0 0 3px rgba(255,246,214,0.16)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 60,
            overflow: "hidden",
            background: "#F6F4EC",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Notch. Drawn inside the clipped screen so it can't overhang. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 230,
              height: 34,
              borderBottomLeftRadius: 22,
              borderBottomRightRadius: 22,
              background: "#26251F",
              zIndex: 2,
            }}
          />
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * The one line of copy above the phone. This is the only element that differs
 * between the English and Hindi cuts — the screen inside the phone is English
 * in both, because the real payment page is (messages/hi.json tells Hindi users
 * exactly that: "सुरक्षित भुगतान पृष्ठ English में खुलेगा").
 */
export const PhoneCaption: React.FC<{
  text: string;
  fontFamily: string;
  color: string;
  shadow: string;
}> = ({ text, fontFamily, color, shadow }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 128,
      paddingLeft: 70,
      paddingRight: 70,
      textAlign: "center",
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        fontFamily,
        fontSize: 62,
        fontWeight: 800,
        lineHeight: 1.14,
        color,
        textShadow: shadow,
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);
