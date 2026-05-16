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

const WORD_POOL = [
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
]

export function getRandomWords(): [string, string, string] {
  const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5)
  return [shuffled[0], shuffled[1], shuffled[2]]
}