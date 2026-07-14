// Real dish photography — Vite resolves these to hashed, build-optimized URLs.
import ayamLalapanImg from "../assets/foods/ayam-lalapan.jpg";
import nasiGorengImg from "../assets/foods/nasi-goreng-kampung.jpg";
import sateTaichanImg from "../assets/foods/sate-taichan.jpg";
import buburAyamImg from "../assets/foods/bubur-ayam.jpg";
import cekodokImg from "../assets/foods/cekodok.jpg";

export type Dish = {
  id: string;
  name: string;
  pronunciation: string;
  /** Real dish photo (imported asset URL). */
  image: string;
  /** Hex pair for the dish's "flavor card" gradient (fallback / accent). */
  palette: [string, string];
};

/**
 * Structural data only — the localized text (region, tagline, story,
 * ingredients, pairing) lives under `culinary.dishes.<id>.*` in the locales,
 * so the same dish reads correctly in RU / EN / ID.
 */
export const dishes: Dish[] = [
  {
    id: "ayam-lalapan",
    name: "Ayam Lalapan",
    pronunciation: "ah-YAM lah-lah-PAN",
    image: ayamLalapanImg,
    palette: ["#d96a3a", "#8a3d1a"],
  },
  {
    id: "nasi-goreng-kampung",
    name: "Nasi Goreng Kampung",
    pronunciation: "NAH-see go-RENG kam-POONG",
    image: nasiGorengImg,
    palette: ["#c4502a", "#4a2014"],
  },
  {
    id: "sate-taichan",
    name: "Sate Taichan",
    pronunciation: "sah-TAY tai-CHAN",
    image: sateTaichanImg,
    palette: ["#e0a73c", "#a26818"],
  },
  {
    id: "bubur-ayam",
    name: "Bubur Ayam",
    pronunciation: "BOO-boor ah-YAM",
    image: buburAyamImg,
    palette: ["#e0a73c", "#a26818"],
  },
  {
    id: "cekodok",
    name: "Cekodok",
    pronunciation: "che-ko-DOK",
    image: cekodokImg,
    palette: ["#d98c3a", "#7a4a12"],
  },
];
