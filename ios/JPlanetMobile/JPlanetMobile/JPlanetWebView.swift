import SwiftUI
import UIKit
import WebKit

@MainActor
final class JPlanetWebViewState: ObservableObject {
    @Published var isLoading = true
    @Published var errorMessage: String?
}

struct JPlanetWebView: UIViewRepresentable {
    let url: URL
    @ObservedObject var state: JPlanetWebViewState

    func makeCoordinator() -> Coordinator {
        Coordinator(state: state, appHost: url.host)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        let script = WKUserScript(
            source: "document.documentElement.dataset.jplanetNativeMobile = 'true';",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        configuration.userContentController.addUserScript(script)

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.isOpaque = false
        webView.backgroundColor = .systemBackground
        webView.scrollView.backgroundColor = .systemBackground
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.load(request(for: url))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard webView.url?.absoluteString != url.absoluteString else {
            return
        }

        webView.load(request(for: url))
    }

    private func request(for url: URL) -> URLRequest {
        URLRequest(
            url: url,
            cachePolicy: .reloadRevalidatingCacheData,
            timeoutInterval: 30
        )
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        private let state: JPlanetWebViewState
        private let appHost: String?

        init(state: JPlanetWebViewState, appHost: String?) {
            self.state = state
            self.appHost = appHost
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            state.isLoading = true
            state.errorMessage = nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            state.isLoading = false
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            present(error)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            present(error)
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction
        ) async -> WKNavigationActionPolicy {
            guard let destination = navigationAction.request.url else {
                return .cancel
            }

            guard destination.host == appHost || destination.host == nil else {
                await openExternally(destination)
                return .cancel
            }

            return .allow
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            guard let destination = navigationAction.request.url else {
                return nil
            }

            Task {
                await openExternally(destination)
            }
            return nil
        }

        @MainActor
        private func openExternally(_ url: URL) {
            UIApplication.shared.open(url)
        }

        private func present(_ error: Error) {
            state.isLoading = false
            state.errorMessage = error.localizedDescription
        }
    }
}
