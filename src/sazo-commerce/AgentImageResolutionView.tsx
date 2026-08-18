import { type Dispatch } from "react";
import { AgentHubHeader } from "@/sazo-commerce/MobileAgentHubView";
import {
  imageSearchNearestCandidate,
  imageSearchOtherCandidates,
  imageSearchResolvedNewBalanceProductId,
  imageSearchSubmittedPreview,
  type ImageSearchCandidate,
} from "@/sazo-commerce/imageProductResolutionFixtures";
import type { AgentSearchRequest, SazoAction } from "@/sazo-commerce/model";

interface AgentImageResolutionViewProps {
  dispatch: Dispatch<SazoAction>;
  request: AgentSearchRequest;
}

function CandidateChoice({
  candidate,
  onChoose,
  primary = false,
}: {
  candidate: ImageSearchCandidate;
  onChoose: (candidate: ImageSearchCandidate) => void;
  primary?: boolean;
}) {
  return (
    <article
      className={
        primary
          ? "sazo-image-resolution-primary-candidate"
          : "sazo-image-resolution-candidate-card"
      }
      data-image-search-candidate
      data-primary-candidate={primary || undefined}
    >
      <img alt={candidate.name} src={candidate.image} />
      <div>
        <h3>{candidate.name}</h3>
        <p>{candidate.color}</p>
        <button
          aria-label={`${candidate.name} ${candidate.color}を選ぶ`}
          onClick={() => onChoose(candidate)}
          type="button"
        >
          この商品を選ぶ
        </button>
      </div>
    </article>
  );
}

function CandidateResults({
  onChoose,
  request,
}: {
  onChoose: (candidate: ImageSearchCandidate) => void;
  request: AgentSearchRequest;
}) {
  const requestLabel =
    request.summary.length > 0 && request.summary !== request.imageName
      ? request.summary
      : "送った画像";

  return (
    <section aria-labelledby="image-search-results-title" className="sazo-image-resolution-results">
      <div className="sazo-image-resolution-request-summary">
        <img alt="送った画像" src={imageSearchSubmittedPreview} />
        <div>
          <span>送った画像</span>
          {requestLabel === "送った画像" ? null : (
            <strong>{requestLabel}</strong>
          )}
        </div>
      </div>
      <header className="sazo-image-resolution-results-heading">
        <h2 id="image-search-results-title">画像に近い商品を見つけました</h2>
        <p>近い商品を選んでください</p>
      </header>
      <section aria-labelledby="nearest-product-title" className="sazo-image-resolution-nearest">
        <h3 className="sazo-visually-hidden" id="nearest-product-title">
          最も近い商品
        </h3>
        <CandidateChoice candidate={imageSearchNearestCandidate} onChoose={onChoose} primary />
      </section>
      <section aria-labelledby="other-candidates-title" className="sazo-image-resolution-other">
        <h3 className="sazo-visually-hidden" id="other-candidates-title">
          その他の候補
        </h3>
        <div role="list">
          {imageSearchOtherCandidates.map((candidate) => (
            <CandidateChoice candidate={candidate} key={candidate.id} onChoose={onChoose} />
          ))}
        </div>
      </section>
    </section>
  );
}

export function AgentImageResolutionView({
  dispatch,
  request,
}: AgentImageResolutionViewProps) {
  const chooseCandidate = (candidate: ImageSearchCandidate) => {
    // Image identification keeps the resolved New Balance identity on the
    // mobile detail surface. URL submission continues to use open-product.
    dispatch(
      candidate.productId === imageSearchResolvedNewBalanceProductId
        ? { type: "open-image-search-product", productId: candidate.productId }
        : { type: "open-product", productId: candidate.productId },
    );
  };

  return (
    <div className="sazo-image-resolution" data-agent-image-resolution data-step="candidates">
      <AgentHubHeader dispatch={dispatch} />
      <main className="sazo-image-resolution-main">
        <CandidateResults onChoose={chooseCandidate} request={request} />
      </main>
    </div>
  );
}
