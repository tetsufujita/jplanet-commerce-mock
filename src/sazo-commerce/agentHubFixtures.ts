import { interestedProducts, type Product } from "@/sazo-commerce/fixtures";

export interface AgentHubConsultation {
  id: string;
  label: string;
}

export interface AgentHubTopic {
  id: string;
  labelKey: `sazo.agentHub.topics.${string}`;
  rank: number;
}

export const agentHubRecentConsultations: readonly AgentHubConsultation[] = [
  { id: "url", label: "coupang.com/vp/products/5973528469" },
  { id: "sneakers", label: "日本限定スニーカーを探したい" },
  { id: "image", label: "この画像の商品が欲しい" },
];

export const agentHubRecentProducts: readonly Product[] = interestedProducts.slice(0, 3);

export const agentHubPopularTopics: readonly AgentHubTopic[] = [
  { id: "anime", labelKey: "sazo.agentHub.topics.anime", rank: 1 },
  { id: "skincare", labelKey: "sazo.agentHub.topics.skincare", rank: 2 },
  { id: "sneakers", labelKey: "sazo.agentHub.topics.sneakers", rank: 3 },
  { id: "characters", labelKey: "sazo.agentHub.topics.characters", rank: 4 },
  { id: "stationery", labelKey: "sazo.agentHub.topics.stationery", rank: 5 },
  { id: "kitchen", labelKey: "sazo.agentHub.topics.kitchen", rank: 6 },
  { id: "beauty-devices", labelKey: "sazo.agentHub.topics.beautyDevices", rank: 7 },
  { id: "gaming", labelKey: "sazo.agentHub.topics.gaming", rank: 8 },
  { id: "watches", labelKey: "sazo.agentHub.topics.watches", rank: 9 },
  { id: "cameras", labelKey: "sazo.agentHub.topics.cameras", rank: 10 },
  { id: "outdoor", labelKey: "sazo.agentHub.topics.outdoor", rank: 11 },
  { id: "baby", labelKey: "sazo.agentHub.topics.baby", rank: 12 },
  { id: "hobby", labelKey: "sazo.agentHub.topics.hobby", rank: 13 },
  { id: "food", labelKey: "sazo.agentHub.topics.food", rank: 14 },
  { id: "matcha", labelKey: "sazo.agentHub.topics.matcha", rank: 15 },
  { id: "fashion", labelKey: "sazo.agentHub.topics.fashion", rank: 16 },
  { id: "bags", labelKey: "sazo.agentHub.topics.bags", rank: 17 },
  { id: "home-decor", labelKey: "sazo.agentHub.topics.homeDecor", rank: 18 },
  { id: "pet", labelKey: "sazo.agentHub.topics.pet", rank: 19 },
  { id: "limited", labelKey: "sazo.agentHub.topics.limited", rank: 20 },
];
