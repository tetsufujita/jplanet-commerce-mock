import { useState, type Dispatch, type FormEvent } from "react";
import {
  CircleAlert,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Globe2,
  History,
  Image as ImageIcon,
  MessageCircle,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  agentHubArchivedHistory,
  agentHubCustomsAction,
  agentHubLatestHistory,
  agentHubRecentProducts,
  type AgentHubHistoryItem,
} from "@/sazo-commerce/agentHubFixtures";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";
import type {
  AgentEntryIntent,
  AgentHubScenario,
  SazoAction,
} from "@/sazo-commerce/model";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";

export interface MobileAgentHubViewProps {
  dispatch: Dispatch<SazoAction>;
  entryIntent: AgentEntryIntent | null;
  scenario?: AgentHubScenario;
}

function HistoryItem({
  dispatch,
  item,
}: {
  dispatch: Dispatch<SazoAction>;
  item: AgentHubHistoryItem;
}) {
  const InputIcon = item.inputKind === "url" ? Globe2 : ImageIcon;

  return (
    <li className="sazo-agent-hub-history-item">
      <button
        aria-label={`${item.product.name}の結果を見る`}
        onClick={() => {
          dispatch({ type: "open-product", productId: item.id });
        }}
        type="button"
      >
        <span className="sazo-agent-hub-history-input">
          <InputIcon aria-hidden size={21} strokeWidth={1.9} />
          <span>{item.inputLabel}</span>
          <time>{item.timestamp}</time>
        </span>
        <span className="sazo-agent-hub-history-result">
          <img alt="" src={item.product.image} />
          <span>
            <strong>{item.product.name}</strong>
            <small>{item.product.priceAndDelivery}</small>
          </span>
          <span className="sazo-agent-hub-history-open">
            結果を見る
            <ChevronRight aria-hidden size={18} strokeWidth={2.1} />
          </span>
        </span>
      </button>
    </li>
  );
}

