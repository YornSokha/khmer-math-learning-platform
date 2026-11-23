export type Locale = "km" | "en";

export const DEFAULT_LOCALE: Locale = "km";

/**
 * UI chrome strings only (navigation, controls, labels, ARIA text).
 * Lesson copy belongs in versioned lesson content files, never in this dictionary.
 */
const kmMessages = {
  appTitle: "គណិតវិទ្យាខ្មែរ",
  appTagline: "រៀនគណិតវិទ្យាតាមការអនុវត្តផ្ទាល់។",
  numeralToggleGroupLabel: "ជ្រើសរើសប្រព័ន្ធលេខ",
  numeralToggleKhmerLabel: "១២៣",
  numeralToggleKhmerAriaLabel: "ប្រើលេខខ្មែរ (១២៣)",
  numeralToggleArabicLabel: "123",
  numeralToggleArabicAriaLabel: "ប្រើលេខអារ៉ាប់ (123)",
  previewSectionHeading: "គំរូអក្សរ និងលេខខ្មែរ",
  instructionSectionLabel: "ការណែនាំគំរូ",
  sampleNumbersLabel: "គំរូលេខថ្នាក់ទី ១",
  sampleActionsLabel: "ប៊ូតុងសាកល្បង",
  actionStartPractice: "ចាប់ផ្តើមអនុវត្ត",
  actionListenAgain: "ស្តាប់ម្តងទៀត",
  actionCheckAnswer: "ពិនិត្យចម្លើយ",
  navHome: "ទំព័រដើម",
  navPlayLesson: "ចាប់ផ្តើមមេរៀន៖ បង្កើតដប់",
  navPreviewLesson: "មើលគំរូមេរៀន៖ បង្កើតដប់",
  previewBannerLabel: "ទំព័រពិនិត្យមេរៀនសម្រាប់គ្រូ និងអ្នកអភិវឌ្ឍ",
  reviewMathLabel: "គណិតវិទ្យា",
  reviewKhmerLabel: "ភាសាខ្មែរ",
  reviewApproved: "បានអនុម័ត",
  reviewDraft: "កំពុងពិនិត្យ",
  stepLabel: "ជំហាន",
  hintsHeading: "ជំនួយតាមលំដាប់",
  misconceptionsHeading: "សារណែនាំពេលឆ្លើយខុសញឹកញាប់",
  correctFeedbackHeading: "សារពេលឆ្លើយត្រូវ",
  mathTermsHeading: "ពាក្យគណិតវិទ្យា",
  keypadLabel: "ក្តារចុចលេខ",
  keypadClear: "សម្អាត",
  keypadBackspace: "លុប",
  tenFrameLabel: "តារាងដប់",
  tenFrameAddedCount: "បានបន្ថែម",
  tenFrameTotalCount: "សរុប",
  numberLineLabel: "បន្ទាត់ចំនួន",
  numberLineHopForward: "លោតទៅមុខ +១",
  numberLineHopBack: "ថយក្រោយ -១",
  numberLineHopsCount: "ចំនួនជំហាន",
  equationAnswerPlaceholder: "ចុចលេខខាងក្រោម",
  equationVisualModelLabel: "រូបជំនួយតារាងដប់",
  playerExit: "ចាកចេញ",
  playerContinue: "បន្ត",
  playerFinishLesson: "បញ្ចប់មេរៀន",
  playerShowHint: "សុំជំនួយ",
  playerHintCountLabel: "ជំនួយ",
  playerAudioPlay: "ស្តាប់ការណែនាំ",
  playerAudioPending: "សំឡេងណែនាំនឹងដាក់បញ្ចូលបន្ទាប់ពីគ្រូពិនិត្យអត្ថបទ។",
  playerEnterAnswerFirst: "សូមជ្រើសរើស ឬបញ្ចូលចម្លើយជាមុនសិន។",
  playerCompleteTitle: "ធ្វើបានល្អណាស់! ជួបគ្នាថ្ងៃស្អែក។",
  playerCompleteSubtitle: "អ្នកបានបញ្ចប់មេរៀននេះដោយជោគជ័យ។ សម្រាកសិន ហើយត្រឡប់មករៀនបន្តនៅថ្ងៃស្អែកណា!",
  playerSummarySteps: "ជំហានបានបញ្ចប់",
  playerSummaryFixedMistakes: "កំហុសដែលបានកែ",
  playerReplayLesson: "រៀនម្តងទៀត",
  playerDraftNotice: "មេរៀនសាកល្បង — កំពុងរង់ចាំគ្រូបឋមសិក្សាពិនិត្យភាសាខ្មែរ",
} as const;

