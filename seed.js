require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear existing data so re-seeding is idempotent
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  // ── Users ──────────────────────────────────────────────────────────────────
  const hash1 = await bcrypt.hash('password123', 10);
  const hash2 = await bcrypt.hash('securepass', 10);

  const u1 = await db.collection('users').insertOne({
    email: 'alice@example.com',
    passwordHash: hash1,
    name: 'Alice Khan',
    createdAt: new Date('2024-01-10')
  });

  const u2 = await db.collection('users').insertOne({
    email: 'bob@example.com',
    passwordHash: hash2,
    name: 'Bob Raza',
    createdAt: new Date('2024-02-01')
  });

  const aliceId = u1.insertedId;
  const bobId   = u2.insertedId;

  // ── Projects ───────────────────────────────────────────────────────────────
  const p1 = await db.collection('projects').insertOne({
    ownerId: aliceId,
    name: 'Final Year Project',
    description: 'AI-based attendance system',
    archived: false,
    createdAt: new Date('2024-01-15')
  });

  const p2 = await db.collection('projects').insertOne({
    ownerId: aliceId,
    name: 'Portfolio Website',
    description: 'Personal portfolio using React',
    archived: false,
    createdAt: new Date('2024-02-20')
  });

  const p3 = await db.collection('projects').insertOne({
    ownerId: bobId,
    name: 'E-Commerce App',
    description: 'Online store with Node and MongoDB',
    archived: false,
    createdAt: new Date('2024-03-01')
  });

  const p4 = await db.collection('projects').insertOne({
    ownerId: bobId,
    name: 'Old Blog',
    description: 'Deprecated blog project',
    archived: true,
    createdAt: new Date('2023-11-01')
  });

  const p1Id = p1.insertedId;
  const p2Id = p2.insertedId;
  const p3Id = p3.insertedId;
  const p4Id = p4.insertedId;

  // ── Tasks ──────────────────────────────────────────────────────────────────
  await db.collection('tasks').insertMany([
    {
      ownerId: aliceId,
      projectId: p1Id,
      title: 'Write project proposal',
      status: 'done',
      priority: 5,
      tags: ['writing', 'urgent'],
      subtasks: [
        { title: 'Outline sections', done: true },
        { title: 'Draft introduction', done: true }
      ],
      dueDate: new Date('2024-02-01'),   // schema flexibility: optional field
      createdAt: new Date('2024-01-16')
    },
    {
      ownerId: aliceId,
      projectId: p1Id,
      title: 'Train ML model',
      status: 'in-progress',
      priority: 4,
      tags: ['ml', 'research'],
      subtasks: [
        { title: 'Collect dataset', done: true },
        { title: 'Preprocess data', done: false },
        { title: 'Run training loop', done: false }
      ],
      createdAt: new Date('2024-02-10')  // no dueDate — demonstrates flexibility
    },
    {
      ownerId: aliceId,
      projectId: p2Id,
      title: 'Design homepage layout',
      status: 'todo',
      priority: 3,
      tags: ['design', 'frontend'],
      subtasks: [
        { title: 'Wireframe', done: false }
      ],
      createdAt: new Date('2024-02-22')
    },
    {
      ownerId: bobId,
      projectId: p3Id,
      title: 'Set up Express server',
      status: 'done',
      priority: 5,
      tags: ['backend', 'setup'],
      subtasks: [
        { title: 'Install dependencies', done: true },
        { title: 'Configure routes', done: true }
      ],
      dueDate: new Date('2024-03-10'),
      createdAt: new Date('2024-03-02')
    },
    {
      ownerId: bobId,
      projectId: p3Id,
      title: 'Integrate payment gateway',
      status: 'todo',
      priority: 4,
      tags: ['payments', 'backend'],
      subtasks: [
        { title: 'Research Stripe API', done: false },
        { title: 'Implement checkout', done: false }
      ],
      createdAt: new Date('2024-03-15')
    }
  ]);

  // ── Notes ──────────────────────────────────────────────────────────────────
  await db.collection('notes').insertMany([
    {
      ownerId: aliceId,
      projectId: p1Id,
      title: 'FYP Meeting Notes',
      body: 'Discussed model accuracy targets with supervisor. Aim for 90%+.',
      tags: ['meeting', 'fyp'],
      pinned: true,              // schema flexibility: optional field
      createdAt: new Date('2024-01-20')
    },
    {
      ownerId: aliceId,
      projectId: p2Id,
      title: 'Portfolio Color Palette',
      body: 'Using indigo and slate. Reference: coolors.co palette #xyz.',
      tags: ['design', 'reference'],
      createdAt: new Date('2024-02-25')
    },
    {
      ownerId: aliceId,
      title: 'Books to Read',
      body: 'Clean Code, Designing Data-Intensive Applications, SICP.',
      tags: ['personal', 'reading'],
      createdAt: new Date('2024-03-01')  // standalone note — no projectId
    },
    {
      ownerId: bobId,
      projectId: p3Id,
      title: 'API Endpoints List',
      body: 'GET /products, POST /orders, DELETE /cart/:id',
      tags: ['backend', 'reference'],
      pinned: false,
      createdAt: new Date('2024-03-05')
    },
    {
      ownerId: bobId,
      title: 'Grocery List',
      body: 'Milk, eggs, bread, coffee.',
      tags: ['personal'],
      createdAt: new Date('2024-03-20')  // standalone note — no projectId
    }
  ]);

  console.log('✅ Database seeded successfully!');
  process.exit(0);
})();