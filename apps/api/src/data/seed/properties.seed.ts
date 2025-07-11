export const seedProperties = [
  {
    id: 'prop-1',
    title: '港区高級タワーマンション',
    description: '東京タワーを望む最上階の高級物件。360度パノラマビューが魅力的な3LDK。',
    propertyType: 'APARTMENT',
    transactionType: 'SALE',
    status: 'ACTIVE',
    price: 280000000,
    landArea: null,
    buildingArea: 120.5,
    address: {
      postalCode: '106-0032',
      prefecture: '東京都',
      city: '港区',
      street: '六本木7-1-1',
      building: 'タワーレジデンス40F'
    },
    location: {
      lat: 35.6654,
      lng: 139.7314
    },
    features: ['タワーマンション', '最上階', '360度ビュー', 'コンシェルジュ付き'],
    images: [
      {
        id: 'img-1-1',
        url: 'https://placeholder.co/800x600?text=Tower+Mansion+1',
        caption: 'リビングからの眺望',
        order: 0
      },
      {
        id: 'img-1-2',
        url: 'https://placeholder.co/800x600?text=Tower+Mansion+2',
        caption: 'キッチン',
        order: 1
      }
    ],
    agentId: 'agent-1',
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop-2',
    title: '世田谷区一戸建て住宅',
    description: '閑静な住宅街に位置する築5年の一戸建て。庭付き、駐車場2台分完備。',
    propertyType: 'HOUSE',
    transactionType: 'SALE',
    status: 'ACTIVE',
    price: 85000000,
    landArea: 180.3,
    buildingArea: 125.8,
    address: {
      postalCode: '154-0024',
      prefecture: '東京都',
      city: '世田谷区',
      street: '三軒茶屋2-15-8'
    },
    location: {
      lat: 35.6436,
      lng: 139.6696
    },
    features: ['庭付き', '駐車場2台', '太陽光発電', 'オール電化'],
    images: [
      {
        id: 'img-2-1',
        url: 'https://placeholder.co/800x600?text=House+1',
        caption: '外観',
        order: 0
      },
      {
        id: 'img-2-2',
        url: 'https://placeholder.co/800x600?text=House+2',
        caption: '庭',
        order: 1
      }
    ],
    agentId: 'agent-2',
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop-3',
    title: '渋谷区投資用ワンルーム',
    description: '渋谷駅徒歩5分の好立地。投資用物件として高い収益性が期待できます。',
    propertyType: 'APARTMENT',
    transactionType: 'SALE',
    status: 'CONTRACT',
    price: 38000000,
    landArea: null,
    buildingArea: 25.4,
    address: {
      postalCode: '150-0002',
      prefecture: '東京都',
      city: '渋谷区',
      street: '渋谷1-10-5',
      building: 'シティマンション502'
    },
    location: {
      lat: 35.6595,
      lng: 139.7037
    },
    features: ['駅近', '投資用', 'オートロック', '宅配ボックス'],
    images: [
      {
        id: 'img-3-1',
        url: 'https://placeholder.co/800x600?text=Studio+1',
        caption: '室内',
        order: 0
      }
    ],
    agentId: 'agent-1',
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop-4',
    title: '千代田区オフィスビル',
    description: '大手町駅直結の好立地オフィスビル。1フロア貸し可能。',
    propertyType: 'BUILDING',
    transactionType: 'SALE',
    status: 'ACTIVE',
    price: 5500000000,
    landArea: 850.0,
    buildingArea: 6800.0,
    address: {
      postalCode: '100-0004',
      prefecture: '東京都',
      city: '千代田区',
      street: '大手町1-5-1'
    },
    location: {
      lat: 35.6862,
      lng: 139.7638
    },
    features: ['駅直結', 'セキュリティ完備', '24時間利用可', '会議室付き'],
    images: [
      {
        id: 'img-4-1',
        url: 'https://placeholder.co/800x600?text=Office+Building',
        caption: 'ビル外観',
        order: 0
      }
    ],
    agentId: 'agent-2',
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop-5',
    title: '品川区更地',
    description: '品川駅徒歩10分の好立地更地。商業施設建設に最適。',
    propertyType: 'LAND',
    transactionType: 'PURCHASE',
    status: 'ACTIVE',
    price: 450000000,
    landArea: 320.0,
    buildingArea: null,
    address: {
      postalCode: '140-0001',
      prefecture: '東京都',
      city: '品川区',
      street: '北品川3-7-15'
    },
    location: {
      lat: 35.6197,
      lng: 139.7395
    },
    features: ['更地', '角地', '商業地域', '建ぺい率80%'],
    images: [
      {
        id: 'img-5-1',
        url: 'https://placeholder.co/800x600?text=Land',
        caption: '土地全景',
        order: 0
      }
    ],
    agentId: 'agent-1',
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date().toISOString()
  }
];