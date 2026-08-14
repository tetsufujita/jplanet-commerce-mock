import { useEffect, useMemo, useState, type Dispatch } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  Store,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { getProductDetail, parseYenPrice } from "@/sazo-commerce/fixtures";
import { getJplanetCoupon } from "@/sazo-commerce/couponFixtures";
import { JplanetRecommendationGrid } from "@/sazo-commerce/HomeView";
import type { CartItem, SazoAction } from "@/sazo-commerce/model";

interface CartViewProps {
  dispatch: Dispatch<SazoAction>;
  items: readonly CartItem[];
  selectedCouponId?: string | null;
}

interface CartPresentation {
  defaultOption: string;
  evidence: string;
  priceBrl: number;
  sourceId: string;
  sourceName: string;
  variants: readonly string[];
}

const cartPresentationByProductId: Readonly<Record<string, CartPresentation>> = {
  "jplanet-nintendo-switch-oled": {
    defaultOption: "カラー: ホワイト",
    evidence: "関税込み · 8〜12日で到着予定",
    priceBrl: 2184,
    sourceId: "rakuten-official",
    sourceName: "Rakuten Japan 公式ストア",
    variants: ["カラー: ホワイト", "カラー: ネオンブルー・ネオンレッド"],
  },
  "jplanet-new-balance-9060": {
    defaultOption: "サイズ: 27cm",
    evidence: "販売元・輸入条件を確認済み",
    priceBrl: 748,
    sourceId: "rakuten-official",
    sourceName: "Rakuten Japan 公式ストア",
    variants: ["サイズ: 26cm", "サイズ: 27cm", "サイズ: 28cm"],
  },
  "jplanet-sony-a7c-ii": {
    defaultOption: "バリエーション: 本体のみ",
    evidence: "関税込み · 8〜12日で到着予定",
    priceBrl: 2680,
    sourceId: "sony-official",
    sourceName: "Sony Japan 公式",
    variants: ["バリエーション: 本体のみ", "バリエーション: レンズキット"],
  },
  "jplanet-nintendo-pro-controller": {
    defaultOption: "カラー: ブラック",
    evidence: "販売元・輸入条件を確認済み",
    priceBrl: 429,
    sourceId: "nintendo-official",
    sourceName: "Nintendo 公式",
    variants: ["カラー: ブラック", "カラー: ホワイト", "カラー: スプラトゥーン"],
  },
};

const couponBySourceId: Readonly<
  Record<string, { discount: number; label: string }>
> = {
  "nintendo-official": { discount: 10, label: "R$ 10 OFF" },
  "rakuten-official": { discount: 20, label: "R$ 20 OFF" },
  "sony-official": { discount: 30, label: "国際送料 R$ 30 OFF" },
};

function itemKey(item: CartItem): string {
  return `${item.productId}:${item.option}`;
}

function formatBrl(amount: number): string {
  return `R$ ${new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(amount)))}`;
}

function fallbackPresentation(item: CartItem): CartPresentation {
  return {
    defaultOption: item.option,
    evidence: "販売元・輸入条件を確認済み",
    priceBrl: Math.max(99, Math.round(parseYenPrice(getProductDetail(item.productId).product.price) / 30)),
    sourceId: "jplanet-selection",
    sourceName: "J-Planet セレクション",
    variants: [item.option],
  };
}

