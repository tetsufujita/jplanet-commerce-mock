import { useMemo, useState, type Dispatch } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Plane,
  Ticket,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import { getProductDetail } from "@/sazo-commerce/fixtures";
import type { CartItem, SazoAction } from "@/sazo-commerce/model";

interface CheckoutViewProps {
  dispatch: Dispatch<SazoAction>;
  items: readonly CartItem[];
}

type CheckoutSheet = "address" | "coupon" | "delivery" | "payment" | "tax" | "breakdown" | null;

interface CheckoutLine {
  item: CartItem;
  image: string;
  name: string;
  price: number;
  sourceId: "rakuten" | "sony" | "jplanet";
  sourceName: string;
}

const checkoutPresentation = {
  "jplanet-nintendo-switch-oled": {
    price: 2184,
    sourceId: "rakuten",
    sourceName: "Rakuten Japan 公式ストア",
  },
  "jplanet-new-balance-9060": {
    price: 748,
    sourceId: "rakuten",
    sourceName: "Rakuten Japan 公式ストア",
  },
  "jplanet-sony-a7c-ii": {
    price: 2680,
    sourceId: "sony",
    sourceName: "Sony Japan 公式",
  },
  "jplanet-nintendo-pro-controller": {
    price: 429,
    sourceId: "jplanet",
    sourceName: "Nintendo 公式",
  },
} as const;

const addresses = [
  { id: "paulista", name: "Tetsu Fujita", detail: "Av. Paulista 1000 · Bela Vista · São Paulo, SP" },
  { id: "pinheiros", name: "Tetsu Fujita", detail: "Rua dos Pinheiros 540 · Pinheiros · São Paulo, SP" },
] as const;

const deliveryOptions = [
  { id: "standard", label: "通常便", detail: "日本で確認後、8〜12日で到着予定", fee: 0 },
  { id: "express", label: "優先便", detail: "日本で確認後、6〜9日で到着予定", fee: 85 },
] as const;

const paymentOptions = [
  { id: "pix", label: "Pix", detail: "即時決済" },
  { id: "card", label: "クレジットカード", detail: "Visa •••• 2048" },
] as const;

function formatBrl(amount: number): string {
  return `R$ ${new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(amount)))}`;
}

function getCheckoutLine(item: CartItem): CheckoutLine {
  const detail = getProductDetail(item.productId);
  const presentation = checkoutPresentation[item.productId as keyof typeof checkoutPresentation];
  return {
    item,
    image: detail.product.image,
    name: detail.product.name,
    price: presentation?.price ?? Math.max(99, Math.round(detail.unitPriceAmount / 30)),
    sourceId: presentation?.sourceId ?? "jplanet",
    sourceName: presentation?.sourceName ?? "J-Planet セレクション",
  };
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="sazo-jplanet-checkout-section-title">{children}</h2>;
}

