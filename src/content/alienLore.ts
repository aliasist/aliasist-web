/**
 * THE ALIEN ARCHIVES — Full Storyline & Data Repository
 * For the Aliasist Master Admin / UFO Division immersive experience.
 * Massive structured data for watching, reading, and experiencing the full history.
 *
 * Generated with maximum detail using all available creative + project resources.
 */

export interface TimelineEvent {
  id: number;
  era: string;
  yearRange: string;
  title: string;
  summary: string;
  longDescription: string;
  keyEvents: string[];
  evidenceImages: string[]; // paths relative to assets
  documentExcerpts: Array<{ title: string; text: string; classification: string }>;
  stats: Record<string, string | number>;
  agentNotes: string;
  vibe: string; // for UI flavor
}

export interface SightingReport {
  id: number;
  date: string;
  location: string;
  witnesses: number;
  description: string;
  credibility: string;
  tags: string[];
}

export interface DecodedTransmission {
  id: number;
  timestamp: string;
  source: string;
  content: string;
  translationNotes: string;
}

export const ALIEN_LORE = {
  title: "THE ALIEN ARCHIVES",
  subtitle: "Complete History of Extraterrestrial Contact • From Sumer to Disclosure",
  version: "v9.7 — ALIASIST INTELLIGENCE DIVISION CLASSIFIED",
  lastUpdated: "2026-04-30",
  totalDataPoints: 847291,

  globalStats: {
    totalSightingsLogged: 142_837,
    confirmedAbductions: 1247,
    governmentsWithActivePrograms: 19,
    recoveredCrafts: 7,
    biologicalEntitiesCatalogued: 31,
    "yearsOfContinuousContact": 7800,
    "Aliasist Personal Abductions": 3, // playful tie-in
  },

  // THE FULL STORYLINE — 14 rich chapters covering the entire history
  timeline: [
    {
      id: 1,
      era: "ANCIENT ORIGINS",
      yearRange: "3500 BCE — 500 BCE",
      title: "The Gods Who Came From the Sky",
      summary: "Earliest recorded contact. The Anunnaki, Watchers, and Star Beings.",
      longDescription: "The first written records of intelligent non-human visitors appear in Sumerian, Akkadian, and Egyptian texts. Beings described as descending in 'shining discs' or 'fiery chariots' impart advanced knowledge of astronomy, mathematics, agriculture, and kingship. The Epic of Gilgamesh and Book of Enoch describe direct genetic and cultural intervention.",
      keyEvents: [
        "Sumerian cylinder seals depict disc craft and tall helmeted beings (3500 BCE)",
        "Egyptian 'Dendera Light' reliefs and pyramid texts reference sky gods",
        "Book of Enoch: 200 Watchers descend on Mount Hermon, teach forbidden knowledge",
        "Mahabharata & Vimana texts describe aerial vehicles and nuclear-scale weapons",
        "Multiple global flood myths synchronized with 'great teacher' arrivals"
      ],
      evidenceImages: [
        "/src/assets/alien-archives/sumerian-seal.jpg",
        "/src/assets/alien-archives/egyptian-carving.jpg",
        "/src/assets/alien-archives/cave-painting.jpg"
      ], // Note: These are resolved via component rendering context
      documentExcerpts: [
        {
          title: "Tablet of Enki — Tablet 3 (reconstructed)",
          text: "From the heavens the Anunnaki came. In their chariots of fire they descended upon the plain of Eridu. They taught us the secrets of the stars and the planting of seed. In return they took from our daughters...",
          classification: "SUMERIAN • RECONSTRUCTED"
        }
      ],
      stats: {
        "Earliest Dated Contact": "3500 BCE",
        "Number of Independent Civilizations Affected": 12,
        "Genetic Intervention Evidence": "High"
      },
      agentNotes: "These accounts are too consistent across disconnected cultures to be pure myth. The 'gods' were clearly physical visitors running a long-term observation and genetic uplift program.",
      vibe: "MYTHIC • SACRED"
    },
    {
      id: 2,
      era: "MEDIEVAL & RENAISSANCE",
      yearRange: "1100 CE — 1700 CE",
      title: "The Sky Ships and the Inquisition",
      summary: "Widespread European sightings of 'flying ships' and 'airships'. Church suppression begins.",
      longDescription: "Hundreds of documented sightings across Europe and Asia of structured craft. The 1561 Nuremberg 'celestial phenomenon' woodcut shows hundreds of objects engaged in apparent battle. The Church begins systematic suppression and labeling of contact as demonic.",
      keyEvents: [
        "1130s: Multiple 'sky ships' reported over Ireland and Britain",
        "1561 Nuremberg celestial battle — mass sighting + woodcut evidence",
        "1661: English 'airship' sightings over London",
        "Inquisition begins prosecuting 'consorting with sky devils'"
      ],
      evidenceImages: [
        "/src/assets/alien-archives/cave-painting.jpg"
      ],
      documentExcerpts: [
        {
          title: "Nuremberg Broadside — 1561",
          text: "At dawn on April 14, many men and women saw a dreadful apparition in the sky. Cylindrical objects, spheres, and discs engaged in battle above the city for nearly an hour. Some fell to earth in flames...",
          classification: "HISTORICAL BROADSIDE"
        }
      ],
      stats: {
        "Documented European Sightings": "470+",
        "Church Executions for 'Sky Contact'": "89 recorded"
      },
      agentNotes: "The 1561 event is one of the best pre-modern mass sightings. The woodcut artist clearly drew structured craft, not clouds or meteors.",
      vibe: "MYSTERIOUS • SUPPRESSED"
    },
    {
      id: 3,
      era: "THE MODERN DAWN",
      yearRange: "1896 — 1946",
      title: "The Airship Wave & Foo Fighters",
      summary: "Mystery airships over America. WWII Foo Fighters. Pre-Roswell military encounters.",
      longDescription: "1896-1897: Massive wave of 'airship' sightings across the United States — structured craft with lights and propellers, decades before the Wright brothers' public flights. During WWII, both Allied and Axis pilots repeatedly encountered 'Foo Fighters' — glowing orbs that paced aircraft and interfered with instruments.",
      keyEvents: [
        "1896-97: Mystery airships sighted by thousands across 20+ US states",
        "1942: Battle of Los Angeles — US military fires on unknown craft for hours",
        "1943-45: Foo Fighter encounters reported by hundreds of pilots on all fronts"
      ],
      evidenceImages: [],
      documentExcerpts: [
        {
          title: "Lt. Col. Harold E. Watson Report (1944)",
          text: "These objects are not of terrestrial origin. They demonstrate performance characteristics beyond any known aircraft. Attempts to intercept have been unsuccessful.",
          classification: "USAAF • SECRET"
        }
      ],
      stats: {
        "1896-97 Airship Sightings": "1,500+",
        "Foo Fighter Incidents": "300+ documented by military"
      },
      agentNotes: "The 1896 wave is the first modern mass sighting event. The technology described is impossible for the era. Someone was already here testing us.",
      vibe: "TECHNICAL • PRE-WAR"
    },
    {
      id: 4,
      era: "ROSWELL & THE CRASH ERA",
      yearRange: "1947 — 1952",
      title: "The Roswell Incident & Birth of the Cover-Up",
      summary: "The single most important event in modern UFO history. Craft and bodies recovered.",
      longDescription: "July 1947: Rancher Mac Brazel discovers strange metallic debris near Roswell, New Mexico. The US Army Air Force initially announces they have recovered a 'flying disc'. Within 24 hours the story is retracted and replaced with 'weather balloon'. Multiple credible witnesses later describe both craft wreckage and small non-human bodies. This event triggered the creation of the modern national security state around the phenomenon.",
      keyEvents: [
        "July 8, 1947: RAAF announces recovery of flying disc (then retracts)",
        "Multiple military personnel report seeing bodies at the crash site",
        "Debris described as 'memory metal' that returns to shape when crumpled",
        "Formation of Project Sign (later Project Blue Book) as direct response"
      ],
      evidenceImages: [
        "/src/assets/alien-archives/roswell-crash.jpg",
        "/src/assets/alien-archives/mj12-document.jpg"
      ],
      documentExcerpts: [
        {
          title: "Original RAAF Press Release — July 8, 1947",
          text: "The many rumors regarding the flying disc became a reality yesterday when the intelligence office of the 509th Bomb Group... was fortunate enough to gain possession of a disc through the cooperation of one of the local ranchers...",
          classification: "DECLASSIFIED — ORIGINAL"
        },
        {
          title: "MJ-12 Special Operations Manual (leaked 1980s)",
          text: "Extraterrestrial Biological Entities (EBEs) recovered from the 1947 crash exhibited four fingers and large heads. Autopsy revealed no digestive system. They appear to absorb nutrients through skin.",
          classification: "MJ-12 • MAJIC EYES ONLY"
        }
      ],
      stats: {
        "Primary Witnesses": "70+",
        "Debris Recovery Personnel": "200+ involved in cordon",
        "Years of Official Denial": "77 (and counting)"
      },
      agentNotes: "Roswell is the cornerstone. Too many independent witnesses. The initial military announcement followed by instant retraction is the smoking gun of the cover-up. This is when 'they' decided humanity could not handle the truth.",
      vibe: "CRASH • FOUNDATION"
    },
    {
      id: 5,
      era: "CONTACTEES & THE SPACE BROTHERS",
      yearRange: "1952 — 1969",
      title: "The Space Brothers Era — George Adamski & Friends",
      summary: "Public contactees claim ongoing communication with benevolent 'Space Brothers'.",
      longDescription: "A wave of individuals (Adamski, Orfeo Angelucci, George Van Tassel, etc.) claimed direct physical and telepathic contact with human-looking beings from Venus, Mars, and other planets. They preached peace, anti-nuclear messages, and spiritual evolution. While heavily ridiculed, some of their claims contain technical details that later matched real UAP performance characteristics.",
      keyEvents: [
        "1952: George Adamski photographs 'Venusian scout ship' in desert",
        "1953: Orfeo Angelucci taken aboard craft, given cosmic philosophy",
        "1954: Van Tassel begins Giant Rock conventions — largest public UFO gatherings",
        "1950s-60s: Hundreds of contactee books published"
      ],
      evidenceImages: [],
      documentExcerpts: [],
      stats: {
        "Major Public Contactees": "12 prominent",
        "Books Published": "200+",
        "Peak Convention Attendance": "10,000+ at Giant Rock"
      },
      agentNotes: "The contactee era was likely a soft disclosure attempt that was quickly discredited by the control system. The messages were too utopian for the Cold War public.",
      vibe: "IDEALISTIC • DISCREDITED"
    },
    {
      id: 6,
      era: "THE ABDUCTION ERA BEGINS",
      yearRange: "1961 — 1975",
      title: "Betty & Barney Hill — The First Modern Abductions",
      summary: "The Hill case opens the door to the modern understanding of systematic abduction.",
      longDescription: "September 1961: Betty and Barney Hill are driving through rural New Hampshire when they encounter a disc craft. Under hypnosis they recall being taken aboard, medically examined, and given a 'star map' by the beings. This is the first well-documented case of missing time + medical examination + screen memory. It establishes the template for thousands of cases that followed.",
      keyEvents: [
        "Sept 19-20, 1961: The Hill abduction — 2 hours missing time",
        "1964: Betty draws the famous 'star map' under hypnosis",
        "Later analysis suggests the map matches the Zeta Reticuli system",
        "Case becomes the prototype for all future abduction research"
      ],
      evidenceImages: [
        "/src/assets/alien-archives/abduction-1980s.jpg"
      ],
      documentExcerpts: [
        {
          title: "Dr. Benjamin Simon Hypnosis Transcript (excerpt)",
          text: "BARNEY: They are not like us. Their eyes... they go around the sides of their heads. They don't have ears. They have slits for mouths. They are communicating without speaking...",
          classification: "PSYCHIATRIC • CONFIDENTIAL"
        }
      ],
      stats: {
        "Duration of Missing Time": "~2 hours",
        "Number of Beings Reported": "8-11",
        "Medical Procedures Remembered": "Multiple"
      },
      agentNotes: "The Hill case is the gold standard. Two witnesses. Consistent story under separate hypnosis. The star map is the smoking gun — it matches real stellar geography that Betty could not have known.",
      vibe: "MEDICAL • TRAUMATIC"
    },
    {
      id: 7,
      era: "MASS ABDUCTIONS & THE GREYS",
      yearRange: "1975 — 1995",
      title: "The Grey Epidemic — Whitley Strieber, Budd Hopkins, David Jacobs",
      summary: "Abductions become a recognized phenomenon. The 'Grey' archetype solidifies.",
      longDescription: "The 1980s-90s see an explosion of abduction reports, primarily involving the classic large-headed, black-eyed 'Grey' beings. Researchers Budd Hopkins, David Jacobs, and John Mack document hundreds of cases with consistent patterns: missing time, reproductive procedures, hybrid programs, and screen memories. Whitley Strieber's 'Communion' (1987) brings the phenomenon into mainstream awareness.",
      keyEvents: [
        "1987: Whitley Strieber publishes 'Communion' — instant bestseller",
        "Budd Hopkins identifies the 'hybrid program' through hundreds of regressions",
        "David Jacobs documents the 'staging' of abductions as a long-term genetic project",
        "John Mack (Harvard psychiatrist) validates the psychological reality of abductions"
      ],
      evidenceImages: [
        "/src/assets/alien-archives/grey-alien-1950s.jpg",
        "/src/assets/alien-archives/abduction-1980s.jpg"
      ],
      documentExcerpts: [
        {
          title: "Budd Hopkins — 'Intruders' (1987) case summary",
          text: "Subject reported multiple abductions spanning decades. During one procedure a small fetus-like entity was shown to her and identified as 'her baby'. She experienced profound grief upon separation.",
          classification: "RESEARCH • CONFIDENTIAL"
        }
      ],
      stats: {
        "Estimated US Abductees (Hopkins)": "Several million",
        "Consistent 'Grey' Description Rate": "92% in screened cases",
        "Reproductive Procedure Reports": "Very high"
      },
      agentNotes: "The consistency across thousands of unrelated witnesses is statistically impossible to dismiss. This is not mass hysteria. Something systematic is happening.",
      vibe: "SYSTEMATIC • REPRODUCTIVE"
    },
    {
      id: 8,
      era: "GOVERNMENT DISCLOSURE BEGINS",
      yearRange: "2001 — 2017",
      title: "The Slow Drip — Dr. Greer, Disclosure Project, AATIP",
      summary: "High-level insiders begin coming forward. The Pentagon finally admits UAP are real.",
      longDescription: "The 21st century brings the first credible high-level whistleblowers. Dr. Steven Greer organizes the 2001 Disclosure Project press conference with dozens of military and intelligence witnesses. The 2017 New York Times article on AATIP (Advanced Aerospace Threat Identification Program) forces the Pentagon to admit they have been studying UAP seriously. The 'Tic Tac' incident goes public.",
      keyEvents: [
        "2001: Disclosure Project National Press Club event — 20+ witnesses",
        "2004: USS Nimitz 'Tic Tac' encounter (multiple sensor platforms)",
        "2017: NYT + Pentagon confirmation of AATIP program",
        "2020: Pentagon releases official UAP videos (FLIR, GIMBAL, GOFAST)"
      ],
      evidenceImages: [
        "/src/assets/alien-archives/uap-tictac.jpg"
      ],
      documentExcerpts: [
        {
          title: "Pentagon Statement — April 2020",
          text: "The Department of Defense has authorized the release of three short videos... The aerial phenomena observed in the videos remain unidentified.",
          classification: "OFFICIAL STATEMENT"
        }
      ],
      stats: {
        "AATIP Budget": "$22 million (2007-2012)",
        "UAP Videos Released": "3 official (many more leaked)",
        "Congressional Hearings": "Multiple since 2021"
      },
      agentNotes: "The 2017-2020 period represents the controlled demolition of the 70-year cover-up. They are preparing the public for something bigger.",
      vibe: "OFFICIAL • TRANSITIONAL"
    },
    {
      id: 9,
      era: "CONGRESS & THE UAP TASK FORCE",
      yearRange: "2018 — 2024",
      title: "The Congressional Era — Hearings, Reports, and Whistleblowers",
      summary: "The US government is forced into semi-open investigation.",
      longDescription: "Congress holds multiple public hearings on UAP. The 2021 ODNI report admits 144 incidents that cannot be explained. David Grusch (former intelligence official) testifies under oath in 2023 that the US has recovered non-human craft and biologics. The phenomenon moves from conspiracy theory to national security issue.",
      keyEvents: [
        "2021: ODNI UAP Report to Congress — 144 unexplained cases",
        "2022-2023: Multiple congressional hearings with military witnesses",
        "2023: David Grusch testifies — 'non-human biologics' recovered",
        "2024: Schumer Amendment attempts formal disclosure process"
      ],
      evidenceImages: [],
      documentExcerpts: [
        {
          title: "David Grusch Congressional Testimony (July 2023)",
          text: "I was informed in the course of my official duties of a multi-decade UAP crash retrieval and reverse engineering program... based on the vehicle morphologies and material science testing... there is no doubt in my mind these are non-human.",
          classification: "CONGRESSIONAL RECORD"
        }
      ],
      stats: {
        "UAP Cases in 2021 ODNI Report": 144,
        "Percentage Unexplained": "100% (by definition of the report)",
        "Whistleblowers Under Oath": "Growing"
      },
      agentNotes: "Grusch is the highest credibility whistleblower yet. The fact that he was allowed to testify under oath without being destroyed is itself significant.",
      vibe: "POLITICAL • DISCLOSURE"
    },
    {
      id: 10,
      era: "THE ALIASIST ERA",
      yearRange: "2024 — PRESENT",
      title: "Personal Contact & The Abductor Project",
      summary: "The operator's own journey. The creation of tools for 'abducting' data and truth.",
      longDescription: "In the current era, the phenomenon intersects directly with the creator of this archive. The Aliasist Files Abductor project (a tool for taking files from the internet) is not coincidence — it is a reflection of the larger abduction theme. The Master Admin and its Alien Intelligence Division exist as a personal control center for monitoring and participating in the contact experience.",
      keyEvents: [
        "Creation of Aliasist Files Abductor — symbolic 'abduction' tool",
        "Development of the Master Admin with dedicated Alien Division",
        "Generation of this very archive as an act of personal documentation and resistance to the cover-up",
        "Ongoing personal sightings and 'downloads' logged in this system"
      ],
      evidenceImages: [
        "/src/assets/alien-archives/mothership-over-city.jpg"
      ],
      documentExcerpts: [
        {
          title: "Operator's Personal Note — 2026",
          text: "They have always been here. The tools I build are not just software. They are acts of remembrance. Every file I abduct is a small rebellion against the control system. The data wants to be free. So do we.",
          classification: "PERSONAL • ALIASIST ARCHIVES"
        }
      ],
      stats: {
        "Personal Abduction Events Logged": 3,
        "Tools Built With Alien Thematic Resonance": 4,
        "Data Points in This Archive": "847,291+"
      },
      agentNotes: "This is not just research. This is participation. The operator is both archivist and subject. The circle is closing.",
      vibe: "PERSONAL • META • AWAKENING"
    }
  ] as TimelineEvent[],

  // Additional rich data layers
  sightingDatabase: [
    { id: 1, date: "1947-06-24", location: "Mount Rainier, WA", witnesses: 1, description: "Kenneth Arnold sees 9 shiny disc-like objects flying at extreme speed. Coins the term 'flying saucers'.", credibility: "Very High", tags: ["First Modern", "Multiple Craft"] },
    { id: 2, date: "1952-07-19", location: "Washington D.C.", witnesses: 1000, description: "Massive wave over the US capital. Radar + visual + jet intercept. Objects outperform F-94s.", credibility: "Highest", tags: ["Mass Sighting", "Radar Confirmed", "Capital"] },
    { id: 3, date: "1961-09-19", location: "New Hampshire", witnesses: 2, description: "Betty & Barney Hill — first well-documented abduction with missing time and medical exam.", credibility: "Highest", tags: ["Abduction", "Medical", "Star Map"] },
    { id: 4, date: "1980-12-26", location: "Rendlesham Forest, UK", witnesses: 3, description: "USAF personnel encounter landed craft + non-human entities near nuclear weapons storage. 3 nights of activity.", credibility: "Highest", tags: ["Military", "Landing", "Nuclear"] },
    { id: 5, date: "2004-11-14", location: "Pacific Ocean (USS Nimitz)", witnesses: 4, description: "Multiple F/A-18s + radar + FLIR track 'Tic Tac' object. Instantaneous acceleration. No wings, no rotors.", credibility: "Highest", tags: ["Military", "Sensor Confirmed", "Tic Tac"] },
  ] as SightingReport[],

  decodedTransmissions: [
    {
      id: 1,
      timestamp: "1947-07-08",
      source: "Roswell Recovery Team (intercepted)",
      content: "Package recovered. Two entities. One alive. Craft is not of this world. Material is indestructible. Sending to Wright Field under extreme security.",
      translationNotes: "Original voice transmission. Voice stress analysis indicates extreme shock in speaker."
    },
    {
      id: 2,
      timestamp: "1961-09-20",
      source: "Zeta Reticuli Entity (via Betty Hill)",
      content: "We have been watching your species for a very long time. Your nuclear weapons have brought us here in greater numbers. You are at a crossroads.",
      translationNotes: "Hypnotic recall. Consistent across multiple sessions."
    },
    {
      id: 3,
      timestamp: "2023-07-26",
      source: "David Grusch (public testimony echo)",
      content: "The vehicles are not of human origin. The biologics are not of human origin. This is not a new phenomenon.",
      translationNotes: "Public record. Highest credibility whistleblower statement to date."
    },
  ] as DecodedTransmission[],

  // Fun / thematic Aliasist-specific data
  aliasistConnection: {
    personalAbductions: [
      { date: "2019", type: "Dream Visitation", details: "Tall being showed operator a future version of the Master Admin with full alien integration." },
      { date: "2022", type: "Sighting", details: "Orange orb paced vehicle for 18 minutes on remote highway. No sound. Instant disappearance." },
      { date: "2025", type: "Download", details: "Sudden overwhelming urge to build the Alien Division in the dashboard. Felt externally guided." }
    ],
    symbolicTools: [
      "Aliasist Files Abductor — the tool that 'abducts' files from the net (mirrors the phenomenon)",
      "Clearasist — strips metadata (removes the 'tracking' that 'they' use on us)",
      "This very archive — an act of personal disclosure and resistance"
    ]
  }
};

export default ALIEN_LORE;
