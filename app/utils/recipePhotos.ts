// Openly licensed photos from Wikimedia Commons, one per illustration, served
// from public/photos/<illustration>.webp. All were cropped to 4:3 and resized
// to 1200 × 900. Licenses CC BY and CC BY-SA require this credit to be shown
// next to the photo. See docs/content-sources.md.
export interface PhotoCredit {
  title: string
  author: string
  license: string
  licenseUrl: string
  sourceUrl: string
}

const CC0 = { license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' }
const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`

export const recipePhotos: Record<string, PhotoCredit> = {
  pyre: {
    title: 'Starting solids – homemade baby food in a bowl',
    author: 'MAKY.OREL',
    ...CC0,
    sourceUrl: commons('Starting_solids_-_homemade_baby_food_in_a_bowl.jpg'),
  },
  kase: {
    title: 'A bowl of mashed potatoes laid out for Thanksgiving Dinner',
    author: 'Famartin',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: commons('2019-11-28_14_29_27_A_bowl_of_mashed_potatoes_laid_out_for_Thanksgiving_Dinner_in_the_Parkway_Village_section_of_Ewing_Township,_Mercer_County,_New_Jersey.jpg'),
  },
  polevka: {
    title: 'Bowl of homemade pumpkin soup, Trimingham, Norfolk',
    author: 'Kolforn',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: commons('-2021-11-01_Bowl_of_homemade_pumpkin_soup,_Trimingham,_Norfolk.JPG'),
  },
  testoviny: {
    title: 'Pasta, Tomato Sauce, Parmesan',
    author: 'Katrin Gilger',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: commons('Pasta,_Tomato_Sauce,_Parmesan_(4365946820).jpg'),
  },
  ryze: {
    title: 'Vegetable rice image',
    author: 'safaritravelplus',
    ...CC0,
    sourceUrl: commons('Vegetable_rice_image.jpg'),
  },
  maso: {
    title: 'Chicken breast on Vegetables',
    author: 'FitTasteTic',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: commons('Chicken_breast_on_Vegetables_-_49859595051.jpg'),
  },
  ryba: {
    title: 'Salmon, pan-seared and glazed, with Brussels sprouts and root vegetables',
    author: 'Daderot',
    ...CC0,
    sourceUrl: commons('Salmon,_pan-seared_and_glazed,_with_Brussels_sprouts_and_root_vegetables_-_Massachusetts.jpg'),
  },
  placky: {
    title: 'Zucchini Fritters – Lunch at Yanyali Fehmi Lokantasi',
    author: 'William Neuheisel',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: commons('Zucchini_Fritters_-_Lunch_at_Yanyali_Fehmi_Lokantasi_(6421047753).jpg'),
  },
  palacinky: {
    title: 'Pancakes on table',
    author: 'Shisma',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: commons('Pancakes_on_table.jpg'),
  },
  vafle: {
    title: 'Waffles with Strawberries',
    author: 'Parkerman & Christie',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: commons('Waffles_with_Strawberries.jpg'),
  },
  jogurt: {
    title: 'Yogurt with raisins and banana',
    author: 'Daderot',
    ...CC0,
    sourceUrl: commons('Yogurt_with_raisins_and_banana_-_Massachusetts.jpg'),
  },
  kulicky: {
    title: 'Havregrynskugler',
    author: 'Slaunger',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: commons('Havregrynskugler_2011-12-23.jpg'),
  },
}
