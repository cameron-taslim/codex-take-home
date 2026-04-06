import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SAMPLE_EXPERIMENTS = [
  {
    name: "Spring Capsule Hero Test",
    pageType: "Hero banner",
    targetAudience:
      "Returning shoppers looking for elevated spring layering pieces",
    tone: "Editorial",
    brandConstraints:
      "Keep the copy premium and product-led. Avoid discount language, countdown urgency, and all-caps sales framing. Use concise CTA text.",
    seedContext:
      "Feature lightweight outerwear, soft tailoring, and transitional layering for early spring. Emphasize texture, versatility, and wardrobe longevity.",
    whatToTest:
      "Generate one polished landing-page hero direction with a strong headline, supporting subheadline, concise CTA, and self-contained HTML preview that fits a bounded container.",
    variant: {
      label: "Editorial layering hero",
      headline: "Layer light. Move beautifully.",
      subheadline:
        "A spring capsule built around soft tailoring, refined texture, and pieces that carry the wardrobe forward.",
      bodyCopy:
        "This direction positions the collection as a considered seasonal investment, keeping the message elevated and product-led for returning shoppers.",
      ctaText: "Shop the capsule",
      htmlContent:
        '<section style="display:flex;flex-direction:column;gap:18px;padding:28px;border-radius:28px;background:linear-gradient(135deg,#f7efe8 0%,#f0dfcf 55%,#e6ccb5 100%);color:#1d2333;"><span style="display:inline-flex;width:fit-content;padding:6px 10px;border-radius:999px;background:rgba(29,35,51,.9);color:#fff8f1;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Spring capsule</span><h1 style="margin:0;font-size:44px;line-height:.95;letter-spacing:-.05em;">Layer light. Move beautifully.</h1><p style="margin:0;max-width:34ch;font-size:18px;line-height:1.55;color:rgba(29,35,51,.8);">A spring capsule built around soft tailoring, refined texture, and pieces that carry the wardrobe forward.</p><div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;"><a href=\"#\" style=\"display:inline-flex;align-items:center;justify-content:center;padding:14px 18px;border-radius:14px;background:#1d2333;color:#fffaf2;text-decoration:none;font-weight:700;\">Shop the capsule</a><p style=\"margin:0;max-width:34ch;font-size:15px;line-height:1.6;color:rgba(29,35,51,.75);\">Lightweight outerwear and polished layers designed for repeat wear across changing spring days.</p></div></section>',
      layoutNotes:
        "Hero-first editorial composition with premium copy hierarchy and a compact CTA row.",
    },
  },
  {
    name: "Weekend Drop Split Layout",
    pageType: "Landing page",
    targetAudience: "Mobile-first shoppers browsing curated new arrivals",
    tone: "Confident",
    brandConstraints:
      "No promo banners, no coupon framing, no external images, and no gimmicky animation language. Keep it clean and conversion-oriented.",
    seedContext:
      "Highlight a limited spring edit with modular outfit building, neutral tones, and quick wardrobe refresh value.",
    whatToTest:
      "Create a split-layout concept with wrapped content blocks, strong hierarchy, and safe inline styling that stays fully inside the preview frame.",
    variant: {
      label: "Split edit conversion layout",
      headline: "Build the weekend edit in one pass",
      subheadline:
        "A mobile-first landing direction that groups new arrivals into fast, modular outfit decisions.",
      bodyCopy:
        "The concept uses a split layout to balance curated storytelling with direct conversion cues, keeping the presentation clean and focused.",
      ctaText: "Browse the drop",
      htmlContent:
        '<section style="display:grid;grid-template-columns:1.2fr .8fr;gap:16px;padding:24px;border-radius:26px;background:linear-gradient(145deg,#f5f1ea 0%,#ebe4da 100%);color:#202531;"><div style="display:flex;flex-direction:column;gap:14px;padding:8px 4px;"><span style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(32,37,49,.58);">Weekend drop</span><h1 style="margin:0;font-size:38px;line-height:1;letter-spacing:-.04em;">Build the weekend edit in one pass</h1><p style="margin:0;font-size:16px;line-height:1.6;color:rgba(32,37,49,.75);">A mobile-first landing direction that groups new arrivals into fast, modular outfit decisions.</p><a href="#" style="display:inline-flex;width:fit-content;align-items:center;justify-content:center;padding:13px 16px;border-radius:14px;background:#202531;color:#fff;text-decoration:none;font-weight:700;">Browse the drop</a></div><div style="display:grid;gap:12px;"><div style="padding:14px;border-radius:18px;background:rgba(255,255,255,.7);"><strong style="display:block;font-size:13px;letter-spacing:.04em;text-transform:uppercase;">Neutral base</strong><p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:rgba(32,37,49,.72);">Clean layers that anchor the full edit.</p></div><div style="padding:14px;border-radius:18px;background:rgba(255,255,255,.56);"><strong style="display:block;font-size:13px;letter-spacing:.04em;text-transform:uppercase;">Quick refresh</strong><p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:rgba(32,37,49,.72);">Modular pieces with high mix-and-match value.</p></div></div></section>',
      layoutNotes:
        "Split-layout landing page with content blocks that keep the scan path clear on smaller screens.",
    },
  },
  {
    name: "PDP Buy Box Trust Refresh",
    pageType: "Product detail page (PDP) buy box",
    targetAudience:
      "High-intent shoppers comparing premium essentials before purchase",
    tone: "Minimalist",
    brandConstraints:
      "Keep the message calm, precise, and premium. No discount framing, no fake scarcity, and no oversized badge clutter.",
    seedContext:
      "Support a premium cotton shirt launch with emphasis on fit, fabric quality, and easy wardrobe pairing.",
    whatToTest:
      "Generate a compact buy-box style concept with strong product trust cues, concise body copy, and bounded inline HTML that reflows cleanly inside the preview container.",
    variant: {
      label: "Trust-led buy box",
      headline: "Premium cotton, cut to stay in rotation",
      subheadline:
        "A calmer buy-box treatment that leads with fabric quality, fit confidence, and everyday versatility.",
      bodyCopy:
        "This direction reduces noise around the purchase moment and builds trust through precise product signals instead of urgency language.",
      ctaText: "Add to bag",
      htmlContent:
        '<section style="display:flex;flex-direction:column;gap:14px;padding:22px;border-radius:24px;background:#f6f3ee;border:1px solid rgba(24,29,38,.08);color:#181d26;"><span style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(24,29,38,.5);">PDP buy box</span><h1 style="margin:0;font-size:30px;line-height:1.05;letter-spacing:-.04em;">Premium cotton, cut to stay in rotation</h1><p style="margin:0;font-size:15px;line-height:1.6;color:rgba(24,29,38,.72);">A calmer buy-box treatment that leads with fabric quality, fit confidence, and everyday versatility.</p><div style="display:grid;gap:10px;"><div style="padding:12px 14px;border-radius:16px;background:white;"><strong style="display:block;font-size:13px;">Why it earns trust</strong><p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:rgba(24,29,38,.7);">Premium cotton handfeel, balanced structure, and easy pairing across the wardrobe.</p></div></div><a href="#" style="display:inline-flex;width:fit-content;align-items:center;justify-content:center;padding:13px 16px;border-radius:14px;background:#181d26;color:#fff;text-decoration:none;font-weight:700;">Add to bag</a></section>',
      layoutNotes:
        "Compact buy-box module emphasizing quality and fit cues with minimal visual clutter.",
    },
  },
  {
    name: "Category Header New Arrivals Push",
    pageType: "Category page header",
    targetAudience:
      "Frequent browsers scanning seasonal new arrivals on desktop",
    tone: "Warm",
    brandConstraints:
      "Keep the tone inviting but still elevated. Avoid discount-heavy language, flashing urgency, and any dependence on external assets.",
    seedContext:
      "Promote a soft spring palette, versatile day-to-night dressing, and easy layering across tops, trousers, and outerwear.",
    whatToTest:
      "Generate a category-header direction with a welcoming headline, supporting copy, and a safe HTML fragment using only inline CSS and fluid layout behavior.",
    variant: {
      label: "Welcoming new arrivals header",
      headline: "New arrivals, softened for spring",
      subheadline:
        "A warm category header that frames the latest drop around easy layering and day-to-night versatility.",
      bodyCopy:
        "The direction keeps the page inviting and elevated, using gentle seasonal framing without drifting into discount-heavy merchandising.",
      ctaText: "Shop new arrivals",
      htmlContent:
        '<section style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;padding:24px 26px;border-radius:24px;background:linear-gradient(135deg,#f4ede3 0%,#efe6d7 100%);color:#2a2f3b;"><div style="display:flex;flex-direction:column;gap:10px;max-width:36ch;"><span style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(42,47,59,.58);">Category header</span><h1 style="margin:0;font-size:36px;line-height:1;letter-spacing:-.04em;">New arrivals, softened for spring</h1><p style="margin:0;font-size:16px;line-height:1.6;color:rgba(42,47,59,.74);">A warm category header that frames the latest drop around easy layering and day-to-night versatility.</p></div><a href="#" style="display:inline-flex;align-items:center;justify-content:center;align-self:flex-end;padding:13px 16px;border-radius:14px;background:#2a2f3b;color:#fffaf4;text-decoration:none;font-weight:700;">Shop new arrivals</a></section>',
      layoutNotes:
        "Fluid category-header composition with welcoming copy, soft palette, and a single anchored CTA.",
    },
  },
] as const;

