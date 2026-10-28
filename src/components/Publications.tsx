/**
 * Publications — a curated list of media coverage and news about PERMIRA Summer Camp 2026.
 * Data extracted from the official publications PDF document.
 */
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Publication {
  id: number;
  title: string;
  url: string;
  type: "mainstream" | "social" | "tv" | "print";
  country: "indonesia" | "russia";
}

const indonesiaPublications: Publication[] = [
  {
    id: 1,
    title: "Mahasiswa Indonesia Rusia Bikin Heboh di Tengah Hutan Rusia: Ada Kuliner Nusantara Hingga Diplomasi Api Unggun",
    url: "https://www.dailyklik.id/2026/07/27/mahasiswa-indonesia-rusia-bikin-heboh-di-tengah-hutan-rusia-ada-kuliner-nusantara-hingga-diplomasi-api-unggun/2/",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 2,
    title: "76 Tahun Indonesia-Rusia: Pelajar Indonesia Gelar Summer Camp di Rusia",
    url: "https://beritaborneo.com/main/76-tahun-indonesia-rusia-pelajar-indonesia-gelar-summer-camp-di-rusia/",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 3,
    title: "Peringati 76 Tahun Hubungan RI-Rusia dan 35 Tahun ASEAN-Rusia: Gelar PERMIRA Summer Camp 2026 Saat Nasi Tumpeng Berpadu dengan Taiga di Ujung Finlandia",
    url: "https://radarmalioboro.jawapos.com/amp/internasional/2608020003/peringati-76-tahun-hubungan-ri-rusia-dan-35-tahun-asean-rusia-gelar-permira-summer-camp-2026-saat-nasi-tumpeng-berpadu-dengan-taiga-di-ujung-finlandia",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 4,
    title: "Mahasiswa Indonesia Rusia Pererat Diplomasi Perkemahan",
    url: "https://achmadnurhidayat.id/mahasiswa-indonesia-rusia-pererat-diplomasi-perkemahan",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 5,
    title: "PERMIRA Summer Camp 2026 - Live Broadcast",
    url: "https://www.youtube.com/watch?v=L8Gw2A1kTrw",
    type: "tv",
    country: "indonesia",
  },
  {
    id: 6,
    title: "Keroyokan Bumbu Nusantara dan Krim Asam Rusia: Diplomasi Unik Mahasiswa Indonesia",
    url: "https://kabarbaik.co/keroyokan-bumbu-nusantara-dan-krim-asam-rusia-diplomasi-unik-mahasiswa-indonesia/",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 7,
    title: "Gastrodiplomasi Perkuat Hubungan RI-Rusia: Mahasiswa Jadi Jembatan",
    url: "https://investor.id/international/448029/gastrodiplomasi-perkuat-hubungan-ri-rusia-mahasiswa-jadi-jembatan",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 8,
    title: "76 Tahun Indonesia-Rusia dan 35 Tahun ASEAN-Rusia: Perkemahan Pemuda di Leningrad Jadi Simbol Diplomasi Kerakyatan",
    url: "https://suaramuda.net/2026/07/29/76-tahun-indonesia-rusia-dan-35-tahun-asean-rusia-perkemahan-pemuda-di-leningrad-jadi-simbol-diplomasi-kerakyatan/",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 9,
    title: "Mahasiswa Indonesia dan Rusia Jalin Persahabatan Lewat Kuliner dan Budaya",
    url: "https://detak.media/mahasiswa-indonesia-dan-rusia-jalin-persahabatan-lewat-kuliner-dan-budaya",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 10,
    title: "PERMIRA Summer Camp di Hutan Rusia: Nasi Goreng Nusantara Bahasa Semua Negara",
    url: "https://jambi.tribunnews.com/news/1202031/permira-summer-camp-di-hutan-rusia-nasi-goreng-nusantara-bahasa-semua-negara",
    type: "mainstream",
    country: "indonesia",
  },
  {
    id: 11,
    title: "Rayakan Hubungan Persahabatan dengan Indonesia dan ASEAN: PERMIRA St. Petersburg Adakan Kegiatan PERMIRA Summer Camp 2026",
    url: "https://kendal.suaramerdeka.com/internasional/103617476412/rayakan-hubungan-persahabatan-dengan-indonesia-dan-asean-permira-st-petersburg-adakan-kegiatan-permira-summer-camp-2026",
    type: "mainstream",
    country: "indonesia",
  },
];

