import SwiftUI

struct MobileCommerceRootView: View {
    @AppStorage("jplanet.mobile.webURL") private var savedURL = ""
    @State private var endpointInput = ""
    @StateObject private var webViewState = JPlanetWebViewState()

    private var commerceURL: URL? {
        CommerceEndpoint.configuredURL(savedURL: savedURL)
    }

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                Color(uiColor: .systemGroupedBackground)
                    .ignoresSafeArea()

                if let commerceURL {
                    JPlanetWebView(url: commerceURL, state: webViewState)
                        .overlay(alignment: .top) {
                            if webViewState.isLoading {
                                ProgressView()
                                    .padding(10)
                                    .background(.regularMaterial, in: Capsule())
                                    .padding(.top, 8)
                            }
                        }
                        .overlay(alignment: .bottom) {
                            if let errorMessage = webViewState.errorMessage {
                                Text("ページを読み込めませんでした: \(errorMessage)")
                                    .font(.footnote)
                                    .multilineTextAlignment(.center)
                                    .padding(12)
                                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                                    .padding()
                            }
                        }
                } else {
                    connectionSetup
                }
            }
            .frame(width: min(proxy.size.width, 440), height: proxy.size.height)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .onAppear {
            endpointInput = savedURL
        }
    }

    private var connectionSetup: some View {
        VStack(spacing: 20) {
            Image(systemName: "iphone")
                .font(.system(size: 42, weight: .light))
                .foregroundStyle(Color(red: 0.12, green: 0.22, blue: 0.39))

            VStack(spacing: 8) {
                Text("J-Planetを接続")
                    .font(.title2.weight(.semibold))

                Text("公開済みのHTTPS URLを設定すると、現在のモバイルUIをそのまま表示します。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            TextField("https://…", text: $endpointInput)
                .textInputAutocapitalization(.never)
                .keyboardType(.URL)
                .autocorrectionDisabled()
                .padding(14)
                .background(.background, in: RoundedRectangle(cornerRadius: 12))
                .overlay {
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color(red: 0.90, green: 0.92, blue: 0.95))
                }

            Button("モバイル画面を開く") {
                savedURL = endpointInput
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.12, green: 0.22, blue: 0.39))
            .disabled(CommerceEndpoint.configuredURL(savedURL: endpointInput) == nil)
        }
        .padding(24)
    }
}
