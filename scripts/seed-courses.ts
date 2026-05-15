import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn'],
});

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Mobile Development',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'AI & Machine Learning',
  'Database',
  'UI/UX Design',
];

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

const COURSE_TEMPLATES = [
  { title: 'Introduction to', desc: 'Learn the fundamentals of' },
  { title: 'Advanced', desc: 'Master advanced concepts in' },
  { title: 'Complete Guide to', desc: 'A comprehensive guide to' },
  { title: 'Mastering', desc: 'Become an expert in' },
  { title: 'Practical', desc: 'Hands-on practical training in' },
  { title: 'Professional', desc: 'Professional-level training in' },
  { title: 'Modern', desc: 'Learn modern approaches to' },
  { title: 'Full Stack', desc: 'End-to-end development with' },
  { title: 'Zero to Hero in', desc: 'Go from beginner to expert in' },
  { title: 'Essential', desc: 'Essential skills and knowledge in' },
];

const TOPICS = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'TypeScript',
  'Docker',
  'Kubernetes',
  'AWS',
  'MongoDB',
  'PostgreSQL',
  'GraphQL',
  'REST APIs',
  'Microservices',
  'Machine Learning',
  'Deep Learning',
  'Data Analysis',
  'Vue.js',
  'Angular',
  'Next.js',
  'Django',
  'Flask',
  'Spring Boot',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Flutter',
  'React Native',
  'TensorFlow',
  'PyTorch',
  'SQL',
  'NoSQL',
  'Redis',
  'Elasticsearch',
  'Git',
  'CI/CD',
  'Testing',
  'Security',
  'Performance',
  'Scalability',
];

function generateCourseData(index: number) {
  const template = COURSE_TEMPLATES[index % COURSE_TEMPLATES.length];
  const topic = TOPICS[index % TOPICS.length];
  const category = CATEGORIES[index % CATEGORIES.length];
  const difficulty = DIFFICULTIES[index % DIFFICULTIES.length];
  
  const title = `${template.title} ${topic} ${index + 1}`;
  const description = `${template.desc} ${topic}. This comprehensive course covers everything you need to know about ${topic.toLowerCase()}. Perfect for ${difficulty.toLowerCase()} level learners who want to enhance their skills.`;
  
  return {
    title,
    description,
    category,
    difficulty,
    published: Math.random() > 0.2,
    thumbnailUrl: `https://picsum.photos/seed/${index}/800/450`,
  };
}

async function main() {
  console.log('🌱 Starting course seeding...');

  const educator = await prisma.user.findUnique({
    where: { email: 'educator@test.com' },
  });

  if (!educator) {
    console.error('❌ Educator account not found. Please run the main seed first.');
    process.exit(1);
  }

  console.log(`✅ Found educator: ${educator.name} (${educator.email})`);

  const existingCoursesCount = await prisma.course.count({
    where: { educatorId: educator.id },
  });

  console.log(`📚 Existing courses: ${existingCoursesCount}`);

  const coursesToCreate = 100;
  console.log(`🚀 Creating ${coursesToCreate} courses...`);

  const courses = Array.from({ length: coursesToCreate }, (_, i) => ({
    ...generateCourseData(i),
    educatorId: educator.id,
  }));

  const batchSize = 20;
  let created = 0;

  for (let i = 0; i < courses.length; i += batchSize) {
    const batch = courses.slice(i, i + batchSize);
    
    await prisma.course.createMany({
      data: batch,
      skipDuplicates: true,
    });

    created += batch.length;
    console.log(`✨ Created ${created}/${coursesToCreate} courses...`);
  }

  const totalCourses = await prisma.course.count({
    where: { educatorId: educator.id },
  });

  console.log(`\n✅ Seeding complete!`);
  console.log(`📊 Total courses for educator: ${totalCourses}`);
  console.log(`🎉 Successfully created ${coursesToCreate} new courses!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding courses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