const russiaPublications: Publication[] = [
  {
    id: 1,
    title: "В заповеднике Выборгский стартовал международный студенческий слет PERMIRA Summer Camp",
    url: "https://vecherka-spb.ru/2026/07/21/v-zakaznike-viborgskii-startoval-mezhdunarodnii-studencheskii-slet/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 2,
    title: "Студенческий слет PERMIRA стартовал в заповеднике Выборгский",
    url: "https://nevskiy.pro/studencheskij-slet-permira-startoval-v-zakaznike-vyborgskij/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 3,
    title: "На полуострове Киперорт состоялся международный студенческий слет PERMIRA",
    url: "https://voop-rf.ru/tpost/hej2in23l1-na-poluostrove-kiperort-sostoyalsya-mezh",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 4,
    title: "В заповеднике Выборгский открылся международный студенческий слет PERMIRA Summer Camp 3.0",
    url: "https://og47.ru/2026/07/21/v-zakaznike-vyborgskii-otkrylsya-mezdunarodnyi-studenceskii-slyot-permira-summer-camp-30-59225",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 5,
    title: "В Ленобласти открылся международный слет PERMIRA Summer Camp 3.0",
    url: "https://gazeta-lo.ru/2026/07/21/v-lenoblasti-otkrylsya-mezdunarodnyj-slet-permira-summer-camp-3-0/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 6,
    title: "В заповеднике Выборгский стартовал международный студенческий слет PERMIRA Summer Camp 3.0",
    url: "https://ivbg.ru/8426608-v-zakaznike-vyborgskiy-startoval-mezhdunarodnyy-studencheskiy-slet-permira-summer-camp-3-0.html",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 7,
    title: "PERMIRA Summer Camp 3.0 принимает гостей",
    url: "https://viborg.bezformata.com/listnews/permira-summer-camp-3-0-prinimaet/161878428/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 8,
    title: "PERMIRA Summer Camp 3.0 принимает гостей в заповеднике",
    url: "https://gazetavyborg.ru/news/eko/permira-summer-camp-30-prinimaet-gostey-v-zakaznik/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 9,
    title: "Эко-проекты: PERMIRA Summer Camp",
    url: "https://lenoblast.bezformata.com/listnews/eko-proekti/161898816/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 10,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-156525972_31263",
    type: "social",
    country: "russia",
  },
  {
    id: 11,
    title: "Индонезийско-российский студенческий слет на полуострове Киперорт",
    url: "https://ooptlo.ru/indonezijsko-rossijskij-studencheskij-slyot-na-poluostrove-kiperort.html",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 12,
    title: "В заповеднике Выборгский состоялся индонезийско-российский летний студенческий слет",
    url: "https://spbdnevnik.ru/news/2026-07-21/v-zakaznike-vyborgskiy-sostoyalsya-indoneziysko-rossiyskiy-letniy-studencheskiy-slet",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 13,
    title: "PERMIRA Summer Camp 3.0 - Официальный сайт КПР Ленобласти",
    url: "https://kpr.lenobl.ru/ru/news/96615/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 14,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-219032321_5037",
    type: "social",
    country: "russia",
  },
  {
    id: 15,
    title: "PERMIRA Summer Camp - Dzen",
    url: "https://dzen.ru/a/al948zRgISluPo_Y",
    type: "social",
    country: "russia",
  },
  {
    id: 16,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-149890722_1088",
    type: "social",
    country: "russia",
  },
  {
    id: 17,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-221220175_6206",
    type: "social",
    country: "russia",
  },
  {
    id: 18,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-219123666_2959",
    type: "social",
    country: "russia",
  },
  {
    id: 19,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-207453836_75186",
    type: "social",
    country: "russia",
  },
  {
    id: 20,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-223489479_4643",
    type: "social",
    country: "russia",
  },
  {
    id: 21,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-218900034_2928",
    type: "social",
    country: "russia",
  },
  {
    id: 22,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-226752029_1877",
    type: "social",
    country: "russia",
  },
  {
    id: 23,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-226752017_2078",
    type: "social",
    country: "russia",
  },
  {
    id: 24,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-239623261_283",
    type: "social",
    country: "russia",
  },
  {
    id: 25,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-238227051_752",
    type: "social",
    country: "russia",
  },
  {
    id: 26,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-207716922_7036",
    type: "social",
    country: "russia",
  },
  {
    id: 27,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-156525972_31092",
    type: "social",
    country: "russia",
  },
  {
    id: 28,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall447441226_232",
    type: "social",
    country: "russia",
  },
  {
    id: 29,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-133435044_69",
    type: "social",
    country: "russia",
  },
  {
    id: 30,
    title: "PERMIRA Summer Camp - VK Post",
    url: "https://vk.ru/wall-232543443_116",
    type: "social",
    country: "russia",
  },
  {
    id: 31,
    title: "Молодежный лагерь стран АСЕАН в Ленинградской области стал символом народной дипломатии",
    url: "https://yugsn.ru/molodeznyi-lager-stran-asean-v-leningradskoi-oblasti-stal-simvolom-narodnoi-diplomatii",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 32,
    title: "PERMIRA Summer Camp - Telegram",
    url: "https://t.me/lenobladminka/25492?single",
    type: "social",
    country: "russia",
  },
  {
    id: 33,
    title: "76 лет дружбы: Индонезия и Россия отметили юбилей на природе в Ленобласти",
    url: "https://mezhnats.ru/76-let-druzhby-indoneziya-i-rossiya-otmetili-yubilej-na-prirode-v-lenoblasti/",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 34,
    title: "PERMIRA Summer Camp - Dzen",
    url: "https://dzen.ru/a/anK11WtbQE6qa9NO",
    type: "social",
    country: "russia",
  },
  {
    id: 35,
    title: "Впервые за 76 лет Индонезия и Россия провели совместный молодежный слет",
    url: "https://technosuveren.ru/vpervye-za-76-let-indoneziya-i-rossiya-proveli-sovmestnyj-molodyozhnyj-slyot",
    type: "mainstream",
    country: "russia",
  },
  {
    id: 36,
    title: "Восток-8 (PDF Publication)",
    url: "https://pakistan.rs.gov.ru/app/uploads/2026/10/416b81_vostok-8.pdf",
    type: "print",
    country: "russia",
  },
];

