import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')

    const plan = await db.fitnessPlan.findUnique({
      where: { id: params.id },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        subscriptions: userId ? {
          where: { userId },
          select: { id: true, status: true }
        } : false
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(plan)

  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userId || userRole !== 'TRAINER') {
      return NextResponse.json(
        { error: 'Only trainers can update fitness plans' },
        { status: 403 }
      )
    }

    const { title, description, price, duration } = await request.json()

    // Check if plan exists and belongs to this trainer
    const existingPlan = await db.fitnessPlan.findUnique({
      where: { id: params.id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    if (existingPlan.trainerId !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own plans' },
        { status: 403 }
      )
    }

    const plan = await db.fitnessPlan.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Plan updated successfully',
      plan
    })

  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userId || userRole !== 'TRAINER') {
      return NextResponse.json(
        { error: 'Only trainers can delete fitness plans' },
        { status: 403 }
      )
    }

    // Check if plan exists and belongs to this trainer
    const existingPlan = await db.fitnessPlan.findUnique({
      where: { id: params.id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    if (existingPlan.trainerId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own plans' },
        { status: 403 }
      )
    }

    await db.fitnessPlan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Plan deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}