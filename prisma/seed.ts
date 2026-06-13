import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const domains = [
  {
    slug: "technology",
    name: "Technology",
    description: "AI model releases, product launches, tech breakthroughs, regulatory policies",
  },
  {
    slug: "business",
    name: "Business",
    description: "Funding, M&A, layoffs, bankruptcies, earnings, market expansion",
  },
  {
    slug: "finance",
    name: "Finance",
    description: "Stocks, interest rates, currencies, crypto, commodity prices",
  },
  {
    slug: "geopolitics",
    name: "Geopolitics",
    description: "Conflicts, sanctions, elections, diplomatic events, policy changes",
  },
  {
    slug: "sports-entertainment",
    name: "Sports & Entertainment",
    description: "Match results, championships, transfers, box office, awards, album sales",
  },
]

async function main() {
  console.log("Seeding domains...")

  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: domain,
      create: domain,
    })
  }

  console.log(`Seeded ${domains.length} domains.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