export function MobileAgentHubView({
  dispatch,
  entryIntent,
  scenario = "normal",
}: MobileAgentHubViewProps) {
  const { t } = useTranslation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recipientSheetOpen, setRecipientSheetOpen] = useState(false);
  const [customsActionComplete, setCustomsActionComplete] = useState(false);
  const [cpf, setCpf] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const showCustomsAction = scenario === "customs-action" && !customsActionComplete;

  const completeRecipientInformation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cpf.trim().length === 0 || deliveryAddress.trim().length === 0) {
      return;
    }

    setRecipientSheetOpen(false);
    setCustomsActionComplete(true);
    dispatch({ type: "complete-agent-customs-action" });
  };

  return (
    <div
      className="sazo-agent-hub sazo-agent-hub--submission-history"
      data-apple-layout="agent"
      data-mobile-agent-hub
      data-scenario={scenario}
    >
      <header className="sazo-agent-hub-header">
        <button
          aria-label={t("sazo.brand.homeLabel")}
          className="sazo-agent-hub-home"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <JplanetLogo />
        </button>
        <h1>エージェント</h1>
        <button
          aria-label={t("sazo.actions.cart")}
          className="sazo-agent-hub-cart"
          onClick={() => {
            dispatch({ type: "navigate", view: "cart" });
          }}
          type="button"
        >
          <ShoppingCart aria-hidden size={22} strokeWidth={1.9} />
          <span aria-hidden="true">2</span>
        </button>
        <button
          aria-label={t("sazo.agentHub.chat")}
          className="sazo-agent-hub-chat"
          onClick={() => {
            dispatch({ type: "open-chat" });
          }}
          type="button"
        >
          <MessageCircle aria-hidden size={24} strokeWidth={1.8} />
        </button>
      </header>

      <section
        data-apple-surface="true"
        data-section="composer"
        data-testid="agent-hub-section"
      >
        <MobileAgentComposer
          entryIntent={entryIntent}
          onEntryIntentConsumed={() => {
            dispatch({ type: "consume-agent-entry-intent" });
          }}
          onSubmitted={(request) => {
            dispatch({ type: "start-agent-search", request });
          }}
          presentation="agent-hub"
          seedRequest={null}
        />
      </section>

      {showCustomsAction ? (
        <section
          aria-labelledby="agent-customs-action-title"
          className="sazo-agent-hub-customs-action"
          data-customs-action-card
          data-testid="agent-customs-action-card"
        >
          <header>
            <CircleAlert aria-hidden size={27} strokeWidth={1.8} />
            <h2 id="agent-customs-action-title">{agentHubCustomsAction.title}</h2>
          </header>
          <div className="sazo-agent-hub-customs-product">
            <img alt="" src={agentHubCustomsAction.productImage} />
            <span>
              <strong>{agentHubCustomsAction.productName}</strong>
              <small>{agentHubCustomsAction.source}</small>
            </span>
          </div>
          <div className="sazo-agent-hub-customs-next-step">
            <UserRound aria-hidden size={24} strokeWidth={1.9} />
            <span>
              <strong>{agentHubCustomsAction.itemLabel}</strong>
              <small>{agentHubCustomsAction.reason}</small>
              <em>必要項目: {agentHubCustomsAction.requiredFields}</em>
            </span>
            <button
              onClick={() => {
                setRecipientSheetOpen(true);
              }}
              type="button"
            >
              情報を入力する
              <ChevronRight aria-hidden size={17} strokeWidth={2.2} />
            </button>
          </div>
        </section>
      ) : null}

      {customsActionComplete ? (
        <p className="sazo-agent-hub-action-status" role="status">
          受取人情報を保存しました
        </p>
      ) : null}

      <section data-section="send-history" data-testid="agent-hub-section">
        <header>
          <h2>送信履歴</h2>
        </header>
        <ol className="sazo-agent-hub-history-list">
          {agentHubLatestHistory.map((item) => (
            <HistoryItem dispatch={dispatch} item={item} key={item.id} />
          ))}
        </ol>
        <button
          aria-expanded={historyOpen}
          className="sazo-agent-hub-history-disclosure"
          onClick={() => {
            setHistoryOpen((open) => !open);
          }}
          type="button"
        >
          <History aria-hidden size={25} strokeWidth={1.8} />
          <span>
            <strong>{historyOpen ? "履歴を閉じる" : "過去の送信履歴 18件"}</strong>
            <small>URL・画像・商品名</small>
          </span>
          {historyOpen ? (
            <ChevronUp aria-hidden size={20} strokeWidth={2} />
          ) : (
            <ChevronDown aria-hidden size={20} strokeWidth={2} />
          )}
        </button>
        {historyOpen ? (
          <ol className="sazo-agent-hub-history-list sazo-agent-hub-history-list--archive">
            {agentHubArchivedHistory.map((item) => (
              <HistoryItem dispatch={dispatch} item={item} key={item.id} />
            ))}
          </ol>
        ) : null}
      </section>

      <section data-section="recent-products" data-testid="agent-hub-section">
        <header>
          <h2>最近見た商品</h2>
        </header>
        <ol className="sazo-agent-hub-product-rail">
          {agentHubRecentProducts.map((product) => (
            <li className="sazo-agent-hub-product-card" key={product.id}>
              <button
                aria-label={`${product.name}の商品詳細を見る`}
                onClick={() => {
                  dispatch({ type: "open-product", productId: product.id });
                }}
                type="button"
              >
                <img alt="" src={product.image} />
                <span>{product.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {recipientSheetOpen ? (
        <div
          aria-labelledby="recipient-information-title"
          aria-modal="true"
          className="sazo-agent-hub-recipient-backdrop"
          role="dialog"
        >
          <form className="sazo-agent-hub-recipient-sheet" onSubmit={completeRecipientInformation}>
            <header>
              <div>
                <span>受取人情報</span>
                <h2 id="recipient-information-title">CPF・お届け先を確認</h2>
              </div>
              <button
                aria-label="閉じる"
                onClick={() => {
                  setRecipientSheetOpen(false);
                }}
                type="button"
              >
                <X aria-hidden size={22} />
              </button>
            </header>
            <p>通関に提出する情報として必要です。登録内容を確認して保存できます。</p>
            <label>
              CPF
              <input
                autoComplete="off"
                onChange={(event) => {
                  setCpf(event.target.value);
                }}
                placeholder="000.000.000-00"
                required
                type="text"
                value={cpf}
              />
            </label>
            <label>
              お届け先
              <input
                autoComplete="street-address"
                onChange={(event) => {
                  setDeliveryAddress(event.target.value);
                }}
                placeholder="São Paulo, Brazil"
                required
                type="text"
                value={deliveryAddress}
              />
            </label>
            <button type="submit">入力内容を保存する</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
