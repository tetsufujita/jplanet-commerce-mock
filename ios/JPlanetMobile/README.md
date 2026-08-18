# J-Planet Mobile

現行のJ-PlanetモバイルWeb UIを、そのままiPhoneアプリで表示する最小のSwiftUI / `WKWebView` ラッパーです。Web側のReact・CSS・ルーティングには変更を加えません。

## 起動前の設定

1. J-Planetモックをインターネットから到達できる **HTTPS** URL に公開します。`127.0.0.1` は実機からは利用できません。
2. Xcodeで `JPlanetMobile.xcodeproj` を開きます。
3. `JPlanetMobile/Info.plist` の `JPLANET_WEB_URL` にそのURLを設定します。
4. Signing & Capabilities で自分のApple Developer Teamを選び、実機またはシミュレータで実行します。

URLを空のまま起動した場合でも、アプリ内の設定画面で公開HTTPS URLを一時的に入力できます。保存先は端末の`UserDefaults`です。

## 挙動

- 表示領域を最大440ptに保ち、Webのモバイルブレークポイントを維持します。
- J-Planetドメイン内の遷移はアプリ内で表示します。
- 外部ドメインへのリンクと新規ウィンドウはSafariで開きます。
- リロード時に最新のWebアセットを再検証します。

## 現時点の制約

- Webモックの公開HTTPS URLは未設定です。
- App Icon、Apple Developer Team、App Store向けプライバシー申告は、配布前に別途設定が必要です。
