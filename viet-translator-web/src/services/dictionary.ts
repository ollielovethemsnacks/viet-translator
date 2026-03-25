// Vietnamese dictionary with 100+ common words and phrases
// This dictionary is used for offline translation

export interface DictionaryEntry {
  vi: string;
  en: string;
  category: 'greeting' | 'person' | 'place' | 'time' | 'object' | 'verb' | 'question' | 'misc';
}

export const dictionary: DictionaryEntry[] = [
  // Greetings
  { vi: 'xin chào', en: 'hello', category: 'greeting' },
  { vi: 'chào', en: 'hello', category: 'greeting' },
  { vi: 'chào bạn', en: 'hello', category: 'greeting' },
  { vi: 'chào buổi sáng', en: 'good morning', category: 'greeting' },
  { vi: 'chào buổi chiều', en: 'good afternoon', category: 'greeting' },
  { vi: 'chào buổi tối', en: 'good evening', category: 'greeting' },
  { vi: 'tạm biệt', en: 'goodbye', category: 'greeting' },
  { vi: 'bye', en: 'bye', category: 'greeting' },
  { vi: 'chào mừng', en: 'welcome', category: 'greeting' },
  { vi: 'cảm ơn', en: 'thank you', category: 'greeting' },
  { vi: 'cảm ơn bạn', en: 'thank you', category: 'greeting' },
  { vi: 'không có gì', en: 'you are welcome', category: 'greeting' },
  { vi: 'được thôi', en: 'you are welcome', category: 'greeting' },
  { vi: 'xin lỗi', en: 'sorry', category: 'greeting' },
  { vi: 'cho tôi xin lỗi', en: 'excuse me', category: 'greeting' },
  
  // Person
  { vi: 'tôi', en: 'I', category: 'person' },
  { vi: 'chúng tôi', en: 'we', category: 'person' },
  { vi: 'bạn', en: 'you', category: 'person' },
  { vi: 'anh', en: 'you (male)', category: 'person' },
  { vi: 'chị', en: 'you (female)', category: 'person' },
  { vi: 'cô', en: 'you (female, older)', category: 'person' },
  { vi: 'thầy', en: 'you (male, teacher)', category: 'person' },
  { vi: 'ông', en: 'you (male, older)', category: 'person' },
  { vi: 'bà', en: 'you (female, older)', category: 'person' },
  { vi: 'anh ấy', en: 'he', category: 'person' },
  { vi: 'cô ấy', en: 'she', category: 'person' },
  { vi: 'họ', en: 'they', category: 'person' },
  { vi: 'mọi người', en: 'everyone', category: 'person' },
  { vi: 'người', en: 'person', category: 'person' },
  { vi: 'tên tôi là', en: 'my name is', category: 'person' },
  { vi: 'tôi tên là', en: 'I am called', category: 'person' },
  { vi: 'giới thiệu', en: 'introduce', category: 'person' },
  
  // Common Words
  { vi: 'đúng', en: 'yes', category: 'misc' },
  { vi: 'đúng rồi', en: 'yes', category: 'misc' },
  { vi: 'không', en: 'no', category: 'misc' },
  { vi: 'không đúng', en: 'no', category: 'misc' },
  { vi: 'xin', en: 'please', category: 'misc' },
  { vi: 'làm ơn', en: 'please', category: 'misc' },
  { vi: 'mọi thứ', en: 'everything', category: 'misc' },
  { vi: 'cái này', en: 'this', category: 'misc' },
  { vi: 'cái đó', en: 'that', category: 'misc' },
  { vi: 'đây', en: 'here', category: 'misc' },
  { vi: 'đó', en: 'there', category: 'misc' },
  { vi: 'ở đây', en: 'here', category: 'misc' },
  { vi: 'ở đó', en: 'there', category: 'misc' },
  { vi: 'nhiều', en: 'many', category: 'misc' },
  { vi: 'ít', en: 'few', category: 'misc' },
  { vi: 'một', en: 'one', category: 'misc' },
  { vi: 'hai', en: 'two', category: 'misc' },
  { vi: 'ba', en: 'three', category: 'misc' },
  { vi: 'bốn', en: 'four', category: 'misc' },
  { vi: 'năm', en: 'five', category: 'misc' },
  { vi: 'sáu', en: 'six', category: 'misc' },
  { vi: 'bảy', en: 'seven', category: 'misc' },
  { vi: 'tám', en: 'eight', category: 'misc' },
  { vi: 'chín', en: 'nine', category: 'misc' },
  { vi: 'mười', en: 'ten', category: 'misc' },
  
  // Questions
  { vi: 'tên bạn là gì', en: 'what is your name', category: 'question' },
  { vi: 'bạn tên gì', en: 'what is your name', category: 'question' },
  { vi: 'tôi tên gì', en: 'what is my name', category: 'question' },
  { vi: 'bạn từ đâu', en: 'where are you from', category: 'question' },
  { vi: 'tôi từ đâu', en: 'where am I from', category: 'question' },
  { vi: 'bạn bao nhiêu tuổi', en: 'how old are you', category: 'question' },
  { vi: 'tôi bao nhiêu tuổi', en: 'how old am I', category: 'question' },
  { vi: 'bạn khỏe không', en: 'how are you', category: 'question' },
  { vi: 'tôi khỏe không', en: 'how am I', category: 'question' },
  { vi: 'thế nào', en: 'how', category: 'question' },
  { vi: 'ở đâu', en: 'where', category: 'question' },
  { vi: 'khi nào', en: 'when', category: 'question' },
  { vi: 'tại sao', en: 'why', category: 'question' },
  { vi: 'cái gì', en: 'what', category: 'question' },
  { vi: 'ai', en: 'who', category: 'question' },
  { vi: 'cái này là gì', en: 'what is this', category: 'question' },
  { vi: 'cái đó là gì', en: 'what is that', category: 'question' },
  { vi: 'bạn làm gì', en: 'what are you doing', category: 'question' },
  { vi: 'tôi đang làm gì', en: 'what am I doing', category: 'question' },
  { vi: 'bạn muốn gì', en: 'what do you want', category: 'question' },
  { vi: 'tôi muốn gì', en: 'what do I want', category: 'question' },
  
  // Time
  { vi: 'bây giờ', en: 'now', category: 'time' },
  { vi: 'hiện tại', en: 'now', category: 'time' },
  { vi: 'ngày mai', en: 'tomorrow', category: 'time' },
  { vi: 'hôm nay', en: 'today', category: 'time' },
  { vi: 'hôm qua', en: 'yesterday', category: 'time' },
  { vi: 'tuần này', en: 'this week', category: 'time' },
  { vi: 'tuần tới', en: 'next week', category: 'time' },
  { vi: 'tuần trước', en: 'last week', category: 'time' },
  { vi: 'tháng này', en: 'this month', category: 'time' },
  { vi: 'năm nay', en: 'this year', category: 'time' },
  { vi: 'giờ', en: 'hour', category: 'time' },
  { vi: 'phút', en: 'minute', category: 'time' },
  { vi: 'giây', en: 'second', category: 'time' },
  { vi: 'sáng', en: 'morning', category: 'time' },
  { vi: 'trưa', en: 'noon', category: 'time' },
  { vi: 'chiều', en: 'afternoon', category: 'time' },
  { vi: 'tối', en: 'evening', category: 'time' },
  { vi: 'đêm', en: 'night', category: 'time' },
  
  // Places
  { vi: 'nước Việt Nam', en: 'Vietnam', category: 'place' },
  { vi: 'Việt Nam', en: 'Vietnam', category: 'place' },
  { vi: 'nước Mỹ', en: 'America/USA', category: 'place' },
  { vi: 'nước Anh', en: 'England/UK', category: 'place' },
  { vi: 'nước Pháp', en: 'France', category: 'place' },
  { vi: 'nước Nhật', en: 'Japan', category: 'place' },
  { vi: 'nước Trung', en: 'China', category: 'place' },
  { vi: ' Thành phố Hồ Chí Minh', en: 'Ho Chi Minh City', category: 'place' },
  { vi: 'Sài Gòn', en: 'Ho Chi Minh City', category: 'place' },
  { vi: 'Hà Nội', en: 'Hanoi', category: 'place' },
  { vi: 'Đà Nẵng', en: 'Da Nang', category: 'place' },
  { vi: 'nơi đây', en: 'here', category: 'place' },
  { vi: 'nơi đó', en: 'there', category: 'place' },
  { vi: 'nhà', en: 'house', category: 'place' },
  { vi: 'trường học', en: 'school', category: 'place' },
  { vi: 'cửa hàng', en: 'shop/store', category: 'place' },
  { vi: 'bệnh viện', en: 'hospital', category: 'place' },
  
  // Objects
  { vi: 'nước', en: 'water', category: 'object' },
  { vi: 'nước uống', en: 'drink', category: 'object' },
  { vi: 'ăn', en: 'eat', category: 'object' },
  { vi: 'cơm', en: 'rice', category: 'object' },
  { vi: 'bánh', en: 'cake/bread', category: 'object' },
  { vi: 'sữa', en: 'milk', category: 'object' },
  { vi: 'cà phê', en: 'coffee', category: 'object' },
  { vi: 'trà', en: 'tea', category: 'object' },
  { vi: 'rau', en: 'vegetable', category: 'object' },
  { vi: 'thịt', en: 'meat', category: 'object' },
  { vi: ' cá', en: 'fish', category: 'object' },
  { vi: 'quần áo', en: 'clothes', category: 'object' },
  { vi: 'giày', en: 'shoes', category: 'object' },
  { vi: 'điện thoại', en: 'phone', category: 'object' },
  { vi: 'tiền', en: 'money', category: 'object' },
  { vi: 'xe', en: 'car', category: 'object' },
  { vi: 'xe máy', en: 'motorbike', category: 'object' },
  { vi: 'tàu', en: 'train', category: 'object' },
  { vi: 'máy bay', en: 'airplane', category: 'object' },
  { vi: 'tivi', en: 'TV', category: 'object' },
  
  // Verbs
  { vi: 'cần', en: 'need', category: 'verb' },
  { vi: 'muốn', en: 'want', category: 'verb' },
  { vi: 'biết', en: 'know', category: 'verb' },
  { vi: 'hiểu', en: 'understand', category: 'verb' },
  { vi: 'nói', en: 'speak/talk', category: 'verb' },
  { vi: 'đi', en: 'go', category: 'verb' },
  { vi: 'đến', en: 'arrive', category: 'verb' },
  { vi: 'ở', en: 'stay', category: 'verb' },
  { vi: 'dừng', en: 'stop', category: 'verb' },
  { vi: 'làm', en: 'do/make', category: 'verb' },
  { vi: 'xem', en: 'look/watch', category: 'verb' },
  { vi: 'nghe', en: 'listen', category: 'verb' },
  { vi: 'ngủ', en: 'sleep', category: 'verb' },
  { vi: 'tỉnh', en: 'wake up', category: 'verb' },
  { vi: 'mua', en: 'buy', category: 'verb' },
  { vi: 'bán', en: 'sell', category: 'verb' },
  { vi: 'mở', en: 'open', category: 'verb' },
  { vi: 'đóng', en: 'close', category: 'verb' },
  { vi: 'đang', en: 'is/are -ing', category: 'verb' },
  { vi: 'đã', en: 'past tense', category: 'verb' },
  
  // Expressions
  { vi: 'tuyệt vời', en: 'wonderful', category: 'misc' },
  { vi: 'tuyệt hay', en: 'awesome', category: 'misc' },
  { vi: 'đáng yêu', en: 'cute', category: 'misc' },
  { vi: 'đẹp', en: 'beautiful', category: 'misc' },
  { vi: 'đẹp trai', en: 'handsome', category: 'misc' },
  { vi: 'xinh', en: 'pretty', category: 'misc' },
  { vi: 'ngon', en: ' delicious', category: 'misc' },
  { vi: 'ngon miệng', en: 'tasty', category: 'misc' },
  { vi: 'tuần salud', en: 'good health', category: 'misc' },
  { vi: 'chúc mừng', en: 'congratulations', category: 'misc' },
  { vi: 'ôm', en: 'hug', category: 'misc' },
  { vi: 'yêu', en: 'love', category: 'misc' },
  { vi: 'thích', en: 'like', category: 'misc' },
  { vi: 'buồn', en: 'sad', category: 'misc' },
  { vi: 'vui', en: 'happy', category: 'misc' },
  { vi: ' khỏe', en: 'healthy', category: 'misc' },
  { vi: 'bệnh', en: 'sick/ill', category: 'misc' },
  { vi: 'đói', en: 'hungry', category: 'misc' },
  { vi: 'khát', en: 'thirsty', category: 'misc' },
  
  // Common Phrases
  { vi: 'xin chào tên tôi là', en: 'hello my name is', category: 'greeting' },
  { vi: 'tôi không hiểu', en: 'I do not understand', category: 'question' },
  { vi: 'bạn có thể giúp tôi', en: 'can you help me', category: 'question' },
  { vi: 'tôi cần giúp đỡ', en: 'I need help', category: 'question' },
  { vi: 'tôi không biết', en: 'I do not know', category: 'question' },
  { vi: 'tôi yêu bạn', en: 'I love you', category: 'greeting' },
  { vi: 'bạn biết tiếng Việt', en: 'do you know Vietnamese', category: 'question' },
  { vi: 'tôi đang học tiếng Việt', en: 'I am learning Vietnamese', category: 'verb' },
  { vi: 'nói chậm hơn', en: 'speak slower', category: 'verb' },
  { vi: 'nói lại', en: 'say again', category: 'verb' },
  { vi: 'tôi không nghe rõ', en: 'I did not hear clearly', category: 'verb' },
  { vi: 'cảm ơn nhiều', en: 'thank you very much', category: 'greeting' },
  { vi: 'chúc bạn một ngày tốt lành', en: 'have a nice day', category: 'greeting' },
  { vi: 'chúc ngủ ngon', en: 'good night', category: 'greeting' },
  { vi: 'sinh nhật vui vẻ', en: 'happy birthday', category: 'greeting' },
];