export function CheckoutView({ dispatch, items }: CheckoutViewProps) {
  const [sheet, setSheet] = useState<CheckoutSheet>(null);
  const [addressId, setAddressId] = useState<(typeof addresses)[number]["id"]>("paulista");
  const [deliveryId, setDeliveryId] = useState<(typeof deliveryOptions)[number]["id"]>("standard");
  const [paymentId, setPaymentId] = useState<(typeof paymentOptions)[number]["id"]>("pix");
  const [couponApplied, setCouponApplied] = useState(true);
  const [pointApplied, setPointApplied] = useState(false);
  const [purchaseNote, setPurchaseNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const lines = useMemo(() => (items.length > 0 ? items : []).map(getCheckoutLine), [items]);
  const groups = useMemo(() => {
    const entries = new Map<string, { name: string; lines: CheckoutLine[] }>();
    lines.forEach((line) => {
      const previous = entries.get(line.sourceId);
      if (previous !== undefined) {
        previous.lines.push(line);
        return;
      }
      entries.set(line.sourceId, { name: line.sourceName, lines: [line] });
    });
    return [...entries.values()];
  }, [lines]);

  const selectedAddress = addresses.find((address) => address.id === addressId) ?? addresses[0];
  const delivery = deliveryOptions.find((option) => option.id === deliveryId) ?? deliveryOptions[0];
  const payment = paymentOptions.find((option) => option.id === paymentId) ?? paymentOptions[0];
  const merchandiseTotal = lines.reduce((total, line) => total + line.price * line.item.quantity, 0);
  const importTax = Math.round(merchandiseTotal * 0.14);
  const stateTax = Math.round(merchandiseTotal * 0.04);
  const couponDiscount = couponApplied ? 20 : 0;
  const pointDiscount = pointApplied ? 50 : 0;
  const total = merchandiseTotal + importTax + stateTax + delivery.fee - couponDiscount - pointDiscount;

  const closeSheet = () => setSheet(null);
  const selectAddress = (id: (typeof addresses)[number]["id"]) => {
    setAddressId(id);
    closeSheet();
  };
  const selectDelivery = (id: (typeof deliveryOptions)[number]["id"]) => {
    setDeliveryId(id);
    closeSheet();
  };
  const selectPayment = (id: (typeof paymentOptions)[number]["id"]) => {
    setPaymentId(id);
    closeSheet();
  };

  return (
    <section className="sazo-jplanet-checkout" data-testid="jplanet-checkout" data-view-content="checkout">
      <header className="sazo-jplanet-checkout-header">
        <button aria-label="カートに戻る" onClick={() => dispatch({ type: "navigate", view: "cart" })} type="button">
          <ArrowLeft aria-hidden size={24} />
        </button>
        <h1>購入手続き</h1>
        <button aria-label="チャット" onClick={() => dispatch({ type: "open-chat" })} type="button">
          <MessageSquareText aria-hidden size={23} />
        </button>
      </header>

      {submitted ? (
        <main className="sazo-jplanet-checkout-success">
          <PackageCheck aria-hidden size={38} />
          <h2>注文を受け付けました</h2>
          <p>注文内容と配送に必要な手続きは、注文・配送から確認できます。</p>
          <strong>{formatBrl(total)}</strong>
          <button onClick={() => dispatch({ type: "navigate", view: "orders" })} type="button">
            注文・配送を見る <ChevronRight aria-hidden size={18} />
          </button>
        </main>
      ) : (
        <main className="sazo-jplanet-checkout-main">
          <section className="sazo-jplanet-checkout-address" aria-label="配送先">
            <button onClick={() => setSheet("address")} type="button">
              <MapPin aria-hidden size={22} />
              <span>
                <small>配送先</small>
                <strong>{selectedAddress.name}</strong>
                <em>{selectedAddress.detail}</em>
              </span>
              <ChevronRight aria-hidden size={19} />
            </button>
          </section>

          {groups.map((group, groupIndex) => (
            <section className="sazo-jplanet-checkout-source" key={group.name}>
              <header>
                <span aria-hidden className="sazo-jplanet-checkout-store-icon"><PackageCheck size={17} /></span>
                <strong>{group.name}</strong>
              </header>
              {group.lines.map((line) => (
                <article className="sazo-jplanet-checkout-line" key={`${line.item.productId}:${line.item.option}`}>
                  <img alt={line.name} src={line.image} />
                  <div>
                    <strong>{line.name}</strong>
                    <span>{line.item.option}</span>
                    <small>関税込み · {delivery.id === "express" ? "6〜9日" : "8〜12日"}で到着予定</small>
                  </div>
                  <aside>
                    <b>{formatBrl(line.price * line.item.quantity)}</b>
                    <small>×{line.item.quantity}</small>
                  </aside>
                </article>
              ))}
              <button className="sazo-jplanet-checkout-row" onClick={() => setSheet("coupon")} type="button">
                <Ticket aria-hidden size={19} />
                <span>クーポン</span>
                <b>{groupIndex === 0 && couponApplied ? "R$ 20 OFF" : "選択する"}</b>
                <ChevronRight aria-hidden size={18} />
              </button>
              <label className="sazo-jplanet-checkout-note">
                <MessageSquareText aria-hidden size={19} />
                <span>購入メモ</span>
                <input aria-label="購入メモ" maxLength={80} onChange={(event) => setPurchaseNote(event.target.value)} placeholder="販売元へのメモを入力" value={purchaseNote} />
              </label>
            </section>
          ))}

          <section className="sazo-jplanet-checkout-section">
            <SectionTitle>配送方法</SectionTitle>
            <button className="sazo-jplanet-checkout-choice-row" onClick={() => setSheet("delivery")} type="button">
              <Plane aria-hidden size={20} />
              <span><strong>国際配送 · {delivery.label}</strong><small>{delivery.detail}</small></span>
              <b>{delivery.fee === 0 ? "追加料金なし" : formatBrl(delivery.fee)}</b>
              <ChevronRight aria-hidden size={18} />
            </button>
          </section>

          <section className="sazo-jplanet-checkout-section">
            <SectionTitle>クーポン・ポイント</SectionTitle>
            <button className="sazo-jplanet-checkout-choice-row" onClick={() => setSheet("coupon")} type="button">
              <Ticket aria-hidden size={20} />
              <span><strong>使えるクーポン</strong><small>{couponApplied ? "R$ 20 OFFを適用中" : "利用できるクーポンを確認"}</small></span>
              <ChevronRight aria-hidden size={18} />
            </button>
            <button className="sazo-jplanet-checkout-choice-row" onClick={() => setPointApplied((current) => !current)} type="button">
              <span aria-hidden className="sazo-jplanet-checkout-point">P</span>
              <span><strong>ポイントを使う</strong><small>{pointApplied ? "50ポイントを使用中" : "500ポイント利用可能"}</small></span>
              <b className={pointApplied ? "is-sakura" : ""}>{pointApplied ? "−R$ 50" : ""}</b>
              <ChevronRight aria-hidden size={18} />
            </button>
          </section>

          <section className="sazo-jplanet-checkout-section">
            <SectionTitle>支払い方法</SectionTitle>
            <button className="sazo-jplanet-checkout-choice-row" onClick={() => setSheet("payment")} type="button">
              <WalletCards aria-hidden size={20} />
              <span><strong>{payment.label}</strong><small>{payment.detail}</small></span>
              <ChevronRight aria-hidden size={18} />
            </button>
          </section>

          <section className="sazo-jplanet-checkout-breakdown">
            <header>
              <h2>支払い内訳</h2>
              <button aria-label="税金の説明を表示" onClick={() => setSheet("tax")} type="button"><CircleHelp aria-hidden size={20} /></button>
            </header>
            <dl>
              <div><dt>商品合計</dt><dd>{formatBrl(merchandiseTotal)}</dd></div>
              <div><dt>輸入関連税</dt><dd>{formatBrl(importTax)}</dd></div>
              <div><dt>州税</dt><dd>{formatBrl(stateTax)}</dd></div>
              <div><dt>国際配送</dt><dd>{delivery.fee === 0 ? "追加料金なし" : formatBrl(delivery.fee)}</dd></div>
              {couponApplied ? <div className="is-discount"><dt>クーポン割引</dt><dd>−{formatBrl(couponDiscount)}</dd></div> : null}
              {pointApplied ? <div className="is-discount"><dt>ポイント利用</dt><dd>−{formatBrl(pointDiscount)}</dd></div> : null}
            </dl>
            <button className="sazo-jplanet-checkout-total-row" onClick={() => setSheet("breakdown")} type="button">
              <span>到着までの総額</span><strong>{formatBrl(total)}</strong><ChevronRight aria-hidden size={18} />
            </button>
          </section>
          <p className="sazo-jplanet-checkout-disclaimer">金額と到着予定は、配送先・選択した配送方法・輸入条件により更新される場合があります。</p>
        </main>
      )}

      {submitted ? null : (
        <footer className="sazo-jplanet-checkout-footer">
          <div><span>合計</span><strong>{formatBrl(total)}</strong><small>税金・国際配送を含む</small></div>
          <button onClick={() => setSubmitted(true)} type="button">注文を確定する</button>
        </footer>
      )}

      {sheet === null ? null : (
        <div className="sazo-jplanet-checkout-sheet-layer" role="presentation">
          <button aria-label="シートを閉じる" onClick={closeSheet} type="button" />
          {sheet === "tax" ? (
            <section aria-label="税金の説明" className="sazo-jplanet-checkout-tax-dialog" role="dialog">
              <header><h2>輸入関連税について</h2><button aria-label="閉じる" onClick={closeSheet} type="button"><X aria-hidden size={22} /></button></header>
              <p>輸入関連税と州税は、商品価格・配送先・輸入条件をもとに表示しています。実際の金額は注文時の条件によって変わる場合があります。</p>
              <button onClick={closeSheet} type="button">確認しました</button>
            </section>
          ) : sheet === "breakdown" ? (
            <section aria-label="支払い内訳" className="sazo-jplanet-checkout-sheet" role="dialog">
              <header><h2>支払い内訳</h2><button aria-label="閉じる" onClick={closeSheet} type="button"><X aria-hidden size={22} /></button></header>
              <p>商品、税金、国際配送、割引を含む到着までの総額です。</p>
              <strong>{formatBrl(total)}</strong>
            </section>
          ) : (
            <section aria-label={sheet === "address" ? "配送先を選択" : sheet === "coupon" ? "クーポンを選択" : sheet === "delivery" ? "配送方法を選択" : "支払い方法を選択"} className="sazo-jplanet-checkout-sheet" role="dialog">
              <header>
                <h2>{sheet === "address" ? "配送先を選択" : sheet === "coupon" ? "クーポンを選択" : sheet === "delivery" ? "配送方法を選択" : "支払い方法を選択"}</h2>
                <button aria-label="閉じる" onClick={closeSheet} type="button"><X aria-hidden size={22} /></button>
              </header>
              {sheet === "address" ? addresses.map((address) => <button aria-pressed={address.id === addressId} key={address.id} onClick={() => selectAddress(address.id)} type="button"><span><strong>{address.name}</strong><small>{address.detail}</small></span>{address.id === addressId ? <Check aria-hidden size={19} /> : null}</button>) : null}
              {sheet === "coupon" ? <><button aria-pressed={couponApplied} onClick={() => { setCouponApplied(true); closeSheet(); }} type="button"><span><strong>R$ 20 OFF</strong><small>商品合計から割引</small></span>{couponApplied ? <Check aria-hidden size={19} /> : null}</button><button aria-pressed={!couponApplied} onClick={() => { setCouponApplied(false); closeSheet(); }} type="button"><span><strong>クーポンを使わない</strong><small>次回の購入で利用できます</small></span>{!couponApplied ? <Check aria-hidden size={19} /> : null}</button></> : null}
              {sheet === "delivery" ? deliveryOptions.map((option) => <button aria-pressed={option.id === deliveryId} key={option.id} onClick={() => selectDelivery(option.id)} type="button"><span><strong>{option.label}</strong><small>{option.detail}</small></span><em>{option.fee === 0 ? "追加料金なし" : formatBrl(option.fee)}</em>{option.id === deliveryId ? <Check aria-hidden size={19} /> : null}</button>) : null}
              {sheet === "payment" ? paymentOptions.map((option) => <button aria-pressed={option.id === paymentId} key={option.id} onClick={() => selectPayment(option.id)} type="button"><span><strong>{option.label}</strong><small>{option.detail}</small></span>{option.id === paymentId ? <Check aria-hidden size={19} /> : null}</button>) : null}
            </section>
          )}
        </div>
      )}
    </section>
  );
}
