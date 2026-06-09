export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Attraction = {
  id: string;
  name: string;
  imageUrl: string;
  coords: Coordinates;
};

// Рестораны/кафе и отели имеют ту же форму, что и достопримечательность.
export type Place = {
  id: string;
  name: string;
  imageUrl: string;
  coords: Coordinates;
};

export type City = {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  imageUrl: string;
  coords: Coordinates;
  attractions: Attraction[];
  restaurants: Place[];
  hotels: Place[];
};

// Базовые данные городов содержат только достопримечательности; рестораны и
// отели хранятся отдельно в CITY_EXTRAS и подмешиваются в CITIES ниже, чтобы не
// раздувать каждый литерал города.
const BASE_CITIES: Omit<City, "restaurants" | "hotels">[] = [
  {
    id: "minsk",
    name: "Минск",
    country: "Беларусь",
    region: "Минская область",
    description:
      "Столица с музеями, парками, советским модернизмом и спокойными городскими маршрутами.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Church_of_Saints_Simon_and_Helena_%28Minsk%29.jpg/1280px-Church_of_Saints_Simon_and_Helena_%28Minsk%29.jpg",
    coords: { latitude: 53.9006, longitude: 27.5590 },
    attractions: [
      { id: "independence-avenue", name: "Проспект Независимости", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Minsk_Prospekt_Nezalezhnosti_05.jpg/1280px-Minsk_Prospekt_Nezalezhnosti_05.jpg", coords: { latitude: 53.9094, longitude: 27.5763 } },
      { id: "trinity-suburb", name: "Троицкое предместье", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Traeckaje_suburb-3.jpg/1280px-Traeckaje_suburb-3.jpg", coords: { latitude: 53.9075, longitude: 27.5547 } },
      { id: "national-library", name: "Национальная библиотека", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/5_50_64_2f_-_Belarus_National_Library%2C_Minsk_2009_%283901618837%29.jpg/1280px-5_50_64_2f_-_Belarus_National_Library%2C_Minsk_2009_%283901618837%29.jpg", coords: { latitude: 53.9326, longitude: 27.6499 } },
      { id: "victory-square", name: "Площадь Победы", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Victory-square.jpg/1280px-Victory-square.jpg", coords: { latitude: 53.9069, longitude: 27.5781 } },
      { id: "upper-town", name: "Верхний город", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Church_of_Saints_Simon_and_Helena_%28Minsk%29.jpg/1280px-Church_of_Saints_Simon_and_Helena_%28Minsk%29.jpg", coords: { latitude: 53.9050, longitude: 27.5562 } },
      { id: "island-of-tears", name: "Остров слез", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Mi%C5%84sk_Wyspa_%C5%81ez_03.jpg/1280px-Mi%C5%84sk_Wyspa_%C5%81ez_03.jpg", coords: { latitude: 53.9096, longitude: 27.5545 } },
      { id: "gorky-park", name: "Парк Горького", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Gorki_park%2C_Minsk14.JPG", coords: { latitude: 53.9033, longitude: 27.5731 } },
      { id: "great-patriotic-war-museum", name: "Музей истории Великой Отечественной войны", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Museum_of_the_Great_Patriotic_War_-_Minsk_-_Belarus_%2827248715740%29.jpg/1280px-Museum_of_the_Great_Patriotic_War_-_Minsk_-_Belarus_%2827248715740%29.jpg", coords: { latitude: 53.9152, longitude: 27.5380 } },
    ],
  },
  {
    id: "brest",
    name: "Брест",
    country: "Беларусь",
    region: "Брестская область",
    description:
      "Пограничный город с крепостью, уютными улицами и маршрутами к Беловежской пуще.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Brest_BY_collage.jpg/1280px-Brest_BY_collage.jpg",
    coords: { latitude: 52.0976, longitude: 23.7341 },
    attractions: [
      { id: "brest-fortress", name: "Брестская крепость", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Brest_Brest_Fortress_Kholm_Gate_9209_2150.jpg/1280px-Brest_Brest_Fortress_Kholm_Gate_9209_2150.jpg", coords: { latitude: 52.0820, longitude: 23.6580 } },
      { id: "sovetskaya-street", name: "Улица Советская", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/%D0%A3%D0%BB%D0%B8%D1%86%D0%B0_%D0%A1%D0%BE%D0%B2%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F_%D0%B2_%D0%91%D1%80%D0%B5%D1%81%D1%82%D0%B5.jpg/1280px-%D0%A3%D0%BB%D0%B8%D1%86%D0%B0_%D0%A1%D0%BE%D0%B2%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F_%D0%B2_%D0%91%D1%80%D0%B5%D1%81%D1%82%D0%B5.jpg", coords: { latitude: 52.0943, longitude: 23.6916 } },
      { id: "railway-museum", name: "Музей железнодорожной техники", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Parovoz_%22Felix_Dzherzinski%22_in_Brest_museum.jpg/1280px-Parovoz_%22Felix_Dzherzinski%22_in_Brest_museum.jpg", coords: { latitude: 52.0855, longitude: 23.6729 } },
      { id: "winter-garden", name: "Зимний сад", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Brest_BY_collage.jpg/1280px-Brest_BY_collage.jpg", coords: { latitude: 52.0981, longitude: 23.6881 } },
      { id: "millennium-monument", name: "Памятник тысячелетия Бреста", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Brest_BY_collage.jpg/1280px-Brest_BY_collage.jpg", coords: { latitude: 52.0978, longitude: 23.7050 } },
      { id: "belovezhskaya-pushcha", name: "Беловежская пуща", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Poland_Bialowieza_-_BPN.jpg", coords: { latitude: 52.7176, longitude: 23.8517 } },
    ],
  },
  {
    id: "grodno",
    name: "Гродно",
    country: "Беларусь",
    region: "Гродненская область",
    description: "Исторический центр с замками, костелами, Коложей и видами на Неман.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Horadnia_%28Hrodna%29%2C_Vilienskaja._%D0%93%D0%BE%D1%80%D0%B0%D0%B4%D0%BD%D1%8F%2C_%D0%92%D1%96%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%282021%29_05.jpg/1280px-Horadnia_%28Hrodna%29%2C_Vilienskaja._%D0%93%D0%BE%D1%80%D0%B0%D0%B4%D0%BD%D1%8F%2C_%D0%92%D1%96%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%282021%29_05.jpg",
    coords: { latitude: 53.6884, longitude: 23.8258 },
    attractions: [
      { id: "old-castle", name: "Старый замок", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Hrodna_Old_Castle_2023-06-25_5510.jpg/1280px-Hrodna_Old_Castle_2023-06-25_5510.jpg", coords: { latitude: 53.6773, longitude: 23.8230 } },
      { id: "new-castle", name: "Новый замок", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Grodno_sightseeing_fc10.jpg/1280px-Grodno_sightseeing_fc10.jpg", coords: { latitude: 53.6763, longitude: 23.8246 } },
      { id: "kalozha", name: "Коложская церковь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f5/%D0%93%D1%80%D0%BE%D0%B4%D0%BD%D0%B0._%D0%9A%D0%B0%D0%BB%D0%BE%D0%B6%D1%81%D0%BA%D0%B0%D1%8F_%D1%86%D0%B0%D1%80%D0%BA%D0%B2%D0%B0_2.JPG", coords: { latitude: 53.6809, longitude: 23.8175 } },
      { id: "farny-church", name: "Фарный костел", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/%D0%93%D1%80%D0%BE%D0%B4%D0%BD%D0%BE._%D0%9A%D0%B0%D1%84%D0%B5%D0%B4%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80_%D0%A1%D0%B2%D1%8F%D1%82%D0%BE%D0%B3%D0%BE_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%B0_%D0%9A%D1%81%D0%B0%D0%B2%D0%B5%D1%80%D0%B8%D1%8F_-_panoramio.jpg/1280px-%D0%93%D1%80%D0%BE%D0%B4%D0%BD%D0%BE._%D0%9A%D0%B0%D1%84%D0%B5%D0%B4%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80_%D0%A1%D0%B2%D1%8F%D1%82%D0%BE%D0%B3%D0%BE_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%B0_%D0%9A%D1%81%D0%B0%D0%B2%D0%B5%D1%80%D0%B8%D1%8F_-_panoramio.jpg", coords: { latitude: 53.6798, longitude: 23.8301 } },
      { id: "sovetskaya-square", name: "Советская площадь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Belarus-Hrodna-Church_of_Francis_Ksaver-8.jpg", coords: { latitude: 53.6802, longitude: 23.8298 } },
      { id: "pharmacy-museum", name: "Аптека-музей", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Hrodna_Jesuit_Pharmac_2023-06-24_5450.jpg/1280px-Hrodna_Jesuit_Pharmac_2023-06-24_5450.jpg", coords: { latitude: 53.6810, longitude: 23.8315 } },
      { id: "zoo", name: "Гродненский зоопарк", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/50/%D0%93%D1%80%D0%BE%D0%B4%D0%BD%D0%B0._%D0%97%D0%B0%D0%B0%D0%BF%D0%B0%D1%80%D0%BA.JPG", coords: { latitude: 53.6892, longitude: 23.8487 } },
    ],
  },
  {
    id: "vitebsk",
    name: "Витебск",
    country: "Беларусь",
    region: "Витебская область",
    description: "Город Шагала, амфитеатра, храмов и прогулок вдоль Западной Двины.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%A3%D1%81%D0%BF%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80..JPG/1280px-%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%A3%D1%81%D0%BF%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80..JPG",
    coords: { latitude: 55.1904, longitude: 30.2049 },
    attractions: [
      { id: "chagall-house", name: "Дом-музей Марка Шагала", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Shagal_Choumoff.jpg/1280px-Shagal_Choumoff.jpg", coords: { latitude: 55.2003, longitude: 30.1906 } },
      { id: "summer-amphitheatre", name: "Летний амфитеатр", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%9B%D0%B5%D1%82%D0%BD%D0%B8%D0%B9_%D0%90%D0%BC%D1%84%D0%B8%D1%82%D0%B5%D0%B0%D1%82%D1%80.jpg/1280px-%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%9B%D0%B5%D1%82%D0%BD%D0%B8%D0%B9_%D0%90%D0%BC%D1%84%D0%B8%D1%82%D0%B5%D0%B0%D1%82%D1%80.jpg", coords: { latitude: 55.1915, longitude: 30.2064 } },
      { id: "assumption-cathedral", name: "Успенский собор", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Church_of_the_Assumption_in_Viciebsk_%282011%29.jpg/1280px-Church_of_the_Assumption_in_Viciebsk_%282011%29.jpg", coords: { latitude: 55.1949, longitude: 30.2050 } },
      { id: "city-hall", name: "Витебская ратуша", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%A3%D1%81%D0%BF%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80..JPG/1280px-%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%A3%D1%81%D0%BF%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80..JPG", coords: { latitude: 55.1955, longitude: 30.2060 } },
      { id: "kz-palace", name: "Губернаторский дворец", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/01/%D0%A1%D0%BE%D0%B2%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F_18_%D0%9F%D1%83%D1%82%D0%BD%D0%B0.jpg", coords: { latitude: 55.1962, longitude: 30.2060 } },
      { id: "victory-square-vitebsk", name: "Площадь Победы", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%A3%D1%81%D0%BF%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80..JPG/1280px-%D0%92%D0%B8%D1%82%D0%B5%D0%B1%D1%81%D0%BA._%D0%A3%D1%81%D0%BF%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80..JPG", coords: { latitude: 55.1823, longitude: 30.2028 } },
    ],
  },
  {
    id: "gomel",
    name: "Гомель",
    country: "Беларусь",
    region: "Гомельская область",
    description: "Южный город с дворцово-парковым ансамблем и набережной Сожа.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/%D0%9F%D0%B0%D0%BB%D0%B0%D1%86%D0%B0%D0%B2%D0%B0-%D0%BF%D0%B0%D1%80%D0%BA%D0%B0%D0%B2%D1%8B_%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D1%9E_%D0%93%D0%BE%D0%BC%D0%B5%D0%BB%D1%96._%D0%A1%D0%B0%D0%B1%D0%BE%D1%80_%D1%96_%D0%BA%D0%B0%D0%BF%D0%BB%D1%96%D1%86%D0%B0.jpg",
    coords: { latitude: 52.4242, longitude: 30.9833 },
    attractions: [
      { id: "rumyantsev-palace", name: "Дворец Румянцевых и Паскевичей", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/%D0%9F%D0%B0%D0%BB%D0%B0%D1%86%D0%B0%D0%B2%D0%B0-%D0%BF%D0%B0%D1%80%D0%BA%D0%B0%D0%B2%D1%8B_%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D1%9E_%D0%93%D0%BE%D0%BC%D0%B5%D0%BB%D1%96._%D0%A4%D0%B0%D1%81%D0%B0%D0%B4_%D0%BF%D0%B0%D0%BB%D0%B0%D1%86%D0%B0.jpg", coords: { latitude: 52.4223, longitude: 31.0169 } },
      { id: "gomel-park", name: "Гомельский парк", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/%D0%9F%D0%B0%D0%BB%D0%B0%D1%86%D0%B0%D0%B2%D0%B0-%D0%BF%D0%B0%D1%80%D0%BA%D0%B0%D0%B2%D1%8B_%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D1%9E_%D0%93%D0%BE%D0%BC%D0%B5%D0%BB%D1%96._%D0%A1%D0%B0%D0%B1%D0%BE%D1%80_%D1%96_%D0%BA%D0%B0%D0%BF%D0%BB%D1%96%D1%86%D0%B0.jpg", coords: { latitude: 52.4206, longitude: 31.0107 } },
      { id: "peter-paul-cathedral", name: "Петропавловский собор", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/%D0%93%D0%BE%D0%BC%D0%B5%D0%BB%D1%8C._%D0%A1%D0%BE%D0%B1%D0%BE%D1%80_%D1%81%D0%B2%D1%8F%D1%82%D1%8B%D1%85_%D0%90%D0%BF%D0%BE%D1%81%D1%82%D0%BE%D0%BB%D0%BE%D0%B2_%D0%9F%D0%B5%D1%82%D1%80%D0%B0_%D0%B8_%D0%9F%D0%B0%D0%B2%D0%BB%D0%B0_27.jpg/1280px-%D0%93%D0%BE%D0%BC%D0%B5%D0%BB%D1%8C._%D0%A1%D0%BE%D0%B1%D0%BE%D1%80_%D1%81%D0%B2%D1%8F%D1%82%D1%8B%D1%85_%D0%90%D0%BF%D0%BE%D1%81%D1%82%D0%BE%D0%BB%D0%BE%D0%B2_%D0%9F%D0%B5%D1%82%D1%80%D0%B0_%D0%B8_%D0%9F%D0%B0%D0%B2%D0%BB%D0%B0_27.jpg", coords: { latitude: 52.4236, longitude: 31.0186 } },
      { id: "observation-tower", name: "Башня обозрения", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Belarus-Homel-Palace_of_Pashkevichs-6.jpg/1280px-Belarus-Homel-Palace_of_Pashkevichs-6.jpg", coords: { latitude: 52.4244, longitude: 31.0170 } },
      { id: "sozh-embankment", name: "Набережная Сожа", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/%D0%9F%D0%B0%D0%BB%D0%B0%D1%86%D0%B0%D0%B2%D0%B0-%D0%BF%D0%B0%D1%80%D0%BA%D0%B0%D0%B2%D1%8B_%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D1%9E_%D0%93%D0%BE%D0%BC%D0%B5%D0%BB%D1%96._%D0%A1%D0%B0%D0%B1%D0%BE%D1%80_%D1%96_%D0%BA%D0%B0%D0%BF%D0%BB%D1%96%D1%86%D0%B0.jpg", coords: { latitude: 52.4249, longitude: 31.0228 } },
      { id: "vetka-museum", name: "Музей ветковской иконы", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Vetka3.JPG/1280px-Vetka3.JPG", coords: { latitude: 52.4279, longitude: 30.9836 } },
    ],
  },
  {
    id: "mogilev",
    name: "Могилев",
    country: "Беларусь",
    region: "Могилевская область",
    description: "Город на Днепре с ратушей, пешеходной Ленинской и панорамными площадками.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/%D0%9C%D0%B0%D0%B3%D1%96%D0%BB%D1%91%D1%9E._%D0%A6%D1%8D%D0%BD%D1%82%D1%80.JPG",
    coords: { latitude: 53.9007, longitude: 30.3326 },
    attractions: [
      { id: "mogilev-city-hall", name: "Могилевская ратуша", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/%D0%9C%D0%B0%D0%B3%D1%96%D0%BB%D1%91%D1%9E._%D0%A6%D1%8D%D0%BD%D1%82%D1%80.JPG", coords: { latitude: 53.8946, longitude: 30.3320 } },
      { id: "leninskaya-street", name: "Улица Ленинская", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Mogilev_Leninskaja_str.JPG/1280px-Mogilev_Leninskaja_str.JPG", coords: { latitude: 53.9092, longitude: 30.3459 } },
      { id: "st-nicholas-monastery", name: "Свято-Никольский монастырь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Sviato-Nikolskij_monastyr_v_Mogileve.jpg/1280px-Sviato-Nikolskij_monastyr_v_Mogileve.jpg", coords: { latitude: 53.8938, longitude: 30.3458 } },
      { id: "star-square", name: "Площадь Звезд", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/%D0%9C%D0%B0%D0%B3%D1%96%D0%BB%D1%91%D1%9E._%D0%A6%D1%8D%D0%BD%D1%82%D1%80.JPG", coords: { latitude: 53.9023, longitude: 30.3407 } },
      { id: "buinichi-field", name: "Буйничское поле", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Moguilev.JPG/1280px-Moguilev.JPG", coords: { latitude: 53.8542, longitude: 30.3092 } },
      { id: "drama-theatre", name: "Драматический театр", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/%D0%9C%D0%B0%D0%B3%D1%96%D0%BB%D1%91%D1%9E._%D0%A6%D1%8D%D0%BD%D1%82%D1%80.JPG", coords: { latitude: 53.8974, longitude: 30.3334 } },
    ],
  },
  {
    id: "polotsk",
    name: "Полоцк",
    country: "Беларусь",
    region: "Витебская область",
    description: "Один из древнейших городов страны с Софийским собором и наследием Евфросинии.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Polack_Montage_%282017%29.jpg/1280px-Polack_Montage_%282017%29.jpg",
    coords: { latitude: 55.4858, longitude: 28.7861 },
    attractions: [
      { id: "sophia-cathedral", name: "Софийский собор", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Modern_photos_of_Cathedral_of_Saint_Sophia_in_Polotsk.jpg/1280px-Modern_photos_of_Cathedral_of_Saint_Sophia_in_Polotsk.jpg", coords: { latitude: 55.4847, longitude: 28.7575 } },
      { id: "saviour-euphrosyne-monastery", name: "Спасо-Евфросиниевский монастырь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/%D0%9F%D0%BE%D0%BB%D0%B0%D1%86%D0%B0%D0%BA%2C_%D0%A1%D0%BF%D0%B0%D1%81%D0%B0-%D0%95%D1%9E%D1%84%D1%80%D0%B0%D1%81%D1%96%D0%BD%D1%8C%D0%BD%D0%B5%D1%9E%D1%81%D0%BA%D1%96_%D0%BC%D0%B0%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80.jpg/1280px-%D0%9F%D0%BE%D0%BB%D0%B0%D1%86%D0%B0%D0%BA%2C_%D0%A1%D0%BF%D0%B0%D1%81%D0%B0-%D0%95%D1%9E%D1%84%D1%80%D0%B0%D1%81%D1%96%D0%BD%D1%8C%D0%BD%D0%B5%D1%9E%D1%81%D0%BA%D1%96_%D0%BC%D0%B0%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80.jpg", coords: { latitude: 55.5044, longitude: 28.7720 } },
      { id: "geographical-center", name: "Географический центр Европы", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Centre_of_Europe.jpg/1280px-Centre_of_Europe.jpg", coords: { latitude: 55.4878, longitude: 28.7717 } },
      { id: "polotsk-museum", name: "Краеведческий музей", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Belarus-Polatsk-Lutheran_Church-1.jpg/1280px-Belarus-Polatsk-Lutheran_Church-1.jpg", coords: { latitude: 55.4851, longitude: 28.7628 } },
      { id: "letter-u-monument", name: "Памятник букве Ў", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Polack_Montage_%282017%29.jpg/1280px-Polack_Montage_%282017%29.jpg", coords: { latitude: 55.4862, longitude: 28.7720 } },
    ],
  },
  {
    id: "nesvizh",
    name: "Несвиж",
    country: "Беларусь",
    region: "Минская область",
    description: "Маршрут вокруг Радзивиллов: замок, парки, ратуша и костел Божьего Тела.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_02.JPG/1280px-Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_02.JPG",
    coords: { latitude: 53.2225, longitude: 26.6831 },
    attractions: [
      { id: "nesvizh-castle", name: "Несвижский замок", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/%D0%97%D0%B0%D0%BC%D0%B0%D0%BA-%D0%BF%D0%B0%D0%BB%D0%B0%D1%86_%D1%83_%D0%9D%D1%8F%D1%81%D1%8C%D0%B2%D1%96%D0%B6%D1%8B_%D0%B7%D0%BD%D1%83%D1%82%D1%80%D1%8B.jpg/1280px-%D0%97%D0%B0%D0%BC%D0%B0%D0%BA-%D0%BF%D0%B0%D0%BB%D0%B0%D1%86_%D1%83_%D0%9D%D1%8F%D1%81%D1%8C%D0%B2%D1%96%D0%B6%D1%8B_%D0%B7%D0%BD%D1%83%D1%82%D1%80%D1%8B.jpg", coords: { latitude: 53.2225, longitude: 26.6896 } },
      { id: "corpus-christi-church", name: "Костел Божьего Тела", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Nesvizh_church.jpg", coords: { latitude: 53.2206, longitude: 26.6838 } },
      { id: "nesvizh-town-hall", name: "Несвижская ратуша", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Niasvi%C5%BE_Town_Hall_2023-07-02_6062.jpg/1280px-Niasvi%C5%BE_Town_Hall_2023-07-02_6062.jpg", coords: { latitude: 53.2229, longitude: 26.6745 } },
      { id: "slutsk-gate", name: "Слуцкая брама", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_02.JPG/1280px-Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_02.JPG", coords: { latitude: 53.2196, longitude: 26.6829 } },
      { id: "castle-park", name: "Замковый парк", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/%D0%97%D0%B0%D0%BC%D0%B0%D0%BA-%D0%BF%D0%B0%D0%BB%D0%B0%D1%86_%D1%83_%D0%9D%D1%8F%D1%81%D1%8C%D0%B2%D1%96%D0%B6%D1%8B_%D0%B7%D0%BD%D1%83%D1%82%D1%80%D1%8B.jpg/1280px-%D0%97%D0%B0%D0%BC%D0%B0%D0%BA-%D0%BF%D0%B0%D0%BB%D0%B0%D1%86_%D1%83_%D0%9D%D1%8F%D1%81%D1%8C%D0%B2%D1%96%D0%B6%D1%8B_%D0%B7%D0%BD%D1%83%D1%82%D1%80%D1%8B.jpg", coords: { latitude: 53.2245, longitude: 26.6952 } },
    ],
  },
  {
    id: "mir",
    name: "Мир",
    country: "Беларусь",
    region: "Гродненская область",
    description: "Небольшой город с замком ЮНЕСКО, старой площадью и следами разных культур.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/City_Mir_Belarus.jpg/1280px-City_Mir_Belarus.jpg",
    coords: { latitude: 53.4520, longitude: 26.4730 },
    attractions: [
      { id: "mir-castle", name: "Мирский замок", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/%D0%9C%D1%96%D1%80%D1%81%D0%BA%D1%96_%D0%B7%D0%B0%D0%BC%D0%B0%D0%BA_%D0%B7_%D0%B2%D1%8B%D1%88%D1%8B%D0%BD%D1%96._2022_%2805%29.jpg", coords: { latitude: 53.4515, longitude: 26.4731 } },
      { id: "st-nicholas-church-mir", name: "Костел Святого Николая", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Church_of_Saint_Nicholas%2C_Red_Army_str.%2C_urban_settlement_Mir%2C_Kareli%C4%8Dy_raion%2C_Grodno_Region%2C_Republic_of_Belarus_02.JPG/1280px-Church_of_Saint_Nicholas%2C_Red_Army_str.%2C_urban_settlement_Mir%2C_Kareli%C4%8Dy_raion%2C_Grodno_Region%2C_Republic_of_Belarus_02.JPG", coords: { latitude: 53.4519, longitude: 26.4694 } },
      { id: "trinity-church-mir", name: "Свято-Троицкая церковь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Belarus-Mir-Holy_Trinity_Church-2.jpg/1280px-Belarus-Mir-Holy_Trinity_Church-2.jpg", coords: { latitude: 53.4546, longitude: 26.4671 } },
      { id: "mir-square", name: "Рыночная площадь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/City_Mir_Belarus.jpg/1280px-City_Mir_Belarus.jpg", coords: { latitude: 53.4517, longitude: 26.4711 } },
      { id: "castle-pond", name: "Замковый пруд", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/%D0%9C%D1%96%D1%80%D1%81%D0%BA%D1%96_%D0%B7%D0%B0%D0%BC%D0%B0%D0%BA_%D0%B7_%D0%B2%D1%8B%D1%88%D1%8B%D0%BD%D1%96._2022_%2805%29.jpg", coords: { latitude: 53.4509, longitude: 26.4752 } },
    ],
  },
  {
    id: "pinsk",
    name: "Пинск",
    country: "Беларусь",
    region: "Брестская область",
    description: "Полесский город с барочной архитектурой, набережной Пины и старым центром.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Pinsk_Montage_%282017%29.jpg/1280px-Pinsk_Montage_%282017%29.jpg",
    coords: { latitude: 52.1229, longitude: 26.0951 },
    attractions: [
      { id: "franciscan-church", name: "Костел Успения Девы Марии", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Pinsk_Montage_%282017%29.jpg/1280px-Pinsk_Montage_%282017%29.jpg", coords: { latitude: 52.1187, longitude: 26.0941 } },
      { id: "jesuit-collegium", name: "Коллегиум иезуитов", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Pinsk_Montage_%282017%29.jpg/1280px-Pinsk_Montage_%282017%29.jpg", coords: { latitude: 52.1110, longitude: 26.1045 } },
      { id: "pina-embankment", name: "Набережная Пины", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Pinsk_Montage_%282017%29.jpg/1280px-Pinsk_Montage_%282017%29.jpg", coords: { latitude: 52.1170, longitude: 26.0964 } },
      { id: "butrimovich-palace", name: "Дворец Бутримовича", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/%D0%9F%D1%96%D0%BD%D1%81%D0%BA%D1%96%D1%8F_%D0%B7%D0%B0%D0%BC%D0%B0%D0%BB%D1%91%D1%9E%D0%BA%D1%96._%2809%29.jpg", coords: { latitude: 52.1186, longitude: 26.0931 } },
      { id: "varvarinskaya-church", name: "Варваринская церковь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/%D0%9Fi%D0%BD%D1%81%D0%BA%2C%D0%92%D0%B0%D1%80%D0%B2%D0%B0%D1%80%D1%8B%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D1%86%D0%B0%D1%80%D0%BA%D0%B2%D0%B0.JPG/1280px-%D0%9Fi%D0%BD%D1%81%D0%BA%2C%D0%92%D0%B0%D1%80%D0%B2%D0%B0%D1%80%D1%8B%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D1%86%D0%B0%D1%80%D0%BA%D0%B2%D0%B0.JPG", coords: { latitude: 52.1199, longitude: 26.1014 } },
    ],
  },
  {
    id: "lida",
    name: "Лида",
    country: "Беларусь",
    region: "Гродненская область",
    description: "Город с мощным замком Гедимина, старым центром и удобной остановкой по пути на запад.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lida_Montage_%282017%29.jpg/1280px-Lida_Montage_%282017%29.jpg",
    coords: { latitude: 53.8884, longitude: 25.2990 },
    attractions: [
      { id: "lida-castle", name: "Лидский замок", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lida_Montage_%282017%29.jpg/1280px-Lida_Montage_%282017%29.jpg", coords: { latitude: 53.8872, longitude: 25.3035 } },
      { id: "exaltation-church", name: "Костел Воздвижения Святого Креста", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lida-Church.JPG/1280px-Lida-Church.JPG", coords: { latitude: 53.8907, longitude: 25.2972 } },
      { id: "st-michael-cathedral", name: "Собор Святого Михаила", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lida_Montage_%282017%29.jpg/1280px-Lida_Montage_%282017%29.jpg", coords: { latitude: 53.8938, longitude: 25.3031 } },
      { id: "lida-brewery", name: "Лидский бровар", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lida_Montage_%282017%29.jpg/1280px-Lida_Montage_%282017%29.jpg", coords: { latitude: 53.8780, longitude: 25.3030 } },
      { id: "lida-center", name: "Исторический центр", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lida_Montage_%282017%29.jpg/1280px-Lida_Montage_%282017%29.jpg", coords: { latitude: 53.8907, longitude: 25.3001 } },
    ],
  },
  {
    id: "novogrudok",
    name: "Новогрудок",
    country: "Беларусь",
    region: "Гродненская область",
    description: "Холмистый город с руинами замка, музеем Мицкевича и красивыми видами.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Belarus_Navahrudak_IMG_1730_2175.jpg/1280px-Belarus_Navahrudak_IMG_1730_2175.jpg",
    coords: { latitude: 53.5990, longitude: 25.8268 },
    attractions: [
      { id: "novogrudok-castle", name: "Руины Новогрудского замка", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Belarus_Navahrudak_IMG_1730_2175.jpg/1280px-Belarus_Navahrudak_IMG_1730_2175.jpg", coords: { latitude: 53.5995, longitude: 25.8230 } },
      { id: "mickiewicz-museum", name: "Дом-музей Адама Мицкевича", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Adam_Mickiewicz_wed%C5%82ug_dagerotypu_paryskiego_z_1842_roku.jpg", coords: { latitude: 53.5973, longitude: 25.8269 } },
      { id: "farny-church-novogrudok", name: "Фарный костел", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/%D0%9D%D0%B0%D0%B2%D0%B0%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D1%96%D1%8F_%D0%BA%D1%80%D0%B0%D1%8F%D0%B2%D1%96%D0%B4%D1%8B_%D1%9E_%D1%87%D1%8D%D1%80%D0%B2%D0%B5%D0%BD%D1%96_2020_%2834%29.jpg/1280px-%D0%9D%D0%B0%D0%B2%D0%B0%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D1%96%D1%8F_%D0%BA%D1%80%D0%B0%D1%8F%D0%B2%D1%96%D0%B4%D1%8B_%D1%9E_%D1%87%D1%8D%D1%80%D0%B2%D0%B5%D0%BD%D1%96_2020_%2834%29.jpg", coords: { latitude: 53.6013, longitude: 25.8300 } },
      { id: "boris-gleb-church", name: "Борисоглебская церковь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Church_of_Saints_Boris_and_Gleb%2C_Navahrudak_2018.jpg/1280px-Church_of_Saints_Boris_and_Gleb%2C_Navahrudak_2018.jpg", coords: { latitude: 53.6002, longitude: 25.8240 } },
      { id: "mindaugas-mountain", name: "Гора Миндовга", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/32/Mindo%C5%ADh_Hill%2C_Navahradak.jpg", coords: { latitude: 53.5998, longitude: 25.8347 } },
    ],
  },
  {
    id: "bobruisk",
    name: "Бобруйск",
    country: "Беларусь",
    region: "Могилевская область",
    description: "Крепостной город на Березине с театром, старой застройкой и городскими скульптурами.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Church_of_Saint_Nicholas_%28Babruysk%29_10.jpg/1280px-Church_of_Saint_Nicholas_%28Babruysk%29_10.jpg",
    coords: { latitude: 53.1384, longitude: 29.2214 },
    attractions: [
      { id: "bobruisk-fortress", name: "Бобруйская крепость", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Church_of_Saint_Nicholas_%28Babruysk%29_10.jpg/1280px-Church_of_Saint_Nicholas_%28Babruysk%29_10.jpg", coords: { latitude: 53.1370, longitude: 29.2440 } },
      { id: "bobruisk-theatre", name: "Драматический театр", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/24-2014-22-05-m.jpg", coords: { latitude: 53.1413, longitude: 29.2308 } },
      { id: "st-nicholas-cathedral-bobruisk", name: "Свято-Никольский собор", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/%D0%91%D0%B0%D0%B1%D1%80%D1%83%D0%B9%D1%81%D0%BA%D1%96%D1%8F_%D0%BA%D1%80%D0%B0%D1%8F%D0%B2%D1%96%D0%B4%D1%8B._%D0%A6%D0%B0%D1%80%D0%BA%D0%B2%D0%B0.jpg", coords: { latitude: 53.1388, longitude: 29.2253 } },
      { id: "beaver-monument", name: "Памятник бобру", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Church_of_Saint_Nicholas_%28Babruysk%29_10.jpg/1280px-Church_of_Saint_Nicholas_%28Babruysk%29_10.jpg", coords: { latitude: 53.1365, longitude: 29.2265 } },
      { id: "berezina-embankment", name: "Набережная Березины", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/%D0%A6%D1%8D%D0%BD%D1%82%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D0%BF%D0%BB%D0%BE%D1%88%D1%87%D0%B0_%D0%91%D0%B5%D1%80%D0%B0%D0%B7%D1%96%D0%BD%D0%BE.jpg", coords: { latitude: 53.1450, longitude: 29.2280 } },
    ],
  },
  {
    id: "slonim",
    name: "Слоним",
    country: "Беларусь",
    region: "Гродненская область",
    description: "Город Огинского канала, монастырей и камерного исторического центра.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/St_Andrew%27s_Church%2C_Slonim.jpg/1280px-St_Andrew%27s_Church%2C_Slonim.jpg",
    coords: { latitude: 53.0894, longitude: 25.3199 },
    attractions: [
      { id: "synagogue-slonim", name: "Большая синагога", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Synagogue%2C_Slonim.jpg/1280px-Synagogue%2C_Slonim.jpg", coords: { latitude: 53.0903, longitude: 25.3196 } },
      { id: "andrew-church", name: "Костел Святого Андрея", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/St_Andrew%27s_Church%2C_Slonim.jpg/1280px-St_Andrew%27s_Church%2C_Slonim.jpg", coords: { latitude: 53.0975, longitude: 25.3302 } },
      { id: "oginski-canal", name: "Канал Огинского", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Oginski_canal.jpg/1280px-Oginski_canal.jpg", coords: { latitude: 53.0500, longitude: 25.5500 } },
      { id: "zhyrovichi-monastery", name: "Жировичский монастырь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/%D0%96%D0%B8%D1%80%D0%BE%D0%B2%D0%B8%D1%87%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C%2C_%D0%91%D0%B5%D0%BB%D0%BE%D1%80%D1%83%D1%81%D1%81%D0%B8%D1%8F.jpg/1280px-%D0%96%D0%B8%D1%80%D0%BE%D0%B2%D0%B8%D1%87%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C%2C_%D0%91%D0%B5%D0%BB%D0%BE%D1%80%D1%83%D1%81%D1%81%D0%B8%D1%8F.jpg", coords: { latitude: 53.0146, longitude: 25.4046 } },
      { id: "slonim-center", name: "Исторический центр", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/St_Andrew%27s_Church%2C_Slonim.jpg/1280px-St_Andrew%27s_Church%2C_Slonim.jpg", coords: { latitude: 53.0911, longitude: 25.3204 } },
    ],
  },
  {
    id: "kamenets",
    name: "Каменец",
    country: "Беларусь",
    region: "Брестская область",
    description: "Небольшой город рядом с пущей, известный Белой вежей и спокойным центром.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/%D0%A1%D1%82%D0%B0%D1%80%D1%8B%D0%B9_%D0%9A%D0%B0%D0%BC%D0%B5%D0%BD%D0%B5%D1%86.jpg/1280px-%D0%A1%D1%82%D0%B0%D1%80%D1%8B%D0%B9_%D0%9A%D0%B0%D0%BC%D0%B5%D0%BD%D0%B5%D1%86.jpg",
    coords: { latitude: 52.4040, longitude: 23.8197 },
    attractions: [
      { id: "kamenets-tower", name: "Каменецкая башня", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/%D0%9A%D0%B0%D0%BC%D1%8F%D0%BD%D0%B5%D1%86%D0%BA%D0%B0%D1%8F_%D0%B2%D0%B5%D0%B6%D0%B0.jpg/1280px-%D0%9A%D0%B0%D0%BC%D1%8F%D0%BD%D0%B5%D1%86%D0%BA%D0%B0%D1%8F_%D0%B2%D0%B5%D0%B6%D0%B0.jpg", coords: { latitude: 52.4048, longitude: 23.8195 } },
      { id: "simeon-church", name: "Симеоновская церковь", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/%D0%A1%D1%82%D0%B0%D1%80%D1%8B%D0%B9_%D0%9A%D0%B0%D0%BC%D0%B5%D0%BD%D0%B5%D1%86.jpg/1280px-%D0%A1%D1%82%D0%B0%D1%80%D1%8B%D0%B9_%D0%9A%D0%B0%D0%BC%D0%B5%D0%BD%D0%B5%D1%86.jpg", coords: { latitude: 52.4050, longitude: 23.8156 } },
      { id: "kamenets-museum", name: "Краеведческий музей", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/%D0%A1%D1%82%D0%B0%D1%80%D1%8B%D0%B9_%D0%9A%D0%B0%D0%BC%D0%B5%D0%BD%D0%B5%D1%86.jpg/1280px-%D0%A1%D1%82%D0%B0%D1%80%D1%8B%D0%B9_%D0%9A%D0%B0%D0%BC%D0%B5%D0%BD%D0%B5%D1%86.jpg", coords: { latitude: 52.4053, longitude: 23.8174 } },
      { id: "pushcha-route", name: "Маршрут к Беловежской пуще", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Poland_Bialowieza_-_BPN.jpg", coords: { latitude: 52.7176, longitude: 23.8517 } },
    ],
  },
  {
    id: "mozyr",
    name: "Мозырь",
    country: "Беларусь",
    region: "Гомельская область",
    description: "Холмистый город на Припяти с обзорными точками, костелом и деревянной архитектурой.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mazyr_Montage_%282017%29.jpg/1280px-Mazyr_Montage_%282017%29.jpg",
    coords: { latitude: 52.0451, longitude: 29.2719 },
    attractions: [
      { id: "mozyr-castle-hill", name: "Замковая гора", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/%D0%9C%D0%BE%D0%B7%D1%8B%D1%80%D1%81%D0%BA%D0%B8%D0%B9_%D0%B7%D0%B0%D0%BC%D0%BE%D0%BA.jpg/1280px-%D0%9C%D0%BE%D0%B7%D1%8B%D1%80%D1%81%D0%BA%D0%B8%D0%B9_%D0%B7%D0%B0%D0%BC%D0%BE%D0%BA.jpg", coords: { latitude: 52.0485, longitude: 29.2681 } },
      { id: "st-michael-church-mozyr", name: "Костел Святого Михаила", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mazyr_Montage_%282017%29.jpg/1280px-Mazyr_Montage_%282017%29.jpg", coords: { latitude: 52.0463, longitude: 29.2459 } },
      { id: "pripyat-embankment", name: "Набережная Припяти", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mazyr_Montage_%282017%29.jpg/1280px-Mazyr_Montage_%282017%29.jpg", coords: { latitude: 52.0418, longitude: 29.2520 } },
      { id: "mozyr-ski-center", name: "Горнолыжный комплекс", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mazyr_Montage_%282017%29.jpg/1280px-Mazyr_Montage_%282017%29.jpg", coords: { latitude: 52.0288, longitude: 29.2575 } },
      { id: "mozyr-museum", name: "Краеведческий музей", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mazyr_Montage_%282017%29.jpg/1280px-Mazyr_Montage_%282017%29.jpg", coords: { latitude: 52.0478, longitude: 29.2692 } },
    ],
  },
];

// Компактный конструктор места (картинку подберёт WikiImage по названию).
const mk = (id: string, name: string, latitude: number, longitude: number): Place => ({
  id,
  name,
  imageUrl: "",
  coords: { latitude, longitude },
});

type CityExtras = { restaurants: Place[]; hotels: Place[] };

const CITY_EXTRAS: Record<string, CityExtras> = {
  minsk: {
    restaurants: [
      mk("rest-vasilki", "Кафе «Васильки»", 53.902, 27.5615),
      mk("rest-kuhmistr", "Кухмистр", 53.9045, 27.555),
      mk("rest-grunwald", "Брассерия «Грюнвальд»", 53.9011, 27.5588),
    ],
    hotels: [
      mk("hotel-minsk", "Гостиница «Минск»", 53.898, 27.565),
      mk("hotel-president", "Президент-Отель", 53.909, 27.546),
    ],
  },
  brest: {
    restaurants: [
      mk("rest-jules-verne", "Ресторан «Жюль Верн»", 52.0958, 23.696),
      mk("rest-times", "Times Cafe", 52.095, 23.693),
      mk("rest-pushcha", "Кафе «Пуща»", 52.097, 23.699),
    ],
    hotels: [
      mk("hotel-hermitage", "Отель «Hermitage»", 52.0935, 23.696),
      mk("hotel-intourist", "Гостиница «Интурист»", 52.099, 23.71),
    ],
  },
  grodno: {
    restaurants: [
      mk("rest-karchma", "Корчма «Старый город»", 53.681, 23.83),
      mk("rest-panskaya", "Ресторан «Панская хата»", 53.679, 23.827),
      mk("rest-stary-grodno", "Кафе «Грюнвальд»", 53.68, 23.829),
    ],
    hotels: [
      mk("hotel-semashko", "Отель «Семашко»", 53.677, 23.826),
      mk("hotel-neman", "Гостиница «Неман»", 53.682, 23.833),
    ],
  },
  vitebsk: {
    restaurants: [
      mk("rest-zolotoy-lev", "Ресторан «Золотой лев»", 55.193, 30.203),
      mk("rest-shagal", "Кафе «Шагал»", 55.2, 30.191),
      mk("rest-vasilki-vit", "Кафе «Васильки»", 55.195, 30.206),
    ],
    hotels: [
      mk("hotel-vitebsk", "Гостиница «Витебск»", 55.188, 30.202),
      mk("hotel-eridan", "Отель «Эридан»", 55.196, 30.208),
    ],
  },
  gomel: {
    restaurants: [
      mk("rest-prichal", "Ресторан «Причал»", 52.425, 31.023),
      mk("rest-stary-gomel", "Кафе «Старый город»", 52.424, 31.015),
      mk("rest-vremena", "Кафе «Времена года»", 52.423, 31.01),
    ],
    hotels: [
      mk("hotel-gomel", "Гостиница «Гомель»", 52.426, 31.015),
      mk("hotel-amaks", "Amaks Visit Hotel", 52.429, 31.005),
    ],
  },
  mogilev: {
    restaurants: [
      mk("rest-leninskaya", "Кафе на Ленинской", 53.909, 30.346),
      mk("rest-karchma-mog", "Корчма «Старый город»", 53.902, 30.34),
      mk("rest-brovar-mog", "Ресторан-бровар", 53.9, 30.334),
    ],
    hotels: [
      mk("hotel-mogilev", "Гостиница «Могилев»", 53.895, 30.332),
      mk("hotel-metropol", "Отель «Метрополь»", 53.903, 30.341),
    ],
  },
  polotsk: {
    restaurants: [
      mk("rest-damiana", "Ресторан «Дамиана»", 55.485, 28.764),
      mk("rest-sofia", "Кафе «София»", 55.4847, 28.758),
      mk("rest-prostokvashino", "Кафе «Простоквашино»", 55.486, 28.77),
    ],
    hotels: [
      mk("hotel-dvina", "Гостиница «Двина»", 55.487, 28.772),
      mk("hotel-slavia", "Отель «Славия»", 55.484, 28.766),
    ],
  },
  nesvizh: {
    restaurants: [
      mk("rest-palace-cafe", "Кафе у замка", 53.2225, 26.688),
      mk("rest-ratusha", "Кафе «Ратуша»", 53.2229, 26.675),
      mk("rest-karchma-nes", "Корчма «Несвиж»", 53.221, 26.683),
    ],
    hotels: [
      mk("hotel-palace-nes", "Дворцовый отель", 53.223, 26.69),
      mk("hotel-nesvizh", "Гостиница «Несвиж»", 53.22, 26.681),
    ],
  },
  mir: {
    restaurants: [
      mk("rest-mir-castle-cafe", "Кафе у Мирского замка", 53.4515, 26.474),
      mk("rest-karchma-mir", "Корчма «Мир»", 53.4517, 26.4711),
    ],
    hotels: [
      mk("hotel-mir-zamak", "Отель «Мирский замок»", 53.452, 26.476),
      mk("hotel-mirium", "Гостиница «Мириум»", 53.4525, 26.47),
    ],
  },
  pinsk: {
    restaurants: [
      mk("rest-nad-pinoy", "Ресторан «Над Пиной»", 52.117, 26.097),
      mk("rest-polesie", "Кафе «Полесье»", 52.119, 26.095),
      mk("rest-stary-pinsk", "Кафе «Старый Пинск»", 52.118, 26.094),
    ],
    hotels: [
      mk("hotel-pripyat-pinsk", "Гостиница «Припять»", 52.12, 26.098),
      mk("hotel-spadar", "Отель «Спадар»", 52.116, 26.093),
    ],
  },
  lida: {
    restaurants: [
      mk("rest-lidbir", "Ресторан «Лидбир»", 53.878, 25.303),
      mk("rest-zamok-lida", "Кафе «У замка»", 53.8875, 25.3035),
      mk("rest-stary-lida", "Кафе «Старый город»", 53.8907, 25.3001),
    ],
    hotels: [
      mk("hotel-continent", "Гостиница «Континент»", 53.889, 25.298),
      mk("hotel-lida", "Гостиница «Лида»", 53.886, 25.3),
    ],
  },
  novogrudok: {
    restaurants: [
      mk("rest-mickiewicz-cafe", "Кафе «Мицкевич»", 53.5975, 25.827),
      mk("rest-karchma-nov", "Корчма «Новогрудок»", 53.599, 25.829),
    ],
    hotels: [
      mk("hotel-novogrudok", "Гостиница «Новогрудок»", 53.5985, 25.826),
      mk("hotel-castle-view-nov", "Отель «Замковый»", 53.5995, 25.824),
    ],
  },
  bobruisk: {
    restaurants: [
      mk("rest-bobr", "Кафе «Бобр»", 53.137, 29.227),
      mk("rest-chyrvonaya", "Ресторан «Чырвоная вежа»", 53.141, 29.231),
      mk("rest-stary-bobruisk", "Кафе «Старый город»", 53.139, 29.225),
    ],
    hotels: [
      mk("hotel-bobruisk", "Гостиница «Бобруйск»", 53.138, 29.223),
      mk("hotel-turist-bob", "Гостиница «Турист»", 53.142, 29.23),
    ],
  },
  slonim: {
    restaurants: [
      mk("rest-shchara", "Кафе «Щара»", 53.09, 25.32),
      mk("rest-karchma-slon", "Корчма «Слоним»", 53.091, 25.321),
    ],
    hotels: [
      mk("hotel-slonim", "Гостиница «Слоним»", 53.089, 25.319),
      mk("hotel-vesta-slon", "Отель «Веста»", 53.0905, 25.322),
    ],
  },
  kamenets: {
    restaurants: [
      mk("rest-vezha-cafe", "Кафе «Белая вежа»", 52.4048, 23.819),
      mk("rest-karchma-kam", "Корчма «Каменец»", 52.405, 23.817),
    ],
    hotels: [
      mk("hotel-belovezhsky", "Отель «Беловежский»", 52.4045, 23.821),
      mk("hotel-kamenets", "Гостиница «Каменюки»", 52.403, 23.818),
    ],
  },
  mozyr: {
    restaurants: [
      mk("rest-pripyat-moz", "Кафе «Припять»", 52.042, 29.252),
      mk("rest-nad-pripyatyu", "Ресторан «Над Припятью»", 52.046, 29.26),
      mk("rest-stary-mozyr", "Кафе «Старый Мозырь»", 52.0478, 29.269),
    ],
    hotels: [
      mk("hotel-pripyat-mozyr", "Гостиница «Припять»", 52.045, 29.27),
      mk("hotel-mozyr", "Гостиница «Мозырь»", 52.047, 29.265),
    ],
  },
};

export const CITIES: City[] = BASE_CITIES.map((city) => ({
  ...city,
  restaurants: CITY_EXTRAS[city.id]?.restaurants ?? [],
  hotels: CITY_EXTRAS[city.id]?.hotels ?? [],
}));

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

// Возвращает места из списка в порядке переданных id (работает и для
// достопримечательностей, и для ресторанов/отелей).
export function getPlacesByIds<T extends { id: string }>(
  places: T[],
  ids: string[],
): T[] {
  const ordered: T[] = [];
  for (const id of ids) {
    const found = places.find((p) => p.id === id);
    if (found) ordered.push(found);
  }
  return ordered;
}

export function getAttractionsByIds(city: City, ids: string[]): Attraction[] {
  return getPlacesByIds(city.attractions, ids);
}

export function getRestaurantsByIds(city: City, ids: string[]): Place[] {
  return getPlacesByIds(city.restaurants, ids);
}

export function getHotelById(city: City, id: string | null | undefined): Place | null {
  if (!id) return null;
  return city.hotels.find((h) => h.id === id) ?? null;
}

export function findAttractionById(
  cityId: string,
  attractionId: string,
): { city: City; attraction: Attraction } | null {
  const city = getCityById(cityId);
  if (!city) return null;
  const attraction = city.attractions.find((a) => a.id === attractionId);
  if (!attraction) return null;
  return { city, attraction };
}
