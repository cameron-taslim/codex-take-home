export type BrandAssetSet = {
  key: string;
  name: string;
  logoWordmark: string;
  eyebrow: string;
  heroImage: string;
  accent: string;
  panel: string;
  text: string;
};

export const brandAssetLibrary: Record<string, BrandAssetSet> = {
  "atelier-spring": {
    key: "atelier-spring",
    name: "Atelier Spring",
    logoWordmark: "ATELIER",
    eyebrow: "Spring collection",
    heroImage:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2), transparent 24%), linear-gradient(135deg, #f2d8b5 0%, #c9854d 46%, #4e2f2d 100%)",
    accent: "#ecb36c",
    panel: "#f7efe5",
    text: "#281d18",
  },
  "midnight-ledger": {
    key: "midnight-ledger",
    name: "Midnight Ledger",
    logoWordmark: "LEDGER",
    eyebrow: "Members drop",
    heroImage:
      "radial-gradient(circle at 70% 20%, rgba(126, 161, 255, 0.24), transparent 22%), linear-gradient(135deg, #1f2841 0%, #0d1426 56%, #050913 100%)",
    accent: "#8ea4ff",
    panel: "#121a2c",
    text: "#f5f7ff",
  },
};

export function getBrandAssetSet(key?: string) {
  return brandAssetLibrary[key ?? "atelier-spring"] ?? brandAssetLibrary["atelier-spring"];
}
