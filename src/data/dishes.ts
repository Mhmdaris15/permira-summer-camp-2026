// Real dish photography — Vite resolves these to hashed, build-optimized URLs.
import sateImg from "../assets/foods/Sate_ayam_madura.jpg";
import sotoImg from "../assets/foods/soto-ayam.jpg";
import ayamLengkuasImg from "../assets/foods/ayam-goreng-lengkuas.jpg";

export type Dish = {
  id: string;
  name: string;
  pronunciation: string;
  region: string;
  tagline: string;
  story: string;
  ingredients: string[];
  pairing: string;
  /** Real dish photo (imported asset URL). */
  image: string;
  /** Hex pair for the dish's "flavor card" gradient (fallback / accent). */
  palette: [string, string];
};

export const dishes: Dish[] = [
  {
    id: "satay",
    name: "Sate Madura",
    pronunciation: "sah-TAY mah-DOO-rah",
    region: "Madura · East Java",
    tagline: "Smoke, peanut, and the patience of a charcoal grill.",
    story:
      "Skewers of marinated chicken kissed by glowing coconut-husk embers, glossed in a sweet-savory peanut sauce. In Madura, sate is a street ritual — eaten standing, shared without ceremony.",
    ingredients: ["Kecap manis", "Roasted peanut", "Lime leaf", "Bird's eye chili", "Lemongrass"],
    pairing: "Lontong (compressed rice cake) and pickled cucumber.",
    image: sateImg,
    palette: ["#d96a3a", "#8a3d1a"],
  },
  {
    id: "soto",
    name: "Soto Ayam",
    pronunciation: "SOH-toh ah-YAM",
    region: "Java · Nusantara-wide",
    tagline: "A golden broth that knows every kitchen by heart.",
    story:
      "Turmeric-stained chicken broth, simmered with galangal, kaffir lime, and lemongrass. Every region writes its own version — Lamongan crowns it with crushed prawn cracker; Kudus prefers buffalo. Soto is Indonesia's family album in a bowl.",
    ingredients: ["Turmeric", "Galangal", "Kaffir lime", "Vermicelli", "Boiled egg", "Fried shallot"],
    pairing: "Sambal, lime wedge, steamed jasmine rice.",
    image: sotoImg,
    palette: ["#e0a73c", "#a26818"],
  },
  {
    id: "ayam-lengkuas",
    name: "Ayam Lengkuas",
    pronunciation: "ah-YAM leng-KOO-as",
    region: "West Sumatra · Padang",
    tagline: "Where galangal becomes a crown of fragrant gold.",
    story:
      "Slow-braised chicken smothered in a fluffy crust of fried galangal — crisp, herbal, deeply aromatic. A Padang specialty that turns a humble root into the centerpiece of the table.",
    ingredients: ["Galangal", "Turmeric leaf", "Coconut milk", "Candlenut", "Lemongrass"],
    pairing: "White rice, cassava leaves, sambal hijau.",
    image: ayamLengkuasImg,
    palette: ["#c4502a", "#4a2014"],
  },
];
