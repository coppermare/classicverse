import type { F1WinImage } from '@/types/f1';

/** Research candidates for McLaren's pre-2024 Grand Prix victories.
 *
 * These are deliberately not treated as display-ready: several come from
 * editorial agencies or pages without a documented reuse licence. The central
 * resolver keeps them quarantined until a rights-cleared replacement is added.
 */
const ROWS: readonly [number, string, string, string, string][] = [
  [
    1,
    "https://motorsportmagazine.b-cdn.net/wp-content/uploads/2014/07/1968-Belgian-GP-McLaren-1600x1067.jpg",
    "https://www.motorsportmagazine.com/archive/article/july-1968/14/xxvii-belgian-grand-prix/",
    "1968 F1 Belgian Grand Prix report: McLaren's first victory July 1968 ...",
    "1968 Belgian Grand Prix"
  ],
  [
    2,
    "https://c8.alamy.com/comp/3ABN5BN/race-winner-denny-hulme-nzl-mclaren-m7a-leads-johnny-servoz-gavin-fra-matra-ms10-2nd-placeitalian-grand-prix-monza-italy-8-september-1968-credit-image-sutton-motorsportszuma-press-3ABN5BN.jpg",
    "https://www.alamy.com/race-winner-denny-hulme-nzl-mclaren-m7a-leads-johnny-servoz-gavin-fra-matra-ms10-2nd-placeitalian-grand-prix-monza-italy-8-september-1968-credit-image-sutton-motorsportszuma-press-image661220441.html",
    "Race winner Denny Hulme (NZL) McLaren M7A leads Johnny Servoz-Gavin ...",
    "1968 Italian Grand Prix"
  ],
  [
    3,
    "https://motorsportmagazine.b-cdn.net/wp-content/uploads/2014/07/1968-Canadian-GP-Oliver-600x400.jpg",
    "https://www.motorsportmagazine.com/archive/article/november-1968/38/canadian-grand-prix-15/",
    "1968 Canadian Grand Prix race report: Denny Hulme dominates November ...",
    "1968 Canadian Grand Prix"
  ],
  [
    4,
    "https://c8.alamy.com/comp/3ABNA9H/denny-hulme-nzl-mclaren-m7a-won-the-final-gp-of-the-season-and-of-the-decademexican-grand-prix-mexico-city-19-october-1969best-image-credit-image-sutton-motorsportszuma-press-3ABNA9H.jpg",
    "https://www.alamy.com/denny-hulme-nzl-mclaren-m7a-won-the-final-gp-of-the-season-and-of-the-decademexican-grand-prix-mexico-city-19-october-1969best-image-credit-image-sutton-motorsportszuma-press-image661224301.html",
    "Denny Hulme (NZL) McLaren M7A won the final GP of the season and of the ...",
    "1969 Mexican Grand Prix"
  ],
  [
    5,
    "https://c8.alamy.com/comp/3ABN9NJ/denny-hulme-nzl-mclaren-celebrates-his-victory-with-the-impressive-winners-trophysouth-african-grand-prix-kyalami-4-march-1972best-image-credit-image-sutton-motorsportszuma-press-3ABN9NJ.jpg",
    "https://www.alamy.com/denny-hulme-nzl-mclaren-celebrates-his-victory-with-the-impressive-winners-trophysouth-african-grand-prix-kyalami-4-march-1972best-image-credit-image-sutton-motorsportszuma-press-image661223854.html",
    "Denny Hulme (NZL) McLaren celebrates his victory with the impressive ...",
    "1972 South African Grand Prix"
  ],
  [
    6,
    "https://motorsportmagazine.b-cdn.net/wp-content/uploads/2014/07/1973-Swedish-GP-Hulme-feature-1600x1067.jpg",
    "https://www.motorsportmagazine.com/archive/article/july-1973/29/sweidsh-grand-prix/",
    "1973 Swedish Grand Prix race report",
    "1973 Swedish Grand Prix"
  ],
  [
    7,
    "https://c8.alamy.com/comp/E10MHT/jul-15-1973-american-peter-revson-wins-the-british-grand-prix-after-E10MHT.jpg",
    "https://www.alamy.com/jul-15-1973-american-peter-revson-wins-the-british-grand-prix-after-image69472308.html",
    "Jul. 15, 1973 - American Peter Revson Wins The British Grand Prix After ...",
    "1973 British Grand Prix"
  ],
  [
    8,
    "https://c8.alamy.com/comp/3ABNG31/an-artist-draws-the-mclaren-m23-of-race-winner-peter-revson-usa-in-the-pitscanadian-grand-prix-rd-14-mosport-park-canada-23-september-1973-credit-image-sutton-motorsportszuma-press-3ABNG31.jpg",
    "https://www.alamy.com/an-artist-draws-the-mclaren-m23-of-race-winner-peter-revson-usa-in-the-pitscanadian-grand-prix-rd-14-mosport-park-canada-23-september-1973-credit-image-sutton-motorsportszuma-press-image661228821.html",
    "An artist draws the McLaren M23 of race winner Peter Revson (USA) in ...",
    "1973 Canadian Grand Prix"
  ],
  [
    9,
    "https://c8.alamy.com/comp/3ABNP40/denny-hulme-nzl-mclaren-m23-takes-the-chequered-flag-to-steal-a-last-lap-victoryargentinean-grand-prix-rd1-buenos-aires-argentina-13-january-1974-credit-image-sutton-motorsportszuma-press-3ABNP40.jpg",
    "https://www.alamy.com/denny-hulme-nzl-mclaren-m23-takes-the-chequered-flag-to-steal-a-last-lap-victoryargentinean-grand-prix-rd1-buenos-aires-argentina-13-january-1974-credit-image-sutton-motorsportszuma-press-image661233552.html",
    "Denny Hulme (NZL) McLaren M23 takes the chequered flag to steal a last ...",
    "1974 Argentine Grand Prix"
  ],
  [
    10,
    "https://c8.alamy.com/comp/3ABNEJ5/the-podium-l-to-r-clay-regazzoni-sui-ferrari-second-emerson-fittipaldi-bra-mclaren-winner-jacky-ickx-bel-lotus-thirdbrazilian-grand-prix-interlagos-27-january-1974best-image-credit-image-sutton-motorsportszuma-press-3ABNEJ5.jpg",
    "https://www.alamy.com/the-podium-l-to-r-clay-regazzoni-sui-ferrari-second-emerson-fittipaldi-bra-mclaren-winner-jacky-ickx-bel-lotus-thirdbrazilian-grand-prix-interlagos-27-january-1974best-image-credit-image-sutton-motorsportszuma-press-image661227677.html",
    "The podium (L to R): Clay Regazzoni (SUI) Ferrari second; Emerson ...",
    "1974 Brazilian Grand Prix"
  ],
  [
    11,
    "https://c8.alamy.com/comp/3ABNPC1/race-winner-emerson-fittipaldi-bra-mclaren-celebrates-on-the-podium-with-the-brazilian-flag-and-the-texaco-girls-second-placed-niki-lauda-aut-ferrari-watches-on-leftbelgian-grand-prix-rd-5-nivelles-baulers-belgium-12-may-1974-credit-image-sutton-motorsportszuma-press-3ABNPC1.jpg",
    "https://www.alamy.com/race-winner-emerson-fittipaldi-bra-mclaren-celebrates-on-the-podium-with-the-brazilian-flag-and-the-texaco-girls-second-placed-niki-lauda-aut-ferrari-watches-on-leftbelgian-grand-prix-rd-5-nivelles-baulers-belgium-12-may-1974-credit-image-sutton-motorsportszuma-press-image661233777.html",
    "Race winner Emerson Fittipaldi (BRA) McLaren celebrates on the podium ...",
    "1974 Belgian Grand Prix"
  ],
  [
    12,
    "https://c8.alamy.com/comp/3ABNFKA/the-podium-l-to-r-clay-regazzoni-sui-ferrari-second-emerson-fittipaldi-bra-mclaren-winner-ronnie-peterson-swe-lotus-thirdcanadian-grand-prix-mosport-park-22-september-1974best-image-credit-image-sutton-motorsportszuma-press-3ABNFKA.jpg",
    "https://www.alamy.com/the-podium-l-to-r-clay-regazzoni-sui-ferrari-second-emerson-fittipaldi-bra-mclaren-winner-ronnie-peterson-swe-lotus-thirdcanadian-grand-prix-mosport-park-22-september-1974best-image-credit-image-sutton-motorsportszuma-press-image661228494.html",
    "The podium (L to R): Clay Regazzoni (SUI) Ferrari, second, Emerson ...",
    "1974 Canadian Grand Prix"
  ],
  [
    13,
    "https://c8.alamy.com/comp/3ABNHRD/race-winner-emerson-fittipaldi-bra-mclaren-m23-leads-ronnie-peterson-swe-lotus-72e-who-retired-on-lap-16-with-a-gearbox-failureargentinean-grand-prix-buenos-aires-12-january-1975best-image-credit-image-sutton-motorsportszuma-press-3ABNHRD.jpg",
    "https://www.alamy.com/race-winner-emerson-fittipaldi-bra-mclaren-m23-leads-ronnie-peterson-swe-lotus-72e-who-retired-on-lap-16-with-a-gearbox-failureargentinean-grand-prix-buenos-aires-12-january-1975best-image-credit-image-sutton-motorsportszuma-press-image661230177.html",
    "Race winner Emerson Fittipaldi (BRA) McLaren M23 leads Ronnie Peterson ...",
    "1975 Argentine Grand Prix"
  ],
  [
    14,
    "https://ichef.bbci.co.uk/ace/standard/1024/cpsprodpb/3b3e/live/11da27b0-2944-11f0-a3a8-3d259a3673a2.jpg",
    "https://www.bbc.co.uk/sport/formula1/articles/cly5d21ve9lo",
    "Jochen Mass, who won 1975 Spanish Grand Prix, dies aged 78 - BBC Sport",
    "1975 Spanish Grand Prix"
  ],
  [
    15,
    "https://c8.alamy.com/comp/3ABNHHR/emerson-fittipaldi-bra-mclaren-celebrates-his-fourteenth-and-final-gp-victory-on-the-podium-with-teddy-mayer-usa-mclaren-team-managerbritish-grand-prix-silverstone-19-july-1975-credit-image-sutton-motorsportszuma-press-3ABNHHR.jpg",
    "https://www.alamy.com/emerson-fittipaldi-bra-mclaren-celebrates-his-fourteenth-and-final-gp-victory-on-the-podium-with-teddy-mayer-usa-mclaren-team-managerbritish-grand-prix-silverstone-19-july-1975-credit-image-sutton-motorsportszuma-press-image661230019.html",
    "Emerson Fittipaldi (BRA) McLaren celebrates his fourteenth and final GP ...",
    "1975 British Grand Prix"
  ],
  [
    16,
    "https://motorsportmagazine.b-cdn.net/wp-content/uploads/2014/07/1976-Spanish-GP-feature-2-1600x1067.jpg",
    "https://www.motorsportmagazine.com/archive/article/june-1976/35/the-spanish-grand-prix-2/",
    "1976 Spanish Grand Prix race report",
    "1976 Spanish Grand Prix"
  ],
  [
    17,
    "https://64.media.tumblr.com/f8c66ee5e96f1253dce1bd6ccab93e7c/0d2e2e2784cc9933-52/s640x960/9b6fd98e24a87a8dbde6460d109faa750a90cd7a.jpg",
    "https://www.tumblr.com/dailyjameshunt/799266683053293568/james-hunt-on-the-podium-at-the-french-grand-prix",
    "James Hunt on the podium at the French Grand Prix in Paul Ricard, 1976 ...",
    "1976 French Grand Prix"
  ],
  [
    18,
    "https://internal-combustion.com/nuvolari/wp-content/uploads/post2/Lastflag_james_hunt__germany_1976_-da06awz.jpg",
    "https://internal-combustion.com/nuvolari/james-hunt-germany-1976-f1-2/",
    "james hunt germany 1976 #F1 - Internal-Combustion.com",
    "1976 German Grand Prix"
  ],
  [
    19,
    "https://c8.alamy.com/comp/2AT4GRW/james-hunt-after-winning-the-1976-dutch-grand-prix-2AT4GRW.jpg",
    "https://www.alamy.com/stock-photo/james-hunt-1976-dutch-grand-prix.html",
    "James hunt 1976 dutch grand prix hi-res stock photography and images ...",
    "1976 Dutch Grand Prix"
  ],
  [
    20,
    "https://c8.alamy.com/comp/3ABNKNB/race-winner-james-hunt-gbr-mclaren-celebrates-his-victory-on-the-podiumcanadian-grand-prix-rd14-mosport-park-canada-3-october-1976best-image-credit-image-sutton-motorsportszuma-press-3ABNKNB.jpg",
    "https://www.alamy.com/race-winner-james-hunt-gbr-mclaren-celebrates-his-victory-on-the-podiumcanadian-grand-prix-rd14-mosport-park-canada-3-october-1976best-image-credit-image-sutton-motorsportszuma-press-image661231687.html",
    "Race winner James Hunt (GBR) McLaren celebrates his victory on the ...",
    "1976 Canadian Grand Prix"
  ],
  [
    21,
    "https://l450v.alamy.com/450v/2k0edwb/james-hunt-1976-united-states-grand-prix-west-2k0edwb.jpg",
    "https://www.alamy.com/james-hunt-1976-united-states-grand-prix-west-image490338768.html",
    "James Hunt. 1976 United States Grand Prix West Stock Photo - Alamy",
    "1976 United States Grand Prix"
  ],
  [
    22,
    "https://c8.alamy.com/comp/2FMX0FY/james-hunt-at-speed-in-the-mclaren-m26-during-practice-for-the-1977-british-grand-prix-silverstone-2FMX0FY.jpg",
    "https://www.alamy.com/james-hunt-at-speed-in-the-mclaren-m26-during-practice-for-the-1977-british-grand-prix-silverstone-image425913151.html",
    "James Hunt at speed in the McLaren M26 during practice for the 1977 ...",
    "1977 British Grand Prix"
  ],
  [
    23,
    "https://l450v.alamy.com/450v/3bkj48e/james-hunt-1977-united-states-grand-prix-west-3bkj48e.jpg",
    "https://www.alamy.com/james-hunt-1977-united-states-grand-prix-west-image543418954.html",
    "James Hunt. 1977 United States Grand Prix West Stock Photo - Alamy",
    "1977 United States Grand Prix"
  ],
  [
    24,
    "https://motorsportmagazine.b-cdn.net/wp-content/uploads/2014/07/1976-Japanese-GP-Hunt-1600x1067.jpg",
    "https://www.motorsportmagazine.com/archive/article/december-1976/34/japanese-grand-prix-4/",
    "1976 Japanese Grand Prix race report: Hunt brings it home December 1976 ...",
    "1977 Japanese Grand Prix"
  ],
  [
    25,
    "https://l450v.alamy.com/450v/gb0d6e/formula-one-motor-racing-british-grand-prix-silverstone-1981-gb0d6e.jpg",
    "https://www.alamy.com/1981-mclaren-mp4-1-john-watson-winner-1981-british-grand-prix-silverstone-image224169505.html",
    "1981 McLaren MP4-1 John Watson. Winner 1981 British Grand Prix ...",
    "1981 British Grand Prix"
  ],
  [
    26,
    "https://c8.alamy.com/comp/2F7GEXF/niki-lauda-1982-united-states-grand-prix-west-2F7GEXF.jpg",
    "https://www.alamy.com/niki-lauda-1982-united-states-grand-prix-west-image417714375.html",
    "Niki Lauda. 1982 United States Grand Prix West Stock Photo - Alamy",
    "1982 United States Grand Prix West Grand Prix"
  ],
  [
    27,
    "https://live.staticflickr.com/5103/5781467968_e2943210d7_b.jpg",
    "https://www.flickr.com/photos/kartingnord/5781467968",
    "John Watson - Mclaren M28 - Zolder - Belgian Grand Prix 19… | Flickr",
    "1982 Belgian Grand Prix"
  ],
  [
    28,
    "https://hips.hearstapps.com/hmg-prod/images/john-watson-mclaren-ford-mp4-1b-grand-prix-of-detroit-news-photo-1686187128.jpg?crop=1.00xw:0.847xh;0,0.153xh&resize=980:*",
    "https://www.autoweek.com/racing/formula-1/a44120103/1982-grand-prix-of-detroit-winner-john-watson-todays-f1-is-like-disappointment-at-christmas/",
    "1982 Grand Prix of Detroit Winner John Watson: Today's F1 Is Like ...",
    "1982 Detroit Grand Prix"
  ],
  [
    29,
    "https://c8.alamy.com/comp/2A57891/mclaren-mp4b-niki-lauda-1982-british-grand-prix-at-brands-hatch-2A57891.jpg",
    "https://www.alamy.com/mclaren-mp4b-niki-lauda-1982-british-grand-prix-at-brands-hatch-image330230461.html",
    "McLaren MP4B, Niki Lauda, 1982 British Grand Prix at Brands Hatch Stock ...",
    "1982 British Grand Prix"
  ],
  [
    30,
    "https://i.redd.it/7r95xyyv4a781.jpg",
    "https://www.reddit.com/r/F1Porn/comments/rmty22/john_watson_mclaren_1983_united_states_grand_prix/",
    "John Watson (McLaren) - 1983 United States Grand Prix West [3770 × 2506 ...",
    "1983 United States Grand Prix West Grand Prix"
  ],
  [
    31,
    "https://images1.bonhams.com/image?src=Images/live/2005-05/18/7102007-1-1.jpg",
    "https://cars.bonhams.com/auction/12170/lot/524/alain-prosts-racing-helmet-brazilian-grand-prix-1984/",
    "Bonhams Cars : Alain Prost's racing helmet, Brazilian Grand Prix, 1984,",
    "1984 Brazilian Grand Prix"
  ],
  [
    32,
    "https://media.gettyimages.com/id/826763020/de/foto/niki-lauda-mclaren-tag-mp4-2-grand-prix-of-south-africa-kyalami-07-april-1984.jpg?s=612x612&w=gi&k=20&c=qNBvqRFWA6hqdmeo6KRUfJabkmX0SDBQ7beOAgmFdZA=",
    "https://www.gettyimages.de/fotos/niki-lauda-and-niki-lauda-1984",
    "Niki Lauda, McLaren, South African Grand Prix 1984",
    "1984 South African Grand Prix"
  ],
  [
    33,
    "https://www.formulaonehistory.com/wp-content/uploads/2024/05/Alain-Prost-Wins-The-1984-San-Marino-Grand-Prix-920x580.webp",
    "https://www.formulaonehistory.com/every-san-marino-grand-prix-f1-winner/",
    "Alain Prost wins the 1984 San Marino Grand Prix for McLaren",
    "1984 San Marino Grand Prix"
  ],
  [
    34,
    "https://media.gettyimages.com/id/826760950/photo/niki-lauda-mclaren-tag-mp4-2-grand-prix-of-france-dijon-prenois-20-may-1984.jpg?s=612x612&w=gi&k=20&c=aJyFPrAngIXityWMINW1DYntn6iGXPW-LTkym76BXYM=",
    "https://www.gettyimages.com/photos/niki-lauda-and-niki-lauda-1984",
    "Niki Lauda, French Grand Prix 1984",
    "1984 French Grand Prix"
  ],
  [
    35,
    "https://autoaction.com.au/wp-content/uploads/2023/04/alain-prost-monaco-1984.jpg",
    "https://autoaction.com.au/2023/04/11/mclaren-to-take-on-indy-500-with-special-triple-crown-tribute/1984-monaco-gp-2",
    "Prost McLaren 1984 Monaco GP - Auto Action",
    "1984 Monaco Grand Prix"
  ],
  [
    36,
    "https://c8.alamy.com/comp/2CBJW90/niki-lauda-mclaren-tag-marlboro-team-winner-of-the-british-grand-prix-brands-hatch-1984-2CBJW90.jpg",
    "https://www.alamy.com/niki-lauda-mclaren-tag-marlboro-team-winner-of-the-british-grand-prix-brands-hatch-1984-image368593932.html",
    "Niki Lauda McLaren Tag Marlboro team winner of the British Grand Prix ...",
    "1984 British Grand Prix"
  ],
  [
    37,
    "https://c8.alamy.com/comp/3ABNRW9/race-winner-alain-prost-fra-mclaren-mp42european-grand-prix-nurburgring-germany-7-october-1984-credit-image-sutton-motorsportszuma-press-3ABNRW9.jpg",
    "https://www.alamy.com/race-winner-alain-prost-fra-mclaren-mp42european-grand-prix-nurburgring-germany-7-october-1984-credit-image-sutton-motorsportszuma-press-image661234933.html",
    "Race winner Alain Prost (FRA) McLaren MP4/2...European Grand Prix ...",
    "1984 German Grand Prix"
  ],
  [
    38,
    "https://c8.alamy.com/comp/2G3HABA/niki-lauda-1984-austrian-grand-prix-2G3HABA.jpg",
    "https://www.alamy.com/niki-lauda-1984-austrian-grand-prix-image432484510.html",
    "Niki Lauda. 1984 Austrian Grand Prix Stock Photo - Alamy",
    "1984 Austrian Grand Prix"
  ],
  [
    39,
    "https://pbs.twimg.com/media/CNSl8PMW8AE6phD.jpg:large",
    "https://twitter.com/zdravkost/status/636315902674403328",
    "Zdravko on Twitter: \"#OnThisDay In 1984, Alain Prost won the #DutchGP ...",
    "1984 Dutch Grand Prix"
  ],
  [
    40,
    "https://c8.alamy.com/comp/2GD4WCM/niki-lauda-1984-italian-grand-prix-2GD4WCM.jpg",
    "https://www.alamy.com/stock-photo/niki-lauda-1984.html",
    "Niki Lauda, Italian Grand Prix 1984",
    "1984 Italian Grand Prix"
  ],
  [
    41,
    "https://c8.alamy.com/comp/3ABNRTW/race-winner-alain-prost-fra-mclaren-mp42european-grand-prix-nurburgring-germany-7-october-1984-credit-image-sutton-motorsportszuma-press-3ABNRTW.jpg",
    "https://www.alamy.com/race-winner-alain-prost-fra-mclaren-mp42european-grand-prix-nurburgring-germany-7-october-1984-credit-image-sutton-motorsportszuma-press-image661234921.html",
    "Race winner Alain Prost (FRA) McLaren MP4/2...European Grand Prix ...",
    "1984 European Grand Prix"
  ],
  [
    42,
    "https://files.ekmcdn.com/d855ee/images/1984-alain-prost-portuguese-unused-card-by-apr-formula-1-grand-prix-20902-p.jpg?v=612AD06D-6CD4-42F8-8728-04FCB03932E9",
    "https://www.footballsoccercards.com/1984-alain-prost-portuguese-unused-card-by-apr-formula-1-grand-prix-20902-p.asp",
    "1984 Alain Prost Portuguese UNused card by APR Formula 1 Grand Prix",
    "1984 Portuguese Grand Prix"
  ],
  [
    43,
    "https://media.gettyimages.com/id/2173942576/photo/brazilian-gp-formula-one-world-championship.jpg?s=1024x1024&w=gi&k=20&c=4AmAMz5apf8pn7x1INRAe5dcnCgO6Tn8XJZjH3QUY5s=",
    "https://www.gettyimages.com/detail/news-photo/winner-alain-prost-mclaren-mp4-3-brazilian-grand-prix-rio-news-photo/2173942576",
    "Winner Alain Prost McLaren MP4/3. Brazilian Grand Prix, Rio de... News ...",
    "1985 Brazilian Grand Prix"
  ],
  [
    44,
    "https://www.racefans.net/wp-content/uploads/2020/05/racefansdotnet-20200519-002417-49.jpg",
    "https://www.racefans.net/2020/05/19/classic-f1-gallery-1985-monaco-grand-prix/monaco-grand-prix-montecarlo-mc-17-19-5-1985-51/",
    "Alain Prost, McLaren, Monaco, 1985 - RaceFans",
    "1985 Monaco Grand Prix"
  ],
  [
    45,
    "https://c8.alamy.com/comp/3ABNY4E/alain-prost-fra-mclaren-mp42c-3rd-placebritish-grand-prixbrands-hatch-13-july-1986-credit-image-sutton-motorsportszuma-press-3ABNY4E.jpg",
    "https://www.alamy.com/alain-prost-fra-mclaren-mp42c-3rd-placebritish-grand-prixbrands-hatch-13-july-1986-credit-image-sutton-motorsportszuma-press-image661237486.html",
    "Alain Prost (FRA) McLaren MP4/2C, 3rd place...British Grand Prix,Brands ...",
    "1985 British Grand Prix"
  ],
  [
    46,
    "https://c8.alamy.com/comp/3ABNPN4/winner-alain-prost-fra-mclaren-mp42baustrian-grand-prix-osterreichring-16-august-1985-credit-image-sutton-motorsportszuma-press-3ABNPN4.jpg",
    "https://www.alamy.com/winner-alain-prost-fra-mclaren-mp42baustrian-grand-prix-osterreichring-16-august-1985-credit-image-sutton-motorsportszuma-press-image661234032.html",
    "Winner Alain Prost (FRA) McLaren MP4/2B..Austrian Grand Prix ...",
    "1985 Austrian Grand Prix"
  ],
  [
    47,
    "https://autoaction.com.au/wp-content/uploads/2019/05/85_HOL06.jpg",
    "https://autoaction.com.au/2019/05/14/f1-dutch-grand-prix-returns-in-2020/1985-dutch-grand-prix",
    "Niki Lauda leading the 1985 Dutch Grand Prix - Photo: LAT - Auto Action",
    "1985 Dutch Grand Prix"
  ],
  [
    48,
    "https://c8.alamy.com/comp/F2PF7D/alain-prost-in-his-mclaren-tag-porsche-at-the-italian-gp-at-monza-F2PF7D.jpg",
    "https://www.alamy.com/stock-photo-alain-prost-in-his-mclaren-tag-porsche-at-the-italian-gp-at-monza-87776065.html",
    "Alain Prost in his McLaren TAG Porsche at the Italian GP at Monza 1987 ...",
    "1985 Italian Grand Prix"
  ],
  [
    49,
    "https://c8.alamy.com/comp/3ABP38F/winner-ayrton-senna-bra-mclaren-mp45-leads-alain-prost-frasan-marino-grand-prix-imola-23-april-1989-credit-image-sutton-motorsportszuma-press-3ABP38F.jpg",
    "https://www.alamy.com/stock-photo/1989-san-marino-grand-prix-senna-prost.html",
    "1989 san marino grand prix senna prost hi-res stock photography and ...",
    "1986 San Marino Grand Prix"
  ],
  [
    50,
    "https://c8.alamy.com/comp/3ABP09M/winner-alain-prost-fra-mclaren-mp42cmonaco-grand-prix-monte-carlo-11-may-1986-credit-image-sutton-motorsportszuma-press-3ABP09M.jpg",
    "https://www.alamy.com/winner-alain-prost-fra-mclaren-mp42cmonaco-grand-prix-monte-carlo-11-may-1986-credit-image-sutton-motorsportszuma-press-image661238416.html",
    "Winner Alain Prost (FRA) McLaren MP4/2C...Monaco Grand Prix, Monte ...",
    "1986 Monaco Grand Prix"
  ],
  [
    51,
    "https://c8.alamy.com/comp/3ABNRD6/the-mclaren-team-including-a-delighted-jo-ramirez-mex-centre-right-celebrate-alain-prosts-fra-victoryaustrian-grand-prix-zeltweg-18-august-1985-credit-image-sutton-motorsportszuma-press-3ABNRD6.jpg",
    "https://www.alamy.com/the-mclaren-team-including-a-delighted-jo-ramirez-mex-centre-right-celebrate-alain-prosts-fra-victoryaustrian-grand-prix-zeltweg-18-august-1985-credit-image-sutton-motorsportszuma-press-image661234594.html",
    "The McLaren team, including a delighted Jo Ramirez (MEX) (centre, right ...",
    "1986 Austrian Grand Prix"
  ],
  [
    52,
    "https://cdn11.bigcommerce.com/s-yv47z/images/stencil/1280x1280/products/56808/73148/86AGP10KM3001__80755.1750140448.jpg?c=2",
    "https://autopics.com.au/86agp10km3001-alain-prost-australian-grand-prix-adelaide-1986-mclaren-mp4-2c-tag-porsche-winner-photographer-keith-midgley/",
    "86AGP10KM3001 - Alain Prost, Australian Grand Prix, Adelaide, 1986 ...",
    "1986 Australian Grand Prix"
  ],
  [
    53,
    "https://media.gettyimages.com/id/2173942353/pt/foto/winner-alain-prost-mclaren-mp4-3-brazilian-grand-prix-rio-de-janeiro-12-april-1987.jpg?s=612x612&w=gi&k=20&c=m8lQz4CzoGtRB_dwqJcnHdHFRMtlvWbJlnJc0c3U4Bo=",
    "https://www.gettyimages.com.br/fotos/1983-f1-brazilian-grand-prix",
    "Alain Prost, McLaren, Brazilian Grand Prix 1987",
    "1987 Brazilian Grand Prix"
  ],
  [
    54,
    "https://c8.alamy.com/comp/3ABP2JT/race-winner-alain-prost-fra-mclaren-celebrates-after-equalling-jackie-stewarts-gbr-record-number-of-twenty-seven-wins-belgian-grand-prix-spa-francorchamps-17-may-1987-credit-image-sutton-motorsportszuma-press-3ABP2JT.jpg",
    "https://www.alamy.com/race-winner-alain-prost-fra-mclaren-celebrates-after-equalling-jackie-stewarts-gbr-record-number-of-twenty-seven-wins-belgian-grand-prix-spa-francorchamps-17-may-1987-credit-image-sutton-motorsportszuma-press-image661240240.html",
    "Race winner Alain Prost (FRA) Mclaren celebrates after equalling Jackie ...",
    "1987 Belgian Grand Prix"
  ],
  [
    55,
    "https://c8.alamy.com/comp/3ABP2N4/race-winner-alain-prost-fra-mclaren-mp43-set-a-new-formula-one-record-with-twenty-eight-grand-prix-wins-portuguese-grand-prix-estoril-20-september-1987-credit-image-sutton-motorsportszuma-press-3ABP2N4.jpg",
    "https://www.alamy.com/race-winner-alain-prost-fra-mclaren-mp43-set-a-new-formula-one-record-with-twenty-eight-grand-prix-wins-portuguese-grand-prix-estoril-20-september-1987-credit-image-sutton-motorsportszuma-press-image661240304.html",
    "Race winner Alain Prost (FRA) McLaren MP4/3 set a new Formula One ...",
    "1987 Portuguese Grand Prix"
  ],
  [
    56,
    "https://www.sportphotogallery.com/content/images/cmsfiles/product/45980/47025-zoom.jpg",
    "https://www.sportphotogallery.com/motor-racing/alain-prost-marlboro-mclaren-brazilian-f1-grand-prix-rio-1986-45980/",
    "Alain Prost Marlboro-McLaren Brazilian F1 Grand Prix Rio 1986 Images ...",
    "1988 Brazilian Grand Prix"
  ],
  [
    57,
    "https://c8.alamy.com/comp/3ABNXND/winner-ayrton-senna-bra-mclaren-mp44-with-2nd-placed-alain-prost-fra-mclaren-mp44-r-and-3rd-place-nelson-piquet-bra-lotus-100t-lsan-marino-grand-prix-imola-1-may-1988-credit-image-sutton-motorsportszuma-press-3ABNXND.jpg",
    "https://www.alamy.com/stock-photo/ayrton-senna-san-marino-1988.html",
    "Ayrton senna san marino 1988 hi-res stock photography and images - Alamy",
    "1988 San Marino Grand Prix"
  ],
  [
    58,
    "https://c8.alamy.com/comp/3ABP2MC/race-winner-alain-prost-fra-mclaren-mp44monaco-grand-prix-monte-carlo-15-may-1988-credit-image-sutton-motorsportszuma-press-3ABP2MC.jpg",
    "https://www.alamy.com/race-winner-alain-prost-fra-mclaren-mp44monaco-grand-prix-monte-carlo-15-may-1988-credit-image-sutton-motorsportszuma-press-image661240284.html",
    "Race winner Alain Prost (FRA) McLaren MP4/4...Monaco Grand Prix, Monte ...",
    "1988 Monaco Grand Prix"
  ],
  [
    59,
    "https://c8.alamy.com/comp/3ABNXGW/winner-alain-prost-fra-mclaren-mp44-c-ayrton-senna-bra-mclaren-mp44-2nd-place-l-and-3rd-placed-gerhard-berger-aut-ferrari-f187mexican-grand-prix-mexico-city-29-may-1988-credit-image-sutton-motorsportszuma-press-3ABNXGW.jpg",
    "https://www.alamy.com/winner-alain-prost-fra-mclaren-mp44-c-ayrton-senna-bra-mclaren-mp44-2nd-place-l-and-3rd-placed-gerhard-berger-aut-ferrari-f187mexican-grand-prix-mexico-city-29-may-1988-credit-image-sutton-motorsportszuma-press-image661237049.html",
    "Winner Alain Prost (FRA) McLaren MP4/4 (C), Ayrton Senna (BRA) McLaren ...",
    "1988 Mexican Grand Prix"
  ],
  [
    60,
    "https://c8.alamy.com/comp/3BHFP7T/1988-ayrton-senna-mclaren-mp44-honda-canadian-grand-prix-formula-1-circuit-gilles-villeneuve-hasselblad-imacon-scan-3BHFP7T.jpg",
    "https://www.alamy.com/1988-ayrton-senna-mclaren-mp44-honda-canadian-grand-prix-formula-1-circuit-gilles-villeneuve-hasselblad-imacon-scan-image682000252.html",
    "1988 Ayrton Senna McLaren MP4/4 Honda Canadian Grand Prix Formula 1 ...",
    "1988 Canadian Grand Prix"
  ],
  [
    61,
    "https://c8.alamy.com/comp/3ABP0RN/race-winner-ayrton-senna-celebrates-on-the-podiumusa-grand-prix-detroit-19-june-1988-credit-image-sutton-motorsportszuma-press-3ABP0RN.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-celebrates-on-the-podiumusa-grand-prix-detroit-19-june-1988-credit-image-sutton-motorsportszuma-press-image661238809.html",
    "Race winner Ayrton Senna celebrates on the podium...USA Grand Prix ...",
    "1988 Detroit Grand Prix"
  ],
  [
    62,
    "https://c8.alamy.com/comp/3ABNXHM/race-winner-alain-prost-on-the-podium-with-ayrton-sennaleft-and-michele-alboretofrench-grand-prix-paul-ricard-3-july-1988-credit-image-sutton-motorsportszuma-press-3ABNXHM.jpg",
    "https://www.alamy.com/race-winner-alain-prost-on-the-podium-with-ayrton-sennaleft-and-michele-alboretofrench-grand-prix-paul-ricard-3-july-1988-credit-image-sutton-motorsportszuma-press-image661237072.html",
    "Race winner Alain Prost on the podium with Ayrton Senna,left, and ...",
    "1988 French Grand Prix"
  ],
  [
    63,
    "https://c8.alamy.com/comp/2NCFFDC/brazils-ayrton-senna-driving-his-honda-marlboro-mclaren-takes-the-chequered-flag-to-win-the-1988-british-grand-prix-on-july-10-1988-at-the-silverstone-circuit-england-ap-photo-2NCFFDC.jpg",
    "https://www.alamy.com/brazils-ayrton-senna-driving-his-honda-marlboro-mclaren-takes-the-chequered-flag-to-win-the-1988-british-grand-prix-on-july-10-1988-at-the-silverstone-circuit-england-ap-photo-image524028328.html",
    "Brazil's Ayrton Senna driving his Honda Marlboro McLaren takes the ...",
    "1988 British Grand Prix"
  ],
  [
    64,
    "https://c8.alamy.com/comp/3ABNXG8/winner-ayrton-senna-bra-mclaren-mp44german-grand-prix-hockenheim-24-july-1988-credit-image-sutton-motorsportszuma-press-3ABNXG8.jpg",
    "https://www.alamy.com/winner-ayrton-senna-bra-mclaren-mp44german-grand-prix-hockenheim-24-july-1988-credit-image-sutton-motorsportszuma-press-image661237032.html",
    "Winner Ayrton Senna (BRA) McLaren MP4/4..German Grand Prix, Hockenheim ...",
    "1988 German Grand Prix"
  ],
  [
    65,
    "https://c8.alamy.com/comp/3ABP10D/winner-ayrton-senna-bra-mclaren-mp44hungarian-grand-prix-hungaroring-7-august-1988-credit-image-sutton-motorsportszuma-press-3ABP10D.jpg",
    "https://www.alamy.com/winner-ayrton-senna-bra-mclaren-mp44hungarian-grand-prix-hungaroring-7-august-1988-credit-image-sutton-motorsportszuma-press-image661238941.html",
    "Winner Ayrton Senna (BRA) McLaren MP4/4..Hungarian Grand Prix ...",
    "1988 Hungarian Grand Prix"
  ],
  [
    66,
    "https://www.sportphotogallery.com/content/images/cmsfiles/product/32929/33614-main.jpg",
    "https://www.sportphotogallery.com/motor-racing/ayrton-senna-brazil-mclaren-belgian-grand-prix-spa-1988-32929/",
    "Ayrton Senna Brazil & McLaren Belgian Grand Prix Spa 1988 Images ...",
    "1988 Belgian Grand Prix"
  ],
  [
    67,
    "https://images-cdn.9gag.com/photo/aAy57M0_700b.jpg",
    "https://9gag.com/gag/aAy57M0",
    "Alain Marie Pascal Prost (Alain Prost) during the 1986 Portuguese Grand ...",
    "1988 Portuguese Grand Prix"
  ],
  [
    68,
    "https://www.gtplanet.net/forum/media/alain-prost-wins-the-1988-spanish-gp.32884/full?d=1498470531",
    "https://www.gtplanet.net/forum/media/alain-prost-wins-the-1988-spanish-gp.32884/",
    "Alain Prost Wins The 1988 Spanish GP | GTPlanet",
    "1988 Spanish Grand Prix"
  ],
  [
    69,
    "https://c8.alamy.com/comp/3ABNYTK/race-winner-ayrton-senna-bra-mclaren-mp44-beat-his-team-mate-alain-prost-fra-to-second-place-and-in-so-doing-claimed-his-first-world-championshipjapanese-grand-prix-suzuka-30-october-1988-credit-image-sutton-motorsportszuma-press-3ABNYTK.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-bra-mclaren-mp44-beat-his-team-mate-alain-prost-fra-to-second-place-and-in-so-doing-claimed-his-first-world-championshipjapanese-grand-prix-suzuka-30-october-1988-credit-image-sutton-motorsportszuma-press-image661238051.html",
    "Race winner Ayrton Senna (BRA) McLaren MP4/4 beat his team mate Alain ...",
    "1988 Japanese Grand Prix"
  ],
  [
    70,
    "https://c8.alamy.com/comp/3ABP2BX/with-ayrton-senna-bra-left-and-alain-prost-fra-right-the-mclaren-team-celebrate-winning-both-constructors-and-drivers-championship-in-record-breaking-style-australian-grand-prix-adelaide-13-november-1988-credit-image-sutton-motorsportszuma-press-3ABP2BX.jpg",
    "https://www.alamy.com/with-ayrton-senna-bra-left-and-alain-prost-fra-right-the-mclaren-team-celebrate-winning-both-constructors-and-drivers-championship-in-record-breaking-style-australian-grand-prix-adelaide-13-november-1988-credit-image-sutton-motorsportszuma-press-image661240046.html",
    "With Ayrton Senna (BRA) (Left) and Alain Prost (FRA) (Right) the ...",
    "1988 Australian Grand Prix"
  ],
  [
    71,
    "https://i.redd.it/od8wuizu9dm61.jpg",
    "https://www.reddit.com/r/F1Porn/comments/m2marv/ayrton_senna_mclaren_mp45_1989_san_marino_grand/",
    "Ayrton Senna (McLaren MP4/5) - 1989 San Marino Grand Prix [2048 × 1344 ...",
    "1989 San Marino Grand Prix"
  ],
  [
    72,
    "https://c8.alamy.com/comp/3ABP345/race-winner-ayrton-senna-bra-mclaren-mp45monaco-grand-prix-rd-3-monte-carlo-monaco-7-may-1989-credit-image-sutton-motorsportszuma-press-3ABP345.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-bra-mclaren-mp45monaco-grand-prix-rd-3-monte-carlo-monaco-7-may-1989-credit-image-sutton-motorsportszuma-press-image661240613.html",
    "Race winner Ayrton Senna (BRA) McLaren MP4/5...Monaco Grand Prix, Rd 3 ...",
    "1989 Monaco Grand Prix"
  ],
  [
    73,
    "https://www.motorsportretro.com/wp-content/uploads/2014/08/a_senna_n_mansell__g_berger__a_prost__mexico_1989__by_f1_history-d5ps30w.jpg",
    "https://www.motorsportretro.com/2014/08/1989-mexican-grand-prix/",
    "1989 Mexican Grand Prix - Senna, Mansell, Berger, Prost",
    "1989 Mexican Grand Prix"
  ],
  [
    74,
    "https://media.gettyimages.com/id/859798638/photo/patrese-at-grand-prix-of-the-united-states.jpg?s=1024x1024&w=gi&k=20&c=kXRTHMJnvjqjGDjHNLUXJC_0ijTTyGkeKV5boloZz4Y=",
    "https://www.gettyimages.co.uk/detail/news-photo/ricardo-patrese-alain-prost-eddie-cheever-grand-prix-of-the-news-photo/859798638?adppopup=true",
    "Ricardo Patrese, Alain Prost, Eddie Cheever, Grand Prix of the United ...",
    "1989 United States Grand Prix"
  ],
  [
    75,
    "https://c8.alamy.com/comp/3ABP1BN/winner-alain-prost-fra-mclaren-mp45french-grand-prix-paul-ricard-9-july-1989-credit-image-sutton-motorsportszuma-press-3ABP1BN.jpg",
    "https://www.alamy.com/winner-alain-prost-fra-mclaren-mp45french-grand-prix-paul-ricard-9-july-1989-credit-image-sutton-motorsportszuma-press-image661239257.html",
    "Winner Alain Prost (FRA) McLaren MP4/5..French Grand Prix, Paul Ricard ...",
    "1989 French Grand Prix"
  ],
  [
    76,
    "https://c8.alamy.com/comp/DDMN19/alain-prost-british-grand-prix-silverstone-northamptonshire-1989-artist-DDMN19.jpg",
    "https://www.alamy.com/alain-prost-british-grand-prix-silverstone-northamptonshire-1989-artist-image60077173.html",
    "Alain Prost, British Grand Prix, Silverstone, Northamptonshire, 1989 ...",
    "1989 British Grand Prix"
  ],
  [
    77,
    "https://live.staticflickr.com/2917/14348719003_eaf7ca0dd9_b.jpg",
    "https://www.flickr.com/photos/124307229@N06/14348719003/",
    "3102208P W GERMAN GRAND PRIX | 1989: Ayrton Senna of Brazil … | Flickr",
    "1989 German Grand Prix"
  ],
  [
    78,
    "https://c8.alamy.com/comp/3ABP1R4/winner-ayrton-senna-bra-mclaren-mp45-leads-the-start-of-the-racebelgian-grand-prix-spa-francorchamps-27-august-1989-credit-image-sutton-motorsportszuma-press-3ABP1R4.jpg",
    "https://www.alamy.com/winner-ayrton-senna-bra-mclaren-mp45-leads-the-start-of-the-racebelgian-grand-prix-spa-francorchamps-27-august-1989-credit-image-sutton-motorsportszuma-press-image661239576.html",
    "Winner Ayrton Senna (BRA) McLaren MP4/5, leads the start of the race ...",
    "1989 Belgian Grand Prix"
  ],
  [
    79,
    "https://i.ytimg.com/vi/Dy0ZlAplC4k/hqdefault.jpg",
    "https://www.youtube.com/watch?v=Dy0ZlAplC4k",
    "Alain Prost throws the trophy to the tifosi - 1989 Italian Grand Prix ...",
    "1989 Italian Grand Prix"
  ],
  [
    80,
    "https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/ayrton-senna-1989-spanish-grand-prix-winner-oleg-konin.jpg",
    "https://fineartamerica.com/featured/ayrton-senna-1989-spanish-grand-prix-winner-oleg-konin.html",
    "Ayrton Senna. 1989 Spanish Grand Prix Winner Photograph by Oleg Konin ...",
    "1989 Spanish Grand Prix"
  ],
  [
    81,
    "https://i.ytimg.com/vi/4Oh1OVW56kE/hqdefault.jpg",
    "https://www.youtube.com/watch?v=4Oh1OVW56kE",
    "Ayrton Senna vs Jean Alesi - 1990 United States Grand Prix - YouTube",
    "1990 United States Grand Prix"
  ],
  [
    82,
    "https://c8.alamy.com/comp/2RMGKRK/ayrton-senna-of-brazil-center-proudly-holds-the-winners-cup-aloft-after-he-won-the-48th-monaco-grand-prix-may-27-1990-behind-him-are-prince-rainier-iii-of-monaco-right-and-his-son-prince-albert-ap-photogilbert-tourte-2RMGKRK.jpg",
    "https://www.alamy.com/ayrton-senna-of-brazil-center-proudly-holds-the-winners-cup-aloft-after-he-won-the-48th-monaco-grand-prix-may-27-1990-behind-him-are-prince-rainier-iii-of-monaco-right-and-his-son-prince-albert-ap-photogilbert-tourte-image563391687.html",
    "Ayrton Senna of Brazil, center, proudly holds the winner's cup aloft ...",
    "1990 Monaco Grand Prix"
  ],
  [
    83,
    "https://live.staticflickr.com/3907/14334941762_5e4c553d26_b.jpg",
    "https://www.flickr.com/photos/124307229@N06/14334941762/",
    "mclaren-1990-senna-canada-01 | 1990 Canadian Grand Prix..Mon… | Flickr",
    "1990 Canadian Grand Prix"
  ],
  [
    84,
    "https://c8.alamy.com/comp/3ABP5W4/race-winner-ayrton-sennabra-mclaren-mp4-5bgerman-gp-hockenheim-germany-29-july-1990-credit-image-sutton-motorsportszuma-press-3ABP5W4.jpg",
    "https://www.alamy.com/race-winner-ayrton-sennabra-mclaren-mp4-5bgerman-gp-hockenheim-germany-29-july-1990-credit-image-sutton-motorsportszuma-press-image661242768.html",
    "Race winner Ayrton Senna(BRA), McLaren MP4-5B..German GP, Hockenheim ...",
    "1990 German Grand Prix"
  ],
  [
    85,
    "https://l450v.alamy.com/450v/3abp337/race-winner-ayrton-senna-bra-mclaren-celebrates-his-victory-on-the-podiumsan-marino-grand-prix-rd-2-san-marino-italy-23-april-1989-credit-image-sutton-motorsportszuma-press-3abp337.jpg",
    "https://www.alamy.com/ayrton-senna-bra-mclaren-celebrates-his-fifth-and-final-success-at-the-legendary-spa-circuitbelgian-grand-prix-spa-francorchamps-belgium-25-august-1991-credit-image-sutton-motorsportszuma-press-image661245510.html",
    "Ayrton Senna (BRA) McLaren celebrates his fifth and final success at ...",
    "1990 Belgian Grand Prix"
  ],
  [
    86,
    "https://live.staticflickr.com/5565/14334918272_b5ce593053_b.jpg",
    "https://www.flickr.com/photos/124307229@N06/14334918272/",
    "402208P ITALIAN GRAND PRIX | 1990: Ayrton Senna of Brazil in… | Flickr",
    "1990 Italian Grand Prix"
  ],
  [
    87,
    "https://c8.alamy.com/comp/3ABP9FR/ayrton-senna-bra-mclaren-mp46-leads-at-the-start-of-the-raceunited-states-grand-prix-phoenix-10-march-1991-credit-image-sutton-motorsportszuma-press-3ABP9FR.jpg",
    "https://www.alamy.com/ayrton-senna-bra-mclaren-mp46-leads-at-the-start-of-the-raceunited-states-grand-prix-phoenix-10-march-1991-credit-image-sutton-motorsportszuma-press-image661245643.html",
    "Ayrton Senna (BRA) McLaren MP4/6 leads at the start of the race ...",
    "1991 United States Grand Prix"
  ],
  [
    88,
    "https://c8.alamy.com/comp/3ABP5YW/race-winner-ayrton-senna-celebrates-on-the-podiumbrazilian-grand-prix-interlagos-24-march-1991-credit-image-sutton-motorsportszuma-press-3ABP5YW.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-celebrates-on-the-podiumbrazilian-grand-prix-interlagos-24-march-1991-credit-image-sutton-motorsportszuma-press-image661242845.html",
    "Race winner Ayrton Senna celebrates on the podium...Brazilian Grand ...",
    "1991 Brazilian Grand Prix"
  ],
  [
    89,
    "https://media.gettyimages.com/id/2229187374/photo/race-winner-ayrton-senna-mclaren-mp4-6-formula-one-world-championship-rd-3-san-marino-grand.jpg?s=612x612&w=gi&k=20&c=7BLjN2GXEaLvbL5cHVfMt55A-7a_tpYnKoMSZGqzH0s=",
    "https://www.gettyimages.co.uk/photos/ayrton-senna-1991-san-marino",
    "115 Ayrton Senna 1991 San Marino Stock Photos, High-Res Pictures, and ...",
    "1991 San Marino Grand Prix"
  ],
  [
    90,
    "https://c8.alamy.com/comp/3ABP9HJ/race-winner-ayrton-senna-bra-mclaren-mp46monaco-grand-prix-monte-carlo-12-may-1991-credit-image-sutton-motorsportszuma-press-3ABP9HJ.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-bra-mclaren-mp46monaco-grand-prix-monte-carlo-12-may-1991-credit-image-sutton-motorsportszuma-press-image661245694.html",
    "Race winner Ayrton Senna (BRA) McLaren MP4/6...Monaco Grand Prix, Monte ...",
    "1991 Monaco Grand Prix"
  ],
  [
    91,
    "https://c8.alamy.com/comp/3ABP64A/race-winner-ayrton-senna-bra-mclaren-mp46-leads-riccardo-patresehungarian-grand-prix-hungaroring-11-august-1991-credit-image-sutton-motorsportszuma-press-3ABP64A.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-bra-mclaren-mp46-leads-riccardo-patresehungarian-grand-prix-hungaroring-11-august-1991-credit-image-sutton-motorsportszuma-press-image661242970.html",
    "Race winner Ayrton Senna (BRA) McLaren MP4/6 leads Riccardo Patrese ...",
    "1991 Hungarian Grand Prix"
  ],
  [
    92,
    "https://c8.alamy.com/comp/3ABP44E/race-winner-ayrton-senna-bra-mclaren-mp46-leads-nigel-mansellbelgian-grand-prix-spa-25-august-1991-credit-image-sutton-motorsportszuma-press-3ABP44E.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-bra-mclaren-mp46-leads-nigel-mansellbelgian-grand-prix-spa-25-august-1991-credit-image-sutton-motorsportszuma-press-image661241406.html",
    "Race winner Ayrton Senna (BRA) McLaren MP4/6 leads Nigel Mansell ...",
    "1991 Belgian Grand Prix"
  ],
  [
    93,
    "https://c8.alamy.com/comp/3ABP8DE/race-winner-gerhard-berger-aut-took-the-top-step-of-the-podium-thanks-to-an-agreement-between-ayrton-senna-aut-and-the-mclaren-team-that-allowed-gerhard-to-pass-ayrton-on-the-final-lap-it-was-his-first-win-for-mclaren-after-nearly-two-seasons-racing-for-them-japanese-grand-prix-suzuka-20-october-1991-credit-image-sutton-motorsportszuma-press-3ABP8DE.jpg",
    "https://www.alamy.com/race-winner-gerhard-berger-aut-took-the-top-step-of-the-podium-thanks-to-an-agreement-between-ayrton-senna-aut-and-the-mclaren-team-that-allowed-gerhard-to-pass-ayrton-on-the-final-lap-it-was-his-first-win-for-mclaren-after-nearly-two-seasons-racing-for-them-japanese-grand-prix-suzuka-20-october-1991-credit-image-sutton-motorsportszuma-press-image661244794.html",
    "Race winner Gerhard Berger (AUT) took the top step of the podium thanks ...",
    "1991 Japanese Grand Prix"
  ],
  [
    94,
    "https://c8.alamy.com/comp/3ABP44X/winner-ayrton-senna-bra-mclaren-mp46australian-grand-prix-adelaide-3-november-1991-credit-image-sutton-motorsportszuma-press-3ABP44X.jpg",
    "https://www.alamy.com/winner-ayrton-senna-bra-mclaren-mp46australian-grand-prix-adelaide-3-november-1991-credit-image-sutton-motorsportszuma-press-image661241418.html",
    "Winner Ayrton Senna (BRA) McLaren MP4/6..Australian Grand Prix ...",
    "1991 Australian Grand Prix"
  ],
  [
    95,
    "https://l450v.alamy.com/450v/2n5056a/file-in-this-may-31-1992-file-photo-brazilian-driver-ayrton-senna-raises-his-fist-to-salute-the-crowd-after-he-won-the-monaco-formula-one-grand-prix-on-his-mclaren-honda-brazils-adoration-of-ayrton-senna-transcends-sports-senna-won-three-formula-one-titles-in-1988-1990-and-91-all-with-mclaren-he-moved-to-the-williams-team-for-his-tragic-1994-season-despite-his-career-being-cut-short-when-he-was-34-his-41-wins-stand-third-all-time-behind-michael-schumachers-91-and-rival-alain-prosts-51-he-died-at-the-1994-san-marino-grand-prix-ap-photojean-marc-follete-file-2n5056a.jpg",
    "https://www.alamy.com/ayrton-senna-1992-monaco-grand-prix-image566031799.html",
    "Ayrton Senna. 1992 Monaco Grand Prix Stock Photo - Alamy",
    "1992 Monaco Grand Prix"
  ],
  [
    96,
    "https://c8.alamy.com/comp/3ABP83F/race-winner-gerhard-berger-aut-mclaren-mp47acanadian-grand-prix-montreal-14-june-1992-credit-image-sutton-motorsportszuma-press-3ABP83F.jpg",
    "https://www.alamy.com/race-winner-gerhard-berger-aut-mclaren-mp47acanadian-grand-prix-montreal-14-june-1992-credit-image-sutton-motorsportszuma-press-image661244515.html",
    "Race winner Gerhard Berger (AUT) McLaren MP4/7A...Canadian Grand Prix ...",
    "1992 Canadian Grand Prix"
  ],
  [
    97,
    "https://c8.alamy.com/comp/3ABPBB0/race-winner-ayrton-senna-bra-mclaren-honda-mp47ahungarian-grand-prix-hungaroring-hungary-16-august-1992-credit-image-sutton-motorsportszuma-press-3ABPBB0.jpg",
    "https://www.alamy.com/race-winner-ayrton-senna-bra-mclaren-honda-mp47ahungarian-grand-prix-hungaroring-hungary-16-august-1992-credit-image-sutton-motorsportszuma-press-image661247076.html",
    "Race winner Ayrton Senna (BRA) McLaren Honda MP4/7A...Hungarian Grand ...",
    "1992 Hungarian Grand Prix"
  ],
  [
    98,
    "https://www.picclickimg.com/m4YAAOSwpIdlStNa/OLD-LARGE-HISTORIC-PHOTO-AYRTON-SENNA-WINNING-THE.webp",
    "https://picclick.fr/OLD-LARGE-HISTORIC-PHOTO-AYRTON-SENNA-WINNING-THE-325878355782.html",
    "OLD LARGE HISTORIC PHOTO AYRTON SENNA WINNING THE 1992 ITALIAN F1 GP ...",
    "1992 Italian Grand Prix"
  ],
  [
    99,
    "https://cdn11.bigcommerce.com/s-yv47z/images/stencil/1280x1280/products/56706/72936/92AGP11RS3024__17525.1748830327.jpg?c=2",
    "https://autopics.com.au/92agp11rs3024-gerhard-berger-australian-grand-prix-adelaide-1992-mclaren-mp4-7a-honda-winner-photographer-ray-simpson/",
    "92AGP11RS3024 - Gerhard Berger, Australian Grand Prix, Adelaide, 1992 ...",
    "1992 Australian Grand Prix"
  ],
  [
    100,
    "https://www.gtplanet.net/forum/media/ayrton-senna-wins-the-1993-brazilian-gp.29451/full?d=1482829908",
    "https://www.gtplanet.net/forum/media/ayrton-senna-wins-the-1993-brazilian-gp.29451/",
    "Ayrton Senna Wins The 1993 Brazilian GP | GTPlanet",
    "1993 Brazilian Grand Prix"
  ],
  [
    101,
    "https://media.gettyimages.com/id/615536110/photo/ayrton-senna-in-the-mclaren-mp4-8-1993-european-grand-prix-at-donington.jpg?s=1024x1024&w=gi&k=20&c=NXmxsNWKEpCLjC7X3qWDxN554Q0Hi9qXSnHgpWj_Mt8=",
    "https://www.gettyimages.com/detail/news-photo/ayrton-senna-in-the-mclaren-mp4-8-1993-european-grand-prix-news-photo/615536110",
    "Ayrton Senna in the McLaren MP4-8 1993 European Grand Prix at... News ...",
    "1993 European Grand Prix"
  ],
  [
    102,
    "https://c8.alamy.com/comp/3ABP99W/ayrton-senna-bra-mclaren-mp48-took-a-record-sixth-monaco-victory-and-a-fifth-success-there-in-a-row-monaco-grand-prix-monte-carlo-23-may-1993-credit-image-sutton-motorsportszuma-press-3ABP99W.jpg",
    "https://www.alamy.com/stock-photo/ayrton-senna-monaco-1993.html",
    "Ayrton senna monaco 1993 hi-res stock photography and images - Alamy",
    "1993 Monaco Grand Prix"
  ],
  [
    103,
    "https://c8.alamy.com/comp/3ABP7C2/ayrton-senna-winnerjapanese-grand-prix-suzuka-24-october-1993-credit-image-sutton-motorsportszuma-press-3ABP7C2.jpg",
    "https://www.alamy.com/ayrton-senna-winnerjapanese-grand-prix-suzuka-24-october-1993-credit-image-sutton-motorsportszuma-press-image661243970.html",
    "Ayrton Senna, winner..Japanese Grand Prix, Suzuka, 24 October 1993 ...",
    "1993 Japanese Grand Prix"
  ],
  [
    104,
    "https://cdn11.bigcommerce.com/s-yv47z/images/stencil/1280x1280/products/11339/10257/93513__65012.1371886178.jpg?c=2",
    "https://autopics.com.au/93513-ayrton-senna-mclaren-ford-australian-grand-prix-adelaide-1993-photographer-marshall-cass/",
    "93513 - Ayrton Senna, Australian Grand Prix, Adelaide, 1993, McLaren ...",
    "1993 Australian Grand Prix"
  ],
  [
    105,
    "https://cdn11.bigcommerce.com/s-yv47z/images/stencil/1280x1280/products/14713/14164/97506__66280.1403940611.jpg?c=2",
    "https://autopics.com.au/97506-david-coulthard-mclaren-mercedes-winner-australian-grand-prix-albert-park-melbourne-1997-photographer-marshall-cass/",
    "97506 - David Coulthard, McLaren-Mercedes - Winner, Australian Grand ...",
    "1997 Australian Grand Prix"
  ],
  [
    106,
    "https://i.ytimg.com/vi/w9kQHmDNY90/maxresdefault.jpg",
    "https://www.youtube.com/watch?v=w9kQHmDNY90",
    "1997 Formula One Italian Grand Prix: David Coulthard - YouTube",
    "1997 Italian Grand Prix"
  ],
  [
    107,
    "https://external-preview.redd.it/IncDFPUnNqoi0YwXRpPRKLb7Gq3hCzHNO8WMUoilCRg.jpg?width=1080&crop=smart&auto=webp&s=171aedd7e4764bca0b7e866684d3cffbaa0a48d3",
    "https://www.reddit.com/r/F1Porn/comments/3kaoiu/mika_h%C3%A4kkinen_mclarenmercedes_mp412_1997_european/",
    "Mika Häkkinen, McLaren-Mercedes MP4-12 - 1997 European Grand Prix ...",
    "1997 European Grand Prix"
  ],
  [
    108,
    "https://cdn11.bigcommerce.com/s-yv47z/images/stencil/1280x1280/products/56066/71739/98AP03MC3000__42244.1744597540.jpg?c=2",
    "https://autopics.com.au/98ap03mc3000-mika-hakkinen-qantas-australian-grand-prix-albert-park-circuit-1998-formula-1-mclaren-mercedes-winner-photographer-marshall-cass/",
    "98AP03MC3000 - Mika Häkkinen, Qantas Australian Grand Prix, Albert Park ...",
    "1998 Australian Grand Prix"
  ],
  [
    109,
    "https://c8.alamy.com/comp/2D5DD4T/mika-hakkinen-powers-his-mclaren-race-car-into-the-first-turn-during-the-brazilian-formula-one-grand-prix-in-sao-paulo-april-11-hakkinen-was-the-1998-formula-one-world-champion-gneld-2D5DD4T.jpg",
    "https://www.alamy.com/stock-photo/mika-hakkinen-1998.html",
    "Mika Häkkinen, Brazilian Grand Prix 1998",
    "1998 Brazilian Grand Prix"
  ],
  [
    110,
    "https://c8.alamy.com/comp/2S4PH0M/british-f1-racing-driver-david-coulthard-wins-the-formula-one-san-marino-grand-prix-1998-2S4PH0M.jpg",
    "https://www.alamy.com/british-f1-racing-driver-david-coulthard-wins-the-formula-one-san-marino-grand-prix-1998-image639738532.html",
    "British F1 racing driver David Coulthard wins the Formula One San ...",
    "1998 San Marino Grand Prix"
  ],
  [
    111,
    "https://c8.alamy.com/comp/G91BRJ/formula-one-motor-racing-spanish-grand-prix-mika-hakkinen-celebrates-G91BRJ.jpg",
    "https://www.alamy.com/stock-photo-formula-one-motor-racing-spanish-grand-prix-mika-hakkinen-celebrates-108825350.html",
    "Formula One Motor Racing - Spanish Grand Prix. Mika Hakkinen celebrates ...",
    "1998 Spanish Grand Prix"
  ],
  [
    112,
    "https://c8.alamy.com/comp/2S4PH8E/finnish-f1-racing-driver-mika-hakkinen-on-mclaren-mercedes-celebrating-the-victory-of-monaco-grand-prix-1998-2S4PH8E.jpg",
    "https://www.alamy.com/finnish-f1-racing-driver-mika-hakkinen-on-mclaren-mercedes-celebrating-the-victory-of-monaco-grand-prix-1998-image639738750.html",
    "Finnish F1 racing driver Mika Hakkinen on McLaren Mercedes celebrating ...",
    "1998 Monaco Grand Prix"
  ],
  [
    113,
    "https://i.ytimg.com/vi/yGmO3Q2HS0w/maxresdefault.jpg",
    "https://www.youtube.com/watch?v=yGmO3Q2HS0w",
    "1998 Formula One Austrian Grand Prix: Mika Häkkinen - YouTube",
    "1998 Austrian Grand Prix"
  ],
  [
    114,
    "https://c8.alamy.com/comp/3AC7244/l-r-david-coulthard-gbr-mclaren-2nd-race-winner-mika-hakkinen-fin-mclaren-and-jacques-villeneuve-cdn-williams-on-the-podiumformula-one-world-championship-german-grand-prix-hockenheim-germany-2-august-1998-credit-image-sutton-motorsportszuma-press-3AC7244.jpg",
    "https://www.alamy.com/l-r-david-coulthard-gbr-mclaren-2nd-race-winner-mika-hakkinen-fin-mclaren-and-jacques-villeneuve-cdn-williams-on-the-podiumformula-one-world-championship-german-grand-prix-hockenheim-germany-2-august-1998-credit-image-sutton-motorsportszuma-press-image661525204.html",
    "L-R): David Coulthard (GBR) McLaren 2nd, race winner Mika Hakkinen (FIN ...",
    "1998 German Grand Prix"
  ],
  [
    115,
    "https://media.gettyimages.com/id/52918829/de/foto/germany-gp-von-luxemburg-1998-nuerburgring-sieger-1998-mika-haekkinen-mclaren-2-michael.jpg?s=612x612&w=gi&k=20&c=HlVcQZPARIyc7fZ3DGlYHJLL4sMw8K3E=",
    "https://www.gettyimages.de/fotos/sieger-mika-haekkinen",
    "Mika Häkkinen, Luxembourg Grand Prix 1998",
    "1998 Luxembourg Grand Prix"
  ],
  [
    116,
    "https://c8.alamy.com/comp/2S4PHFG/finnish-f1-racing-driver-mika-hakkinen-on-mclaren-mercedes-at-japanese-grand-prix-1998-2S4PHFG.jpg",
    "https://www.alamy.com/finnish-f1-racing-driver-mika-hakkinen-on-mclaren-mercedes-at-japanese-grand-prix-1998-image639738948.html",
    "Finnish F1 racing driver Mika Hakkinen on McLaren Mercedes at Japanese ...",
    "1998 Japanese Grand Prix"
  ],
  [
    117,
    "https://i.ytimg.com/vi/VUDkwxETABE/maxresdefault.jpg",
    "https://www.youtube.com/watch?v=VUDkwxETABE",
    "1999 Formula One Brazilian Grand Prix: Mika Häkkinen - YouTube",
    "1999 Brazilian Grand Prix"
  ],
  [
    118,
    "https://i.ytimg.com/vi/9gIu-Ng_c80/maxresdefault.jpg",
    "https://www.youtube.com/watch?v=9gIu-Ng_c80",
    "F1 Challenge 99 02 F1 1999 Mika Häkkinen McLaren Spanish Gameplay - YouTube",
    "1999 Spanish Grand Prix"
  ],
  [
    119,
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Mika_Hakkinen_1999_Canada.jpg/440px-Mika_Hakkinen_1999_Canada.jpg",
    "https://fr.wikipedia.org/wiki/Mika_H%C3%A4kkinen",
    "Mika Häkkinen, Canadian Grand Prix 1999",
    "1999 Canadian Grand Prix"
  ],
  [
    120,
    "https://c8.alamy.com/comp/2S4PGB6/british-f1-racing-driver-david-coulthard-on-mclaren-mercedes-1999-2S4PGB6.jpg",
    "https://www.alamy.com/british-f1-racing-driver-david-coulthard-on-mclaren-mercedes-1999-image639738042.html",
    "British F1 racing driver David Coulthard on McLaren Mercedes, 1999 ...",
    "1999 British Grand Prix"
  ],
  [
    121,
    "https://images-cdn.bridgemanimages.com/api/1.0/image/600wm.REU.00919570.7055475/7588721.jpg",
    "https://www.bridgemanimages.com/en-US/pawel-kopczynski/the-winners-of-the-hungarian-grand-prix-celebrate-on-the-podium-august-15-finland-s-mika-hakkinen/photograph/asset/7588721",
    "Image of The winners of the Hungarian Grand Prix celebrate on the",
    "1999 Hungarian Grand Prix"
  ],
  [
    122,
    "https://c8.alamy.com/comp/G942KH/formula-one-motor-racing-belgian-grand-prix-mclarens-david-coulthard-G942KH.jpg",
    "https://www.alamy.com/stock-photo-formula-one-motor-racing-belgian-grand-prix-mclarens-david-coulthard-108884037.html",
    "Formula One Motor Racing - Belgian Grand Prix. McLaren's David ...",
    "1999 Belgian Grand Prix"
  ],
  [
    123,
    "https://i.redd.it/6w6042mx637a1.jpg",
    "https://www.reddit.com/r/F1Porn/comments/zqu0l0/1998_japanese_grand_prix_mika_hakkinen_mclaren/",
    "1998 Japanese Grand Prix - Mika Hakkinen - McLaren Mp4-13 Mercedes ...",
    "1999 Japanese Grand Prix"
  ],
  [
    124,
    "https://c8.alamy.com/comp/2D30W04/mclaren-mercedes-formula-one-grand-prix-driver-david-coulthard-celebrates-after-winning-the-2000-british-formula-one-grand-prix-at-silverstone-northampton-2D30W04.jpg",
    "https://www.alamy.com/mclaren-mercedes-formula-one-grand-prix-driver-david-coulthard-celebrates-after-winning-the-2000-british-formula-one-grand-prix-at-silverstone-northampton-image380491668.html",
    "McLaren Mercedes Formula One Grand Prix driver David Coulthard ...",
    "2000 British Grand Prix"
  ],
  [
    125,
    "https://c8.alamy.com/comp/G96MF7/formula-one-motor-racing-spanish-grand-prix-mika-hakkinen-celebrates-G96MF7.jpg",
    "https://www.alamy.com/stock-photo-formula-one-motor-racing-spanish-grand-prix-mika-hakkinen-celebrates-108941931.html",
    "Formula One Motor Racing - Spanish Grand Prix. Mika Hakkinen celebrates ...",
    "2000 Spanish Grand Prix"
  ],
  [
    126,
    "https://c8.alamy.com/comp/3AC7DEX/winner-david-coulthardgbr-mclaren-mp4-15-shows-off-the-spoilsmonaco-gp-4-june-2000-credit-image-sutton-motorsportszuma-press-3AC7DEX.jpg",
    "https://www.alamy.com/winner-david-coulthardgbr-mclaren-mp4-15-shows-off-the-spoilsmonaco-gp-4-june-2000-credit-image-sutton-motorsportszuma-press-image661534130.html",
    "Winner David Coulthard(GBR) Mclaren MP4-15 shows off the spoils.Monaco ...",
    "2000 Monaco Grand Prix"
  ],
  [
    127,
    "https://cdn-4.motorsport.com/images/mgl/6nMvOylY/s8/f1-french-gp-2000-podium-second-place-mika-hakkinen-mclaren-race-winner-david-coulthard-mc.jpg",
    "https://www.motorsport.com/f1/news/race-of-my-life-david-coulthard-on-the-2000-french-gp/4800081/",
    "Race of my Life: David Coulthard on the 2000 French GP",
    "2000 French Grand Prix"
  ],
  [
    128,
    "https://media.gettyimages.com/id/1049060/photo/mika-hakkinen-of-mclaren-and-finland-celebrates-after-winning-the-austrian-formula-one-grand.jpg?s=612x612&w=gi&k=20&c=P-n1ImwyynPHP7SojSwiiXJpzQgU6ss6PEYHyJ2CD_k=",
    "https://www.gettyimages.com/photos/mika-hakkinen-2000",
    "Mika Häkkinen, Austrian Grand Prix 2000",
    "2000 Austrian Grand Prix"
  ],
  [
    129,
    "https://c8.alamy.com/comp/3AC7DR8/the-podium-l-to-r-race-winner-mika-hakkinen-fin-mclaren-with-second-placed-team-mate-david-coulthard-gbr-mclarenhungarian-grand-prix-hungaroring-budapest-hungary-13-august-2000-credit-image-sutton-motorsportszuma-press-3AC7DR8.jpg",
    "https://www.alamy.com/the-podium-l-to-r-race-winner-mika-hakkinen-fin-mclaren-with-second-placed-team-mate-david-coulthard-gbr-mclarenhungarian-grand-prix-hungaroring-budapest-hungary-13-august-2000-credit-image-sutton-motorsportszuma-press-image661534364.html",
    "The podium (L to R): race winner Mika Hakkinen (FIN) McLaren, with ...",
    "2000 Hungarian Grand Prix"
  ],
  [
    130,
    "https://motorsportmagazine.b-cdn.net/wp-content/uploads/2025/03/Mika-Hakkine-sprays-Michael-Schumacher.jpg",
    "https://www.motorsportmagazine.com/special-article/the-75-greatest-grands-prix/45/50-2000-belgian-gp-fearless-hakkinen-pass-seals-victory-over-schumacher/",
    "50. 2000 Belgian GP: Fearless Hakkinen pass seals victory over ...",
    "2000 Belgian Grand Prix"
  ],
  [
    131,
    "https://c8.alamy.com/comp/G9KMBR/formula-one-motor-racing-brazilian-grand-prix-david-coulthard-mclaren-G9KMBR.jpg",
    "https://www.alamy.com/stock-photo-formula-one-motor-racing-brazilian-grand-prix-david-coulthard-mclaren-109227211.html",
    "Formula One Motor Racing - Brazilian Grand Prix. David Coulthard ...",
    "2001 Brazilian Grand Prix"
  ],
  [
    132,
    "https://c8.alamy.com/comp/G9MH08/david-coulthard-celebrates-winning-the-austrian-grand-prix-G9MH08.jpg",
    "https://www.alamy.com/stock-photo-david-coulthard-celebrates-winning-the-austrian-grand-prix-109246488.html",
    "David Coulthard celebrates winning the Austrian Grand Prix Stock Photo ...",
    "2001 Austrian Grand Prix"
  ],
  [
    133,
    "https://c8.alamy.com/comp/2BBNAXP/mika-hkkinen-mclaren-mercedes-during-british-grand-prix-at-silvestone-circuit-on-17072001-2BBNAXP.jpg",
    "https://www.alamy.com/mika-hkkinen-mclaren-mercedes-during-british-grand-prix-at-silvestone-circuit-on-17072001-image351438158.html",
    "Mika Häkkinen McLaren-Mercedes during British Grand Prix at Silvestone ...",
    "2001 British Grand Prix"
  ],
  [
    134,
    "https://cdn-1.motorsport.com/static/img/mgl/0/10000/14000/14800/14894/s8/f1-united-states-gp-2001-david-coulthard-congratulating-mika-hakkinen-after-the-race.jpg",
    "https://nl.motorsport.com/f1/news/united-states-grand-prix-2001-mika-hakkinen-kean-alesi-michel-schumacher/4884266/",
    "OTD: De United States Grand Prix van 2001",
    "2001 United States Grand Prix"
  ],
  [
    135,
    "https://c8.alamy.com/comp/3AC8GNY/race-winner-david-coulthard-gbr-mclaren-mercedesmonaco-grand-prix-rd7-monte-carlo-monaco-26-may-2002best-image-credit-image-sutton-motorsportszuma-press-3AC8GNY.jpg",
    "https://www.alamy.com/race-winner-david-coulthard-gbr-mclaren-mercedesmonaco-grand-prix-rd7-monte-carlo-monaco-26-may-2002best-image-credit-image-sutton-motorsportszuma-press-image661558631.html",
    "Race winner David Coulthard (GBR) McLaren Mercedes..Monaco Grand Prix ...",
    "2002 Monaco Grand Prix"
  ],
  [
    136,
    "https://c8.alamy.com/comp/G7N9XA/motor-racing-australian-grand-prix-david-coulthard-lifts-his-trophy-G7N9XA.jpg",
    "https://www.alamy.com/stock-photo-motor-racing-australian-grand-prix-david-coulthard-lifts-his-trophy-108033586.html",
    "Motor Racing ... Australian Grand Prix. David Coulthard lifts his ...",
    "2003 Australian Grand Prix"
  ],
  [
    137,
    "https://i.ytimg.com/vi/mGmlCwmmoxU/maxresdefault.jpg",
    "https://www.youtube.com/watch?v=mGmlCwmmoxU",
    "Your Favourite Malaysian Grand Prix - 2003 Raikkonen's First Win ...",
    "2003 Malaysian Grand Prix"
  ],
  [
    138,
    "http://www.sabreraider.com/sports/mclaren/kimipodium.jpg",
    "http://www.sabreraider.com/sports/mclaren/archive.html",
    "Kimi Raikkonen Wins Belgian Grand Prix",
    "2004 Belgian Grand Prix"
  ],
  [
    139,
    "https://www.racefans.net/wp-content/uploads/2020/04/racefansdotnet-20200430-221450-3.jpg",
    "https://www.racefans.net/2005/05/08/spanish-grand-prix-2005-review/",
    "Raikkonen romps to comfortable Spanish Grand Prix win - RaceFans",
    "2005 Spanish Grand Prix"
  ],
  [
    140,
    "https://cdn-3.motorsport.com/images/mgl/63kZ9qE6/s8/f1-monaco-gp-2005-podium-race-winner-kimi-raikkonen-mclaren-second-place-nick-heidfeld-wil.jpg",
    "https://es.motorsport.com/f1/news/monaco-2005-raikkonen-star-wars/4795484/",
    "Cuando Star Wars llegó a Mónaco y Raikkonen fue Darth Vader ante Alonso",
    "2005 Monaco Grand Prix"
  ],
  [
    141,
    "https://external-preview.redd.it/ViWxx7XkRAfbWE-8pU5uhAS_stHKHjLaWAnVK1bmo1k.jpg?width=960&crop=smart&auto=webp&s=e8952154765ca0df6a26c2f0ecb8a0e465ad9c54",
    "https://www.reddit.com/r/F1Porn/comments/2252im/kimi_raikkonen_mclaren_mp420_2005_canadian_grand/",
    "Kimi Raikkonen, McLaren MP4-20 - 2005 Canadian Grand Prix [2835x1793 ...",
    "2005 Canadian Grand Prix"
  ],
  [
    142,
    "https://c8.alamy.com/comp/2EA4JJW/columbian-formula-one-driver-juan-pablo-montoya-of-mclaren-mercedes-during-the-british-formula-one-grand-prix-at-the-race-track-in-silverstone-uk-july-10-2005-he-won-the-race-photo-by-thierry-gromikcameleonabacapresscom-2EA4JJW.jpg",
    "https://www.alamy.com/columbian-formula-one-driver-juan-pablo-montoya-of-mclaren-mercedes-during-the-british-formula-one-grand-prix-at-the-race-track-in-silverstone-uk-july-10-2005-he-won-the-race-photo-by-thierry-gromikcameleonabacapresscom-image402087473.html",
    "Columbian Formula One driver Juan Pablo Montoya of McLaren Mercedes ...",
    "2005 British Grand Prix"
  ],
  [
    143,
    "https://media.gettyimages.com/id/2160154221/photo/2002-hungarian-gp.jpg?s=1024x1024&w=gi&k=20&c=DxI1fMsRwJ1alXI4GJcb6yYShjUHlW18tKp8GsVNuOY=",
    "https://www.gettyimages.com.au/detail/news-photo/kimi-r%C3%A4ikk%C3%B6nen-mclaren-mp4-17-mercedes-during-the-hungarian-news-photo/2160154221",
    "Kimi Räikkönen, McLaren MP4-17 Mercedes during the Hungarian GP at ...",
    "2005 Hungarian Grand Prix"
  ],
  [
    144,
    "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=2756991107849588",
    "https://www.facebook.com/Kimiraikkonenmclarenyears/posts/on-this-day-in-2005-kimi-raikkonen-wins-the-first-ever-turkish-gp-with-the-mp420/2756991574516208/",
    "On this day in 2005 Kimi... - Kimi Räikkönen - McLaren years",
    "2005 Turkish Grand Prix"
  ],
  [
    145,
    "https://c8.alamy.com/comp/G9XW9E/motor-racing-formula-one-italian-grand-prix-juan-pablo-montoya-celebrates-G9XW9E.jpg",
    "https://www.alamy.com/stock-photo-motor-racing-formula-one-italian-grand-prix-juan-pablo-montoya-celebrates-109384730.html",
    "Motor Racing - Formula One - Italian Grand Prix -. Juan Pablo Montoya ...",
    "2005 Italian Grand Prix"
  ],
  [
    146,
    "https://c8.alamy.com/compde/2pdtg9y/finlands-kimi-raikkonen-of-the-mclaren-team-drives-his-car-into-a-curve-while-qualifying-for-second-position-at-the-belgium-formula-one-grand-prix-saturday-sept10-2005-kimi-raikkonen-put-himself-on-the-front-row-for-sundays-belgian-grand-prix-behind-mclaren-teammate-juan-pablo-montoya-boosting-his-chances-of-preventing-spains-fernando-alonso-becoming-formula-ones-youngest-world-champion-just-yet-ap-photobas-czerwinski-2pdtg9y.jpg",
    "https://www.alamy.de/finlands-kimi-raikkonen-of-the-mclaren-team-drives-his-car-into-a-curve-while-qualifying-for-second-position-at-the-belgium-formula-one-grand-prix-saturday-sept10-2005-kimi-raikkonen-put-himself-on-the-front-row-for-sundays-belgian-grand-prix-behind-mclaren-teammate-juan-pablo-montoya-boosting-his-chances-of-preventing-spains-fernando-alonso-becoming-formula-ones-youngest-world-champion-just-yet-ap-photobas-czerwinski-image542051607.html",
    "Finland's Kimi Raikkonen of the McLaren team drives his car into a ...",
    "2005 Belgian Grand Prix"
  ],
  [
    147,
    "https://media.gettyimages.com/id/55768772/photo/juan-pablo-montoya-of-columbia-and-mclaren-mercedes-celebrates-winning-the-brazilian-f1-grand.jpg?s=612x612&w=gi&k=20&c=9ov8XMCrfZcuYyR4t98oU_C1Pl9w9KfGbKh0yA508U8=",
    "https://www.gettyimages.ie/photos/paul-montoya",
    "Juan Pablo Montoya, McLaren, Brazilian Grand Prix 2005",
    "2005 Brazilian Grand Prix"
  ],
  [
    148,
    "https://preview.redd.it/2poiapxfpfd61.jpg?auto=webp&s=5b6c5d825888ff08db5cac82e52d13d485609ea3",
    "https://www.reddit.com/r/F1Porn/comments/l4j3c6/kimi_r%C3%A4ikk%C3%B6nen_mclaren_mp420_2005_japanese_gp/",
    "Kimi Räikkönen (McLaren MP4-20) - 2005 Japanese GP [3500x2333] : r/F1Porn",
    "2005 Japanese Grand Prix"
  ],
  [
    149,
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Fernando_Alonso_Malasia.jpg/330px-Fernando_Alonso_Malasia.jpg",
    "https://en.wikinews.org/wiki/Fernando_Alonso_wins_2007_Malaysian_Grand_Prix",
    "Fernando Alonso wins 2007 Malaysian Grand Prix - Wikinews, the free ...",
    "2007 Malaysian Grand Prix"
  ],
  [
    150,
    "https://c8.alamy.com/comp/2E81RR0/fernando-alonso-reacts-after-winning-the-grand-prix-of-monaco-in-monte-carlo-monaco-sunday-27-may-2007-photo-by-frederic-nebingerabacapresscom-2E81RR0.jpg",
    "https://www.alamy.com/fernando-alonso-reacts-after-winning-the-grand-prix-of-monaco-in-monte-carlo-monaco-sunday-27-may-2007-photo-by-frederic-nebingerabacapresscom-image400796340.html",
    "Fernando alonso reacts after winning the Grand Prix of Monaco in Monte ...",
    "2007 Monaco Grand Prix"
  ],
  [
    151,
    "https://cdn1.f1oversteer.com/uploads/37/2024/05/GettyImages-74506516-1140x825.jpg",
    "https://www.f1oversteer.com/features/where-the-drivers-from-lewis-hamiltons-2007-canadian-grand-prix-win-are-now-including-sky-pundits-and-le-mans-winners/",
    "Where the drivers from Lewis Hamilton's 2007 Canadian Grand Prix win ...",
    "2007 Canadian Grand Prix"
  ],
  [
    152,
    "https://www.gtplanet.net/forum/media/lewis-hamilton-wins-the-2007-united-states-gp.31593/full?d=1490210458",
    "https://www.gtplanet.net/forum/media/lewis-hamilton-wins-the-2007-united-states-gp.31593/",
    "Lewis Hamilton Wins The 2007 United States GP | GTPlanet",
    "2007 United States Grand Prix"
  ],
  [
    153,
    "https://c8.alamy.com/comp/DB09DP/spanish-formula-one-pilot-fernando-alonso-of-mclaren-mercedes-waves-DB09DP.jpg",
    "https://dvu-nds.de/2007-european-gp-alonso-wins-chaotic-nurburgring-race/",
    "2007 European Gp: Alonso Wins Chaotic Nurburgring Race - VHZW",
    "2007 European Grand Prix"
  ],
  [
    154,
    "https://preview.redd.it/lewis-hamilton-mclaren-mp4-22-3rd-free-practice-2007-v0-vvr24o5w1utc1.png?auto=webp&s=2e1e1373ffd194ee23653161b9c7043cdd76504f",
    "https://www.reddit.com/r/F1Porn/comments/1c1cc9w/lewis_hamilton_mclaren_mp422_3rd_free_practice/",
    "Lewis Hamilton (McLaren MP4-22), 3rd free practice, 2007 Hungarian GP ...",
    "2007 Hungarian Grand Prix"
  ],
  [
    155,
    "https://external-preview.redd.it/81yArrWFbqEDWd5m2TC7Rv1Znoro3998H6XHvbKFD94.jpg?auto=webp&s=015ac3316762ba56682751255267de5adc826727",
    "https://www.reddit.com/r/F1Porn/comments/1br5nf/fernando_alonso_vodafone_mclaren_mp422_winner/",
    "Fernando Alonso, Vodafone McLaren Mp4-22, Winner 2007 Italian F1GP ...",
    "2007 Italian Grand Prix"
  ],
  [
    156,
    "https://c8.alamy.com/comp/2PB2430/british-mclaren-mercedes-driver-lewis-hamilton-shows-thumbs-up-signs-after-winning-the-formula-one-japanese-grand-prix-at-the-fuji-speedway-circuit-in-oyama-west-of-tokyo-japan-sunday-sept-30-2007-ap-photoshizuo-kambayashi-2PB2430.jpg",
    "https://www.alamy.com/british-mclaren-mercedes-driver-lewis-hamilton-shows-thumbs-up-signs-after-winning-the-formula-one-japanese-grand-prix-at-the-fuji-speedway-circuit-in-oyama-west-of-tokyo-japan-sunday-sept-30-2007-ap-photoshizuo-kambayashi-image540329748.html",
    "British McLaren-Mercedes driver Lewis Hamilton shows thumbs-up signs ...",
    "2007 Japanese Grand Prix"
  ],
  [
    157,
    "https://www.tiktok.com/api/img/?itemId=7557338607464320278&location=0&aid=1988",
    "https://www.tiktok.com/@onboardxtra/video/7557338607464320278",
    "Lewis Hamilton's McLaren-Mercedes MP4-23 at 2008 Australian GP | TikTok",
    "2008 Australian Grand Prix"
  ],
  [
    158,
    "https://c8.alamy.com/comp/C0FDJW/lewis-hamilton-winner-of-the-2008-monaco-grand-prix-C0FDJW.jpg",
    "https://www.alamy.com/stock-photo-lewis-hamilton-winner-of-the-2008-monaco-grand-prix-34760737.html",
    "Lewis Hamilton, winner of the 2008 Monaco Grand Prix Stock Photo - Alamy",
    "2008 Monaco Grand Prix"
  ],
  [
    159,
    "https://c8.alamy.com/comp/W2MG6D/file-photo-dated-06-07-2008-of-mclaren-mercedes-lewis-hamilton-celebrates-winning-the-british-grand-prix-at-silverstone-northamptonshire-W2MG6D.jpg",
    "https://www.alamy.com/file-photo-dated-06-07-2008-of-mclaren-mercedes-lewis-hamilton-celebrates-winning-the-british-grand-prix-at-silverstone-northamptonshire-image259836597.html",
    "File photo dated 06-07-2008 of McLaren Mercedes' Lewis Hamilton ...",
    "2008 British Grand Prix"
  ],
  [
    160,
    "https://c8.alamy.com/comp/C5JK5H/lewis-hamilton-mclaren-celebrates-his-win-at-the-german-formula-one-C5JK5H.jpg",
    "https://www.alamy.com/stock-photo-lewis-hamilton-mclaren-celebrates-his-win-at-the-german-formula-one-37904205.html",
    "Lewis Hamilton, McLaren, celebrates his win at the German Formula One ...",
    "2008 German Grand Prix"
  ],
  [
    161,
    "https://sidepodcast.com/static/content/2009/07/hungary-heikki.jpg",
    "https://sidepodcast.com/f1-big-picture/hungary-heikki",
    "Hungary Heikki - Heikki Kovalainen wins the 2008 Hungarian Grand Prix",
    "2008 Hungarian Grand Prix"
  ],
  [
    162,
    "https://c8.alamy.com/comp/D4H3DX/british-formula-one-driver-lewis-hamilton-of-mclaren-mercedes-celebrates-D4H3DX.jpg",
    "https://www.alamy.com/stock-photo/2008-chinese-grand-prix-hamilton.html",
    "2008 chinese grand prix hamilton hi-res stock photography and images ...",
    "2008 Chinese Grand Prix"
  ],
  [
    163,
    "https://www.racefans.net/wp-content/uploads/2009/07/racefansdotnet-24-07-25-23-21-04-1-XPB_329538_HiRes.jpg",
    "https://www.racefans.net/2009/07/26/hamilton-takes-mclaren-back-to-winning-ways-hungarian-grand-prix/",
    "Hamilton takes McLaren back to winning ways - RaceFans",
    "2009 Hungarian Grand Prix"
  ],
  [
    164,
    "https://www.carrushome.com/media/2019/08/ss-10-1024x681.jpg",
    "https://www.carrushome.com/2009-singapore-grand-prix-round-14-lewis-hamilton-%E0%B8%84%E0%B8%A7%E0%B9%89%E0%B8%B2%E0%B9%81%E0%B8%8A%E0%B8%A1%E0%B8%9B%E0%B9%8C%E0%B8%AA%E0%B8%99%E0%B8%B2%E0%B8%A1%E0%B9%81%E0%B8%82%E0%B9%88/",
    "2009 SINGAPORE GRAND PRIX (Round 14)-Lewis Hamilton คว้าแชมป์สนามแข่ง ...",
    "2009 Singapore Grand Prix"
  ],
  [
    165,
    "https://c8.alamy.com/comp/2NE2884/mclaren-formula-one-driver-jenson-button-of-britain-sprays-champagne-as-he-celebrates-on-the-podium-after-winning-the-australian-formula-one-grand-prix-in-melbournesunday-march-28-2010-ap-photomark-baker-2NE2884.jpg",
    "https://www.alamy.com/mclaren-formula-one-driver-jenson-button-of-britain-sprays-champagne-as-he-celebrates-on-the-podium-after-winning-the-australian-formula-one-grand-prix-in-melbournesunday-march-28-2010-ap-photomark-baker-image524966628.html",
    "McLaren Formula One driver Jenson Button of Britain sprays champagne as ...",
    "2010 Australian Grand Prix"
  ],
  [
    166,
    "https://www.racefans.net/wp-content/uploads/2020/04/racefansdotnet-20200401-154924-1.jpg",
    "https://www.racefans.net/2010/04/18/button-leads-mclaren-to-one-two-in-wet-chinese-grand-prix/",
    "Button leads McLaren to one-two in wet race - RaceFans",
    "2010 Chinese Grand Prix"
  ],
  [
    167,
    "https://c8.alamy.com/comp/2FNN4FK/london-uk-18th-may-2021-lewis-hamiltons-2010-turkish-grand-prix-mclaren-mercedes-mp4-25a-race-winner-mclaren-certified-and-the-first-ever-hamilton-gp-winning-car-to-come-to-market-offered-by-formula-1-and-rm-sothebys-with-an-estimate-of-5000000-7000000-the-auction-event-will-be-held-live-on-17-july-2021-as-the-mclaren-mercedes-is-driven-around-hamiltons-home-track-throughout-the-live-bidding-on-the-weekend-of-the-british-grand-prix-credit-guy-bellalamy-live-news-2FNN4FK.jpg",
    "https://www.alamy.com/london-uk-18th-may-2021-lewis-hamiltons-2010-turkish-grand-prix-mclaren-mercedes-mp4-25a-race-winner-mclaren-certified-and-the-first-ever-hamilton-gp-winning-car-to-come-to-market-offered-by-formula-1-and-rm-sothebys-with-an-estimate-of-5000000-7000000-the-auction-event-will-be-held-live-on-17-july-2021-as-the-mclaren-mercedes-is-driven-around-hamiltons-home-track-throughout-the-live-bidding-on-the-weekend-of-the-british-grand-prix-credit-guy-bellalamy-live-news-image426421175.html",
    "London, UK. 18th May, 2021. Lewis Hamilton's 2010 Turkish Grand Prix ...",
    "2010 Turkish Grand Prix"
  ],
  [
    168,
    "https://drop.ndtv.com/albums/SPORTS/canada2012/1_113912_153928_2173.jpg",
    "https://sports.ndtv.com/formula-1/photos/lewis-hamilton-wins-canadian-grand-prix-13245",
    "Lewis Hamilton wins Canadian Grand Prix | Photo Gallery",
    "2010 Canadian Grand Prix"
  ],
  [
    169,
    "https://s1.cdn.autoevolution.com/images/news/hamilton-wins-belgian-grand-prix-23900_1.jpg",
    "https://www.autoevolution.com/news/hamilton-wins-2010-belgian-grand-prix-23900.html",
    "Hamilton Wins 2010 Belgian Grand Prix - autoevolution",
    "2010 Belgian Grand Prix"
  ],
  [
    170,
    "https://c8.alamy.com/comp/W9866G/mclaren-mercedes-driver-lewis-hamilton-of-britain-competes-in-the-formula-one-chinese-grand-prix-2011-at-the-shanghai-international-circuit-in-shangha-W9866G.jpg",
    "https://www.alamy.com/mclaren-mercedes-driver-lewis-hamilton-of-britain-competes-in-the-formula-one-chinese-grand-prix-2011-at-the-shanghai-international-circuit-in-shangha-image263867928.html",
    "McLaren-Mercedes driver Lewis Hamilton of Britain competes in the ...",
    "2011 Chinese Grand Prix"
  ],
  [
    171,
    "https://i.ytimg.com/vi/q6Iaz1-8VC0/maxresdefault.jpg",
    "https://www.youtube.com/watch?v=q6Iaz1-8VC0",
    "Your Favourite Canadian Grand Prix - 2011 Button's Epic Victory - YouTube",
    "2011 Canadian Grand Prix"
  ],
  [
    172,
    "https://c8.alamy.com/comp/C5JK6B/nuerburgring-germany-july-24-2011-lewis-hamilton-mclaren-with-the-C5JK6B.jpg",
    "https://www.alamy.com/stock-photo-nuerburgring-germany-july-24-2011-lewis-hamilton-mclaren-with-the-37904227.html",
    "Nuerburgring, Germany July 24 2011, Lewis Hamilton, McLaren, with the ...",
    "2011 German Grand Prix"
  ],
  [
    173,
    "https://images.hgmsites.net/med/jenson-button-scores-200th-formula-1-gp-win-in-hungary_100357907_m.jpg",
    "https://www.motorauthority.com/news/1064167_jenson-button-takes-out-2011-formula-1-hungarian-grand-prix",
    "Jenson Button Takes Out 2011 Formula 1 Hungarian Grand Prix",
    "2011 Hungarian Grand Prix"
  ],
  [
    174,
    "https://c8.alamy.com/comp/2P70MXT/mclaren-driver-jenson-button-of-britain-flashes-a-number-one-sign-after-winning-the-japanese-formula-one-grand-prix-at-the-suzuka-circuit-in-suzuka-central-japan-sunday-oct-9-2011-ap-photoshizuo-kambayashi-2P70MXT.jpg",
    "https://www.alamy.com/mclaren-driver-jenson-button-of-britain-flashes-a-number-one-sign-after-winning-the-japanese-formula-one-grand-prix-at-the-suzuka-circuit-in-suzuka-central-japan-sunday-oct-9-2011-ap-photoshizuo-kambayashi-image537840432.html",
    "McLaren driver Jenson Button of Britain flashes a number one sign after ...",
    "2011 Japanese Grand Prix"
  ],
  [
    175,
    "https://www.emirates247.com/polopoly_fs/1.428021.1452198433!/image/image.jpg",
    "https://www.emirates247.com/sports/other/hamilton-wins-abu-dhabi-f1-grand-prix-2011-11-13-1.428013",
    "Hamilton wins Abu Dhabi F1 Grand Prix - Sports - Other - Emirates24|7",
    "2011 Abu Dhabi Grand Prix"
  ],
  [
    176,
    "https://c8.alamy.com/comp/2GCRP7C/race-winner-jenson-button-gbr-mclaren-on-the-podium-australian-grand-prix-sunday-18th-march-2012-albert-park-melbourne-australia-2GCRP7C.jpg",
    "https://www.alamy.com/race-winner-jenson-button-gbr-mclaren-on-the-podium-australian-grand-prix-sunday-18th-march-2012-albert-park-melbourne-australia-image438157424.html",
    "Race winner Jenson Button (GBR) McLaren on the podium. Australian Grand ...",
    "2012 Australian Grand Prix"
  ],
  [
    177,
    "https://thumbs.dreamstime.com/z/lewis-hamilton-win-2012-f1-canadian-grand-prix-25234158.jpg",
    "https://www.dreamstime.com/royalty-free-stock-photos-lewis-hamilton-win-2012-f1-canadian-grand-prix-image25234158",
    "Lewis Hamilton Win 2012 F1 Canadian Grand Prix Editorial Stock Photo ...",
    "2012 Canadian Grand Prix"
  ],
  [
    178,
    "https://c8.alamy.com/comp/2GCRTYM/race-winner-lewis-hamilton-gbr-mclaren-celebrates-on-the-podium-hungarian-grand-prix-sunday-29th-july-2012-budapest-hungary-2GCRTYM.jpg",
    "https://www.alamy.com/race-winner-lewis-hamilton-gbr-mclaren-celebrates-on-the-podium-hungarian-grand-prix-sunday-29th-july-2012-budapest-hungary-image438159560.html",
    "Race winner Lewis Hamilton (GBR) McLaren celebrates on the podium ...",
    "2012 Hungarian Grand Prix"
  ],
  [
    179,
    "https://c8.alamy.com/comp/2GCRW64/race-winner-jenson-button-gbr-mclaren-celebrates-with-the-team-belgian-grand-prix-sunday-2nd-september-2012-spa-francorchamps-belgium-2GCRW64.jpg",
    "https://www.alamy.com/race-winner-jenson-button-gbr-mclaren-celebrates-with-the-team-belgian-grand-prix-sunday-2nd-september-2012-spa-francorchamps-belgium-image438159740.html",
    "Race winner Jenson Button (GBR) McLaren celebrates with the team ...",
    "2012 Belgian Grand Prix"
  ],
  [
    180,
    "https://c8.alamy.com/comp/2GHN383/the-podium-l-to-r-sergio-perez-mex-sauber-second-lewis-hamilton-gbr-mclaren-race-winner-fernando-alonso-esp-ferrari-third-09092012-formula-1-world-championship-rd-13-italian-grand-prix-monza-italy-race-day-2GHN383.jpg",
    "https://www.alamy.com/the-podium-l-to-r-sergio-perez-mex-sauber-second-lewis-hamilton-gbr-mclaren-race-winner-fernando-alonso-esp-ferrari-third-09092012-formula-1-world-championship-rd-13-italian-grand-prix-monza-italy-race-day-image441171923.html",
    "The podium (L to R): Sergio Perez (MEX) Sauber, second; Lewis Hamilton ...",
    "2012 Italian Grand Prix"
  ],
  [
    181,
    "https://assets.catawiki.nl/assets/2024/3/5/a/8/3/a83d3611-94c5-418f-9bbe-574f42702bfb.jpg",
    "https://www.catawiki.com/es/l/83957419-sdimart-lewis-hamilton-mclaren-mercedes-2012-united-states-grand-prix-winner-limited-edition-2-5-w-coa",
    "SDIMART - Lewis Hamilton - McLaren Mercedes 2012 United States Grand ...",
    "2012 United States Grand Prix"
  ],
  [
    182,
    "https://c8.alamy.com/comp/2GCRY69/race-winner-jenson-button-gbr-mclaren-mp427-brazilian-grand-prix-sunday-25th-november-2012-sao-paulo-brazil-2GCRY69.jpg",
    "https://www.alamy.com/race-winner-jenson-button-gbr-mclaren-mp427-brazilian-grand-prix-sunday-25th-november-2012-sao-paulo-brazil-image438161313.html",
    "Race winner Jenson Button (GBR) McLaren MP4/27. Brazilian Grand Prix ...",
    "2012 Brazilian Grand Prix"
  ],
  [
    183,
    "https://c8.alamy.com/comp/2GJYK3R/race-winner-daniel-ricciardo-aus-mclaren-celebrates-on-the-podium-with-lando-norris-gbr-mclaren-and-zak-brown-usa-mclaren-executive-director-italian-grand-prix-sunday-12th-september-2021-monza-italy-2GJYK3R.jpg",
    "https://www.alamy.com/race-winner-daniel-ricciardo-aus-mclaren-celebrates-on-the-podium-with-lando-norris-gbr-mclaren-and-zak-brown-usa-mclaren-executive-director-italian-grand-prix-sunday-12th-september-2021-monza-italy-image441930715.html",
    "Race winner Daniel Ricciardo (AUS) McLaren celebrates on the podium ...",
    "2021 Italian Grand Prix"
  ]
];

export const MCLAREN_HISTORIC_WIN_IMAGES: Record<number, F1WinImage> = Object.fromEntries(
  ROWS.map(([number, src, sourceUrl, title, label]) => [number, {
    file: `mclaren-${number}`, src, sourceUrl, title, label, kind: 'race' as const,
  }]),
);