async function main() {
  const email = process.env.AUTH_DEMO_EMAIL ?? "demo@example.com";
  const password = process.env.AUTH_DEMO_PASSWORD ?? "password123";
  const passwordHash = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      displayName: "Demo User",
      passwordHash,
    },
    create: {
      email,
      displayName: "Demo User",
      passwordHash,
    },
  });

  await prisma.experiment.deleteMany({});

  for (let index = 0; index < SAMPLE_EXPERIMENTS.length; index += 1) {
    const experiment = SAMPLE_EXPERIMENTS[index];
    const startedAt = new Date(Date.now() - (index + 1) * 60 * 60 * 1000);
    const completedAt = new Date(startedAt.getTime() + 2 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      const createdExperiment = await tx.experiment.create({
        data: {
          userId: user.id,
          name: experiment.name,
          pageType: experiment.pageType,
          targetAudience: experiment.targetAudience,
          tone: experiment.tone,
          brandConstraints: experiment.brandConstraints,
          seedContext: experiment.seedContext,
          whatToTest: experiment.whatToTest,
          status: "generated",
        },
      });

      const run = await tx.codexGenerationRun.create({
        data: {
          experimentId: createdExperiment.id,
          status: "succeeded",
          promptSnapshot: {
            experimentName: experiment.name,
            componentType: experiment.pageType,
            targetAudience: experiment.targetAudience,
            brandTone: experiment.tone,
            brandConstraints: experiment.brandConstraints,
            seedContext: experiment.seedContext,
            whatToTest: experiment.whatToTest,
            currentVariant: null,
          },
          startedAt,
          completedAt,
        },
      });

      await tx.experimentVariant.create({
        data: {
          experimentId: createdExperiment.id,
          generationRunId: run.id,
          position: 0,
          ...experiment.variant,
        },
      });

      await tx.experiment.update({
        where: { id: createdExperiment.id },
        data: {
          latestGenerationRunId: run.id,
          status: "generated",
        },
      });
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