function PublicationCard({ pub }: { pub: Publication }) {
  const { t } = useTranslation();

  const typeLabels = {
    mainstream: t("publications.type.mainstream"),
    social: t("publications.type.social"),
    tv: t("publications.type.tv"),
    print: t("publications.type.print"),
  };

  const typeColors = {
    mainstream: "bg-terracotta-500/10 text-terracotta-500 border-terracotta-500/20",
    social: "bg-saffron-500/10 text-saffron-500 border-saffron-500/20",
    tv: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    print: "bg-clove-500/10 text-clove-500 border-clove-500/20",
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-cream-50 border border-clove-100 p-5 md:p-6 transition-all duration-300 hover:border-terracotta-500/30 hover:shadow-lg hover:shadow-terracotta-500/5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-terracotta-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2m-2 2h-10a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2m-2 2h10a2 2 0 012 2v2a2 2 0 01-2 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[pub.type]}`}>
              {typeLabels[pub.type]}
            </span>
            <span className="text-xs text-clove-500/60">
              {pub.country === "indonesia" ? "🇮🇩 Indonesia" : "🇷🇺 Russia"}
            </span>
          </div>
          <h3 className="font-display text-lg font-light text-clove-900 group-hover:text-terracotta-500 transition-colors line-clamp-2">
            {pub.title}
          </h3>
        </div>
      </div>
      <a
        href={pub.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        aria-label={`Read: ${pub.title}`}
      />
    </article>
  );
}

export function Publications() {
  const { t } = useTranslation();

  return (
    <section id="publications" className="relative bg-cream-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
              {t("publications.eyebrow")}
            </span>
            <h2 className="reveal mt-4 max-w-2xl font-display text-balance text-4xl font-light leading-tight tracking-tight text-clove-900 md:text-6xl">
              {t("publications.heading1")} <span className="italic text-terracotta-500">{t("publications.headingItalic")}</span> {t("publications.heading2")}
            </h2>
          </div>
          <p className="reveal max-w-md text-pretty text-base leading-relaxed text-clove-700/80">
            {t("publications.intro")}
          </p>
        </div>

        {/* Indonesia Media */}
        <div className="mt-14">
          <h3 className="reveal font-display text-2xl font-light text-clove-900 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-terracotta-500/10 flex items-center justify-center">
              <span className="text-terracotta-500 text-sm font-medium">🇮🇩</span>
            </span>
            {t("publications.indonesiaMedia")}
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {indonesiaPublications.map((pub) => (
              <motion.article
                key={pub.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <PublicationCard pub={pub} />
              </motion.article>
            ))}
          </div>
        </div>

        {/* Russia Media */}
        <div className="mt-16">
          <h3 className="reveal font-display text-2xl font-light text-clove-900 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-saffron-500/10 flex items-center justify-center">
              <span className="text-saffron-500 text-sm font-medium">🇷🇺</span>
            </span>
            {t("publications.russiaMedia")}
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {russiaPublications.map((pub) => (
              <motion.article
                key={pub.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <PublicationCard pub={pub} />
              </motion.article>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-16 reveal grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-terracotta-500/10 border border-terracotta-500/20 p-6 text-center">
            <div className="font-display text-4xl font-light text-terracotta-500">{indonesiaPublications.length}</div>
            <div className="text-sm text-terracotta-500/80 mt-1">{t("publications.stats.indonesiaArticles")}</div>
          </div>
          <div className="rounded-2xl bg-saffron-500/10 border border-saffron-500/20 p-6 text-center">
            <div className="font-display text-4xl font-light text-saffron-500">{russiaPublications.length}</div>
            <div className="text-sm text-saffron-500/80 mt-1">{t("publications.stats.russiaArticles")}</div>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center">
            <div className="font-display text-4xl font-light text-emerald-500">
              {indonesiaPublications.filter((p) => p.type === "tv").length + russiaPublications.filter((p) => p.type === "tv").length}
            </div>
            <div className="text-sm text-emerald-500/80 mt-1">{t("publications.stats.tvBroadcasts")}</div>
          </div>
          <div className="rounded-2xl bg-clove-500/10 border border-clove-500/20 p-6 text-center">
            <div className="font-display text-4xl font-light text-clove-500">
              {indonesiaPublications.filter((p) => p.type === "print").length + russiaPublications.filter((p) => p.type === "print").length}
            </div>
            <div className="text-sm text-clove-500/80 mt-1">{t("publications.stats.printMedia")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}