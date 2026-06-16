import "./SjUseCases.css";
import { SjUseCasesEnterprise } from "./SjUseCasesEnterprise";
import { SjUseCasesStartups } from "./SjUseCasesStartups";
import { SjUseCasesPlatform } from "./SjUseCasesPlatform";

/**
 * §5 あらゆるビジネスに対応。（.business-sizes-section / Y4529–9194、最大 section）
 *
 * 構成（specs/00-section-map.md §5 / storyboard-scroll-028）:
 * - section title（h2 + subdued 連結文）
 * - 5a 大企業: 導入事例アコーディオン + 専任エキスパート 3 カラム … SjUseCasesEnterprise
 * - 5b スタートアップ: drag carousel + Startups/Atlas プロモカード … SjUseCasesStartups
 * - 5c SaaS: Zenflow widget build-in + 3 カラム + testimonial auto-rotate … SjUseCasesPlatform
 * - 各部の間に divider（本家は canvas、spec の方針どおり 1px line で代替）
 *
 * motion 方針（specs/01-motion-spec.md）: section entrance なし。
 * 動くのは「UI 自体が動く」2 箇所（Zenflow build-in / testimonial progress）+ hover 系のみ。
 */
export function SjUseCases() {
  return (
    <section className="sj-uc">
      <div className="sj-container">
        <div className="sj-uc__title-block">
          <h2 className="sj-uc-h2">
            あらゆるビジネスに対応。{" "}
            <span className="sj-uc-h2__subdued">
              ニーズに応える柔軟性と信頼性を兼ね備えたプラットフォーム。
            </span>
          </h2>
        </div>
        <div className="sj-uc__header-divider" aria-hidden="true" />

        <SjUseCasesEnterprise />
        <div className="sj-uc-divider" aria-hidden="true" />
        <SjUseCasesStartups />
        <div className="sj-uc-divider" aria-hidden="true" />
        <SjUseCasesPlatform />
      </div>
    </section>
  );
}
