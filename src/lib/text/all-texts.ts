const brainrotNouns = [
  "skibidi", "rizz", "gyatt", "sigma", "aura", "mew", "glizzy", "ohio",
  "fanum", "hawk", "tuah", "mogged", "npc", "chad", "based", "slay",
  "bussin", "goat", "vibe", "drip", "flex", "clout", "wave", "grind",
  "plug", "heat", "fire", "goose", "dunk", "swag", "beast", "king",
  "ghost", "blade", "storm", "wolf", "rogue", "spike", "nova", "blaze",
  "frost", "venom", "echo", "drift", "titan", "phantom", "raven", "cobra",
  "lynx", "viper", "hawk", "crane", "bison", "moose", "falcon", "puma",
  "jaguar", "dingo", "hyena", "gecko", "rhino", "bison", "otter", "stoat",
  "pixel", "glitch", "byte", "node", "cache", "proxy", "token", "shard",
  "chunk", "block", "stack", "queue", "fetch", "query", "parse", "loop",
  "brick", "stone", "flint", "slate", "ember", "cinder", "ash", "coal",
  "iron", "steel", "bronze", "copper", "chrome", "nickel", "cobalt", "zinc"
];

export function generateBrainrotName(): string {
  const a = brainrotNouns[Math.floor(Math.random() * brainrotNouns.length)];
  const b = brainrotNouns[Math.floor(Math.random() * brainrotNouns.length)];

  const combined = (a + b).slice(0, 8);
  return combined;
}

const WORD_POOL: Record<LanguageType, string[]> = {
  ENGLISH: [
    // animals
    "cat", "dog", "fish", "bird", "frog", "bear", "lion", "duck", "cow", "pig",
    "horse", "shark", "whale", "crab", "snail", "snake", "wolf", "deer", "fox", "owl",
    // food
    "pizza", "burger", "taco", "cake", "donut", "apple", "banana", "carrot", "bread", "egg",
    "hotdog", "sushi", "cookie", "lemon", "grape", "mushroom", "corn", "cherry", "waffle", "mango",
    // vehicles
    "car", "bus", "boat", "plane", "train", "bike", "rocket", "truck", "yacht", "scooter",
    // nature
    "tree", "flower", "cloud", "sun", "moon", "star", "mountain", "river", "volcano", "cactus",
    "rainbow", "leaf", "wave", "island", "cave",
    // household
    "chair", "table", "lamp", "clock", "door", "window", "bed", "sofa", "mirror", "ladder",
    "bucket", "broom", "candle", "pillow", "curtain",
    // outdoor / misc
    "bridge", "castle", "lighthouse", "windmill", "igloo", "tent", "well", "fence", "swing", "slide",
    // body / clothing
    "hat", "shoe", "glasses", "crown", "ring", "glove", "boot", "scarf", "umbrella", "backpack",
  ],

  FRENCH: [
    // animaux
    "chat", "chien", "poisson", "oiseau", "grenouille", "ours", "lion", "canard", "vache", "cochon",
    "cheval", "requin", "baleine", "crabe", "escargot", "serpent", "loup", "cerf", "renard", "hibou",
    // nourriture
    "pizza", "hamburger", "taco", "gâteau", "beignet", "pomme", "banane", "carotte", "pain", "oeuf",
    "hotdog", "sushi", "biscuit", "citron", "raisin", "champignon", "maïs", "cerise", "gaufre", "mangue",
    // véhicules
    "voiture", "bus", "bateau", "avion", "train", "vélo", "fusée", "camion", "yacht", "scooter",
    // nature
    "arbre", "fleur", "nuage", "soleil", "lune", "étoile", "montagne", "rivière", "volcan", "cactus",
    "arc-en-ciel", "feuille", "vague", "île", "grotte",
    // maison
    "chaise", "table", "lampe", "horloge", "porte", "fenêtre", "lit", "canapé", "miroir", "échelle",
    "seau", "balai", "bougie", "oreiller", "rideau",
    // extérieur
    "pont", "château", "phare", "moulin", "igloo", "tente", "puits", "clôture", "balançoire", "toboggan",
    // vêtements
    "chapeau", "chaussure", "lunettes", "couronne", "bague", "gant", "botte", "écharpe", "parapluie", "sac à dos",
  ],

  GERMAN: [
    // Tiere
    "Katze", "Hund", "Fisch", "Vogel", "Frosch", "Bär", "Löwe", "Ente", "Kuh", "Schwein",
    "Pferd", "Hai", "Wal", "Krabbe", "Schnecke", "Schlange", "Wolf", "Hirsch", "Fuchs", "Eule",
    // Essen
    "Pizza", "Burger", "Taco", "Kuchen", "Donut", "Apfel", "Banane", "Karotte", "Brot", "Ei",
    "Hotdog", "Sushi", "Keks", "Zitrone", "Traube", "Pilz", "Mais", "Kirsche", "Waffel", "Mango",
    // Fahrzeuge
    "Auto", "Bus", "Boot", "Flugzeug", "Zug", "Fahrrad", "Rakete", "LKW", "Yacht", "Roller",
    // Natur
    "Baum", "Blume", "Wolke", "Sonne", "Mond", "Stern", "Berg", "Fluss", "Vulkan", "Kaktus",
    "Regenbogen", "Blatt", "Welle", "Insel", "Höhle",
    // Haushalt
    "Stuhl", "Tisch", "Lampe", "Uhr", "Tür", "Fenster", "Bett", "Sofa", "Spiegel", "Leiter",
    "Eimer", "Besen", "Kerze", "Kissen", "Vorhang",
    // Outdoor
    "Brücke", "Schloss", "Leuchtturm", "Windmühle", "Iglu", "Zelt", "Brunnen", "Zaun", "Schaukel", "Rutsche",
    // Kleidung
    "Hut", "Schuh", "Brille", "Krone", "Ring", "Handschuh", "Stiefel", "Schal", "Regenschirm", "Rucksack",
  ],

  SPANISH: [
    // animales
    "gato", "perro", "pez", "pájaro", "rana", "oso", "león", "pato", "vaca", "cerdo",
    "caballo", "tiburón", "ballena", "cangrejo", "caracol", "serpiente", "lobo", "ciervo", "zorro", "búho",
    // comida
    "pizza", "hamburguesa", "taco", "pastel", "dona", "manzana", "banana", "zanahoria", "pan", "huevo",
    "hotdog", "sushi", "galleta", "limón", "uva", "hongo", "maíz", "cereza", "waffle", "mango",
    // vehículos
    "coche", "autobús", "barco", "avión", "tren", "bicicleta", "cohete", "camión", "yate", "scooter",
    // naturaleza
    "árbol", "flor", "nube", "sol", "luna", "estrella", "montaña", "río", "volcán", "cactus",
    "arcoíris", "hoja", "ola", "isla", "cueva",
    // hogar
    "silla", "mesa", "lámpara", "reloj", "puerta", "ventana", "cama", "sofá", "espejo", "escalera",
    "cubo", "escoba", "vela", "almohada", "cortina",
    // exterior
    "puente", "castillo", "faro", "molino", "iglú", "tienda", "pozo", "cerca", "columpio", "tobogán",
    // ropa
    "sombrero", "zapato", "gafas", "corona", "anillo", "guante", "bota", "bufanda", "paraguas", "mochila",
  ],
}

export type LanguageType = 'ENGLISH' | 'FRENCH' | 'GERMAN' | 'SPANISH'

export function getRandomWords(language: LanguageType): [string, string, string] {
  const pool = WORD_POOL[language]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return [shuffled[0], shuffled[1], shuffled[2]]
}