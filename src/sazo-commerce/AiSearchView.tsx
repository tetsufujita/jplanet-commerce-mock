import {
  ArrowLeft,
  Bookmark,
  Camera,
  ChevronRight,
  CircleHelp,
  Languages,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
} from "react";
import {
  aiSearchInitialRecentItems,
  aiSearchPopularItems,
  genericSearchGroups,
  genericSearchKeywords,
  newBalanceSearchGroups,
  newBalanceSearchKeywords,
  newBalanceSearchTabs,
  tonerSearchGroups,
  tonerSearchKeywords,
  type AiSearchResultGroupId,
  type AiSearchRecentItem,
} from "@/sazo-commerce/aiSearchFixtures";
import { imageSearchResolvedNewBalanceProductId } from "@/sazo-commerce/imageProductResolutionFixtures";
import {
  JPLANET_PRODUCT_DETAIL_ID,
  type SazoAction,
  type SazoState,
} from "@/sazo-commerce/model";

interface AiSearchViewProps {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value.trim());
const isNewBalance9060Query = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase() === "new balance 9060";
const normalizeSearchQuery = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
const isTonerQuery = (value: string) => {
  const normalized = normalizeSearchQuery(value);

  return (
    normalized.includes("化粧水") ||
    normalized.includes("locao") ||
    normalized.includes("lotion") ||
    normalized.includes("tonico") ||
    normalized.includes("toner")
  );
};
const isJapaneseTonerQuery = (value: string) => value.includes("化粧水");
type AiSearchResultKind = "generic" | "new-balance-9060" | "toner";
const getAiSearchResultKind = (value: string): AiSearchResultKind | null => {
  if (value.trim().length === 0) return null;
  if (isNewBalance9060Query(value)) return "new-balance-9060";
  if (isTonerQuery(value)) return "toner";
  return "generic";
};

const readInitialQuery = () => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("query")?.trim() ?? "";
};

const aiSearchAgentCheckItems = [
  "販売元",
  "購入可否",
  "関税・配送",
  "BRL総額",
] as const;

