import { useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  Link2,
  Mic,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import "@/sazo-commerce/agent-designs.css";

type CandidateId = "chat" | "modes" | "welcome" | "discovery" | "float";

const candidates: {
  id: CandidateId;
  number: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "chat",
    number: "01",
    title: "ChatGPTライク",
    subtitle: "入力をひとつにまとめ、＋から画像やカメラを呼び出す",
  },
  {
    id: "modes",
    number: "02",
    title: "3モードクイック入力",
    subtitle: "URL・画像・商品名を最初から見せて迷いをなくす",
  },
  {
    id: "welcome",
    number: "03",
    title: "ウェルカムカード",
    subtitle: "J-Planet AIの役割を先に説明して安心感をつくる",
  },
  {
    id: "discovery",
    number: "04",
    title: "発見型サーチ",
    subtitle: "人気キーワードと候補商品を検索体験の中に配置する",
  },
  {
    id: "float",
    number: "05",
    title: "フローティングアシスタント",
    subtitle: "コンテンツを邪魔せず、いつでも相談できる最小UI",
  },
];

function Composer({ variant }: { variant: CandidateId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className={`agent-design-composer agent-design-composer--${variant}`}>
      {variant === "welcome" ? (
        <div className="agent-design-welcome-copy">
          <span className="agent-design-avatar">✿</span>
          <div>
            <strong>J-Planet AIエージェント</strong>
            <p>日本の商品探し・購入からブラジルへの配送まで、AIがサポートします。</p>
          </div>
        </div>
      ) : null}

      {variant === "discovery" ? (
        <div className="agent-design-discovery-heading">
          <Sparkles aria-hidden size={18} />
          <strong>ブラジルで人気の日本アイテムを探す</strong>
        </div>
      ) : null}

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
          <Plus aria-hidden size={21} />
        </button>
        <input
          aria-label="AIへの相談内容"
          onChange={(event) => {
            setValue(event.target.value);
          }}
          placeholder={
            variant === "discovery"
              ? "日本の商品名やキーワードを入力"
              : "URL・画像・商品名をAIに渡す"
          }
          value={value}
        />
        {variant === "float" ? (
          <button aria-label="音声入力" className="agent-design-mic" type="button">
            <Mic aria-hidden size={20} />
          </button>
        ) : null}
        <button aria-label="AIに送信" className="agent-design-submit" type="button">
          <Sparkles aria-hidden size={19} />
        </button>
      </div>

      {menuOpen ? (
        <div className="agent-design-plus-menu" role="menu">
          <button role="menuitem" type="button">
            <Link2 aria-hidden size={18} /> URLを貼る
          </button>
          <button role="menuitem" type="button">
            <ImageIcon aria-hidden size={18} /> 写真を選ぶ
          </button>
          <button role="menuitem" type="button">
            <Camera aria-hidden size={18} /> 写真を撮る
          </button>
        </div>
      ) : null}

      {variant === "modes" ? (
        <div className="agent-design-mode-row">
          <button type="button"><Link2 aria-hidden size={16} />URLを貼る</button>
          <button type="button"><ImageIcon aria-hidden size={16} />写真を選ぶ</button>
          <button type="button"><Camera aria-hidden size={16} />写真を撮る</button>
        </div>
      ) : null}
    </div>
  );
}

function DiscoveryPreview() {
  return (
    <div className="agent-design-discovery-preview">
      <div className="agent-design-chip-row">
        <span>アニメグッズ</span><span>スニーカー</span><span>コスメ</span>
      </div>
      <div className="agent-design-mini-products">
        <div><span className="agent-design-product-image agent-design-product-image--pink" /><b>日本限定ギフト</b><small>¥3,200〜</small></div>
        <div><span className="agent-design-product-image agent-design-product-image--blue" /><b>人気の雑貨</b><small>¥2,480〜</small></div>
      </div>
    </div>
  );
}

function CandidatePreview({ id }: { id: CandidateId }) {
  if (id === "float") {
    return (
      <div className="agent-design-float-preview">
        <div className="agent-design-float-bubble"><Sparkles aria-hidden size={18} /> いつでも相談できます</div>
        <Composer variant={id} />
      </div>
    );
  }

  return (
    <>
      <Composer variant={id} />
      {id === "discovery" ? <DiscoveryPreview /> : null}
      {id === "chat" ? (
        <div className="agent-design-hint"><Upload aria-hidden size={16} /> URL・画像・商品名をまとめて送信</div>
      ) : null}
      {id === "welcome" ? (
        <div className="agent-design-trust-row"><span>✓</span> 日本からブラジルまで購入・配送をサポート</div>
      ) : null}
    </>
  );
}

export function AgentDesignCandidatesView() {
  const [selected, setSelected] = useState<CandidateId>("chat");

  return (
    <main className="agent-designs-page" data-agent-design-candidates>
      <header className="agent-designs-header">
        <div className="agent-designs-brand"><JplanetLogo /><span>AIエージェントUI</span></div>
        <p className="agent-designs-eyebrow">J-PLANET DESIGN LAB</p>
        <h1>AIエージェントのUI 5案</h1>
        <p className="agent-designs-intro">
          URL・画像・商品名をひとつの入口にまとめ、ブラジルのお客様が直感的に使える形を比較します。
        </p>
        <div aria-label="デザイン案を選択" className="agent-designs-tabs" role="tablist">
          {candidates.map((candidate) => (
            <button
              aria-selected={selected === candidate.id}
              className={selected === candidate.id ? "is-active" : ""}
              key={candidate.id}
              onClick={() => {
                setSelected(candidate.id);
                document.querySelector(`[data-agent-design="${candidate.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              role="tab"
              type="button"
            >
              {candidate.number} <span>{candidate.title}</span>
            </button>
          ))}
        </div>
      </header>

      <section className="agent-designs-grid" aria-label="5つのデザイン候補">
        {candidates.map((candidate) => (
          <article
            className={`agent-design-card ${selected === candidate.id ? "is-selected" : ""}`}
            data-agent-design={candidate.id}
            key={candidate.id}
            onClick={() => {
              setSelected(candidate.id);
            }}
          >
            <div className="agent-design-card-heading">
              <span className="agent-design-number">{candidate.number}</span>
              <div><h2>{candidate.title}</h2><p>{candidate.subtitle}</p></div>
            </div>
            <div className="agent-design-phone-frame"><CandidatePreview id={candidate.id} /></div>
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