// Extended dictionary with more words
export const extendedDictionary: DictionaryEntry[] = [
  // Pronouns
  { vi: 'tôi', en: 'me/I', category: 'person' },
  { vi: 'bạn', en: 'you', category: 'person' },
  { vi: 'anh ấy', en: 'he/him', category: 'person' },
  { vi: 'cô ấy', en: 'she/her', category: 'person' },
  { vi: 'chúng tôi', en: 'we/us', category: 'person' },
  { vi: 'họ', en: 'they/them', category: 'person' },
  
  // Common adjectives
  { vi: 'lớn', en: 'big', category: 'misc' },
  { vi: 'nhỏ', en: 'small', category: 'misc' },
  { vi: 'cao', en: 'tall', category: 'misc' },
  { vi: 'thấp', en: 'short', category: 'misc' },
  { vi: 'nặng', en: 'heavy', category: 'misc' },
  { vi: 'nhẹ', en: 'light', category: 'misc' },
  { vi: 'nhanh', en: 'fast', category: 'misc' },
  { vi: 'chậm', en: 'slow', category: 'misc' },
  { vi: 'nóng', en: 'hot', category: 'misc' },
  { vi: 'lạnh', en: 'cold', category: 'misc' },
  { vi: 'mới', en: 'new', category: 'misc' },
  { vi: 'cũ', en: 'old', category: 'misc' },
  { vi: 'đen', en: 'black', category: 'misc' },
  { vi: 'trắng', en: 'white', category: 'misc' },
  { vi: 'đỏ', en: 'red', category: 'misc' },
  { vi: 'xanh', en: 'blue/green', category: 'misc' },
  { vi: 'vàng', en: 'yellow', category: 'misc' },
  { vi: 'be', en: 'brown', category: 'misc' },
  
  // More verbs
  { vi: 'có', en: 'have', category: 'verb' },
  { vi: 'không có', en: 'do not have', category: 'verb' },
  { vi: 'cho', en: 'give', category: 'verb' },
  { vi: 'lấy', en: 'take', category: 'verb' },
  { vi: 'mang', en: 'carry', category: 'verb' },
  { vi: 'đưa', en: 'pass/hand', category: 'verb' },
  { vi: 'nhận', en: 'receive', category: 'verb' },
  { vi: 'kẹt', en: 'stuck', category: 'verb' },
  { vi: 'rơi', en: 'drop/fall', category: 'verb' },
  { vi: 'vứt', en: 'throw', category: 'verb' },
  { vi: 'viết', en: 'write', category: 'verb' },
  { vi: 'đọc', en: 'read', category: 'verb' },
  { vi: 'nghe', en: 'listen/hear', category: 'verb' },
  { vi: 'nhìn', en: 'look/see', category: 'verb' },
  { vi: 'cảm nhận', en: 'feel', category: 'verb' },
  { vi: 'tư duy', en: 'think', category: 'verb' },
  
  // More nouns
  { vi: 't ivory', en: 'ivory', category: 'object' },
  { vi: 'kim cương', en: 'diamond', category: 'object' },
  { vi: 'vàng', en: 'gold', category: 'object' },
  { vi: 'bạc', en: 'silver', category: 'object' },
  { vi: 'núi', en: 'mountain', category: 'place' },
  { vi: 'biển', en: 'sea/ocean', category: 'place' },
  { vi: 'sông', en: 'river', category: 'place' },
  { vi: 'rừng', en: 'forest', category: 'place' },
  { vi: 'trời', en: 'sky', category: 'place' },
  { vi: 'đất', en: 'land/earth', category: 'place' },
  { vi: 'nam', en: 'male/man', category: 'person' },
  { vi: 'nữ', en: 'female/woman', category: 'person' },
  { vi: 'trẻ em', en: 'child/children', category: 'person' },
  { vi: 'bạn bè', en: 'friends', category: 'person' },
  { vi: 'gia đình', en: 'family', category: 'person' },
  
  // Time expressions
  { vi: 'lần đầu', en: 'first time', category: 'time' },
  { vi: 'mỗi ngày', en: 'every day', category: 'time' },
  { vi: 'một lần', en: 'one time', category: 'time' },
  { vi: 'thường xuyên', en: 'often', category: 'time' },
  { vi: 'ít khi', en: 'seldom', category: 'time' },
  { vi: 'luôn luôn', en: 'always', category: 'time' },
  { vi: 'không bao giờ', en: 'never', category: 'time' },
  
  // More phrases
  { vi: 'xin vui lòng', en: 'please', category: 'greeting' },
  { vi: 'xin lỗi', en: 'excuse me/sorry', category: 'greeting' },
  { vi: 'tạm biệt', en: 'goodbye', category: 'greeting' },
  { vi: 'chào tạm biệt', en: 'bye', category: 'greeting' },
  { vi: 'tốt lành', en: 'good', category: 'greeting' },
  { vi: 'chúc ngon miệng', en: 'enjoy your meal', category: 'greeting' },
  { vi: 'chúc ngon miệng', en: 'bon appétit', category: 'greeting' },
];

// Combine dictionaries and remove duplicates
export const fullDictionary: DictionaryEntry[] = [
  ...new Map(dictionary.concat(extendedDictionary).map(item => [item.vi, item])).values()
];

// Helper function to find translation
export function findTranslation(text: string): string | null {
  const normalizedText = text.trim().toLowerCase();
  
  // Try exact match first
  const exactMatch = fullDictionary.find(entry => 
    entry.vi === normalizedText || normalizedText.includes(entry.vi)
  );
  
  if (exactMatch) {
    return exactMatch.en;
  }
  
  // Try partial match for multi-word phrases
  for (const entry of fullDictionary) {
    if (normalizedText.includes(entry.vi) || entry.vi.includes(normalizedText)) {
      return entry.en;
    }
  }
  
  return null;
}

// Get category icon for 
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    greeting: '👋',
    person: '👤',
    place: '🌍',
    time: '⏰',
    object: '📦',
    verb: '⚡',
    question: '❓',
    misc: '✨'
  };
  return icons[category] || '✨';
}
