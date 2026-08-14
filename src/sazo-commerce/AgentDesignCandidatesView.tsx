import { useState } from "react";
import { Camera, Image as ImageIcon, Link2, Plus, Sparkles } from "lucide-react";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import "@/sazo-commerce/agent-designs.css";

type CandidateId = "quiet" | "inset" | "orbit";

const candidates: {
  id: CandidateId;
  number: string;
  title: string;
  subtitle: string;
  recommendation?: string;
}[] = [
  {
    id: "quiet",
    number: "01",
    title: "クワイエット・コンポーザー",
    subtitle: "一つの落ち着いた入力欄に、相談・URL・写真を自然にまとめる",
    recommendation: "推奨",
  },
  {
    id: "inset",
    number: "02",
    title: "インセット・シート",
    subtitle: "説明と入力欄の階層を分け、初めてでも迷わせない",
  },
  {
    id: "orbit",
    number: "03",
    title: "オービット・コマンドバー",
    subtitle: "最小限の要素で、AIに渡す行為そのものを主役にする",
  },
];

const sourceActions = [
  { icon: Link2, label: "URLを貼る", notice: "日本の商品URLを貼り付けてください" },
  { icon: ImageIcon, label: "写真を選ぶ", notice: "写真ライブラリから選択できます" },
  { icon: Camera, label: "写真を撮る", notice: "カメラで商品の写真を撮影できます" },
];

function AgentComposer({ variant }: { variant: CandidateId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [value, setValue] = useState("");

  return (
    <div className={`agent-design-composer agent-design-composer--${variant}`}>
      <div className="agent-design-composer-caption">
        <span className="agent-design-sakura-mark" aria-hidden>✿</span>
        <span>J-Planet AIエージェント</span>
      </div>
      <div className="agent-design-input-row">
        <button
          aria-expanded={menuOpen}
          aria-label="入力方法を追加"
          className="agent-design-plus"
          onClick={() => {
            setMenuOpen((open) => !open);
          }}
          type="button"
        >
          <Plus aria-hidden size={20} />
        </button>
        <input
          aria-label="AIへの相談内容"
          onChange={(event) => {
            setValue(event.target.value);
          }}
          placeholder="URL・画像・商品名をAIに渡す"
          value={value}
        />
        <button aria-label="AIに送信" className="agent-design-submit" type="button">
          <Sparkles aria-hidden size={18} />
        </button>
      </div>
      {menuOpen ? (
        <div className="agent-design-plus-menu" role="menu">
          {sourceActions.map(({ icon: Icon, label, notice: nextNotice }) => (
            <button
              key={label}
              onClick={() => {
                setNotice(nextNotice);
                setMenuOpen(false);
              }}
              role="menuitem"
              type="button"
            >
              <Icon aria-hidden size={18} />
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {notice ? (
        <p aria-live="polite" className="agent-design-action-notice">{notice}</p>
      ) : null}
    </div>
  );
}

function CandidatePreview({ id }: { id: CandidateId }) {
  return (
    <div
      className={`agent-design-stage agent-design-stage--${id}`}
      data-testid="home-agent-preview"
    >
      {id === "orbit" ? <div className="agent-design-orbit-ring" aria-hidden /> : null}
      <AgentComposer variant={id} />
    </div>
  );
}

export function AgentDesignCandidatesView() {
  const [selected, setSelected] = useState<CandidateId>("quiet");

  return (
    <main className="agent-designs-page" data-agent-design-candidates>
      <header className="agent-designs-header">
        <div className="agent-designs-brand"><JplanetLogo /><span>AI INPUT STUDY</span></div>
        <p className="agent-designs-eyebrow">J-PLANET DESIGN LAB</p>
        <h1>J-Planet AI入力カード — 3案</h1>
        <p className="agent-designs-intro">
          商品名はそのまま入力。URLや写真は＋から追加する、iPhoneらしい静かな操作感を比較できます。
        </p>
      </header>

      <section aria-label="3つのデザイン候補" className="agent-designs-grid">
        {candidates.map((candidate) => (
          <article
            className={`agent-design-card ${selected === candidate.id ? "is-selected" : ""}`}
            data-agent-design={candidate.id}
            key={candidate.id}
          >
            <div className="agent-design-card-heading">
              <span className="agent-design-number">{candidate.number}</span>
              <div>
                <div className="agent-design-title-line">
                  <h2>{candidate.title}</h2>
                  {candidate.recommendation ? <span>{candidate.recommendation}</span> : null}
                </div>
                <p>{candidate.subtitle}</p>
              </div>
            </div>
            <CandidatePreview id={candidate.id} />
            <button
              className="agent-design-select"
              onClick={() => {
                setSelected(candidate.id);
              }}
              type="button"
            >
              {selected === candidate.id ? "選択中" : "この案を選ぶ"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
