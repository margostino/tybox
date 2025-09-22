import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  // Clean up existing data
  await prisma.post.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.tag.deleteMany({});

  console.log("🧹 Cleaned up existing data");

  // Create categories
  const techCategory = await prisma.category.create({
    data: { name: "Technology" },
  });

  const scienceCategory = await prisma.category.create({
    data: { name: "Science" },
  });

  // Create tags
  const typescriptTag = await prisma.tag.create({
    data: { name: "TypeScript" },
  });

  const prismaTag = await prisma.tag.create({
    data: { name: "Prisma" },
  });

  const dockerTag = await prisma.tag.create({
    data: { name: "Docker" },
  });

  console.log("✅ Created categories and tags");

  // Create a user with profile
  const user = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice Johnson",
      profile: {
        create: {
          bio: "Full-stack developer passionate about TypeScript",
          avatarUrl: "https://example.com/alice.jpg",
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log("✅ Created user:", user);

  // Create posts for the user
  const post1 = await prisma.post.create({
    data: {
      title: "Getting Started with Prisma",
      content: "Prisma is a next-generation ORM that makes database access easy...",
      published: true,
      authorId: user.id,
      categories: {
        connect: [{ id: techCategory.id }],
      },
      tags: {
        connect: [{ id: prismaTag.id }, { id: typescriptTag.id }],
      },
    },
    include: {
      author: true,
      categories: true,
      tags: true,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Docker Compose for Development",
      content: "Setting up a development environment with Docker Compose...",
      published: false,
      authorId: user.id,
      categories: {
        connect: [{ id: techCategory.id }],
      },
      tags: {
        connect: [{ id: dockerTag.id }],
      },
    },
  });

  console.log("✅ Created posts");

  // Query examples

  // 1. Find all published posts with their authors
  const publishedPosts = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
      categories: true,
      tags: true,
    },
  });

  console.log("\n📚 Published posts:");
  console.log(JSON.stringify(publishedPosts, null, 2));

  // 2. Find user by email with all their posts
  const userWithPosts = await prisma.user.findUnique({
    where: {
      email: "alice@example.com",
    },
    include: {
      posts: {
        include: {
          categories: true,
          tags: true,
        },
      },
      profile: true,
    },
  });

  console.log("\n👤 User with posts:");
  console.log(JSON.stringify(userWithPosts, null, 2));

  // 3. Count posts by category
  const postsByCategory = await prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  console.log("\n📊 Posts count by category:");
  postsByCategory.forEach((category) => {
    console.log(`  ${category.name}: ${category._count.posts} posts`);
  });

  // 4. Update a post
  const updatedPost = await prisma.post.update({
    where: {
      id: post2.id,
    },
    data: {
      published: true,
    },
  });

  console.log("\n✏️ Updated post:", updatedPost);

  // 5. Complex query with filtering and sorting
  const recentTechPosts = await prisma.post.findMany({
    where: {
      categories: {
        some: {
          name: "Technology",
        },
      },
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      author: true,
      tags: true,
    },
  });

  console.log("\n🚀 Recent tech posts:");
  recentTechPosts.forEach((post) => {
    console.log(`  - ${post.title} by ${post.author.name}`);
  });

  // 6. Transaction example
  const [postCount, userCount] = await prisma.$transaction([
    prisma.post.count(),
    prisma.user.count(),
  ]);

  console.log("\n📈 Stats:");
  console.log(`  Total posts: ${postCount}`);
  console.log(`  Total users: ${userCount}`);
}

// Execute the main function
main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
