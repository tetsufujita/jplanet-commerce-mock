import Foundation

enum CommerceEndpoint {
    static let infoDictionaryKey = "JPLANET_WEB_URL"

    static func configuredURL(savedURL: String) -> URL? {
        let configuredValue = savedURL.isEmpty
            ? Bundle.main.object(forInfoDictionaryKey: infoDictionaryKey) as? String ?? ""
            : savedURL

        guard let url = URL(string: configuredValue.trimmingCharacters(in: .whitespacesAndNewlines)),
              url.scheme == "https",
              url.host != nil else {
            return nil
        }

        return url
    }
}