export function AiSearchView({ dispatch, state }: AiSearchViewProps) {
  const initialQuery = readInitialQuery();
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(
    getAiSearchResultKind(initialQuery) === null ? "" : initialQuery,
  );
  const [activeGroup, setActiveGroup] = useState<AiSearchResultGroupId>("all");
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<readonly string[]>([]);
  const [recentItems, setRecentItems] = useState<readonly AiSearchRecentItem[]>(
    aiSearchInitialRecentItems,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const shouldAutoFocus = state.view === "agent-hub" && submittedQuery.length === 0;

  useEffect(() => {
    if (
      state.view !== "agent-hub" ||
      (state.agentEntryIntent !== "camera" && state.agentEntryIntent !== "image-picker")
    ) {
      return;
    }

    imageInputRef.current?.click();
    dispatch({ type: "consume-agent-entry-intent" });
  }, [dispatch, state.agentEntryIntent, state.view]);

  const searchText = (value: string) => {
    const normalized = value.trim();

    if (normalized.length === 0) return;

    if (isHttpUrl(normalized)) {
      // Preserve the established URL -> identified product detail hand-off.
      dispatch({ type: "open-product", productId: JPLANET_PRODUCT_DETAIL_ID });
      return;
    }

    setQuery(normalized);
    setSubmittedQuery(normalized);
    setActiveGroup("all");
    setActiveKeyword(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isComposingRef.current) return;
    searchText(query);
  };

  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file === undefined || !file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    dispatch({
      type: "start-agent-search",
      request: {
        candidateResolution: true,
        imageName: file.name,
        imageResolution: true,
        summary: file.name,
      },
    });
    event.target.value = "";
  };

  const resultKind = getAiSearchResultKind(submittedQuery);
  const showResults = resultKind !== null;
  const resultGroups =
    resultKind === "toner"
      ? tonerSearchGroups
      : resultKind === "new-balance-9060"
        ? newBalanceSearchGroups
        : genericSearchGroups;
  const resultKeywords =
    resultKind === "toner"
      ? tonerSearchKeywords
      : resultKind === "new-balance-9060"
        ? newBalanceSearchKeywords
        : genericSearchKeywords;
  const visibleGroups =
    activeGroup === "all"
      ? resultGroups
      : resultGroups.filter((group) => group.id === activeGroup);
  const resultCount =
    activeGroup === "all"
      ? resultGroups.reduce((total, group) => total + group.count, 0)
      : (resultGroups.find((group) => group.id === activeGroup)?.count ?? 0);

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setActiveGroup("all");
    setActiveKeyword(null);
  };

  const openSearchResultProduct = () => {
    if (resultKind === "toner") {
      dispatch({ type: "navigate", view: "skincare-catalog" });
      return;
    }

    if (resultKind === "generic") {
      dispatch({ type: "open-product", productId: JPLANET_PRODUCT_DETAIL_ID });
      return;
    }

    dispatch({
      type: "open-image-search-product",
      productId: imageSearchResolvedNewBalanceProductId,
    });
  };

  return (
    <section
      className="sazo-ai-search"
      data-ai-search-view
      data-has-results={showResults || undefined}
    >
      <header className="sazo-ai-search-header">
        <button
          aria-label="ホームに戻る"
          className="sazo-ai-search-back"
          data-ai-search-back
          onClick={() => dispatch({ type: "navigate", view: "home" })}
          type="button"
        >
          <ArrowLeft aria-hidden size={25} strokeWidth={2.2} />
        </button>
        <form
          aria-label="AI検索"
          className="sazo-ai-search-form"
          onSubmit={submit}
          role="search"
        >
          <Search
            aria-hidden
            className="sazo-ai-search-form-icon"
            size={23}
            strokeWidth={2.1}
          />
          <input
            aria-label="AI検索"
            autoComplete="off"
            autoFocus={shouldAutoFocus}
            data-ai-search-input
            enterKeyHint="search"
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.nativeEvent.isComposing) {
                event.preventDefault();
              }
            }}
            placeholder="商品名・キーワード・画像・URLで検索"
            ref={inputRef}
            type="search"
            value={query}
          />
          <input
            accept="image/*"
            aria-label="カメラ"
            capture="environment"
            data-ai-search-image-input
            data-testid="ai-search-image-input"
            hidden
            onChange={chooseImage}
            ref={imageInputRef}
            type="file"
          />
          {showResults ? (
            <button
              aria-label="検索語を削除"
              className="sazo-ai-search-clear"
              onClick={clearSearch}
              type="button"
            >
              <X aria-hidden size={18} strokeWidth={2} />
            </button>
          ) : (
            <button
              aria-label="画像を選択"
              className="sazo-ai-search-camera"
              onClick={() => imageInputRef.current?.click()}
              type="button"
            >
              <Camera aria-hidden size={23} strokeWidth={2.1} />
            </button>
          )}
        </form>
        <button
          aria-label="カート"
          className="sazo-ai-search-cart"
          onClick={() => dispatch({ type: "navigate", view: "cart" })}
          type="button"
        >
          <ShoppingCart aria-hidden size={25} strokeWidth={2.2} />
          <span aria-hidden="true">{state.cartItems.length}</span>
        </button>
      </header>

      {showResults ? (
        <main
          className="sazo-ai-search-results"
          data-ai-search-results
          data-search-result-kind={resultKind}
        >
          <section aria-label="検索補助" className="sazo-ai-search-assistance">
            <Languages aria-hidden size={22} strokeWidth={2} />
            {resultKind === "toner" ? (
              <p>
                {isJapaneseTonerQuery(submittedQuery) ? (
                  <>日本語の商品名「化粧水」で検索しました。</>
                ) : (
                  <>
                    <strong>「化粧水」</strong>に翻訳して検索しました。
                  </>
                )}
              </p>
            ) : resultKind === "new-balance-9060" ? (
              <p>海外ショップも含めて検索しました。</p>
            ) : (
              <p>「{submittedQuery}」で検索しました。</p>
            )}
            <button
              aria-label={
                resultKind === "toner"
                  ? "日本語への翻訳検索について"
                  : resultKind === "new-balance-9060"
                    ? "海外ショップ検索について"
                    : "キーワード検索について"
              }
              type="button"
            >
              <CircleHelp aria-hidden size={21} strokeWidth={2} />
            </button>
          </section>

          <div aria-label="関連する検索語" className="sazo-ai-search-keywords">
            {resultKeywords.map((keyword) => (
              <button
                aria-pressed={activeKeyword === keyword}
                key={keyword}
                onClick={() =>
                  setActiveKeyword((current) => (current === keyword ? null : keyword))
                }
                type="button"
              >
                {keyword}
              </button>
            ))}
          </div>

          <div className="sazo-ai-search-result-divider" />

          <nav aria-label="検索結果の分類" className="sazo-ai-search-result-tabs">
            {newBalanceSearchTabs.map((tab) => (
              <button
                aria-current={activeGroup === tab.id ? "page" : undefined}
                key={tab.id}
                onClick={() => setActiveGroup(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <p className="sazo-ai-search-result-count">
            {newBalanceSearchTabs.find((tab) => tab.id === activeGroup)?.label}{" "}
            {resultCount}件
          </p>

          <div className="sazo-ai-search-result-groups">
            {visibleGroups.map((group) => (
              <section
                aria-labelledby={`ai-search-result-${group.id}`}
                className="sazo-ai-search-result-group"
                data-result-group={group.id}
                key={group.id}
              >
                <header>
                  <div className="sazo-ai-search-result-title">
                    <h2 id={`ai-search-result-${group.id}`}>{group.title}</h2>
                    {group.infoLabel === undefined ? null : (
                      <span aria-label={group.infoLabel} role="img" title={group.infoLabel}>
                        <CircleHelp aria-hidden size={17} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                  <button onClick={() => setActiveGroup(group.id)} type="button">
                    もっと見る
                  </button>
                </header>

                <ul aria-label={`${group.title}の商品`}>
                  {group.products.map((product) => {
                    const isSaved = savedProductIds.includes(product.id);

                    return (
                      <li key={product.id}>
                        <div className="sazo-ai-search-result-image">
                          <button
                            aria-label={`${product.name.replace("\n", " ")}${
                              resultKind === "toner"
                                ? "のスキンケア商品を見る"
                                : "の商品詳細を見る"
                            }`}
                            onClick={openSearchResultProduct}
                            type="button"
                          >
                            <img
                              alt={product.name.replace("\n", " ")}
                              src={product.image}
                            />
                          </button>
                          <button
                            aria-label={
                              isSaved
                                ? `${product.name.replace("\n", " ")}を保存から削除`
                                : `${product.name.replace("\n", " ")}を保存`
                            }
                            aria-pressed={isSaved}
                            className="sazo-ai-search-result-save"
                            onClick={() =>
                              setSavedProductIds((current) =>
                                isSaved
                                  ? current.filter((id) => id !== product.id)
                                  : [...current, product.id],
                              )
                            }
                            type="button"
                          >
                            <Bookmark
                              aria-hidden
                              fill={isSaved ? "currentColor" : "none"}
                              size={18}
                              strokeWidth={1.9}
                            />
                          </button>
                        </div>
                        <button
                          className="sazo-ai-search-result-copy"
                          onClick={openSearchResultProduct}
                          type="button"
                        >
                          {product.source === undefined ? <small>J-Planet</small> : null}
                          <strong>
                            {product.source === undefined ? null : (
                              <span
                                className="sazo-ai-search-source-logo"
                                data-logo-crop={product.source.crop}
                              >
                                <img
                                  alt={`販売サイト ${product.source.name}（モック）`}
                                  src={product.source.logo}
                                />
                              </span>
                            )}
                            {product.name}
                          </strong>
                          <b>{product.price}</b>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </main>
      ) : (
        <main className="sazo-ai-search-main">
          {recentItems.length > 0 ? (
            <section
              aria-labelledby="ai-search-recent-title"
              className="sazo-ai-search-recent"
            >
              <header>
                <h1 id="ai-search-recent-title">最近の検索</h1>
                <button
                  aria-label="すべての検索履歴を削除"
                  onClick={() => setRecentItems([])}
                  type="button"
                >
                  削除
                </button>
              </header>
              <ul aria-label="最近の検索">
                {recentItems.map((item) => (
                  <li key={item.id}>
                    <button onClick={() => searchText(item.label)} type="button">
                      {item.label}
                    </button>
                    <button
                      aria-label={`${item.label}を検索履歴から削除`}
                      onClick={() =>
                        setRecentItems((items) =>
                          items.filter((entry) => entry.id !== item.id),
                        )
                      }
                      type="button"
                    >
                      <X aria-hidden size={21} strokeWidth={2.2} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section
            aria-labelledby="ai-search-agent-bridge-title"
            className="sazo-ai-search-agent-bridge"
          >
            <div className="sazo-ai-search-agent-bridge-intro">
              <img
                alt=""
                aria-hidden="true"
                data-jplanet-sakura-mark
                height={44}
                src="/sazo-commerce/jplanet-sakura-mark.png"
                width={44}
              />
              <div>
                <h2 id="ai-search-agent-bridge-title">
                  欲しい商品を、J-Planetに相談
                </h2>
                <p>日本の商品を、ブラジルで買える条件まで確認します。</p>
              </div>
            </div>
            <ul aria-label="J-Planetが確認する条件">
              {aiSearchAgentCheckItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="ai-search-popular-title"
            className="sazo-ai-search-popular"
          >
            <h2 id="ai-search-popular-title">今、人気の検索</h2>
            <ol>
              {aiSearchPopularItems.slice(0, 5).map((item, index) => (
                <li key={item.id}>
                  <button onClick={() => searchText(item.label)} type="button">
                    <span aria-hidden="true">{index + 1}</span>
                    <strong>{item.label}</strong>
                    <ChevronRight aria-hidden size={19} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </main>
      )}
    </section>
  );
}
