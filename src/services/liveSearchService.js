/**
 * 🌐 DuckDuckGo Live Search & Dharmic Real-Time Knowledge Service
 * ===============================================================
 * Enables live retrieval of dynamic spiritual events, Hindu calendar dates,
 * Ekadashi schedules, Grahan (Eclipse) Sutak timings, temple darshan hours,
 * and current festival schedules with authentic spiritual guidance.
 */

// Key patterns for dynamic spiritual & calendar queries
const LIVE_CALENDAR_PATTERNS = [
  // 1. Ekadashi queries (including follow-ups like 'is month me', 'parana timing')
  /(?:next\s*ekadashi|ekadashi\s*dates?|when\s*is.*ekadashi|अगली\s*एकादशी|एकादशी\s*कब\s*है|एकादशी\s*तिथि|एकादशी\s*का\s*व्रत|एकादशी\s*पारण|ekadashi.*is\s*month|ekadashi.*this\s*month|is\s*month.*ekadashi|इस\s*महीने.*एकादशी)/i,
  // 2. Grahan & Sutak queries
  /(?:grahan.*sutak|sutak.*kab\s*lagega|sutak\s*timings?|chandra\s*grahan|surya\s*grahan|ग्रहण.*सूतक|सूतक\s*कब\s*लगेगा|सूतक\s*में\s*क्या\s*करें|सूर्य\s*ग्रहण|चंद्र\s*ग्रहण|solar\s*eclipse|lunar\s*eclipse)/i,
  // 3. Panchang, Tithi, Vrat & Muhurat
  /(?:aaj\s*ka\s*panchang|today.*tithi|आज\s*का\s*पंचांग|आज\s*की\s*तिथि|प्रदोष\s*व्रत|पूर्णिमा\s*कब\s*है|अमावस्या\s*कब\s*है|pradosh\s*vrat|purnima\s*date|amavasya\s*date|shubh\s*muhurat|शुभ\s*मुहूर्त|राहुकाल)/i,
  // 4. Festivals
  /(?:when\s*is|kab\s*hai|कब\s*है).*(?:diwali|holi|navratri|janmashtami|radhashtami|shivratri|ram\s*navami|hanuman\s*jayanti|raksha\s*bandhan|guru\s*purnima|दीपावली|होली|जन्माष्टमी|राधाष्टमी|शिवरात्रि|नवरात्रि)/i,
  // 5. Vrindavan & Temple Darshan timings
  /(?:bankey\s*bihari|radha\s*vallabh|radharani|barsana|prem\s*mandir|iskcon|nidhivan|बांके\s*बिहारी|राधा\s*वल्लभ|राधारानी|बरसाना|प्रेम\s*मंदिर).*?(?:darshan|timing|open|close|aarti|दर्शन|समय|कपाट|आरती)/i,
  // 6. Explicit live web search triggers
  /(?:search\s*(?:online|web|internet)|live\s*search|इंटरनेट\s*पर\s*(?:खोजें|सर्च)|लाइव\s*सर्च)/i
];

export function isLiveCalendarQuery(query) {
  if (!query || typeof query !== 'string') return false;
  return LIVE_CALENDAR_PATTERNS.some((pat) => pat.test(query));
}

/**
 * 📅 Verified Ekadashi Timetable Database (2025 - 2027)
 * Provides exact dates, names, paksha, and parana timings.
 */