export function CartView({ dispatch, items, selectedCouponId = null }: CartViewProps) {
  const [selectedKeys, setSelectedKeys] = useState<readonly string[]>(() => items.map(itemKey));
  const [quantityOverrides, setQuantityOverrides] = useState<Readonly<Record<string, number>>>({});
  const [optionOverrides, setOptionOverrides] = useState<Readonly<Record<string, string>>>({});
  const [removedKeys, setRemovedKeys] = useState<readonly string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [couponSourceId, setCouponSourceId] = useState<string | null>(null);
  const [appliedCoupons, setAppliedCoupons] = useState<Readonly<Record<string, boolean>>>({});
  const activeItems = useMemo(
    () => items.filter((item) => !removedKeys.includes(itemKey(item))),
    [items, removedKeys],
  );
  const cartLines = useMemo(
    () =>
      activeItems.map((item) => {
        const key = itemKey(item);
        const presentation = cartPresentationByProductId[item.productId] ?? fallbackPresentation(item);
        return {
          item,
          key,
          option: optionOverrides[key] ?? item.option ?? presentation.defaultOption,
          presentation,
          product: getProductDetail(item.productId).product,
          quantity: quantityOverrides[key] ?? item.quantity,
        };
      }),
    [activeItems, optionOverrides, quantityOverrides],
  );
  const cartLineKeys = cartLines.map(({ key }) => key);

  useEffect(() => {
    setSelectedKeys((current) => [
      ...current.filter((key) => cartLineKeys.includes(key)),
      ...cartLineKeys.filter((key) => !current.includes(key)),
    ]);
  }, [cartLineKeys.join("|")]);

  const groups = useMemo(() => {
    const entries = new Map<
      string,
      { lines: (typeof cartLines)[number][]; presentation: CartPresentation }
    >();

    cartLines.forEach((line) => {
      const existing = entries.get(line.presentation.sourceId);
      if (existing !== undefined) {
        existing.lines.push(line);
        return;
      }
      entries.set(line.presentation.sourceId, {
        lines: [line],
        presentation: line.presentation,
      });
    });

    return [...entries.values()];
  }, [cartLines]);

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const selectedCount = cartLines.filter(({ key }) => selectedSet.has(key)).length;
  const selectedSubtotal = cartLines.reduce(
    (total, line) =>
      selectedSet.has(line.key) ? total + line.presentation.priceBrl * line.quantity : total,
    0,
  );
  const selectedDiscount = groups.reduce((total, group) => {
    if (!appliedCoupons[group.presentation.sourceId]) return total;
    if (!group.lines.some(({ key }) => selectedSet.has(key))) return total;
    return total + (couponBySourceId[group.presentation.sourceId]?.discount ?? 0);
  }, 0);
  const selectedTotal = Math.max(0, selectedSubtotal - selectedDiscount);
  const allSelected = cartLines.length > 0 && selectedCount === cartLines.length;
  const activeCoupon = couponSourceId === null ? null : couponBySourceId[couponSourceId] ?? null;

  const setGroupSelected = (groupKeys: readonly string[], next: boolean) => {
    setSelectedKeys((current) =>
      next
        ? [...new Set([...current, ...groupKeys])]
        : current.filter((key) => !groupKeys.includes(key)),
    );
  };

  const updateQuantity = (line: (typeof cartLines)[number], next: number) => {
    const quantity = Math.max(1, next);
    setQuantityOverrides((current) => ({ ...current, [line.key]: quantity }));
    dispatch({
      type: "set-cart-item-quantity",
      productId: line.item.productId,
      option: line.item.option,
      quantity,
    });
  };

  const removeLine = (line: (typeof cartLines)[number]) => {
    setRemovedKeys((current) => [...current, line.key]);
    setSelectedKeys((current) => current.filter((key) => key !== line.key));
    dispatch({
      type: "set-cart-item-quantity",
      productId: line.item.productId,
      option: line.item.option,
      quantity: 0,
    });
  };

  const chooseVariant = (line: (typeof cartLines)[number], option: string) => {
    setOptionOverrides((current) => ({ ...current, [line.key]: option }));
    dispatch({
      type: "set-cart-item-option",
      productId: line.item.productId,
      previousOption: line.item.option,
      option,
    });
    setCouponSourceId(null);
  };

  const applyCoupon = () => {
    if (couponSourceId === null) return;
    setAppliedCoupons((current) => ({ ...current, [couponSourceId]: true }));
    setCouponSourceId(null);
  };

  const removeCoupon = (sourceId: string) => {
    setAppliedCoupons((current) => ({ ...current, [sourceId]: false }));
  };

  return (
    <section className="sazo-jplanet-cart" data-testid="jplanet-cart" data-view-content="cart">
      <header className="sazo-jplanet-cart-header">
        <button
          aria-label="戻る"
          onClick={() => dispatch({ type: "navigate", view: "home" })}
          type="button"
        >
          <ArrowLeft aria-hidden size={24} />
        </button>
        <h1>カート ({cartLines.length})</h1>
        <button
          aria-pressed={isEditing}
          className="sazo-jplanet-cart-edit"
          onClick={() => setIsEditing((current) => !current)}
          type="button"
        >
          {isEditing ? "完了" : "編集"}
        </button>
        <button aria-label="チャット" onClick={() => dispatch({ type: "open-chat" })} type="button">
          <MessageCircle aria-hidden size={24} />
        </button>
      </header>

      {selectedCouponId === null ? null : (
        <p className="sazo-jplanet-cart-selected-coupon" role="status">
          <Ticket aria-hidden size={17} /> {getJplanetCoupon(selectedCouponId).name}を選択中
        </p>
      )}

      <main className="sazo-jplanet-cart-main">
        {groups.length === 0 ? (
          <section className="sazo-jplanet-cart-empty" data-testid="jplanet-cart-empty">
            <Store aria-hidden size={30} />
            <h2>カートに商品がありません</h2>
            <button onClick={() => dispatch({ type: "navigate", view: "agent-hub" })} type="button">
              エージェントで商品を探す <ChevronRight aria-hidden size={18} />
            </button>
          </section>
        ) : (
          <div className="sazo-jplanet-cart-groups">
            {groups.map((group) => {
              const groupKeys = group.lines.map(({ key }) => key);
              const groupSelected = groupKeys.every((key) => selectedSet.has(key));
              const coupon = couponBySourceId[group.presentation.sourceId];
              const couponApplied = appliedCoupons[group.presentation.sourceId] === true;

              return (
                <section
                  aria-label={`${group.presentation.sourceName}の商品`}
                  className="sazo-jplanet-cart-group"
                  key={group.presentation.sourceId}
                >
                  <header>
                    <label>
                      <input
                        aria-label={`${group.presentation.sourceName}をすべて選択`}
                        checked={groupSelected}
                        onChange={() => setGroupSelected(groupKeys, !groupSelected)}
                        type="checkbox"
                      />
                    </label>
                    <Store aria-hidden size={18} />
                    <strong>{group.presentation.sourceName}</strong>
                    <button
                      aria-label={`${group.presentation.sourceName}を編集`}
                      onClick={() => setIsEditing(true)}
                      type="button"
                    >
                      編集
                    </button>
                  </header>

                  <div className="sazo-jplanet-cart-items">
                    {group.lines.map((line) => {
                      const selected = selectedSet.has(line.key);

                      return (
                        <article className="sazo-jplanet-cart-item" data-testid="jplanet-cart-item" key={line.key}>
                          <label>
                            <input
                              aria-label={`${line.product.name}を選択`}
                              checked={selected}
                              onChange={() => setGroupSelected([line.key], !selected)}
                              type="checkbox"
                            />
                          </label>
                          <img alt={line.product.name} src={line.product.image} />
                          <div className="sazo-jplanet-cart-item-copy">
                            <h2>{line.product.name}</h2>
                            <button
                              aria-label={`${line.product.name}のバリアントを選択`}
                              className="sazo-jplanet-cart-option"
                              onClick={() => setCouponSourceId(`variant:${line.key}`)}
                              type="button"
                            >
                              {line.option} <ChevronDown aria-hidden size={15} />
                            </button>
                            <div className="sazo-jplanet-cart-item-price-row">
                              <strong>{formatBrl(line.presentation.priceBrl * line.quantity)}</strong>
                              <div aria-label={`${line.product.name}の数量`} className="sazo-jplanet-cart-quantity">
                                <button
                                  aria-label={`${line.product.name}を減らす`}
                                  disabled={line.quantity === 1}
                                  onClick={() => updateQuantity(line, line.quantity - 1)}
                                  type="button"
                                >
                                  <Minus aria-hidden size={15} />
                                </button>
                                <span>{line.quantity}</span>
                                <button
                                  aria-label={`${line.product.name}を増やす`}
                                  onClick={() => updateQuantity(line, line.quantity + 1)}
                                  type="button"
                                >
                                  <Plus aria-hidden size={15} />
                                </button>
                              </div>
                            </div>
                            <p>
                              <Check aria-hidden size={13} /> {line.presentation.evidence}
                            </p>
                          </div>
                          {isEditing ? (
                            <button
                              aria-label={`${line.product.name}を削除`}
                              className="sazo-jplanet-cart-remove"
                              onClick={() => removeLine(line)}
                              type="button"
                            >
                              <Trash2 aria-hidden size={17} />
                            </button>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>

                  {coupon === undefined ? null : (
                    <button
                      aria-label={`${group.presentation.sourceName}のクーポンを選択`}
                      className="sazo-jplanet-cart-coupon-row"
                      onClick={() => setCouponSourceId(group.presentation.sourceId)}
                      type="button"
                    >
                      <Ticket aria-hidden size={19} />
                      <span>{couponApplied ? "使えるクーポン" : "クーポンコードを追加"}</span>
                      {couponApplied ? <b>{coupon.label}</b> : null}
                      <ChevronRight aria-hidden size={18} />
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <JplanetRecommendationGrid
          dispatch={dispatch}
          heading="あなたへのおすすめ"
          sectionClassName="sazo-jplanet-cart-recommendations"
          testId="jplanet-cart-recommendations"
        />
      </main>

      {groups.length > 0 ? (
        <footer className="sazo-jplanet-cart-summary">
          <label>
            <input
              aria-label="すべての商品を選択"
              checked={allSelected}
              onChange={() => setSelectedKeys(allSelected ? [] : cartLineKeys)}
              type="checkbox"
            />
            <span>すべて</span>
          </label>
          <div>
            <span>{selectedDiscount > 0 ? `${formatBrl(selectedDiscount)} 割引適用` : "関税込み・国際送料を含む"}</span>
            <strong>{formatBrl(selectedTotal)}</strong>
          </div>
          <button
            disabled={selectedCount === 0}
            onClick={() =>
              dispatch({
                type: "begin-checkout",
                items: cartLines
                  .filter(({ key }) => selectedSet.has(key))
                  .map((line) => ({
                    option: line.option,
                    productId: line.item.productId,
                    quantity: line.quantity,
                  })),
              })
            }
            type="button"
          >
            購入手続きへ{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
        </footer>
      ) : null}

      {couponSourceId?.startsWith("variant:") ? (() => {
        const line = cartLines.find(({ key }) => `variant:${key}` === couponSourceId);
        if (line === undefined) return null;
        return (
          <div className="sazo-jplanet-cart-sheet-layer" role="presentation">
            <button aria-label="バリアント選択を閉じる" onClick={() => setCouponSourceId(null)} type="button" />
            <section aria-label="バリアントを選択" className="sazo-jplanet-cart-sheet" role="dialog">
              <header>
                <h2>バリアントを選択</h2>
                <button aria-label="閉じる" onClick={() => setCouponSourceId(null)} type="button">
                  <X aria-hidden size={21} />
                </button>
              </header>
              <p>{line.product.name}</p>
              <div>
                {line.presentation.variants.map((option) => (
                  <button
                    aria-pressed={line.option === option}
                    key={option}
                    onClick={() => chooseVariant(line, option)}
                    type="button"
                  >
                    {option}
                    {line.option === option ? <Check aria-hidden size={17} /> : null}
                  </button>
                ))}
              </div>
            </section>
          </div>
        );
      })() : null}

      {activeCoupon !== null && couponSourceId !== null ? (
        <div className="sazo-jplanet-cart-sheet-layer" role="presentation">
          <button aria-label="クーポン選択を閉じる" onClick={() => setCouponSourceId(null)} type="button" />
          <section aria-label="クーポンを選択" className="sazo-jplanet-cart-sheet" role="dialog">
            <header>
              <h2>クーポンを選択</h2>
              <button aria-label="閉じる" onClick={() => setCouponSourceId(null)} type="button">
                <X aria-hidden size={21} />
              </button>
            </header>
            <button
              aria-pressed={appliedCoupons[couponSourceId] === true}
              className="sazo-jplanet-cart-sheet-coupon"
              onClick={applyCoupon}
              type="button"
            >
              <Ticket aria-hidden size={22} />
              <span>
                <b>{activeCoupon.label}</b>
                <small>選択した商品のBRL合計から割引</small>
              </span>
              {appliedCoupons[couponSourceId] ? <Check aria-hidden size={19} /> : null}
            </button>
            {appliedCoupons[couponSourceId] ? (
              <button
                className="sazo-jplanet-cart-sheet-clear"
                onClick={() => {
                  removeCoupon(couponSourceId);
                  setCouponSourceId(null);
                }}
                type="button"
              >
                クーポンを解除する
              </button>
            ) : null}
            <button className="sazo-jplanet-cart-sheet-apply" onClick={applyCoupon} type="button">
              適用する
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}
