import type { RadioStation } from '@/os/types';

/**
 * The Radio's programming: real public-domain recordings from the acoustic era,
 * streamed from Wikimedia Commons. Ten stations laid out across the FM band.
 *
 * Everything here is genuinely public domain. US sound recordings published
 * before 1925 entered the public domain under the Music Modernization Act, and
 * the U.S. Marine Band sides are federal-government works. That legal ceiling is
 * why the dial stops in the 1920s rather than running to 1984 — it is the real
 * boundary of what can be played freely, not an aesthetic choice.
 *
 * Ogg/Opus/FLAC originals are addressed through Commons' auto-generated MP3
 * transcodes so Safari can play them too; each track keeps its Commons file page.
 *
 * Generated against the Commons API and every URL verified to return audio.
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
    id: 'pianoroll',
    name: 'Piano Roll',
    frequency: '90.5',
    era: '1916–1922 · Player piano',
    accent: '#a8762c',
    tracks: [
      { title: 'Afghanistan', artist: 'Zez Confrey', year: 1920, duration: 167, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9c/Afghanistan%2C_Piano_Roll%2C_Zez_Confrey.opus/Afghanistan%2C_Piano_Roll%2C_Zez_Confrey.opus.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AAfghanistan%2C_Piano_Roll%2C_Zez_Confrey.opus' },
      { title: 'A Little Bit of Rag', artist: 'Paul C. Pratt', year: 1916, duration: 197, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/fb/%22A_Little_Bit_of_Rag%22_%281916%29%2C_by_Paul_C._Pratt.opus/%22A_Little_Bit_of_Rag%22_%281916%29%2C_by_Paul_C._Pratt.opus.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3A%22A_Little_Bit_of_Rag%22_%281916%29%2C_by_Paul_C._Pratt.opus' },
      { title: 'Justin-Tyme', artist: 'Roy Bargy', year: 1922, duration: 175, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Justin-Tyme_%28Roy_Bargy%2C_1922%29_-_Piano_Roll_Transcription_-_MIDI_Playing.opus/Justin-Tyme_%28Roy_Bargy%2C_1922%29_-_Piano_Roll_Transcription_-_MIDI_Playing.opus.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AJustin-Tyme_%28Roy_Bargy%2C_1922%29_-_Piano_Roll_Transcription_-_MIDI_Playing.opus' },
      { title: 'Jungle Time', artist: 'Eric P. Severin', year: 1916, duration: 197, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f9/%22Jungle_Time-_A_Genuine_Rag%22_-_Piano_Roll_By_Eric_P._Severin_Transferred_On_Riverside_RLP_12_-126.opus/%22Jungle_Time-_A_Genuine_Rag%22_-_Piano_Roll_By_Eric_P._Severin_Transferred_On_Riverside_RLP_12_-126.opus.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3A%22Jungle_Time-_A_Genuine_Rag%22_-_Piano_Roll_By_Eric_P._Severin_Transferred_On_Riverside_RLP_12_-126.opus' },
      { title: 'The Japanese Sandman', artist: 'Max Kortlander', year: 1920, duration: 202, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/64/%22The_Japanese_Sandman%22_piano_roll_by_Max_Kortlander.oga/%22The_Japanese_Sandman%22_piano_roll_by_Max_Kortlander.oga.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3A%22The_Japanese_Sandman%22_piano_roll_by_Max_Kortlander.oga' },
    ],
  },
  {
    id: 'jazz',
    name: 'Hot Jazz',
    frequency: '92.5',
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
    id: 'dance',
    name: 'Dance Band',
    frequency: '94.5',
    era: '1914–1920 · Fox trots',
    accent: '#8a5a2b',
    tracks: [
      { title: 'Afghanistan', artist: 'Prince\'s Dance Orchestra', year: 1920, duration: 196, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9a/%22Afghanistan%22_-_Fox_Trot-_Prince%27s_Dance_Orchestra-_Columbia_1920.ogg/%22Afghanistan%22_-_Fox_Trot-_Prince%27s_Dance_Orchestra-_Columbia_1920.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3A%22Afghanistan%22_-_Fox_Trot-_Prince%27s_Dance_Orchestra-_Columbia_1920.ogg' },
      { title: 'Rose Room', artist: 'Riley\'s Cabaret Orchestra', year: 1919, duration: 183, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/32/%22Rose_Room_Fox_Trot%22_%281919%29%2C_by_Riley%27s_Cabaret_Orchestra.oga/%22Rose_Room_Fox_Trot%22_%281919%29%2C_by_Riley%27s_Cabaret_Orchestra.oga.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3A%22Rose_Room_Fox_Trot%22_%281919%29%2C_by_Riley%27s_Cabaret_Orchestra.oga' },
      { title: 'Castle House Rag', artist: 'James Reese Europe', year: 1914, duration: 182, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f5/James_Reese_Europe_-_Castle_House_Rag_%281914%29.ogg/James_Reese_Europe_-_Castle_House_Rag_%281914%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AJames_Reese_Europe_-_Castle_House_Rag_%281914%29.ogg' },
    ],
  },
  {
    id: 'brass',
    name: 'Brass Band',
    frequency: '96.5',
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
    id: 'military',
    name: 'Military Band',
    frequency: '98.5',
    era: '1905–1914 · Regimental',
    accent: '#3f6b2c',
    tracks: [
      { title: 'Fall In Line Suffrage March', artist: 'Victor Military Band', year: 1914, duration: 157, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/93/Fall_In_Line_Suffrage_March-Victor_Military_Band_recorded_July_15%2C_1914.ogg/Fall_In_Line_Suffrage_March-Victor_Military_Band_recorded_July_15%2C_1914.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AFall_In_Line_Suffrage_March-Victor_Military_Band_recorded_July_15%2C_1914.ogg' },
      { title: 'The Victors March', artist: 'Victor Military Band', year: 1914, duration: 163, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/ff/The_Victors_March_%281914%29_-_Victor_17672-A.ogg/The_Victors_March_%281914%29_-_Victor_17672-A.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AThe_Victors_March_%281914%29_-_Victor_17672-A.ogg' },
      { title: 'Varsity March', artist: 'Victor Military Band', year: 1914, duration: 161, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4f/Varsity_March_%281914%29_-_Victor_17672-B.ogg/Varsity_March_%281914%29_-_Victor_17672-B.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AVarsity_March_%281914%29_-_Victor_17672-B.ogg' },
      { title: 'Happy Heinie', artist: 'J. Bodewalt Lampe', year: 1905, duration: 228, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/%22Happy_Heinie%22%2C_by_J._Bodewalt_Lampe_%281905%29.opus/%22Happy_Heinie%22%2C_by_J._Bodewalt_Lampe_%281905%29.opus.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3A%22Happy_Heinie%22%2C_by_J._Bodewalt_Lampe_%281905%29.opus' },
    ],
  },
  {
    id: 'spiritual',
    name: 'Spirituals',
    frequency: '100.5',
    era: '1909–1914 · Jubilee singers',
    accent: '#6b6b2c',
    tracks: [
      { title: 'Swing Low, Sweet Chariot', artist: 'Fisk Jubilee Singers', year: 1909, duration: 180, src: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Swing_Low%2C_Sweet_Chariot_-_Fisk_Jubilee_Singers_%281909%29.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ASwing_Low%2C_Sweet_Chariot_-_Fisk_Jubilee_Singers_%281909%29.mp3' },
      { title: 'Golden Slippers', artist: 'Fisk Jubilee Singers', year: 1909, duration: 164, src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Golden_Slippers_%281909%2C_Fisk_University_Jubilee_Singers%29.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AGolden_Slippers_%281909%2C_Fisk_University_Jubilee_Singers%29.mp3' },
      { title: 'The Old Time Religion', artist: 'Tuskegee Institute Singers', year: 1914, duration: 171, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d5/The_Old_Time_Religion_-_Tuskegee_Institute_Singers.flac/The_Old_Time_Religion_-_Tuskegee_Institute_Singers.flac.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AThe_Old_Time_Religion_-_Tuskegee_Institute_Singers.flac' },
    ],
  },
  {
    id: 'blues',
    name: 'Blues',
    frequency: '102.5',
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
    id: 'tango',
    name: 'Tango',
    frequency: '104.5',
    era: '1914–1924 · Rio de la Plata',
    accent: '#8a2a5a',
    tracks: [
      { title: 'Mi Noche Triste', artist: 'Carlos Gardel', year: 1917, duration: 186, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/05/CarlosGardel-MiNocheTriste%281917%29.ogg/CarlosGardel-MiNocheTriste%281917%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ACarlosGardel-MiNocheTriste%281917%29.ogg' },
      { title: 'Adiós Buenos Aires', artist: 'Eduardo Arolas', year: 1917, duration: 184, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/30/Arolas-AdiosBsAs-%281917%29.ogg/Arolas-AdiosBsAs-%281917%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AArolas-AdiosBsAs-%281917%29.ogg' },
      { title: 'Ay, Ay, Ay', artist: 'Carlos Gardel', year: 1919, duration: 180, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bc/Carlos_Gardel-Ay%2C_ay%2C_ay_%281919%29.ogg/Carlos_Gardel-Ay%2C_ay%2C_ay_%281919%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ACarlos_Gardel-Ay%2C_ay%2C_ay_%281919%29.ogg' },
      { title: 'Amame Mucho', artist: 'Gardel & Razzano', year: 1917, duration: 182, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/80/Gardel%26Razzano-AmameMucho%281917%29.ogg/Gardel%26Razzano-AmameMucho%281917%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3AGardel%26Razzano-AmameMucho%281917%29.ogg' },
      { title: 'Desdichas', artist: 'Carlos Gardel', year: 1923, duration: 125, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f4/Carlos_Gardel-Desdichas_%281923%29.ogg/Carlos_Gardel-Desdichas_%281923%29.ogg.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ACarlos_Gardel-Desdichas_%281923%29.ogg' },
      { title: 'Pobre Amigo', artist: 'Carlos Gardel', year: 1924, duration: 171, src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0d/Carlos_Gardel_-_Pobre_amigo_%281924%29.flac/Carlos_Gardel_-_Pobre_amigo_%281924%29.flac.mp3', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File%3ACarlos_Gardel_-_Pobre_amigo_%281924%29.flac' },
    ],
  },
  {
    id: 'opera',
    name: 'Grand Opera',
    frequency: '106.5',
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