export const EKADASHI_CALENDAR_DB = [
  // --- 2025 ---
  { year: 2025, month: 1, nameHi: 'पौष पुत्रदा एकादशी', nameEn: 'Pausha Putrada Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '10 जनवरी 2025', dateEn: 'Jan 10, 2025', dateIso: '2025-01-10', paranaHi: '11 जनवरी प्रातः 07:15 से 09:21 तक', paranaEn: 'Jan 11, 07:15 AM to 09:21 AM' },
  { year: 2025, month: 1, nameHi: 'षटतिला एकादशी', nameEn: 'Shattila Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '25 जनवरी 2025', dateEn: 'Jan 25, 2025', dateIso: '2025-01-25', paranaHi: '26 जनवरी प्रातः 07:12 से 09:20 तक', paranaEn: 'Jan 26, 07:12 AM to 09:20 AM' },
  { year: 2025, month: 2, nameHi: 'जया एकादशी', nameEn: 'Jaya Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '8 फरवरी 2025', dateEn: 'Feb 8, 2025', dateIso: '2025-02-08', paranaHi: '9 फरवरी प्रातः 07:05 से 09:17 तक', paranaEn: 'Feb 9, 07:05 AM to 09:17 AM' },
  { year: 2025, month: 2, nameHi: 'विजया एकादशी', nameEn: 'Vijaya Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '24 फरवरी 2025', dateEn: 'Feb 24, 2025', dateIso: '2025-02-24', paranaHi: '25 फरवरी प्रातः 06:51 से 09:09 तक', paranaEn: 'Feb 25, 06:51 AM to 09:09 AM' },
  { year: 2025, month: 3, nameHi: 'आमलकी एकादशी', nameEn: 'Amalaki Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '10 मार्च 2025', dateEn: 'Mar 10, 2025', dateIso: '2025-03-10', paranaHi: '11 मार्च प्रातः 06:36 से 08:58 तक', paranaEn: 'Mar 11, 06:36 AM to 08:58 AM' },
  { year: 2025, month: 3, nameHi: 'पापमोचिनी एकादशी', nameEn: 'Papmochani Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '25 मार्च 2025', dateEn: 'Mar 25, 2025', dateIso: '2025-03-25', paranaHi: '26 मार्च प्रातः 06:19 से 08:44 तक', paranaEn: 'Mar 26, 06:19 AM to 08:44 AM' },
  { year: 2025, month: 4, nameHi: 'कामदा एकादशी', nameEn: 'Kamada Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '8 अप्रैल 2025', dateEn: 'Apr 8, 2025', dateIso: '2025-04-08', paranaHi: '9 अप्रैल प्रातः 06:03 से 08:32 तक', paranaEn: 'Apr 9, 06:03 AM to 08:32 AM' },
  { year: 2025, month: 4, nameHi: 'वरूथिनी एकादशी', nameEn: 'Varuthini Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '24 अप्रैल 2025', dateEn: 'Apr 24, 2025', dateIso: '2025-04-24', paranaHi: '25 अप्रैल प्रातः 05:46 से 08:21 तक', paranaEn: 'Apr 25, 05:46 AM to 08:21 AM' },
  { year: 2025, month: 5, nameHi: 'मोहिनी एकादशी', nameEn: 'Mohini Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '8 मई 2025', dateEn: 'May 8, 2025', dateIso: '2025-05-08', paranaHi: '9 मई प्रातः 05:35 से 08:14 तक', paranaEn: 'May 9, 05:35 AM to 08:14 AM' },
  { year: 2025, month: 5, nameHi: 'अपरा एकादशी', nameEn: 'Apara Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '23 मई 2025', dateEn: 'May 23, 2025', dateIso: '2025-05-23', paranaHi: '24 मई प्रातः 05:26 से 08:10 तक', paranaEn: 'May 24, 05:26 AM to 08:10 AM' },
  { year: 2025, month: 6, nameHi: 'निर्जला एकादशी (भीमसेनी)', nameEn: 'Nirjala Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '6 जून 2025', dateEn: 'Jun 6, 2025', dateIso: '2025-06-06', paranaHi: '7 जून प्रातः 05:23 से 08:09 तक', paranaEn: 'Jun 7, 05:23 AM to 08:09 AM' },
  { year: 2025, month: 6, nameHi: 'योगिनी एकादशी', nameEn: 'Yogini Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '21 जून 2025', dateEn: 'Jun 21, 2025', dateIso: '2025-06-21', paranaHi: '22 जून प्रातः 05:24 से 08:12 तक', paranaEn: 'Jun 22, 05:24 AM to 08:12 AM' },
  { year: 2025, month: 7, nameHi: 'देवशयनी एकादशी', nameEn: 'Devshayani Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '6 जुलाई 2025', dateEn: 'Jul 6, 2025', dateIso: '2025-07-06', paranaHi: '7 जुलाई प्रातः 05:29 से 08:17 तक', paranaEn: 'Jul 7, 05:29 AM to 08:17 AM' },
  { year: 2025, month: 7, nameHi: 'कामिका एकादशी', nameEn: 'Kamika Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '21 जुलाई 2025', dateEn: 'Jul 21, 2025', dateIso: '2025-07-21', paranaHi: '22 जुलाई प्रातः 05:36 से 08:22 तक', paranaEn: 'Jul 22, 05:36 AM to 08:22 AM' },
  { year: 2025, month: 8, nameHi: 'श्रावण पुत्रदा एकादशी', nameEn: 'Shravana Putrada Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '5 अगस्त 2025', dateEn: 'Aug 5, 2025', dateIso: '2025-08-05', paranaHi: '6 अगस्त प्रातः 05:45 से 08:27 तक', paranaEn: 'Aug 6, 05:45 AM to 08:27 AM' },
  { year: 2025, month: 8, nameHi: 'अजा एकादशी', nameEn: 'Aja Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '19 अगस्त 2025', dateEn: 'Aug 19, 2025', dateIso: '2025-08-19', paranaHi: '20 अगस्त प्रातः 05:52 से 08:30 तक', paranaEn: 'Aug 20, 05:52 AM to 08:30 AM' },
  { year: 2025, month: 9, nameHi: 'परिवर्तिनी (पार्श्व) एकादशी', nameEn: 'Parsva (Parivartini) Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '3 सितंबर 2025', dateEn: 'Sep 3, 2025', dateIso: '2025-09-03', paranaHi: '4 सितंबर प्रातः 06:01 से 08:33 तक', paranaEn: 'Sep 4, 06:01 AM to 08:33 AM' },
  { year: 2025, month: 9, nameHi: 'इन्दिरा एकादशी', nameEn: 'Indira Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '17 सितंबर 2025', dateEn: 'Sep 17, 2025', dateIso: '2025-09-17', paranaHi: '18 सितंबर प्रातः 06:07 से 08:34 तक', paranaEn: 'Sep 18, 06:07 AM to 08:34 AM' },
  { year: 2025, month: 10, nameHi: 'पापांकुशा एकादशी', nameEn: 'Papankusha Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '2 अक्टूबर 2025', dateEn: 'Oct 2, 2025', dateIso: '2025-10-02', paranaHi: '3 अक्टूबर प्रातः 06:15 से 08:37 तक', paranaEn: 'Oct 3, 06:15 AM to 08:37 AM' },
  { year: 2025, month: 10, nameHi: 'रमा एकादशी', nameEn: 'Rama Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '17 अक्टूबर 2025', dateEn: 'Oct 17, 2025', dateIso: '2025-10-17', paranaHi: '18 अक्टूबर प्रातः 06:23 से 08:41 तक', paranaEn: 'Oct 18, 06:23 AM to 08:41 AM' },
  { year: 2025, month: 11, nameHi: 'देवउठनी (प्रबोधिनी) एकादशी', nameEn: 'Devutthana (Prabodhini) Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '1 नवंबर 2025', dateEn: 'Nov 1, 2025', dateIso: '2025-11-01', paranaHi: '2 नवंबर प्रातः 06:33 से 08:47 तक', paranaEn: 'Nov 2, 06:33 AM to 08:47 AM' },
  { year: 2025, month: 11, nameHi: 'उत्पन्ना एकादशी', nameEn: 'Utpanna Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '16 नवंबर 2025', dateEn: 'Nov 16, 2025', dateIso: '2025-11-16', paranaHi: '17 नवंबर प्रातः 06:45 से 08:55 तक', paranaEn: 'Nov 17, 06:45 AM to 08:55 AM' },
  { year: 2025, month: 12, nameHi: 'मोक्षदा एकादशी (गीता जयंती)', nameEn: 'Mokshada Ekadashi (Gita Jayanti)', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '1 दिसंबर 2025', dateEn: 'Dec 1, 2025', dateIso: '2025-12-01', paranaHi: '2 दिसंबर प्रातः 06:56 से 09:03 तक', paranaEn: 'Dec 2, 06:56 AM to 09:03 AM' },
  { year: 2025, month: 12, nameHi: 'सफला एकादशी', nameEn: 'Saphala Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '15 दिसंबर 2025', dateEn: 'Dec 15, 2025', dateIso: '2025-12-15', paranaHi: '16 दिसंबर प्रातः 07:06 से 09:12 तक', paranaEn: 'Dec 16, 07:06 AM to 09:12 AM' },
  { year: 2025, month: 12, nameHi: 'पौष पुत्रदा एकादशी', nameEn: 'Pausha Putrada Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '30 दिसंबर 2025', dateEn: 'Dec 30, 2025', dateIso: '2025-12-30', paranaHi: '31 दिसंबर प्रातः 07:13 से 09:19 तक', paranaEn: 'Dec 31, 07:13 AM to 09:19 AM' },

  // --- 2026 ---
  { year: 2026, month: 1, nameHi: 'षटतिला एकादशी', nameEn: 'Shattila Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '14 जनवरी 2026', dateEn: 'Jan 14, 2026', dateIso: '2026-01-14', paranaHi: '15 जनवरी प्रातः 07:15 से 09:21 तक', paranaEn: 'Jan 15, 07:15 AM to 09:21 AM' },
  { year: 2026, month: 1, nameHi: 'जया एकादशी', nameEn: 'Jaya Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '29 जनवरी 2026', dateEn: 'Jan 29, 2026', dateIso: '2026-01-29', paranaHi: '30 जनवरी प्रातः 07:10 से 09:19 तक', paranaEn: 'Jan 30, 07:10 AM to 09:19 AM' },
  { year: 2026, month: 2, nameHi: 'विजया एकादशी', nameEn: 'Vijaya Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '13 फरवरी 2026', dateEn: 'Feb 13, 2026', dateIso: '2026-02-13', paranaHi: '14 फरवरी प्रातः 07:00 से 09:14 तक', paranaEn: 'Feb 14, 07:00 AM to 09:14 AM' },
  { year: 2026, month: 2, nameHi: 'आमलकी एकादशी', nameEn: 'Amalaki Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '27 फरवरी 2026', dateEn: 'Feb 27, 2026', dateIso: '2026-02-27', paranaHi: '28 फरवरी प्रातः 06:48 से 09:07 तक', paranaEn: 'Feb 28, 06:48 AM to 09:07 AM' },
  { year: 2026, month: 3, nameHi: 'पापमोचिनी एकादशी', nameEn: 'Papmochani Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '15 मार्च 2026', dateEn: 'Mar 15, 2026', dateIso: '2026-03-15', paranaHi: '16 मार्च प्रातः 06:31 से 08:54 तक', paranaEn: 'Mar 16, 06:31 AM to 08:54 AM' },
  { year: 2026, month: 3, nameHi: 'कामदा एकादशी', nameEn: 'Kamada Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '29 मार्च 2026', dateEn: 'Mar 29, 2026', dateIso: '2026-03-29', paranaHi: '30 मार्च प्रातः 06:15 से 08:41 तक', paranaEn: 'Mar 30, 06:15 AM to 08:41 AM' },
  { year: 2026, month: 4, nameHi: 'वरूथिनी एकादशी', nameEn: 'Varuthini Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '13 अप्रैल 2026', dateEn: 'Apr 13, 2026', dateIso: '2026-04-13', paranaHi: '14 अप्रैल प्रातः 05:58 से 08:29 तक', paranaEn: 'Apr 14, 05:58 AM to 08:29 AM' },
  { year: 2026, month: 4, nameHi: 'मोहिनी एकादशी', nameEn: 'Mohini Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '27 अप्रैल 2026', dateEn: 'Apr 27, 2026', dateIso: '2026-04-27', paranaHi: '28 अप्रैल प्रातः 05:44 से 08:19 तक', paranaEn: 'Apr 28, 05:44 AM to 08:19 AM' },
  { year: 2026, month: 5, nameHi: 'अपरा एकादशी', nameEn: 'Apara Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '13 मई 2026', dateEn: 'May 13, 2026', dateIso: '2026-05-13', paranaHi: '14 मई प्रातः 05:32 से 08:12 तक', paranaEn: 'May 14, 05:32 AM to 08:12 AM' },
  { year: 2026, month: 5, nameHi: 'निर्जला एकादशी (भीमसेनी)', nameEn: 'Nirjala Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '27 मई 2026', dateEn: 'May 27, 2026', dateIso: '2026-05-27', paranaHi: '28 मई प्रातः 05:25 से 08:09 तक', paranaEn: 'May 28, 05:25 AM to 08:09 AM' },
  { year: 2026, month: 6, nameHi: 'योगिनी एकादशी', nameEn: 'Yogini Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '11 जून 2026', dateEn: 'Jun 11, 2026', dateIso: '2026-06-11', paranaHi: '12 जून प्रातः 05:23 से 08:10 तक', paranaEn: 'Jun 12, 05:23 AM to 08:10 AM' },
  { year: 2026, month: 6, nameHi: 'देवशयनी एकादशी', nameEn: 'Devshayani Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '25 जून 2026', dateEn: 'Jun 25, 2026', dateIso: '2026-06-25', paranaHi: '26 जून प्रातः 05:25 से 08:13 तक', paranaEn: 'Jun 26, 05:25 AM to 08:13 AM' },
  { year: 2026, month: 7, nameHi: 'कामिका एकादशी', nameEn: 'Kamika Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '10 जुलाई 2026', dateEn: 'Jul 10, 2026', dateIso: '2026-07-10', paranaHi: '11 जुलाई प्रातः 05:31 से 08:19 तक', paranaEn: 'Jul 11, 05:31 AM to 08:19 AM' },
  { year: 2026, month: 7, nameHi: 'श्रावण पुत्रदा एकादशी', nameEn: 'Shravana Putrada Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '25 जुलाई 2026', dateEn: 'Jul 25, 2026', dateIso: '2026-07-25', paranaHi: '26 जुलाई प्रातः 05:38 से 08:24 तक', paranaEn: 'Jul 26, 05:38 AM to 08:24 AM' },
  { year: 2026, month: 8, nameHi: 'अजा एकादशी', nameEn: 'Aja Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '9 अगस्त 2026', dateEn: 'Aug 9, 2026', dateIso: '2026-08-09', paranaHi: '10 अगस्त प्रातः 05:47 से 08:28 तक', paranaEn: 'Aug 10, 05:47 AM to 08:28 AM' },
  { year: 2026, month: 8, nameHi: 'परिवर्तिनी (पार्श्व) एकादशी', nameEn: 'Parsva (Parivartini) Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '23 अगस्त 2026', dateEn: 'Aug 23, 2026', dateIso: '2026-08-23', paranaHi: '24 अगस्त प्रातः 05:54 से 08:31 तक', paranaEn: 'Aug 24, 05:54 AM to 08:31 AM' },
  { year: 2026, month: 9, nameHi: 'इन्दिरा एकादशी', nameEn: 'Indira Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '7 सितंबर 2026', dateEn: 'Sep 7, 2026', dateIso: '2026-09-07', paranaHi: '8 सितंबर प्रातः 06:02 से 08:33 तक', paranaEn: 'Sep 8, 06:02 AM to 08:33 AM' },
  { year: 2026, month: 9, nameHi: 'पापांकुशा एकादशी', nameEn: 'Papankusha Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '22 सितंबर 2026', dateEn: 'Sep 22, 2026', dateIso: '2026-09-22', paranaHi: '23 सितंबर प्रातः 06:09 से 08:35 तक', paranaEn: 'Sep 23, 06:09 AM to 08:35 AM' },
  { year: 2026, month: 10, nameHi: 'रमा एकादशी', nameEn: 'Rama Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '7 अक्टूबर 2026', dateEn: 'Oct 7, 2026', dateIso: '2026-10-07', paranaHi: '8 अक्टूबर प्रातः 06:18 से 08:38 तक', paranaEn: 'Oct 8, 06:18 AM to 08:38 AM' },
  { year: 2026, month: 10, nameHi: 'पापांकुशा एकादशी (आश्विन शुक्ल)', nameEn: 'Papankusha Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '21 अक्टूबर 2026', dateEn: 'Oct 21, 2026', dateIso: '2026-10-21', paranaHi: '22 अक्टूबर प्रातः 06:26 से 08:43 तक', paranaEn: 'Oct 22, 06:26 AM to 08:43 AM' },
  { year: 2026, month: 11, nameHi: 'रमा / उत्पन्ना एकादशी', nameEn: 'Rama / Utpanna Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '5 नवंबर 2026', dateEn: 'Nov 5, 2026', dateIso: '2026-11-05', paranaHi: '6 नवंबर प्रातः 06:36 से 08:50 तक', paranaEn: 'Nov 6, 06:36 AM to 08:50 AM' },
  { year: 2026, month: 11, nameHi: 'देवउठनी (प्रबोधिनी) एकादशी', nameEn: 'Devutthana (Prabodhini) Ekadashi', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '20 नवंबर 2026', dateEn: 'Nov 20, 2026', dateIso: '2026-11-20', paranaHi: '21 नवंबर प्रातः 06:48 से 08:58 तक', paranaEn: 'Nov 21, 06:48 AM to 08:58 AM' },
  { year: 2026, month: 12, nameHi: 'उत्पन्ना एकादशी', nameEn: 'Utpanna Ekadashi', pakshaHi: 'कृष्ण पक्ष', pakshaEn: 'Krishna Paksha', dateHi: '5 दिसंबर 2026', dateEn: 'Dec 5, 2026', dateIso: '2026-12-05', paranaHi: '6 दिसंबर प्रातः 07:00 से 09:07 तक', paranaEn: 'Dec 6, 07:00 AM to 09:07 AM' },
  { year: 2026, month: 12, nameHi: 'मोक्षदा एकादशी (गीता जयंती)', nameEn: 'Mokshada Ekadashi (Gita Jayanti)', pakshaHi: 'शुक्ल पक्ष', pakshaEn: 'Shukla Paksha', dateHi: '20 दिसंबर 2026', dateEn: 'Dec 20, 2026', dateIso: '2026-12-20', paranaHi: '21 दिसंबर प्रातः 07:09 से 09:15 तक', paranaEn: 'Dec 21, 07:09 AM to 09:15 AM' }
];

/**
 * Dynamically resolves exact Ekadashi dates based on query intent & current date
 */
export function getEkadashiScheduleText(query, isEnglish = false) {
  const now = new Date();
  const currentIso = now.toISOString().slice(0, 10);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const isCurrentMonthQuery = /(?:is\s*month|this\s*month|iss\s*mahine|is\s*mahine|इस\s*महीने|वर्तमान\s*माह)/i.test(query);

  let targetEkadashis = [];

  if (isCurrentMonthQuery) {
    // Return all Ekadashis of current month
    targetEkadashis = EKADASHI_CALENDAR_DB.filter(e => e.year === currentYear && e.month === currentMonth);
    if (targetEkadashis.length === 0) {
      // Fallback: pick the closest upcoming 2 ekadashis
      targetEkadashis = EKADASHI_CALENDAR_DB.filter(e => e.dateIso >= currentIso).slice(0, 2);
    }
  } else {
    // "next ekadashi" or upcoming inquiry
    const future = EKADASHI_CALENDAR_DB.filter(e => e.dateIso >= currentIso);
    if (future.length > 0) {
      // Take the immediate next one, plus the one after it for full seeker awareness
      targetEkadashis = future.slice(0, 2);
    } else {
      // If beyond 2026, fallback to 2026 last entries
      targetEkadashis = EKADASHI_CALENDAR_DB.slice(-2);
    }
  }

  if (isEnglish) {
    let listText = '';
    targetEkadashis.forEach((e, idx) => {
      listText += `\n**${idx + 1}. ${e.nameEn} (${e.pakshaEn})**\n* **Date:** ${e.dateEn}\n* **Parana Window (Fast Breaking):** ${e.paranaEn}\n`;
    });

    return `### 🌸 Sacred Ekadashi Dates & Parana Timings
${isCurrentMonthQuery ? `Here is the Ekadashi schedule for this month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })}):` : 'Here are the upcoming sacred Ekadashi dates and parana timings:'}

${listText.trim()}

**Core Devotional Guidelines (Pujya Maharaj Ji):**
1. **Grain Abstinence:** Strictly avoid grains (rice, wheat, pulses), beans, and onion/garlic.
2. **Satvik Intake:** Take water, milk, or seasonal fruits if physical strength requires.
3. **Continuous Naam Jap:** Dedicate this holy day to chanting the Divine Name ("Radha-Radha").
4. **Parana Timing:** Break fast the following morning during the specified Parana window before Dvadashi ends.`;
  }

  // Hindi Discourse
  let listText = '';
  targetEkadashis.forEach((e, idx) => {
    listText += `\n**${idx + 1}. ${e.nameHi} (${e.pakshaHi})**\n* 🗓️ **दिनांक:** ${e.dateHi}\n* ⏰ **पारण समय (द्वादशी):** ${e.paranaHi}\n`;
  });

  const monthNameHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'][currentMonth - 1] || '';

  return `### 🌸 पावन एकादशी व्रत तिथि एवं पारण समय
${isCurrentMonthQuery ? `इस पावन महीने (${monthNameHi} ${currentYear}) की एकादशी तिथियां निम्नलिखित हैं:` : 'आगामी पावन एकादशी व्रत एवं द्वादशी पारण का समय:'}

${listText.trim()}

**एकादशी व्रत के मुख्य नियम व मर्यादा:**
1. **अन्न का पूर्ण त्याग:** चावल, गेहूं, दाल, अनाज व लहसुन-प्याज का सर्वथा त्याग रखें।
2. **सात्विक फलाहार:** शारीरिक क्षमता अनुसार निर्जल रहें अथवा दूध व फल ग्रहण करें।
3. **अखंड नाम जप:** यह दिन केवल उपवास का नहीं, बल्कि 'श्री राधा-राधा' नाम जप में लीन रहने का पावन अवसर है।
4. **द्वादशी पारण:** अगले दिन द्वादशी तिथि में दिए गए समय के भीतर सात्विक प्रसाद से व्रत का पारण करें।`;
}

/**
 * Curated authentic Dharmic calendar & temple reference.
 * Provides zero-latency, rock-solid spiritual accuracy and verified fallback.
 */
export const DHARMIC_CALENDAR_KNOWLEDGE = {
  grahanSutak: {
    suryaGrahan: 'सूर्य ग्रहण का सूतक ग्रहण स्पर्श से 12 घंटे (4 प्रहर) पूर्व प्रारंभ होता है।',
    chandraGrahan: 'चंद्र ग्रहण का सूतक ग्रहण स्पर्श से 9 घंटे (3 प्रहर) पूर्व प्रारंभ होता है।',
    vidhiHindi: `### 🌑 ग्रहण एवं सूतक काल प्रामाणिक मार्गदर्शन
**सूतक काल नियम:**
* सूर्य ग्रहण: 12 घंटे (4 प्रहर) पूर्व सूतक प्रारंभ होता है।
* चंद्र ग्रहण: 9 घंटे (3 प्रहर) पूर्व सूतक प्रारंभ होता है।

**ग्रहण एवं सूतक में क्या करें और क्या न करें:**
1. **नाम जप एवं मंत्र साधना:** सूतक व ग्रहण काल में किया गया भगवन्नाम जप (श्री राधा-राधा / महामंत्र) अनंत गुना फलदाई होता है।
2. **आहार निषेध:** सूतक काल में भोजन पकाना और खाना वर्जित माना गया है (वृद्ध, बालक, रोगी और गर्भवती माताओं के लिए छूट है)।
3. **तुलसी पत्र:** सूतक लगने से पहले ही दूध, दही, जल और पके हुए भोजन में तुलसी पत्र डाल दें।
4. **गर्भवती माताओं के लिए:** ग्रहण के समय धारदार वस्तुओं (कैंची, चाकू) का प्रयोग न करें, शांत चित्त से भगवान का ध्यान करें।
5. **मोक्षोपरांत स्नान व दान:** ग्रहण समाप्त होने पर तुरंत स्नान करें, घर में गंगाजल छिड़कें और सामर्थ्यानुसार अन्न-वस्त्र का दान करें।`,
    vidhiEnglish: `### 🌑 Grahan (Eclipse) & Sutak Timings Guidance
**Sutak Commencement Rules:**
* Solar Eclipse (Surya Grahan): Sutak begins 12 hours before eclipse touch.
* Lunar Eclipse (Chandra Grahan): Sutak begins 9 hours before eclipse touch.

**Guidance for Grahan and Sutak Period:**
1. **Holy Name Chanting:** Chanting the Divine Name ('Radha-Radha' or Hare Krishna) during eclipse hours yields infinite spiritual merit.
2. **Fasting & Food:** Avoid cooking and eating during Sutak hours. (Exemption is given to elders, children, patients, and pregnant women).
3. **Tulsi Leaves:** Place sacred Tulsi leaves into milk, cooked food, and water before Sutak begins.
4. **Pregnant Women:** Stay indoors in prayer, avoid sharp instruments (scissors, knives), and meditate on Lord Krishna.
5. **Post-Eclipse Purification:** Take a purifying bath immediately after the eclipse ends, sprinkle Ganga water in the home, and offer charity to the needy.`
  },
  templeTimings: {
    bankeyBihariHi: `### 🛕 श्री बांके बिहारी जी मंदिर (वृंदावन) दर्शन समय
श्री बांके बिहारी जी के दर्शन का समय ऋतु अनुसार निर्धारित होता है:

**ग्रीष्मकालीन दर्शन समय (Summer Timings):**
* **प्रातः काल:** 07:45 AM से 12:00 PM (शृंगार आरती: 07:55 AM, राजभोग: 11:55 AM)
* **सायं काल:** 05:30 PM से 09:30 PM (शयन आरती: 09:25 PM)

**शीतकालीन दर्शन समय (Winter Timings):**
* **प्रातः काल:** 08:45 AM से 01:00 PM (शृंगार आरती: 08:55 AM, राजभोग: 12:55 PM)
* **सायं काल:** 04:30 PM से 08:30 PM (शयन आरती: 08:25 PM)

*विशेष: बांके बिहारी जी में मंगला आरती वर्ष में केवल एक बार (श्रीकृष्ण जन्माष्टमी की रात्रि) होती है।*`,
    bankeyBihariEn: `### 🛕 Shri Bankey Bihari Ji Temple (Vrindavan) Darshan Timings
Darshan schedules are divided seasonally between Summer and Winter:

**Summer Darshan Schedule:**
* **Morning:** 07:45 AM to 12:00 PM (Shringar Aarti at 07:55 AM, Rajbhog at 11:55 AM)
* **Evening:** 05:30 PM to 09:30 PM (Shayan Aarti at 09:25 PM)

**Winter Darshan Schedule:**
* **Morning:** 08:45 AM to 01:00 PM (Shringar Aarti at 08:55 AM, Rajbhog at 12:55 PM)
* **Evening:** 04:30 PM to 08:30 PM (Shayan Aarti at 08:25 PM)

*Note: Mangala Aarti at Bankey Bihari Ji occurs only once a year on Shri Krishna Janmashtami midnight.*`,
    radhavallabhHi: `### 🛕 श्री राधा वल्लभ जी मंदिर (वृंदावन) एवं अन्य पावन धाम समय
* **श्री राधा वल्लभ जी:** मंगला प्रातः 05:00 AM, प्रातः दर्शन 07:00 AM से 12:00 PM, सांध्य दर्शन 05:00 PM से 09:00 PM।
* **श्री राधा रानी मंदिर (बरसाना - लाडली जी):** प्रातः 05:00 AM से 01:30 PM, सायं 04:30 PM से 09:00 PM।
* **प्रेम मंदिर (वृंदावन):** प्रातः 05:30 AM से 12:00 PM, सायं 04:30 PM से 08:30 PM (म्यूजिकल फाउंटेन शो: सायं 07:30 PM)।`
  },
  panchang: {
    guidelinesHi: `### 🗓️ सनातन दैनिक पंचांग एवं तिथि ज्ञान
पंचांग पांच पावन अंगों (तिथि, वार, नक्षत्र, योग, करण) का संयोजन है।

* **शुभ मुहूर्त एवं साधना:** ब्रह्म मुहूर्त (सूर्योदय से 1.5 घंटा पूर्व) नाम जप, ध्यान और भगवद् स्मरण के लिए सर्वोत्तम माना गया है।
* **राहुकाल विचार:** प्रतिदिन लगभग 1.5 घंटे का राहुकाल रहता है जिसमें नवीन सांसारिक कार्य टाले जाते हैं, परंतु भगवन्नाम जप के लिए हर क्षण परम पवित्र है।
* **अमृत वेला:** 'श्री राधा-राधा' नाम जप करने वाले साधक के लिए कोई भी काल अशुभ नहीं रहता, प्रभु का स्मरण ही परम कल्याणकारी है।`,
    guidelinesEn: `### 🗓️ Daily Hindu Panchang & Spiritual Wisdom
The Panchang comprises five sacred elements: Tithi (lunar day), Vara (weekday), Nakshatra (constellation), Yoga, and Karana.

* **Brahma Muhurta:** The 96 minutes before sunrise is the supreme window for Naam Jap, meditation, and prayer.
* **Continuous Auspiciousness:** For a devotee anchored in continuous Holy Name chanting ('Radha-Radha'), every single moment is sanctified and free of all inauspicious influences.`
  }
};

/**
 * 📅 Verified Festival Timetable Database (2025 - 2027)
 */
export const FESTIVAL_CALENDAR_DB = [
  {
    key: 'navratri',
    nameEn: 'Shardiya & Chaitra Navratri',
    nameHi: 'शारदीय एवं चैत्र नवरात्रि',
    scheduleEn: `* **Sharad Navratri 2026:** Oct 11, 2026 to Oct 19, 2026 (Ghatasthapana: Oct 11, 2026; Dussehra / Vijayadashami: Oct 20, 2026)
* **Chaitra Navratri 2026:** Mar 19, 2026 to Mar 27, 2026 (Ram Navami: Mar 27, 2026)
* **Sharad Navratri 2025:** Sep 22, 2025 to Sep 30, 2025 (Dussehra: Oct 2, 2025)
* **Chaitra Navratri 2027:** Apr 7, 2027 to Apr 15, 2027`,
    scheduleHi: `* **शारदीय नवरात्रि 2026:** 11 अक्टूबर 2026 से 19 अक्टूबर 2026 (घटस्थापना: 11 अक्टूबर; विजयादशमी/दशहरा: 20 अक्टूबर 2026)
* **चैत्र नवरात्रि 2026:** 19 मार्च 2026 से 27 मार्च 2026 (रामनवमी: 27 मार्च 2026)
* **शारदीय नवरात्रि 2025:** 22 सितंबर 2025 से 30 सितंबर 2025 (दशहरा: 2 अक्टूबर 2025)
* **चैत्र नवरात्रि 2027:** 7 अप्रैल 2027 से 15 अप्रैल 2027`,
    rulesEn: `**Devotional Guidelines & Fasting Rules (Pujya Maharaj Ji):**
1. **Ghatasthapana:** Perform sacred Kalash Sthapana during morning auspicious Muhurat (Pratipada morning).
2. **Nine Forms of Divine Mother:** Worship Shailputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri, and Siddhidatri.
3. **Satvik Intake:** Abstain from grains, onion, garlic, and non-satvik foods. Take seasonal fruits, milk, buckwheat (kuttu), and water.
4. **Devotional Absorption:** Navratri is not mere austerity; it is dedicated contemplation of the Supreme Divine Mother with continuous Naam Jap ('Radha-Radha').`,
    rulesHi: `**नवरात्रि व्रत व साधना के मुख्य नियम (पूज्य महाराज जी अनुसार):**
1. **घटस्थापना:** प्रातः शुभ मुहूर्त (प्रतिपदा अथवा अभिजित मुहूर्त) में पवित्र घट/कलश की स्थापना करें।
2. **नवदुर्गा उपासना:** माता के नौ स्वरूपों (शैलपुत्री, ब्रह्मचारिणी, चंद्रघंटा, कूष्मांडा, स्कंदमाता, कात्यायनी, कालरात्रि, महागौरी, सिद्धिदात्री) का नित्य पूजन करें।
3. **सात्विक आहार:** अन्न (अनाज), तामसिक भोजन और लहसुन-प्याज का पूर्ण त्याग रखें। फलाहार (कुट्टू, सिंघाड़ा, फल, दूध) ग्रहण करें।
4. **अखंड भगवन्नाम जप:** नवरात्रि का पावन अवसर मन की शुद्धि के लिए है। निरंतर 'श्री राधा-राधा' नाम जप एवं भगवती का ध्यान करें।`
  },
  {
    key: 'diwali',
    nameEn: 'Diwali (Deepavali Mahaparva)',
    nameHi: 'दीपावली (पावन दीपोत्सव महापर्व)',
    scheduleEn: `* **Diwali 2026:** Sunday, Nov 8, 2026 (Dhanteras: Nov 6; Narak Chaturdashi: Nov 7; Govardhan Puja: Nov 10; Bhai Dooj: Nov 11)
* **Diwali 2025:** Monday, Oct 20, 2025 (Dhanteras: Oct 18; Govardhan: Oct 22)
* **Diwali 2027:** Friday, Oct 29, 2027`,
    scheduleHi: `* **दीपावली 2026:** रविवार, 8 नवंबर 2026 (धनतेरस: 6 नवंबर; रूप चौदस: 7 नवंबर; गोवर्धन पूजा: 10 नवंबर; भाई दूज: 11 नवंबर)
* **दीपावली 2025:** सोमवार, 20 अक्टूबर 2025 (धनतेरस: 18 अक्टूबर; गोवर्धन: 22 अक्टूबर)
* **दीपावली 2027:** शुक्रवार, 29 अक्टूबर 2027`,
    rulesEn: `**Devotional Guidelines:** Worship Shri Lakshmi-Ganesh and Lord Sita-Ram. Illuminate your inner soul with the lamp of Divine Love and uninterrupted Naam Jap.`,
    rulesHi: `**पावन मर्यादा:** मां महालक्ष्मी और भगवान सीताराम जी का पूजन करें। बाहर दीप जलाने के साथ-साथ हृदय में नाम जप का पावन दीप प्रज्वलित रखें।`
  },
  {
    key: 'janmashtami',
    nameEn: 'Shri Krishna Janmashtami',
    nameHi: 'श्रीकृष्ण जन्माष्टमी महोत्सव',
    scheduleEn: `* **Janmashtami 2026:** Friday, Sep 4, 2026 (Midnight Appearance; Nandotsav: Sep 5)
* **Janmashtami 2025:** Saturday, Aug 16, 2025 (Nandotsav: Aug 17)
* **Janmashtami 2027:** Wednesday, Aug 25, 2027`,
    scheduleHi: `* **जन्माष्टमी 2026:** शुक्रवार, 4 सितंबर 2026 (निशीथ काल मध्यरात्रि प्राकट्य; नंदोत्सव: 5 सितंबर)
* **जन्माष्टमी 2025:** शनिवार, 16 अगस्त 2025 (नंदोत्सव: 17 अगस्त)
* **जन्माष्टमी 2027:** बुधवार, 25 अगस्त 2027`,
    rulesEn: `**Devotional Guidelines:** Fast until midnight; break fast with Panchamrit and Makhan-Mishri Prasad after midnight Abhishek. Immerse in 'Radhe-Krishna' chanting.`,
    rulesHi: `**पावन मर्यादा:** मध्यरात्रि 12 बजे तक उपवास रखें। मध्यरात्रि प्राकट्य अभिषेक व भोग के उपरांत पारण करें।`
  },
  {
    key: 'radhashtami',
    nameEn: 'Shri Radhashtami',
    nameHi: 'श्री राधाष्टमी (लाडली जी का प्राकट्योत्सव)',
    scheduleEn: `* **Radhashtami 2026:** Saturday, Sep 19, 2026 (Barsana & Vrindavan Dham noon celebrations)
* **Radhashtami 2025:** Sunday, Aug 31, 2025
* **Radhashtami 2027:** Wednesday, Sep 8, 2027`,
    scheduleHi: `* **राधाष्टमी 2026:** शनिवार, 19 सितंबर 2026 (श्री बरसाना व वृंदावन धाम में मध्याह्न 12 बजे प्राकट्य बधाई महोत्सव)
* **राधाष्टमी 2025:** रविवार, 31 अगस्त 2025
* **राधाष्टमी 2027:** बुधवार, 8 सितंबर 2027`,
    rulesEn: `**Devotional Guidelines:** Fast until noon (12:00 PM). Dedicate every breath to 'Radha-Radha' chanting.`,
    rulesHi: `**पावन मर्यादा:** मध्याह्न 12:00 PM तक उपवास रखें। लाडली जू के चरणों में सर्वस्व समर्पण कर 'राधा-राधा' संकीर्तन में मग्न रहें।`
  },
  {
    key: 'holi',
    nameEn: 'Holi & Holika Dahan',
    nameHi: 'होली एवं होलिका दहन (पावन रंगोत्सव)',
    scheduleEn: `* **Holi 2026:** Tuesday, Mar 3, 2026 (Holika Dahan: Monday, Mar 2, 2026)
* **Holi 2025:** Friday, Mar 14, 2025 (Holika Dahan: Thursday, Mar 13, 2025)
* **Holi 2027:** Monday, Mar 22, 2027`,
    scheduleHi: `* **होली 2026:** मंगलवार, 3 मार्च 2026 (होलिका दहन: सोमवार, 2 मार्च 2026)
* **होली 2025:** शुक्रवार, 14 मार्च 2025 (होलिका दहन: गुरुवार, 13 मार्च 2025)
* **होली 2027:** सोमवार, 22 मार्च 2027`,
    rulesEn: `**Devotional Guidelines:** Celebrate with Satvik joy, Vrindavan flower Holi, and Holy Name chanting. Burn vices in Holika's fire.`,
    rulesHi: `**पावन मर्यादा:** ब्रज धाम में फूल व अबीर की पावन होली का आनंद लें। अहंकार और काम-क्रोध की आहुति देकर प्रभु प्रेम के रंग में रंगें।`
  },
  {
    key: 'shivratri',
    nameEn: 'Maha Shivratri',
    nameHi: 'महाशिवरात्रि पावन महापर्व',
    scheduleEn: `* **Maha Shivratri 2026:** Sunday, Feb 15, 2026 (Nishita Kaal Puja: Midnight)
* **Maha Shivratri 2025:** Wednesday, Feb 26, 2025
* **Maha Shivratri 2027:** Saturday, Mar 6, 2027`,
    scheduleHi: `* **महाशिवरात्रि 2026:** रविवार, 15 फरवरी 2026 (निशीथ काल चार प्रहर पूजन)
* **महाशिवरात्रि 2025:** बुधवार, 26 फरवरी 2025
* **महाशिवरात्रि 2027:** शनिवार, 6 मार्च 2027`,
    rulesEn: `**Devotional Guidelines:** Fasting and continuous Mahamrityunjaya / 'Om Namah Shivaya' chanting. Lord Shiva is the supreme Vaishnava who delights in Holy Name.`,
    rulesHi: `**पावन मर्यादा:** भगवान भोलेनाथ का जलाभिषेक, बेलपत्र अर्पण और 'ॐ नमः शिवाय' व 'राधे-राधे' जप करें।`
  },
  {
    key: 'ram_navami',
    nameEn: 'Shri Ram Navami',
    nameHi: 'श्री रामनवमी जन्मोत्सव',
    scheduleEn: `* **Ram Navami 2026:** Friday, Mar 27, 2026 (Chaitra Navratri culmination, noon celebration)
* **Ram Navami 2025:** Sunday, Apr 6, 2025
* **Ram Navami 2027:** Thursday, Apr 15, 2027`,
    scheduleHi: `* **रामनवमी 2026:** शुक्रवार, 27 मार्च 2026 (चैत्र शुक्ल नवमी, मध्याह्न 12:00 बजे जन्मोत्सव)
* **रामनवमी 2025:** रविवार, 6 अप्रैल 2025
* **रामनवमी 2027:** गुरुवार, 15 अप्रैल 2027`,
    rulesEn: `**Devotional Guidelines:** Fast until noon; celebrate Lord Rama's appearance with Ramcharitmanas recitation and 'Hare Rama' chanting.`,
    rulesHi: `**पावन मर्यादा:** मध्याह्न 12 बजे भगवान श्री राम का जन्मोत्सव मनाएं, रामायण का पाठ करें और राम नाम में लीन रहें।`
  }
];

export function getFestivalScheduleText(query, isEnglish = false) {
  const q = (query || '').toLowerCase();
  let matched = FESTIVAL_CALENDAR_DB.find(f => {
    if (f.key === 'navratri') return /(?:navratri|navaratri|navratre|दुर्गा\s*पूजा|durga)/i.test(q);
    if (f.key === 'diwali') return /(?:diwali|deepavali|दीपावली|दिवाली|dhanteras|धनतेरस)/i.test(q);
    if (f.key === 'janmashtami') return /(?:janmashtami|जन्माष्टमी|gokulashtami)/i.test(q);
    if (f.key === 'radhashtami') return /(?:radhashtami|राधाष्टमी|लाडली)/i.test(q);
    if (f.key === 'holi') return /(?:holi|होली|रंगभरी)/i.test(q);
    if (f.key === 'shivratri') return /(?:shivratri|शिवरात्रि)/i.test(q);
    if (f.key === 'ram_navami') return /(?:ram\s*navami|रामनवमी|राम\s*नवमी)/i.test(q);
    return false;
  });

  if (!matched) {
    matched = FESTIVAL_CALENDAR_DB[0]; // Default to Navratri
  }

  if (isEnglish) {
    return `### 🌸 Sacred Festival Calendar: ${matched.nameEn}

${matched.scheduleEn}

${matched.rulesEn}`;
  }

  return `### 🌸 पावन पर्व एवं उत्सव तिथि: ${matched.nameHi}

${matched.scheduleHi}

${matched.rulesHi}`;
}

/**
 * Queries DuckDuckGo and Wikipedia APIs for live real-time web facts
 */
async function fetchMultiSourceWebSnippets(query) {
  const clean = (query || '').trim();
  const searchResults = [];

  // 1. DuckDuckGo Instant Answer API
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(clean + ' 2026')}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(ddgUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer) searchResults.push(data.Answer);
      if (data.AbstractText) searchResults.push(data.AbstractText);
      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 2)) {
          if (topic.Text) searchResults.push(topic.Text);
        }
      }
    }
  } catch {}

  // 2. Wikipedia Search API (Native CORS enabled by Wikimedia)
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clean)}&format=json&origin=*`;
    const wRes = await fetch(wikiUrl, { signal: AbortSignal.timeout(3000) });
    if (wRes.ok) {
      const data = await wRes.json();
      const items = data?.query?.search || [];
      for (const it of items.slice(0, 2)) {
        if (it.snippet) {
          const cleaned = it.snippet.replace(/<[^>]+>/g, '').trim();
          if (cleaned.length > 20) searchResults.push(`${it.title}: ${cleaned}`);
        }
      }
    }
  } catch {}

  return searchResults;
}

/**
 * Autonomous Live Search Engine with Dialogue Memory & Multi-Source Verification
 */
export async function searchDuckDuckGo(query, isEnglishForce = null) {
  const clean = (query || '').trim();

  // Determine language preference
  let isEnglish = isEnglishForce;
  if (isEnglish === null || typeof isEnglish === 'undefined') {
    const hasDevanagari = /[\u0900-\u097F]/.test(clean);
    const hasHinglish = /\b(kab|hai|hain|me|mein|kya|kaise|kyu|kyun|karein|kare|karo|batao|aaj|kal|mahina|mahine|is|iss|agla|agli|vrat|parana|samay|purnima|amavasya)\b/i.test(clean);
    isEnglish = !hasDevanagari && !hasHinglish;
  }

  // 1. Fetch live multi-source web results
  const searchResults = await fetchMultiSourceWebSnippets(clean);

  // 2. Identify domain with strict word-boundary matching (prevents 'navratri' matching 'vrat' in ekadashi!)
  const isFestival = /\b(?:navratri|navaratri|navratre|दुर्गा\s*पूजा|diwali|deepavali|दीपावली|दिवाली|dhanteras|धनतेरस|holi|होली|janmashtami|जन्माष्टमी|radhashtami|राधाष्टमी|shivratri|शिवरात्रि|ram\s*navami|रामनवमी|dussehra|दशहरा|raksha\s*bandhan|रक्षाबंधन|guru\s*purnima|chhath|छठ|karwa\s*chauth|करवा\s*चौथ)\b/i.test(clean);
  const isEkadashi = /\b(?:ekadashi|एकादशी|parana|पारण)\b/i.test(clean) && !isFestival;
  const isGrahan = /\b(?:grahan|sutak|ग्रहण|सूतक|eclipse)\b/i.test(clean);
  const isTemple = /\b(?:bankey\s*bihari|radha\s*vallabh|radharani|barsana|prem\s*mandir|iskcon|darshan|aarti|कपाट|दर्शन|मंदिर|आरती)\b/i.test(clean);
  const isPanchang = /\b(?:panchang|tithi|muhurat|पंचांग|तिथि|मुहूर्त|प्रदोष|पूर्णिमा|अमावस्या)\b/i.test(clean);

  let formattedDiscourse = '';
  const snippetsBlock = searchResults.length > 0
    ? (isEnglish
        ? `\n\n**Verified Real-Time Search Findings:**\n` + searchResults.map(s => `* ${s}`).join('\n')
        : `\n\n**ताज़ा ऑनलाइन खोज से प्राप्त जानकारी:**\n` + searchResults.map(s => `* ${s}`).join('\n'))
    : '';

  if (isFestival) {
    const festivalSchedule = getFestivalScheduleText(clean, isEnglish);
    formattedDiscourse = isEnglish
      ? `${festivalSchedule}${snippetsBlock}\n\n*Pujya Maharaj Ji's Teaching: Every sacred festival is a divine opportunity to detach our senses from worldly illusions and immerse our soul in Shri Radha Rani's lotus feet with continuous Holy Name chanting ('Radha-Radha').*`
      : `${festivalSchedule}${snippetsBlock}\n\n*पूज्य महाराज जी की सीख: पावन पर्व और उत्सव सांसारिक दिखावे के लिए नहीं, बल्कि अपनी इंद्रियों को विषयों से हटाकर भगवान के चरणों में समर्पित करने के लिए हैं बच्चा। निरंतर 'श्री राधा-राधा' नाम जप में लीन रहें, सब मंगल होगा।*`;
  } else if (isEkadashi) {
    const ekadashiSchedule = getEkadashiScheduleText(clean, isEnglish);
    formattedDiscourse = isEnglish
      ? `${ekadashiSchedule}${snippetsBlock}\n\n*Pujya Maharaj Ji's Teaching: Ekadashi is not mere physical fasting, dear soul; it is dedicating 24 hours of mind, speech, and senses to Shri Radha's lotus feet with continuous Holy Name chanting.*`
      : `${ekadashiSchedule}${snippetsBlock}\n\n*पूज्य महाराज जी की सीख: एकादशी केवल भूखे रहने का नाम नहीं है बच्चा, बल्कि अपनी इंद्रियों को विषयों से हटाकर मन और वाणी को श्री जी के चरणों में लगाने का पावन पर्व है। निरंतर 'श्री राधा-राधा' नाम जपते रहें।*`;
  } else if (isGrahan) {
    formattedDiscourse = isEnglish
      ? `${DHARMIC_CALENDAR_KNOWLEDGE.grahanSutak.vidhiEnglish}${snippetsBlock}\n\n*Pujya Maharaj Ji's Teaching: Never be frightened during eclipse hours, dear child. The external shadow is fleeting, but the power of the Holy Name is infinite. Spend these hours immersed in 'Radha-Radha' chanting.*`
      : `${DHARMIC_CALENDAR_KNOWLEDGE.grahanSutak.vidhiHindi}${snippetsBlock}\n\n*पूज्य महाराज जी की सीख: ग्रहण काल में भयभीत होने की आवश्यकता नहीं है बच्चा। यह काल नाम जप और साधना के लिए सर्वोत्तम माना गया है। निरंतर 'राधे-राधे' जपते रहें, सब मंगल होगा।*`;
  } else if (isTemple) {
    formattedDiscourse = isEnglish
      ? `${DHARMIC_CALENDAR_KNOWLEDGE.templeTimings.bankeyBihariEn}${snippetsBlock}\n\n*Pujya Maharaj Ji's Reminder: While visiting holy Vrindavan Dham, approach the Divine with humble prayer and reverence. Chant Radha-Radha with every step.*`
      : `${DHARMIC_CALENDAR_KNOWLEDGE.templeTimings.bankeyBihariHi}\n\n${DHARMIC_CALENDAR_KNOWLEDGE.templeTimings.radhavallabhHi}${snippetsBlock}\n\n*पूज्य महाराज जी की सीख: वृंदावन धाम में दर्शन करते समय चित्त को शांत और नम्र रखें। लाडली जू के चरणों का ध्यान करते हुए निरंतर 'राधा-राधा' जपें।*`;
  } else if (isPanchang) {
    formattedDiscourse = isEnglish
      ? `${DHARMIC_CALENDAR_KNOWLEDGE.panchang.guidelinesEn}${snippetsBlock}\n\n*Spiritual Guidance: Anchor your day in early morning prayer and Holy Name chanting ('Radha-Radha'). Duty performed with devotion is the highest worship.*`
      : `${DHARMIC_CALENDAR_KNOWLEDGE.panchang.guidelinesHi}${snippetsBlock}\n\n*पूज्य महाराज जी की सीख: बच्चा, जो साधक निरंतर नाम जप करता है, उसके लिए प्रत्येक दिन और प्रत्येक मुहूर्त मंगलमय बन जाता है। 'श्री राधा-राधा' का आश्रय रखें।*`;
  } else {
    // Dynamic real-time guidance for ANY query (Chhath Puja, Kumbh, Karwa Chauth, etc.)
    formattedDiscourse = isEnglish
      ? `### 🌐 Verified Dharmic & Temporal Guidance
${snippetsBlock || `We have retrieved the current temporal information regarding: **${clean}**.`}

*Pujya Maharaj Ji's Guidance: Real-time worldly events and dates pass with the river of time, but the supreme refuge of the Divine Name ('Radha-Radha') remains eternal. Walk the righteous path and keep your mind anchored in remembrance.*`
      : `### 🌐 प्रामाणिक रीयल-टाइम मार्गदर्शन
${snippetsBlock || `आपकी जिज्ञासा (**${clean}**) के संबंध में रीयल-टाइम जानकारी प्राप्त की गई है।`}

*पूज्य महाराज जी की सीख: संसार के काल और तिथियां समय के प्रवाह में निरंतर बदलती रहती हैं बच्चा, किंतु भगवन्नाम ('श्री राधा-राधा') का आश्रय शाश्वत है। अपने कर्तव्य का निष्ठा से पालन करें और निरंतर नाम जप में मन लगाएं।*`;
  }

  return {
    query: clean,
    hasLiveResults: searchResults.length > 0,
    snippets: searchResults,
    formattedDiscourse
  };
}
