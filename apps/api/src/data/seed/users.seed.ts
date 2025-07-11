export const seedUsers = [
  {
    id: 'admin-1',
    email: 'admin@realestate-dx.com',
    password: 'Admin123!',
    name: '管理者',
    role: 'ADMIN',
    department: 'システム管理部',
    phone: '03-1234-5678',
    isActive: true,
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'agent-1',
    email: 'agent1@realestate-dx.com',
    password: 'Agent123!',
    name: '田中太郎',
    role: 'AGENT',
    department: '営業部',
    phone: '090-1234-5678',
    isActive: true,
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'agent-2',
    email: 'agent2@realestate-dx.com',
    password: 'Agent123!',
    name: '佐藤花子',
    role: 'AGENT',
    department: '営業部',
    phone: '090-2345-6789',
    isActive: true,
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'client-1',
    email: 'client1@example.com',
    password: 'Client123!',
    name: '山田次郎',
    role: 'CLIENT',
    phone: '080-1234-5678',
    isActive: true,
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'client-2',
    email: 'client2@example.com',
    password: 'Client123!',
    name: '鈴木美咲',
    role: 'CLIENT',
    phone: '080-2345-6789',
    isActive: true,
    tenantId: 'test-tenant-1',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date().toISOString()
  }
];