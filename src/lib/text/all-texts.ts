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