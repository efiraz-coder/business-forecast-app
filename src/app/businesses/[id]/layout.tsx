import { ReactNode } from 'react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { BusinessLayout } from '@/components/layout/BusinessLayout'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function BusinessPageLayout({ children, params }: LayoutProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Check access and get business name
  const advisorBusiness = await prisma.advisorBusiness.findFirst({
    where: {
      businessId: id,
      advisorId: session.user.id,
    },
    include: {
      business: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!advisorBusiness) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <BusinessLayout businessId={id} businessName={advisorBusiness.business.name}>
        {children}
      </BusinessLayout>
    </>
  )
}
