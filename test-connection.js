// シンプルなAPI接続テスト用スクリプト
const https = require('http');

// ヘルスチェック
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// ユーザー登録
function testUserRegistration() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'integration-test@example.com',
      password: 'testpassword123',
      name: '統合テストユーザー',
      tenantId: 'test-tenant'
    });

    const req = https.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// ログイン
function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'integration-test@example.com',
      password: 'testpassword123',
      tenantId: 'test-tenant'
    });

    const req = https.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// 物件一覧
function testPropertiesList(token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/properties',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// テスト実行
async function runTests() {
  console.log('🚀 API統合テスト開始\n');

  try {
    // 1. ヘルスチェック
    console.log('1️⃣ ヘルスチェック...');
    const healthResult = await testHealthCheck();
    console.log(`   ✅ ステータス: ${healthResult.status}`);
    console.log(`   📊 レスポンス: ${healthResult.data.status}\n`);

    // 2. ユーザー登録
    console.log('2️⃣ ユーザー登録...');
    const registerResult = await testUserRegistration();
    console.log(`   ✅ ステータス: ${registerResult.status}`);
    console.log(`   👤 ユーザー: ${registerResult.data.data?.user?.name}\n`);

    // 3. ログイン
    console.log('3️⃣ ログイン...');
    const loginResult = await testLogin();
    console.log(`   ✅ ステータス: ${loginResult.status}`);
    const token = loginResult.data.data?.accessToken;
    console.log(`   🔑 トークン取得: ${token ? '成功' : '失敗'}\n`);

    // 4. 物件一覧
    if (token) {
      console.log('4️⃣ 認証後の物件一覧...');
      const propertiesResult = await testPropertiesList(token);
      console.log(`   ✅ ステータス: ${propertiesResult.status}`);
      console.log(`   🏠 物件数: ${propertiesResult.data.data?.properties?.length || 0}\n`);
    }

    console.log('🎉 すべてのテストが完了しました！');

  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
  }
}

// テスト実行
runTests();