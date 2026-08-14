import { useEffect, useState, type Dispatch } from "react";
import type { AgentSearchRequest, SazoAction } from "@/sazo-commerce/model";

export interface AgentSearchLoadingViewProps {
  dispatch: Dispatch<SazoAction>;
  request: AgentSearchRequest;
}

export function AgentSearchLoadingView({ dispatch }: AgentSearchLoadingViewProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setActiveStep(1), 2_500),
      window.setTimeout(() => setActiveStep(2), 5_000),
      window.setTimeout(() => setActiveStep(3), 7_500),
      window.setTimeout(() => dispatch({ type: "complete-agent-search" }), 10_000),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dispatch]);

  return (
    <main className="sazo-agent-search-loading" data-agent-search-loading>
      <div
        aria-label="クロネとJupiが遊んでいます"
        className="sazo-agent-pet-stage"
        data-agent-pet-stage
        data-play-phase={activeStep}
        role="img"
      >
        <span
          className="sazo-agent-pet-actor sazo-agent-pet-kurone-actor"
          aria-hidden="true"
          data-pet-id="kurone"
        >
          <span className="sazo-agent-pet-kurone" />
        </span>
        <span
          className="sazo-agent-pet-actor sazo-agent-pet-jupi-actor"
          aria-hidden="true"
          data-pet-id="jupi"
        >
          <span className="sazo-agent-pet-jupi" />
        </span>
      </div>
    </main>
  );
}
