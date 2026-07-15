import type { RadioStation } from '@/os/types';

/**
 * The Radio channel's programming: real public-domain recordings from the
 * acoustic era, streamed from Wikimedia Commons.
 *
 * Everything here is genuinely public domain. US sound recordings published
 * before 1925 entered the public domain under the Music Modernization Act, and
 * the U.S. Marine Band sides are federal-government works. That legal ceiling is
 * why the dial stops at the 1920s rather than running to 1984 — it is the real
 * boundary of what can be played freely, not an aesthetic choice.
 *
 * Ogg/Opus/FLAC originals are addressed through Commons' auto-generated MP3
 * transcodes so Safari can play them too; each track keeps its Commons file page
 * for attribution.
 *
 * Generated against the Commons API and verified to return audio; see
 * RadioApp for playback.
 */
export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'ragtime',
    name: 'Ragtime',
    frequency: '88.5',
    era: '1899–1916 · Piano rags',
    accent: '#c8922e',
    tracks: [
      { title: 'Maple Leaf Rag', artist: 'Scott Joplin', year: 1899, duration: 131, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e9/Maple_Leaf_Rag_-_played_by_Scott_Joplin_1916_sample.ogg/Maple_Leaf_Rag_-_played_by_Scott_Joplin_1916_sample.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AMaple_Leaf_Rag_-_played_by_Scott_Joplin_1916_sample.ogg' },
      { title: 'The Entertainer', artist: 'Scott Joplin', year: 1902, duration: 201, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2c/The_Entertainer_-_1902_-_By_Scott_Joplin.ogg/The_Entertainer_-_1902_-_By_Scott_Joplin.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AThe_Entertainer_-_1902_-_By_Scott_Joplin.ogg' },
      { title: 'Gladiolus Rag', artist: 'Scott Joplin', year: 1907, duration: 202, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/88/Scott_Joplin_-_Gladiolus_Rag_%281907%29.ogg/Scott_Joplin_-_Gladiolus_Rag_%281907%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AScott_Joplin_-_Gladiolus_Rag_%281907%29.ogg' },
      { title: 'Peacherine Rag', artist: 'Scott Joplin', year: 1901, duration: 194, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/15/Scott_Joplin_-_Peacherine_Rag_%281901%29.ogg/Scott_Joplin_-_Peacherine_Rag_%281901%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AScott_Joplin_-_Peacherine_Rag_%281901%29.ogg' },
      { title: 'Paragon Rag', artist: 'Scott Joplin', year: 1909, duration: 198, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d6/Scott_Joplin_-_Paragon_Rag_%281909%29.ogg/Scott_Joplin_-_Paragon_Rag_%281909%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AScott_Joplin_-_Paragon_Rag_%281909%29.ogg' },
      { title: 'Magnetic Rag', artist: 'Scott Joplin', year: 1914, duration: 270, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/67/Scott_Joplin_-_Magnetic_Rag_%281914%29.ogg/Scott_Joplin_-_Magnetic_Rag_%281914%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AScott_Joplin_-_Magnetic_Rag_%281914%29.ogg' },
    ],
  },
  {
    id: 'jazz',
    name: 'Hot Jazz',
    frequency: '92.7',
    era: '1912–1921 · Dixieland',
    accent: '#9a2a2a',
    tracks: [
      { title: 'Livery Stable Blues', artist: 'Original Dixieland Jass Band', year: 1917, duration: 190, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/42/ODJB_Livery_Stable_Blues_1917.ogg/ODJB_Livery_Stable_Blues_1917.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AODJB_Livery_Stable_Blues_1917.ogg' },
      { title: 'Dixie Jass Band One Step', artist: 'Original Dixieland Jass Band', year: 1917, duration: 155, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/00/OriginalDixielandJassBand_DixieJassBandOneStep1917.ogg/OriginalDixielandJassBand_DixieJassBandOneStep1917.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AOriginalDixielandJassBand_DixieJassBandOneStep1917.ogg' },
      { title: 'Jazz Me Blues', artist: 'Original Dixieland Jazz Band', year: 1921, duration: 179, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/62/OriginalDixielandJassBand-JazzMeBlues.ogg/OriginalDixielandJassBand-JazzMeBlues.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AOriginalDixielandJassBand-JazzMeBlues.ogg' },
      { title: 'Margie', artist: 'Original Dixieland Jazz Band', year: 1920, duration: 213, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/47/Margie_-_Original_Dixieland_Jazz_Band.flac/Margie_-_Original_Dixieland_Jazz_Band.flac.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AMargie_-_Original_Dixieland_Jazz_Band.flac' },
      { title: 'The Memphis Blues', artist: 'W. C. Handy', year: 1912, duration: 204, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/32/W._C._Handy_-_The_Memphis_Blues_%281912%29.ogg/W._C._Handy_-_The_Memphis_Blues_%281912%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AW._C._Handy_-_The_Memphis_Blues_%281912%29.ogg' },
      { title: 'Rose Room Fox Trot', artist: 'Art Hickman', year: 1917, duration: 133, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2e/%22Rose_Room_Fox_Trot%22_%281917%29%2C_by_Art_Hickman.ogg/%22Rose_Room_Fox_Trot%22_%281917%29%2C_by_Art_Hickman.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3A%22Rose_Room_Fox_Trot%22_%281917%29%2C_by_Art_Hickman.ogg' },
    ],
  },
  {
    id: 'brass',
    name: 'Brass Band',
    frequency: '96.3',
    era: '1885–1920 · Marches',
    accent: '#1f6f3e',
    tracks: [
      { title: 'Comrades of the Legion', artist: 'Sousa / U.S. Marine Band', year: 1920, duration: 165, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/de/John_Philip_Sousa_-_Comrades_of_the_Legion.ogg/John_Philip_Sousa_-_Comrades_of_the_Legion.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AJohn_Philip_Sousa_-_Comrades_of_the_Legion.ogg' },
      { title: 'The Fairest of the Fair', artist: 'Sousa / U.S. Marine Band', year: 1908, duration: 213, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/18/Sousa_The_Fairest_of_the_Fair_United_States_Marine_Band.ogg/Sousa_The_Fairest_of_the_Fair_United_States_Marine_Band.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ASousa_The_Fairest_of_the_Fair_United_States_Marine_Band.ogg' },
      { title: 'The High School Cadets', artist: 'Sousa / U.S. Marine Band', year: 1890, duration: 154, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Sousa_The_High_School_Cadets_United_States_Marine_Band.ogg/Sousa_The_High_School_Cadets_United_States_Marine_Band.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ASousa_The_High_School_Cadets_United_States_Marine_Band.ogg' },
      { title: 'Mikado March', artist: 'Sousa / U.S. Marine Band', year: 1885, duration: 133, src: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Sousa%27s_%22Mikado_March%22_-_United_States_Marine_Band_%282016%29.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ASousa%27s_%22Mikado_March%22_-_United_States_Marine_Band_%282016%29.mp3' },
      { title: 'The Chantyman\'s March', artist: 'Sousa / U.S. Marine Band', year: 1918, duration: 166, src: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Sousa%27s_%22The_Chantyman%27s_March%22_-_United_States_Marine_Band_%282019%29.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ASousa%27s_%22The_Chantyman%27s_March%22_-_United_States_Marine_Band_%282019%29.mp3' },
    ],
  },
  {
    id: 'blues',
    name: 'Blues',
    frequency: '101.1',
    era: '1917–1923 · Classic blues',
    accent: '#2a4a8a',
    tracks: [
      { title: 'Crazy Blues', artist: 'Mamie Smith', year: 1920, duration: 211, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/dc/Mamie_Smith%2C_Crazy_Blues.ogg/Mamie_Smith%2C_Crazy_Blues.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AMamie_Smith%2C_Crazy_Blues.ogg' },
      { title: 'Downhearted Blues', artist: 'Bessie Smith', year: 1923, duration: 205, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/27/Bessie_Smith_-_Downhearted_Blues_%281923%29.ogg/Bessie_Smith_-_Downhearted_Blues_%281923%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ABessie_Smith_-_Downhearted_Blues_%281923%29.ogg' },
      { title: 'Beale Street Blues', artist: 'W. C. Handy', year: 1917, duration: 121, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5b/Beale_Street_Blues_by_W._C._Handy_%281917%2C_Blues_piano%29.opus/Beale_Street_Blues_by_W._C._Handy_%281917%2C_Blues_piano%29.opus.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ABeale_Street_Blues_by_W._C._Handy_%281917%2C_Blues_piano%29.opus' },
      { title: 'If You Don\'t I Know Who Will', artist: 'Bessie Smith', year: 1923, duration: 214, src: 'https://upload.wikimedia.org/wikipedia/commons/6/61/If_you_don%27t_I_know_who_will_%28Smith%2C_Henderson%2C_1923%29.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AIf_you_don%27t_I_know_who_will_%28Smith%2C_Henderson%2C_1923%29.mp3' },
    ],
  },
  {
    id: 'opera',
    name: 'Grand Opera',
    frequency: '105.9',
    era: '1905–1906 · Acoustic era',
    accent: '#6b3fa0',
    tracks: [
      { title: 'Il bacio', artist: 'Adelina Patti', year: 1906, duration: 156, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5f/Arditi-Adelina_Patti-Il_bacio-%281906%29.ogg/Arditi-Adelina_Patti-Il_bacio-%281906%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AArditi-Adelina_Patti-Il_bacio-%281906%29.ogg' },
      { title: 'La Sonnambula: Ah! non credea mirarti', artist: 'Adelina Patti', year: 1906, duration: 203, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/aa/Bellini-La_Sonnambula-Adelina_Patti-Ah%21_non_credea_mirarti-%281906%29.ogg/Bellini-La_Sonnambula-Adelina_Patti-Ah%21_non_credea_mirarti-%281906%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ABellini-La_Sonnambula-Adelina_Patti-Ah%21_non_credea_mirarti-%281906%29.ogg' },
      { title: 'Don Giovanni: Batti, batti o bel Masetto', artist: 'Adelina Patti', year: 1905, duration: 198, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/04/Mozart-Don_Giovanni-Adelina_Patti-Batti%2C_batti_o_bel_Masetto-%281905%29.ogg/Mozart-Don_Giovanni-Adelina_Patti-Batti%2C_batti_o_bel_Masetto-%281905%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AMozart-Don_Giovanni-Adelina_Patti-Batti%2C_batti_o_bel_Masetto-%281905%29.ogg' },
      { title: 'The Last Rose of Summer', artist: 'Adelina Patti', year: 1906, duration: 161, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/Stevenson-Moore-Adelina_Patti-The_last_rose_of_summer-%281906%29.ogg/Stevenson-Moore-Adelina_Patti-The_last_rose_of_summer-%281906%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AStevenson-Moore-Adelina_Patti-The_last_rose_of_summer-%281906%29.ogg' },
      { title: 'Mignon: Connais-tu le pays', artist: 'Adelina Patti', year: 1906, duration: 153, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7a/Thomas-Mignon-Adelina_Patti-Connais-tu_le_pays-%281906%29.ogg/Thomas-Mignon-Adelina_Patti-Connais-tu_le_pays-%281906%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AThomas-Mignon-Adelina_Patti-Connais-tu_le_pays-%281906%29.ogg' },
    ],
  },
];
