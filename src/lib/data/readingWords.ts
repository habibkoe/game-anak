// This file is deprecated - data is now managed through the admin panel
// and stored in localStorage via the storage service
// Keeping this for backwards compatibility only

import type { GameWord } from "../types/game";

export const WORDS: GameWord[] = [
  {
    id: "word-1",
    text: "Anak bermain bola",
    imageSrc: "/images/anak_main_bola.png",
    groupId: "group-1",
    order: 1
  },
  {
    id: "word-2",
    text: "anak-anak main dengan kucing hitam dan putih",
    imageSrc: "/images/anak_main_kucing.png",
    groupId: "group-1",
    order: 2
  },
  {
    id: "word-3",
    text: "anak-anak makan bersama",
    imageSrc: "/images/anak_makan.png",
    groupId: "group-1",
    order: 3
  },
  {
    id: "word-4",
    text: "anak-anak memancing ikan di sungai",
    imageSrc: "/images/anak_mancing_ikan.png",
    groupId: "group-1",
    order: 4
  },
  {
    id: "word-5",
    text: "anak-anak menyebrang dengan hati-hati di jalan raya",
    imageSrc: "/images/anak_nyebrang_jalan.png",
    groupId: "group-1",
    order: 5
  }
];
