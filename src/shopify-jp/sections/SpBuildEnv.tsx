import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";

/**
 * 10-build-env — 構築に最適な環境が揃っています
 * 本家: deep-pine 大ブロックの「蓋」。navy 裏地の上に上 2 角だけ角丸の pine 帯 + 中央 H2 のみ。
 * motion 仮説 = なし（完全静的）。animations.json 対象外・transition 系 class ゼロのため
 * useState / useEffect / motion component は一切使わない。
 * 高さ @1440: pt 80 + H2 2 行 (70px lh × 2 = 140) + pb-[3px] ≈ 223px（spec 実測 222px と整合）。
 */

const COPY = {
  headingLine1: "構築に最適な環境が",
  headingLine2: "揃っています",
} as const;

export function SpBuildEnv() {
  return (
    /* navy 裏地: 上角丸の外側に deep-navy が見える（前 section から連続） */
    <div className="bg-sp-navy">
      <SpSection
        id="10-build-env"
        bg="pine"
        /* 上 2 角のみ角丸（蓋の形）。下は次 section（同色 pine）に継ぎ目なく連続するため角丸なし */
        /* 本家 shot の corner 曲線プロファイル実測 (x=2..30 の depth) は r=48px に一致（r=40 は浅すぎ） */
        className="rounded-t-[32px] pt-16 pb-2 text-white sm:pt-20 sm:pb-0 md:rounded-t-[48px]"
      >
        <SpContainer>
          {/* text-t2 実測: 70px / weight 330 / lh 70px / letter-spacing normal / 白 / 中央 / <br> で 2 行固定 */}
          {/* font-weight 330 は Noto Sans JP variable 前提（static のみの環境では 300 に丸まる） */}
          {/* TODO(measure): 1425px の breakpoint 帯域（xl なら w-1/2。08 spec 判断に合わせ lg:w-2/3 を採用） */}
          <h2 className="pb-[3px] text-[40px] leading-[44px] font-[330] tracking-normal text-pretty sm:mx-auto sm:text-center md:w-3/4 md:text-[70px] md:leading-[70px] lg:w-2/3">
            {COPY.headingLine1}
            <br />
            {COPY.headingLine2}
          </h2>
        </SpContainer>
      </SpSection>
    </div>
  );
}
