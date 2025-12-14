import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.follow.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.fitnessPlan.deleteMany()
  await prisma.user.deleteMany()

  // Create trainers
  const trainer1Password = await bcrypt.hash('trainer123', 10)
  const trainer2Password = await bcrypt.hash('trainer123', 10)
  const trainer3Password = await bcrypt.hash('trainer123', 10)

  const trainer1 = await prisma.user.create({
    data: {
      email: 'john@trainer.com',
      password: trainer1Password,
      name: 'John Anderson',
      role: 'TRAINER',
      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face'
    }
  })

  const trainer2 = await prisma.user.create({
    data: {
      email: 'sarah@trainer.com',
      password: trainer2Password,
      name: 'Sarah Mitchell',
      role: 'TRAINER',
      avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&h=150&fit=crop&crop=face'
    }
  })

  const trainer3 = await prisma.user.create({
    data: {
      email: 'mike@trainer.com',
      password: trainer3Password,
      name: 'Mike Johnson',
      role: 'TRAINER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  })

  // Create regular users
  const user1Password = await bcrypt.hash('user123', 10)
  const user2Password = await bcrypt.hash('user123', 10)

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: user1Password,
      name: 'Alice Wilson',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: user2Password,
      name: 'Bob Smith',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  })

  // Create fitness plans
  const plans = [
    {
      title: 'Fat Loss Beginner Plan',
      description: 'Perfect for beginners looking to start their fitness journey. This 30-day plan includes cardio exercises, basic strength training, and nutrition guidance to help you lose weight safely and effectively.',
      price: 29.99,
      duration: 30,
      trainerId: trainer1.id
    },
    {
      title: 'Muscle Building Advanced',
      description: 'Take your muscle gains to the next level with this intensive 60-day program. Includes advanced lifting techniques, progressive overload principles, and detailed meal plans for maximum muscle growth.',
      price: 49.99,
      duration: 60,
      trainerId: trainer1.id
    },
    {
      title: 'HIIT Cardio Blast',
      description: 'High-intensity interval training for maximum calorie burn. 21-day program designed to boost metabolism and improve cardiovascular fitness with short, effective workouts.',
      price: 19.99,
      duration: 21,
      trainerId: trainer2.id
    },
    {
      title: 'Yoga & Flexibility',
      description: 'Improve flexibility, balance, and mental clarity with this 45-day yoga program. Suitable for all levels with progressive poses and mindfulness practices.',
      price: 34.99,
      duration: 45,
      trainerId: trainer2.id
    },
    {
      title: 'Strength & Conditioning',
      description: 'Build functional strength and athletic performance with this comprehensive 90-day program. Includes compound movements, plyometrics, and sport-specific training.',
      price: 59.99,
      duration: 90,
      trainerId: trainer3.id
    },
    {
      title: 'Core & Abs Specialist',
      description: 'Targeted 30-day program to build a strong core and defined abs. Includes progressive ab exercises, core stability work, and nutritional guidance.',
      price: 24.99,
      duration: 30,
      trainerId: trainer3.id
    }
  ]

  const createdPlans = await Promise.all(
    plans.map(plan => prisma.fitnessPlan.create({ data: plan }))
  )

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: user1.id, trainerId: trainer1.id },
      { followerId: user1.id, trainerId: trainer2.id },
      { followerId: user2.id, trainerId: trainer1.id },
      { followerId: user2.id, trainerId: trainer3.id }
    ]
  })

  // Create subscriptions
  await prisma.subscription.createMany({
    data: [
      { userId: user1.id, planId: createdPlans[0].id, status: 'active' },
      { userId: user1.id, planId: createdPlans[2].id, status: 'active' },
      { userId: user2.id, planId: createdPlans[1].id, status: 'active' },
      { userId: user2.id, planId: createdPlans[4].id, status: 'active' }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n👥 Created Users:')
  console.log('Trainers:')
  console.log('  - john@trainer.com (John Anderson)')
  console.log('  - sarah@trainer.com (Sarah Mitchell)')
  console.log('  - mike@trainer.com (Mike Johnson)')
  console.log('\nUsers:')
  console.log('  - alice@example.com (Alice Wilson)')
  console.log('  - bob@example.com (Bob Smith)')
  console.log('\n💪 Created Fitness Plans:', createdPlans.length)
  console.log('🤝 Created Follows: 4')
  console.log('💳 Created Subscriptions: 4')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })