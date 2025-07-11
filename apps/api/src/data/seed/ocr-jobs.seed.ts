export const seedOcrJobs = [
  {
    id: 'ocr-1',
    filename: '登記簿謄本_港区物件.pdf',
    documentType: '登記簿謄本',
    status: 'COMPLETED',
    fileUrl: 'https://storage.example.com/ocr/touki-minato.pdf',
    progress: 100,
    result: {
      extractedText: '不動産登記簿謄本\n\n表題部（建物の表示）\n所在：東京都港区六本木七丁目1番1号\n家屋番号：1番1\n種類：共同住宅\n構造：鉄骨鉄筋コンクリート造陸屋根地下2階付45階建\n床面積：40階部分 120.50平方メートル\n\n権利部（甲区）（所有権に関する事項）\n順位番号：1\n登記の目的：所有権保存\n受付年月日・受付番号：平成30年1月15日第1234号\n権利者その他の事項：所有者 山田太郎',
      confidence: 0.95,
      metadata: {
        pages: 3,
        language: 'ja',
        extractedFields: {
          address: '東京都港区六本木七丁目1番1号',
          buildingType: '共同住宅',
          structure: '鉄骨鉄筋コンクリート造',
          area: '120.50平方メートル',
          owner: '山田太郎'
        }
      }
    },
    userId: 'agent-1',
    propertyId: 'prop-1',
    tenantId: 'test-tenant-1',
    startedAt: new Date('2024-02-01T10:00:00').toISOString(),
    completedAt: new Date('2024-02-01T10:05:00').toISOString(),
    createdAt: new Date('2024-02-01T09:55:00').toISOString(),
    updatedAt: new Date('2024-02-01T10:05:00').toISOString()
  },
  {
    id: 'ocr-2',
    filename: '公図_世田谷区.pdf',
    documentType: '公図',
    status: 'COMPLETED',
    fileUrl: 'https://storage.example.com/ocr/kouzu-setagaya.pdf',
    progress: 100,
    result: {
      extractedText: '公図\n\n地番：世田谷区三軒茶屋二丁目15番8\n縮尺：1/250\n隣接地番：15-7、15-9、道路\n\n備考：平成31年3月測量',
      confidence: 0.88,
      metadata: {
        pages: 1,
        language: 'ja',
        extractedFields: {
          landNumber: '15番8',
          scale: '1/250',
          adjacentLands: ['15-7', '15-9', '道路']
        }
      }
    },
    userId: 'agent-2',
    propertyId: 'prop-2',
    tenantId: 'test-tenant-1',
    startedAt: new Date('2024-02-02T14:00:00').toISOString(),
    completedAt: new Date('2024-02-02T14:03:00').toISOString(),
    createdAt: new Date('2024-02-02T13:55:00').toISOString(),
    updatedAt: new Date('2024-02-02T14:03:00').toISOString()
  },
  {
    id: 'ocr-3',
    filename: '測量図_品川区土地.pdf',
    documentType: '測量図',
    status: 'PROCESSING',
    fileUrl: 'https://storage.example.com/ocr/sokuryou-shinagawa.pdf',
    progress: 65,
    result: null,
    userId: 'agent-1',
    propertyId: 'prop-5',
    tenantId: 'test-tenant-1',
    startedAt: new Date('2024-02-10T09:00:00').toISOString(),
    completedAt: null,
    createdAt: new Date('2024-02-10T08:55:00').toISOString(),
    updatedAt: new Date('2024-02-10T09:10:00').toISOString()
  },
  {
    id: 'ocr-4',
    filename: '建物図面_渋谷マンション.pdf',
    documentType: '建物図面',
    status: 'FAILED',
    fileUrl: 'https://storage.example.com/ocr/tatemono-shibuya.pdf',
    progress: 0,
    result: null,
    error: 'ファイル形式が不正です。PDFファイルが破損している可能性があります。',
    userId: 'agent-1',
    propertyId: 'prop-3',
    tenantId: 'test-tenant-1',
    startedAt: new Date('2024-02-08T11:00:00').toISOString(),
    completedAt: new Date('2024-02-08T11:01:00').toISOString(),
    createdAt: new Date('2024-02-08T10:55:00').toISOString(),
    updatedAt: new Date('2024-02-08T11:01:00').toISOString()
  },
  {
    id: 'ocr-5',
    filename: '重要事項説明書_sample.pdf',
    documentType: 'その他',
    status: 'PENDING',
    fileUrl: 'https://storage.example.com/ocr/juusetsu-sample.pdf',
    progress: 0,
    result: null,
    userId: 'agent-2',
    propertyId: null,
    tenantId: 'test-tenant-1',
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2024-02-12T16:30:00').toISOString(),
    updatedAt: new Date('2024-02-12T16:30:00').toISOString()
  }
];