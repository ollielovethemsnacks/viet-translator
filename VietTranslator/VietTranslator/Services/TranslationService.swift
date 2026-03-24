//
//  TranslationService.swift
//  VietTranslator
//
//  Vietnamese to English translation
//  Using a simple dictionary-based approach for MVP
//

import Foundation

protocol TranslationProtocol {
    func translate(_ text: String, from source: Language, to target: Language) async throws -> Translation
}

class TranslationService: TranslationProtocol, ObservableObject {
    // MARK: - Properties
    private var translationCache = TranslationCache()
    
    // Simple Vietnamese-English dictionary for common phrases
    private let commonPhrases: [String: String] = [
        "xin chào": "hello",
        "cảm ơn": "thank you",
        "tạm biệt": "goodbye",
        "vâng": "yes",
        "không": "no",
        "tôi": "I/me",
        "bạn": "you",
        "anh": "brother/you (male)",
        "chị": "sister/you (female)",
        "mẹ": "mom",
        "ba": "dad",
        "bố": "dad",
        "con": "child/me (to parent)",
        "ăn": "eat",
        "cơm": "rice/food",
        "nước": "water",
        "đi": "go",
        "đến": "come/arrive",
        "đây": "here",
        "đó": "there",
        "này": "this",
        "kia": "that",
        "nhà": "house/home",
        "xe": "car/vehicle",
        "đường": "road/street",
        "trường": "school",
        "học": "study/learn",
        "làm": "do/work",
        "việc": "work/job",
        "tốt": "good",
        "đẹp": "beautiful",
        "lớn": "big",
        "nhỏ": "small",
        "mới": "new",
        "cũ": "old",
        "nóng": "hot",
        "lạnh": "cold",
        "ngon": "delicious",
        "muốn": "want",
        "có": "have/exist",
        "là": "is/are/am",
        "và": "and",
        "hay": "or/interesting",
        "nhưng": "but",
        "vì": "because",
        "nếu": "if",
        "khi": "when",
        "ở": "at/in",
        "tại": "at",
        "với": "with",
        "cho": "for/give",
        "từ": "from",
        "đến": "to/until",
        "trong": "in/inside",
        "ngoài": "outside",
        "trên": "on/above",
        "dưới": "under/below",
        "bên": "side",
        "trước": "before/front",
        "sau": "after/back",
        "giữa": "between/middle",
        "gần": "near",
        "xa": "far",
        "rất": "very",
        "quá": "too/very",
        "hơn": "more/than",
        "nhất": "most",
        "đã": "already/did",
        "đang": "currently/ing",
        "sẽ": "will",
        "hãy": "please/let's",
        "đừng": "don't",
        "nên": "should",
        "cần": "need",
        "thích": "like",
        "yêu": "love",
        "ghét": "hate",
        "biết": "know",
        "hiểu": "understand",
        "nghĩ": "think",
        "nói": "speak/say",
        "nghe": "listen/hear",
        "nhìn": "look/see",
        "thấy": "see",
        "tìm": "find/search",
        "mua": "buy",
        "bán": "sell",
        "đưa": "give/hand",
        "lấy": "take/get",
        "đặt": "put/place/order",
        "mở": "open",
        "đóng": "close",
        "bật": "turn on",
        "tắt": "turn off",
        "bắt đầu": "start/begin",
        "kết thúc": "end/finish",
        "sẵn sàng": "ready",
        "xong": "done/finished",
        "được": "okay/can",
        "khỏe": "healthy/fine",
        "mệt": "tired",
        "đói": "hungry",
        "khát": "thirsty",
        "buồn": "sad",
        "vui": "happy",
        "sợ": "scared",
        "giận": "angry",
        "ngạc nhiên": "surprised",
        "mời": "invite",
        "giúp": "help",
        "chờ": "wait",
        "đợi": "wait",
        "nhanh": "fast",
        "chậm": "slow",
        "sớm": "early",
        "muộn": "late",
        "hôm nay": "today",
        "hôm qua": "yesterday",
        "ngày mai": "tomorrow",
        "bây giờ": "now",
        "sáng": "morning",
        "trưa": "noon",
        "chiều": "afternoon",
        "tối": "evening",
        "đêm": "night",
        "tuần": "week",
        "tháng": "month",
        "năm": "year",
        "giờ": "hour/time",
        "phút": "minute",
        "giây": "second"
    ]
    
    // MARK: - Translation
    func translate(_ text: String, from source: Language, to target: Language) async throws -> Translation {
        // Check cache first
        if let cached = translationCache.get(for: text) {
            return cached
        }
        
        // Perform translation
        let translatedText = performTranslation(text)
        
        let translation = Translation(
            originalText: text,
            translatedText: translatedText,
            sourceLanguage: source,
            targetLanguage: target,
            confidence: 0.7 // Estimated confidence for dictionary-based translation
        )
        
        // Cache the result
        translationCache.set(translation, for: text)
        
        return translation
    }
    
    private func performTranslation(_ text: String) -> String {
        let lowercased = text.lowercased().trimmingCharacters(in: .whitespacesAndPunctuation)
        
        // Check for exact match
        if let exactMatch = commonPhrases[lowercased] {
            return exactMatch.capitalized
        }
        
        // Try to translate word by word
        let words = lowercased.split(separator: " ")
        var translatedWords: [String] = []
        var untranslatedWords: [String] = []
        
        for word in words {
            let wordString = String(word).trimmingCharacters(in: .punctuationCharacters)
            if let translation = commonPhrases[wordString] {
                translatedWords.append(translation)
            } else {
                untranslatedWords.append(String(word))
            }
        }
        
        // Combine results
        var result = ""
        if !translatedWords.isEmpty {
            result += translatedWords.joined(separator: " ")
        }
        if !untranslatedWords.isEmpty {
            if !result.isEmpty {
                result += " | "
            }
            result += "[\"" + untranslatedWords.joined(separator: " ") + "\"]"
        }
        
        return result.isEmpty ? "[\"\(text)\"]" : result
    }
}

// MARK: - Translation Cache
class TranslationCache {
    private var cache: [String: Translation] = [:]
    private let maxSize = 1000
    private var accessOrder: [String] = []
    
    func get(for text: String) -> Translation? {
        guard let translation = cache[text] else { return nil }
        
        // Update access order
        accessOrder.removeAll { $0 == text }
        accessOrder.append(text)
        
        return translation
    }
    
    func set(_ translation: Translation, for text: String) {
        // Evict oldest if at capacity
        if cache.count >= maxSize && cache[text] == nil {
            if let oldest = accessOrder.first {
                cache.removeValue(forKey: oldest)
                accessOrder.removeFirst()
            }
        }
        
        cache[text] = translation
        
        // Update access order
        accessOrder.removeAll { $0 == text }
        accessOrder.append(text)
    }
    
    func clear() {
        cache.removeAll()
        accessOrder.removeAll()
    }
}
