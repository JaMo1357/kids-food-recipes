// Ingredient catalog: the source of truth for allergens and age limits.
// `allergens` is mandatory on purpose (scripts/build-seed.mjs enforces it), so
// nobody can add an ingredient without deciding what it contains. A child
// inherits the allergens of its `parent`. Groups only exist for filtering.
//
// Age limits follow the Czech guidance collected in docs/content-sources.md.
// They need review by a paediatric nutritionist before a public launch.

const group = (slug, name, extra = {}) => ({ slug, name, group: true, allergens: [], ...extra })
const item = (slug, name, allergens = [], extra = {}) => ({ slug, name, allergens, ...extra })

export const ingredients = [
  group('maso', 'Maso (všechno)'),
  group('drubezi-maso', 'Drůbeží maso', { parent: 'maso' }),
  item('kureci-maso', 'kuřecí maso', [], { parent: 'drubezi-maso' }),
  item('kruti-maso', 'krůtí maso', [], { parent: 'drubezi-maso' }),
  item('kralici-maso', 'králičí maso', [], { parent: 'maso' }),
  item('hovezi-maso', 'hovězí maso', [], { parent: 'maso' }),
  item('mlete-hovezi', 'mleté hovězí maso', [], { parent: 'hovezi-maso' }),
  item('mlete-kruti', 'mleté krůtí maso', [], { parent: 'kruti-maso' }),

  group('ryby', 'Ryby (všechny)', { allergens: ['fish'] }),
  item('losos', 'losos', [], { parent: 'ryby' }),

  group('mlecne-vyrobky', 'Mléčné výrobky (všechny)', { allergens: ['milk'] }),
  item('materske-mleko', 'mateřské nebo kojenecké mléko', [], {
    parent: 'mlecne-vyrobky',
  }),
  item('mleko', 'plnotučné mléko', [], {
    parent: 'mlecne-vyrobky',
    minAge: 12,
    ageNote: 'Neupravené kravské mléko až po 1. roce.',
  }),
  item('jogurt', 'bílý jogurt', [], { parent: 'mlecne-vyrobky', minAge: 8 }),
  item('tvaroh', 'tvaroh', [], { parent: 'mlecne-vyrobky', minAge: 12 }),
  item('smetana', 'smetana ke šlehání', [], { parent: 'mlecne-vyrobky', minAge: 12 }),
  item('tvrdy-syr', 'tvrdý sýr', [], { parent: 'mlecne-vyrobky', minAge: 12 }),
  item('kozi-syr', 'měkký kozí sýr', [], { parent: 'mlecne-vyrobky', minAge: 12 }),
  item('kremovy-syr', 'krémový sýr', [], { parent: 'mlecne-vyrobky', minAge: 10 }),
  item('maslo', 'máslo', [], { parent: 'mlecne-vyrobky' }),

  item('vejce', 'vejce', ['eggs']),
  item('zloutek', 'vaječný žloutek', [], { parent: 'vejce' }),

  group('obiloviny-s-lepkem', 'Obiloviny s lepkem (všechny)', { allergens: ['gluten'] }),
  item('hladka-mouka', 'hladká pšeničná mouka', [], { parent: 'obiloviny-s-lepkem' }),
  item('spaldova-mouka', 'špaldová mouka', [], { parent: 'obiloviny-s-lepkem' }),
  item('zitna-mouka', 'žitná mouka', [], { parent: 'obiloviny-s-lepkem' }),
  // Oats are listed as a gluten cereal by the EU regulation.
  item('ovesne-vlocky', 'ovesné vločky', [], { parent: 'obiloviny-s-lepkem' }),
  item('testoviny', 'těstoviny bez vajec', [], { parent: 'obiloviny-s-lepkem' }),
  item('spagety', 'špagety bez vajec', [], { parent: 'obiloviny-s-lepkem' }),
  item('kuskus', 'kuskus', [], { parent: 'obiloviny-s-lepkem' }),

  group('lusteniny', 'Luštěniny (všechny)'),
  item('cervena-cocka', 'červená čočka', [], { parent: 'lusteniny', minAge: 7 }),
  item('cerna-cocka', 'černá čočka', [], { parent: 'lusteniny', minAge: 10 }),
  item('cizrna', 'cizrna', [], { parent: 'lusteniny', minAge: 10 }),
  item('hrasek', 'hrášek', [], { parent: 'lusteniny' }),

  group('cibulova-zelenina', 'Cibule, česnek a pórek'),
  item('cibule', 'cibule', [], { parent: 'cibulova-zelenina' }),
  item('cesnek', 'česnek', [], { parent: 'cibulova-zelenina' }),
  item('porek', 'pórek', [], { parent: 'cibulova-zelenina' }),

  item('ryze', 'rýže'),
  item('jahly', 'jáhly'),

  item('mrkev', 'mrkev'),
  item('brambory', 'brambory'),
  item('batat', 'batát'),
  item('dyne', 'dýně hokaido'),
  item('brokolice', 'brokolice'),
  item('kvetak', 'květák'),
  item('cuketa', 'cuketa'),
  item('kedluben', 'kedluben'),
  item('cervena-repa', 'červená řepa'),
  item('celer', 'celer', ['celery']),
  item('petrzel-koren', 'kořenová petržel'),
  item('rajcata', 'rajčata'),
  item('pasirovana-rajcata', 'pasírovaná rajčata'),
  item('paprika', 'červená paprika'),

  item('jablko', 'jablko'),
  item('banan', 'banán'),
  item('merunka', 'meruňky'),
  item('boruvky', 'borůvky'),

  item('olivovy-olej', 'olivový olej'),
  item('repkovy-olej', 'řepkový olej'),
  item('petrzelova-nat', 'petrželová nať'),
  item('bazalka', 'bazalka'),
  item('majoranka', 'majoránka'),
  item('tymian', 'tymián'),
  item('skorice', 'skořice'),
  item('kokos', 'jemně mletý kokos'),
  item('kypriciprasek', 'kypřicí prášek'),
  item('kakao', 'kakao', [], { minAge: 24 }),
  item('med', 'med', [], {
    minAge: 12,
    ageNote: 'Med je do 1 roku nevhodný (riziko kojeneckého botulismu).',
  }),
]

export const allergens = [
  ['gluten', 1, 'Lepek', '🌾'],
  ['crustaceans', 2, 'Korýši', '🦀'],
  ['eggs', 3, 'Vejce', '🥚'],
  ['fish', 4, 'Ryby', '🐟'],
  ['peanuts', 5, 'Arašídy', '🥜'],
  ['soy', 6, 'Sója', '🫘'],
  ['milk', 7, 'Mléko', '🥛'],
  ['nuts', 8, 'Ořechy', '🌰'],
  ['celery', 9, 'Celer', '🥬'],
  ['mustard', 10, 'Hořčice', '🌭'],
  ['sesame', 11, 'Sezam', '🌱'],
  ['sulphites', 12, 'Siřičitany', '🧪'],
  ['lupin', 13, 'Vlčí bob', '🌼'],
  ['molluscs', 14, 'Měkkýši', '🐚'],
]

export const tags = [
  ['snidane', 'meal', 'Snídaně', 1],
  ['obed', 'meal', 'Oběd', 2],
  ['polevka', 'meal', 'Polévka', 3],
  ['svacina', 'meal', 'Svačina', 4],
  ['vecere', 'meal', 'Večeře', 5],
  ['prvni-prikrm', 'occasion', 'První příkrmy', 6],
  ['do-ruky', 'occasion', 'Do ručičky', 7],
  ['pro-celou-rodinu', 'occasion', 'Pro celou rodinu', 8],
]
