export const seedInquiries = [
  {
    id: 'inq-1',
    propertyId: 'prop-1',
    userId: 'client-1',
    type: 'VIEWING',
    status: 'NEW',
    name: '山田次郎',
    email: 'client1@example.com',
    phone: '080-1234-5678',
    message: '港区のタワーマンションを内覧したいです。今週末は可能でしょうか？',
    response: null,
    respondedBy: null,
    respondedAt: null,
    metadata: {
      source: 'website',
      preferredDate: '2024-02-17',
      preferredTime: '14:00'
    },
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-12T10:30:00').toISOString(),
    updatedAt: new Date('2024-02-12T10:30:00').toISOString()
  },
  {
    id: 'inq-2',
    propertyId: 'prop-2',
    userId: 'client-2',
    type: 'PURCHASE',
    status: 'RESPONDED',
    name: '鈴木美咲',
    email: 'client2@example.com',
    phone: '080-2345-6789',
    message: '世田谷の一戸建てについて、ローンの相談もしたいです。',
    response: 'お問い合わせありがとうございます。住宅ローンについては、提携している金融機関をご紹介できます。詳細は直接お会いしてご説明させていただけますでしょうか。',
    respondedBy: 'agent-2',
    respondedAt: new Date('2024-02-10T15:00:00').toISOString(),
    metadata: {
      source: 'website',
      interestedInLoan: true
    },
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-10T09:15:00').toISOString(),
    updatedAt: new Date('2024-02-10T15:00:00').toISOString()
  },
  {
    id: 'inq-3',
    propertyId: 'prop-3',
    userId: null,
    type: 'PRICE',
    status: 'IN_PROGRESS',
    name: '投資家A',
    email: 'investor@example.com',
    phone: '090-3456-7890',
    message: '渋谷のワンルームマンションの投資利回りを教えてください。また、管理費や修繕積立金の詳細も知りたいです。',
    response: null,
    respondedBy: null,
    respondedAt: null,
    metadata: {
      source: 'mobile',
      investmentPurpose: true
    },
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-11T13:45:00').toISOString(),
    updatedAt: new Date('2024-02-11T14:00:00').toISOString()
  },
  {
    id: 'inq-4',
    propertyId: 'prop-5',
    userId: null,
    type: 'DOCUMENT',
    status: 'CLOSED',
    name: '建設会社B',
    email: 'construction@example.com',
    phone: '03-9876-5432',
    message: '品川区の更地について、都市計画法上の制限や建築可能な用途を教えてください。',
    response: 'お問い合わせの土地は商業地域に指定されており、建ぺい率80%、容積率600%です。詳細な資料をメールでお送りしました。',
    respondedBy: 'agent-1',
    respondedAt: new Date('2024-02-08T16:30:00').toISOString(),
    metadata: {
      source: 'website',
      companyName: '建設会社B',
      requestedDocuments: ['都市計画図', '用途地域図']
    },
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-08T11:20:00').toISOString(),
    updatedAt: new Date('2024-02-08T17:00:00').toISOString()
  },
  {
    id: 'inq-5',
    propertyId: 'prop-4',
    userId: null,
    type: 'GENERAL',
    status: 'NEW',
    name: 'IT企業C',
    email: 'it-company@example.com',
    phone: '03-5555-1234',
    message: '大手町のオフィスビルについて、セキュリティ設備と入居可能時期を教えてください。',
    response: null,
    respondedBy: null,
    respondedAt: null,
    metadata: {
      source: 'website',
      companySize: '50-100人',
      requiredSpace: '200坪'
    },
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-12T16:00:00').toISOString(),
    updatedAt: new Date('2024-02-12T16:00:00').toISOString()
  }
];