export type MessageKey = keyof typeof kmMessages;
export type Messages = Record<MessageKey, string>;

const enMessages: Messages = {
  appTitle: "Khmer Math",
  appTagline: "Learn math through hands-on practice.",
  numeralToggleGroupLabel: "Choose numeral system",
  numeralToggleKhmerLabel: "១២៣",
  numeralToggleKhmerAriaLabel: "Use Khmer numerals (១២៣)",
  numeralToggleArabicLabel: "123",
  numeralToggleArabicAriaLabel: "Use Arabic numerals (123)",
  previewSectionHeading: "Khmer Typography & Numerals Preview",
  instructionSectionLabel: "Sample Instruction",
  sampleNumbersLabel: "Grade 1 Sample Numbers",
  sampleActionsLabel: "Sample Controls",
  actionStartPractice: "Start Practice",
  actionListenAgain: "Listen Again",
  actionCheckAnswer: "Check Answer",
  navHome: "Home",
  navPlayLesson: "Start Lesson: Make Ten",
  navPreviewLesson: "Preview Lesson: Make Ten",
  previewBannerLabel: "Lesson Review Preview (Teacher & Developer)",
  reviewMathLabel: "Math",
  reviewKhmerLabel: "Khmer",
  reviewApproved: "Approved",
  reviewDraft: "Draft",
  stepLabel: "Step",
  hintsHeading: "Progressive Hints",
  misconceptionsHeading: "Misconception Feedback",
  correctFeedbackHeading: "Correct Feedback",
  mathTermsHeading: "Math Terms",
  keypadLabel: "Numeric keypad",
  keypadClear: "Clear",
  keypadBackspace: "Delete",
  tenFrameLabel: "Ten-frame",
  tenFrameAddedCount: "Added",
  tenFrameTotalCount: "Total",
  numberLineLabel: "Number line",
  numberLineHopForward: "Hop +1",
  numberLineHopBack: "Back -1",
  numberLineHopsCount: "Hops",
  equationAnswerPlaceholder: "Tap a number below",
  equationVisualModelLabel: "Ten-frame visual helper",
  playerExit: "Exit",
  playerContinue: "Continue",
  playerFinishLesson: "Finish Lesson",
  playerShowHint: "Show Hint",
  playerHintCountLabel: "Hint",
  playerAudioPlay: "Listen to instruction",
  playerAudioPending: "Pre-recorded Khmer audio will be added after teacher wording review.",
  playerEnterAnswerFirst: "Please choose or enter an answer first.",
  playerCompleteTitle: "Great work! See you tomorrow.",
  playerCompleteSubtitle: "You finished this lesson. Take a break and come back tomorrow!",
  playerSummarySteps: "Steps completed",
  playerSummaryFixedMistakes: "Mistakes fixed",
  playerReplayLesson: "Practice again",
  playerDraftNotice: "Preview lesson — awaiting primary teacher Khmer wording review",
};

const dictionaries: Record<Locale, Messages> = {
  km: kmMessages,
  en: enMessages,
};

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return dictionaries[locale];
}

export function t(key: MessageKey, locale: Locale = DEFAULT_LOCALE): string {
  return dictionaries[locale][key];
}
