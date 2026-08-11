import { useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Link2,
  Plus,
  Send,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import "@/sazo-commerce/agent-first.css";

type AgentMode = "idle" | "thinking" | "results";

const products = [
  {
    image: "/sazo-commerce/products/03.webp",
    name: "日本限定ギフトセット",
    source: "J-Planet selection",
    price: "¥3,200〜",
    delivery: "ブラジル到着 7〜12日",
  },
  {
    image: "/sazo-commerce/products/08.webp",
    name: "毎日使えるミニバッグ",
    source: "日本の人気ショップ",
    price: "¥4,980〜",
    delivery: "ブラジル到着 8〜14日",
  },
  {
    image: "/sazo-commerce/products/11.webp",
    name: "プレミアムスニーカー",
    source: "公式ストア取寄せ",
    price: "¥12,800〜",
    delivery: "ブラジル到着 10〜16日",
  },
];

function PlusMenu({ onClose, onSelect }: { onClose: () => void; onSelect: (value: string) => void }) {
  return (
    <div className="agent-first-plus-menu" role="menu">
      <p>追加する</p>
      <button onClick={() => { onSelect("URLを貼り付けてください"); }} role="menuitem" type="button">
        <Link2 aria-hidden size={19} /> URLを貼る
      </button>
      <button onClick={() => { onSelect("写真を選択してください"); }} role="menuitem" type="button">
        <ImageIcon aria-hidden size={19} /> 写真を選択
      </button>
      <button onClick={() => { onSelect("写真を撮ってください"); }} role="menuitem" type="button">
        <Camera aria-hidden size={19} /> 写真を撮る
      </button>
      <button aria-label="メニューを閉じる" className="agent-first-menu-close" onClick={onClose} type="button">
        <X aria-hidden size={15} />
      </button>
    </div>
  );
}

export function AgentFirstPrototypeView() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<AgentMode>("idle");

  const sendPrompt = (prompt?: string) => {
    setValue(prompt ?? value);
    setMode("thinking");
    window.setTimeout(() => { setMode("results"); }, 650);
  };

  return (
    <main className="agent-first-page" data-agent-first-prototype>
      <section className="agent-first-hero" aria-labelledby="agent-first-title">
        <div className="agent-first-hero-topline">
          <span className="agent-first-pill"><Sparkles aria-hidden size={14} /> AGENT-FIRST</span>
          <span className="agent-first-step">01 / 03</span>
        </div>
        <h1 id="agent-first-title">日本の商品を、<br /><em>ブラジルのあなたへ。</em></h1>
        <p className="agent-first-lede">URL・写真・商品名を送るだけ。<br />日本での購入からブラジル配送まで、J-Planet AIが案内します。</p>

        <div className="agent-first-composer-wrap">
          <div className="agent-first-composer-label"><span>J-Planet AI</span><strong>何を探していますか？</strong></div>
          <div className="agent-first-composer" data-mode={mode}>
            <button aria-expanded={menuOpen} aria-label="入力を追加" className="agent-first-icon-button" onClick={() => { setMenuOpen((open) => !open); }} type="button">
              <Plus aria-hidden size={22} />
            </button>
            <input aria-label="URL・写真・商品名を入力" onChange={(event) => { setValue(event.target.value); }} placeholder="URL・写真・商品名を送ってください" value={value} />
            {mode === "thinking" ? <span aria-label="検索中" className="agent-first-thinking"><span /><span /><span /></span> : null}
            <button aria-label="AIに送信" className="agent-first-send" disabled={mode === "thinking"} onClick={() => { sendPrompt(); }} type="button">
              <Send aria-hidden size={18} />
            </button>
            {menuOpen ? <PlusMenu onClose={() => { setMenuOpen(false); }} onSelect={(selectedValue) => { setValue(selectedValue); setMenuOpen(false); }} /> : null}
          </div>
          <div className="agent-first-composer-note"><Check aria-hidden size={14} /> 相談は無料。購入前に送料と到着目安を確認できます。</div>
        </div>

        <div className="agent-first-intents" aria-label="おすすめの相談例">
          <button onClick={() => { sendPrompt("ブラジルで人気の日本のギフト"); }} type="button">🎁 日本のギフトを探す <ArrowRight aria-hidden size={14} /></button>
          <button onClick={() => { sendPrompt("予算R$300以内のスニーカー"); }} type="button">👟 予算内で探す <ArrowRight aria-hidden size={14} /></button>
          <button onClick={() => { sendPrompt("写真と似た商品"); }} type="button">📷 写真から探す <ArrowRight aria-hidden size={14} /></button>
        </div>
      </section>

      <section className={`agent-first-results ${mode === "results" ? "is-visible" : ""}`} aria-live="polite">
        <div className="agent-first-results-heading">
          <div><span className="agent-first-overline">AI SHORTLIST</span><h2>{mode === "thinking" ? "候補を探しています…" : mode === "results" ? "あなたに合いそうな候補" : "まずは相談してみてください"}</h2></div>
          {mode === "results" ? <button className="agent-first-link" type="button">すべて見る <ArrowRight aria-hidden size={15} /></button> : null}
        </div>
        {mode === "idle" ? (
          <div className="agent-first-empty"><Sparkles aria-hidden size={20} /><span>相談内容に合わせて、商品・価格・配送条件をまとめて提案します。</span></div>
        ) : null}
        {mode === "thinking" ? <div className="agent-first-loading"><span /><span /><span /> 日本のショップを確認中</div> : null}
        {mode === "results" ? (
          <>
            <div className="agent-first-query"><span>相談内容</span><strong>{value || "日本の商品を探す"}</strong><button aria-label="相談内容を編集" onClick={() => { setMode("idle"); }} type="button"><ChevronDown aria-hidden size={16} /></button></div>
            <div className="agent-first-product-grid">
              {products.map((product) => (
                <article className="agent-first-product-card" key={product.name}>
                  <img alt="" src={product.image} />
                  <div className="agent-first-product-body"><span>{product.source}</span><h3>{product.name}</h3><strong>{product.price}</strong><small><Truck aria-hidden size={13} /> {product.delivery}</small></div>
                </article>
              ))}
            </div>
            <div className="agent-first-approval"><div><Check aria-hidden size={16} /><span>購入前に内容を確認できます</span></div><button type="button">候補を比較する <ArrowRight aria-hidden size={15} /></button></div>
          </>
        ) : null}
      </section>

      <section className="agent-first-trust" aria-label="J-Planet AIの特徴">
        <div><span>01</span><h3>日本のショップをまとめて探す</h3><p>複数サイトを行き来せず、候補を一度に比較。</p></div>
        <div><span>02</span><h3>費用と配送目安がわかる</h3><p>購入前にブラジルまでの条件を確認。</p></div>
        <div><span>03</span><h3>最後はあなたが決める</h3><p>AIが勝手に購入せず、確認してから進みます。</p></div>
      </section>

      <footer className="agent-first-footer"><JplanetLogo /><span>J-Planet AI · 日本からブラジルへ</span></footer>
    </main>
  );
}
