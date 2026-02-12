import "./index.css";
import { Link } from "react-router-dom";

export const title = "FAB Pulse";
export const description =
  "Ring pulse animation around a floating action button — shareable CSS + React.";

export default function FabPulse() {
  return (
    <div className="fab-pulse-page">
      <nav className="fab-pulse-nav">
        <Link to="/">← All projects</Link>
      </nav>

      <div className="fab-pulse-stage">
        <h1 className="fab-pulse-label">Animation</h1>

        <div className="fab-pulse-orb" aria-label="Pulse animation">
          <div className="fab-pulse-ring-base" aria-hidden />
          <div className="fab-pulse-pulse fab-pulse-p1" aria-hidden />
          <div className="fab-pulse-pulse fab-pulse-p2" aria-hidden />
          <div className="fab-pulse-fab">
            <div className="fab-pulse-icon" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

export const routes = [{ path: "/", Component: () => null }];
