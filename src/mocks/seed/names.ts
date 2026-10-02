/**
 * Fictional name pools for seed generation. Deliberately NOT drawn from the
 * real names in docs/EMIS_Proposal.pdf's implementation-committee pages —
 * this prototype must not surface real people's personal phone numbers or
 * email addresses (brief §11). Every (bn, en) pair below is an invented
 * combination of common Bangladeshi given/family names.
 */

export interface NamePair {
  bn: string;
  en: string;
}

export const MALE_FIRST_NAMES: NamePair[] = [
  { bn: "নিজাম", en: "Nizam" },
  { bn: "আরিফুল", en: "Ariful" },
  { bn: "তানভীর", en: "Tanvir" },
  { bn: "রাকিবুল", en: "Rakibul" },
  { bn: "ফাহিম", en: "Fahim" },
  { bn: "সাইফুল", en: "Saiful" },
  { bn: "নাঈম", en: "Naeem" },
  { bn: "ইমরান", en: "Imran" },
  { bn: "তৌহিদ", en: "Touhid" },
  { bn: "রাসেল", en: "Rasel" },
  { bn: "সজীব", en: "Sajib" },
  { bn: "মাহমুদুল", en: "Mahmudul" },
  { bn: "শাহরিয়ার", en: "Shahriar" },
  { bn: "আশিকুর", en: "Ashikur" },
  { bn: "জাহিদুল", en: "Jahidul" },
  { bn: "রবিউল", en: "Robiul" },
  { bn: "মিনহাজুল", en: "Minhajul" },
  { bn: "নাজমুল", en: "Nazmul" },
  { bn: "ফরহাদ", en: "Forhad" },
  { bn: "ওয়াসিম", en: "Wasim" },
  { bn: "হাসিবুল", en: "Hasibul" },
  { bn: "রিয়াদ", en: "Riyad" },
  { bn: "শফিকুল", en: "Shafiqul" },
  { bn: "মেহেদী", en: "Mehedi" },
  { bn: "আল আমিন", en: "Al Amin" },
  { bn: "জুবায়ের", en: "Zubayer" },
  { bn: "সাকিব", en: "Sakib" },
  { bn: "কামরুল", en: "Kamrul" },
  { bn: "রফিকুল", en: "Rafiqul" },
  { bn: "এমরান", en: "Emran" },
  { bn: "তাজউদ্দিন", en: "Tajuddin" },
];

export const FEMALE_FIRST_NAMES: NamePair[] = [
  { bn: "ফারজানা", en: "Farzana" },
  { bn: "সুমাইয়া", en: "Sumaiya" },
  { bn: "তাসনিম", en: "Tasnim" },
  { bn: "নুসরাত", en: "Nusrat" },
  { bn: "মাহমুদা", en: "Mahmuda" },
  { bn: "সাবরিনা", en: "Sabrina" },
  { bn: "রুমানা", en: "Rumana" },
  { bn: "ইসরাত", en: "Israt" },
  { bn: "তানজিলা", en: "Tanjila" },
  { bn: "জান্নাতুল", en: "Jannatul" },
  { bn: "মারিয়া", en: "Maria" },
  { bn: "সানজিদা", en: "Sanjida" },
  { bn: "রাফিয়া", en: "Rafia" },
  { bn: "নাজনীন", en: "Nazneen" },
  { bn: "তাহমিনা", en: "Tahmina" },
  { bn: "সাদিয়া", en: "Sadia" },
  { bn: "লাবণ্য", en: "Labonno" },
  { bn: "মিথিলা", en: "Mithila" },
  { bn: "শারমিন", en: "Sharmin" },
  { bn: "আফসানা", en: "Afsana" },
];

export const SURNAMES: NamePair[] = [
  { bn: "ইসলাম", en: "Islam" },
  { bn: "হোসেন", en: "Hossain" },
  { bn: "রহমান", en: "Rahman" },
  { bn: "আহমেদ", en: "Ahmed" },
  { bn: "আলী", en: "Ali" },
  { bn: "খান", en: "Khan" },
  { bn: "সরকার", en: "Sarkar" },
  { bn: "মিয়া", en: "Mia" },
  { bn: "চৌধুরী", en: "Chowdhury" },
  { bn: "তালুকদার", en: "Talukder" },
  { bn: "আকন্দ", en: "Akand" },
  { bn: "মণ্ডল", en: "Mondol" },
  { bn: "প্রামাণিক", en: "Pramanik" },
  { bn: "ভূঁইয়া", en: "Bhuiyan" },
  { bn: "শেখ", en: "Sheikh" },
  { bn: "উদ্দিন", en: "Uddin" },
];

export const UPAZILA_PLACES: NamePair[] = [
  { bn: "শেরপুর সদর", en: "Sherpur Sadar" },
  { bn: "নকলা", en: "Nakla" },
  { bn: "নালিতাবাড়ী", en: "Nalitabari" },
  { bn: "ঝিনাইগাতী", en: "Jhenaigati" },
  { bn: "শ্রীবরদী", en: "Sreebardi" },
  { bn: "ভাতশালা", en: "Bhatshala" },
  { bn: "ময়মনসিংহ সদর", en: "Mymensingh Sadar" },
  { bn: "জামালপুর সদর", en: "Jamalpur Sadar" },
];

export function fullName(first: NamePair, last: NamePair): { bn: string; en: string } {
  return { bn: `${first.bn} ${last.bn}`, en: `${first.en} ${last.en}` };
}

export function initialsOf(nameEn: string): string {
  return nameEn
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
