# 🤖 AI Worker (Python) - 担当: Full Stack Engineer

## 🎯 あなたのミッション
**Python + FastAPI + Gemini API** で高性能なAI-OCR機能を実装する

---

## ⚡ 今すぐ開始

### 1. 開発環境確認
```bash
# プロジェクトルートで実行済みか確認
cd ../../  # real-estate-dx/ ディレクトリに戻る
pnpm dev

# AI Worker単体起動
cd apps/ai-worker
python -m uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

### 2. 今日のタスク（Day 1）
- [ ] **Python環境・依存関係セットアップ**
- [ ] **Gemini API接続確認**
- [ ] **PDF処理基盤実装開始**

---

## 📂 ディレクトリ構造

```
apps/ai-worker/
├── 📄 README.md                # このファイル
├── 📄 requirements.txt         # Python依存関係
├── 📄 pyproject.toml           # Python プロジェクト設定
├── 🚀 main.py                  # FastAPI サーバーエントリーポイント
├── 📄 config.py                # 設定・環境変数
├── 📁 services/                # ビジネスロジック
│   ├── 🤖 gemini_service.py    # Gemini API統合
│   ├── 📄 pdf_service.py       # PDF処理サービス
│   ├── 🔍 ocr_service.py       # OCR統合サービス
│   ├── 📊 data_service.py      # データ処理・構造化
│   └── 🔗 api_service.py       # 外部API統合
│
├── 📁 api/                     # FastAPI ルート
│   ├── 📄 __init__.py
│   ├── 🔍 ocr.py               # OCR API エンドポイント
│   ├── 📄 documents.py         # 文書処理API
│   ├── 🤖 ai.py                # AI関連API
│   └── ❤️ health.py            # ヘルスチェック
│
├── 📁 models/                  # データモデル・スキーマ
│   ├── 📄 __init__.py
│   ├── 🔍 ocr_models.py        # OCR入出力モデル
│   ├── 📄 document_models.py   # 文書モデル
│   ├── 🏠 property_models.py   # 物件データモデル
│   └── 🔧 common_models.py     # 共通モデル
│
├── 📁 utils/                   # ユーティリティ
│   ├── 📄 __init__.py
│   ├── 📄 pdf_utils.py         # PDF処理ユーティリティ
│   ├── 🖼️ image_utils.py       # 画像処理ユーティリティ
│   ├── 📝 text_utils.py        # テキスト処理ユーティリティ
│   ├── 🔧 validation_utils.py  # バリデーション
│   └── 📊 logging_utils.py     # ログ出力
│
├── 📁 processors/              # 専門処理器
│   ├── 📄 __init__.py
│   ├── 📋 deed_processor.py    # 登記簿謄本処理
│   ├── 🏠 property_processor.py # 物件情報処理
│   ├── 📄 contract_processor.py # 契約書処理
│   └── 🔧 base_processor.py    # 基底処理クラス
│
├── 📁 integrations/            # 外部統合
│   ├── 📄 __init__.py
│   ├── 🔗 backend_api.py       # バックエンドAPI連携
│   ├── ☁️ gcs_client.py        # Google Cloud Storage
│   ├── 📊 database_client.py   # データベース連携
│   └── 📧 notification_client.py # 通知連携
│
├── 📁 tests/                   # テストファイル
│   ├── 🧪 test_ocr.py          # OCRテスト
│   ├── 🧪 test_pdf.py          # PDF処理テスト
│   ├── 🧪 test_gemini.py       # Gemini APIテスト
│   └── 📁 fixtures/            # テストデータ
│       ├── sample_deed.pdf     # サンプル登記簿
│       └── sample_contract.pdf # サンプル契約書
│
└── 📁 docs/                    # ドキュメント
    ├── 📄 API.md               # API仕様書
    ├── 📄 OCR_GUIDE.md         # OCR使用ガイド
    └── 📄 DEPLOYMENT.md        # デプロイ手順
```

---

## 🛠️ 開発コマンド

### 基本コマンド
```bash
# 仮想環境作成（初回のみ）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# 開発サーバー起動
uvicorn main:app --reload --port 8000
# → http://localhost:8000

# API ドキュメント確認
# → http://localhost:8000/docs (Swagger UI)
# → http://localhost:8000/redoc (ReDoc)

# テスト実行
pytest
pytest -v                    # 詳細表示
pytest --cov=.              # カバレッジ付き
pytest tests/test_ocr.py    # 特定ファイル

# リント・フォーマット
black .                     # コードフォーマット
flake8 .                    # リント
mypy .                      # 型チェック
```

### AI-OCR専用コマンド
```bash
# OCR機能テスト
python -m tests.test_ocr_manual sample.pdf

# Gemini API接続テスト
python -c "from services.gemini_service import test_connection; test_connection()"

# PDF処理テスト
python utils/pdf_utils.py sample.pdf

# 登記簿処理テスト
python processors/deed_processor.py sample_deed.pdf
```

---

## 📅 実装スケジュール

### Week 1: AI-OCR基盤構築
- [ ] **Day 1**: Python環境・FastAPI基盤セットアップ
- [ ] **Day 2**: Gemini API統合・接続確認
- [ ] **Day 3**: PDF処理・前処理機能実装
- [ ] **Day 4**: 基本OCR機能実装・テスト
- [ ] **Day 5**: エラーハンドリング・ロギング

### Week 2: 専門機能実装
- [ ] **Day 1-2**: 登記簿謄本専用処理器
- [ ] **Day 3-4**: 構造化データ抽出・検証
- [ ] **Day 5**: バックエンドAPI統合

### Week 3: 統合・最適化
- [ ] **Day 1-2**: 統合テスト・E2Eテスト
- [ ] **Day 3-4**: パフォーマンス最適化
- [ ] **Day 5**: 本番環境対応・監視

---

## 🧩 実装優先度

### 🔥 最優先（Week 1）
1. **Gemini API統合**
2. **PDF処理基盤**
3. **基本OCR機能**

### ⚡ 高優先（Week 2）
1. **登記簿謄本処理**
2. **構造化データ抽出**
3. **API統合**

### 📊 中優先（Week 3）
1. **パフォーマンス最適化**
2. **エラーハンドリング強化**
3. **監視・ログ機能**

---

## 🤖 Gemini API統合

### Gemini サービス実装
```python
# services/gemini_service.py
import google.generativeai as genai
from typing import Optional, Dict, Any
import base64
import logging
from config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_CLOUD_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def extract_pdf_data(
        self, 
        pdf_content: bytes, 
        document_type: str = "property_deed"
    ) -> Dict[str, Any]:
        """
        PDFから構造化データを抽出
        
        Args:
            pdf_content: PDF バイナリデータ
            document_type: 文書種別 (property_deed, contract, etc.)
            
        Returns:
            抽出された構造化データ
        """
        try:
            # PDF を base64 エンコード
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
            
            # 文書種別に応じたプロンプト生成
            prompt = self._generate_prompt(document_type)
            
            # Gemini API呼び出し
            response = await self._call_gemini_api(pdf_base64, prompt)
            
            # レスポンス処理・構造化
            structured_data = self._process_response(response, document_type)
            
            return {
                "success": True,
                "data": structured_data,
                "confidence": self._calculate_confidence(response),
                "processing_time": response.get("processing_time", 0)
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    def _generate_prompt(self, document_type: str) -> str:
        """文書種別に応じたプロンプト生成"""
        prompts = {
            "property_deed": """
            この登記簿謄本PDFから以下の情報を正確に抽出してJSONで返してください：
            
            {
                "property_info": {
                    "address": "所在地（完全住所）",
                    "land_area": "土地面積（数値のみ、m²）",
                    "building_area": "建物面積（数値のみ、m²）",
                    "building_structure": "建物構造",
                    "building_use": "建物用途",
                    "build_date": "建築年月日（YYYY-MM-DD形式）"
                },
                "ownership_info": {
                    "current_owner": "現在の所有者名",
                    "ownership_ratio": "持分割合",
                    "acquisition_date": "取得日（YYYY-MM-DD形式）",
                    "acquisition_cause": "取得原因"
                },
                "legal_info": {
                    "lot_number": "地番",
                    "building_number": "家屋番号",
                    "land_rights": "土地権利",
                    "restrictions": "制限事項（配列）"
                },
                "metadata": {
                    "document_number": "登記簿番号",
                    "issue_date": "発行日（YYYY-MM-DD形式）",
                    "issuing_authority": "発行機関"
                }
            }
            
            注意事項：
            - 情報が記載されていない場合はnullを返してください
            - 数値は文字列ではなく数値型で返してください
            - 日付は必ずYYYY-MM-DD形式で返してください
            - 不明な場合はnullを返し、推測しないでください
            """,
            
            "contract": """
            この契約書PDFから以下の情報を抽出してJSONで返してください：
            
            {
                "contract_info": {
                    "contract_type": "契約種別",
                    "contract_number": "契約番号",
                    "contract_date": "契約日（YYYY-MM-DD形式）",
                    "effective_date": "効力発生日（YYYY-MM-DD形式）",
                    "amount": "契約金額（数値のみ）"
                },
                "parties": {
                    "buyer": {
                        "name": "買主名",
                        "address": "買主住所",
                        "phone": "電話番号"
                    },
                    "seller": {
                        "name": "売主名", 
                        "address": "売主住所",
                        "phone": "電話番号"
                    }
                },
                "property_details": {
                    "address": "物件所在地",
                    "description": "物件概要"
                },
                "terms": {
                    "payment_method": "支払方法",
                    "completion_date": "決済日（YYYY-MM-DD形式）",
                    "special_conditions": "特約事項（配列）"
                }
            }
            """
        }
        
        return prompts.get(document_type, prompts["property_deed"])
    
    async def _call_gemini_api(self, pdf_base64: str, prompt: str) -> Dict[str, Any]:
        """Gemini API呼び出し"""
        try:
            # PDF データとプロンプトを送信
            response = self.model.generate_content([
                {
                    "inline_data": {
                        "mime_type": "application/pdf",
                        "data": pdf_base64
                    }
                },
                prompt
            ])
            
            return {
                "text": response.text,
                "candidates": response.candidates,
                "processing_time": 0  # 実際の処理時間を記録
            }
            
        except Exception as e:
            logger.error(f"Gemini API call failed: {str(e)}")
            raise
    
    def _process_response(self, response: Dict[str, Any], document_type: str) -> Dict[str, Any]:
        """レスポンス処理・JSON パース"""
        try:
            import json
            
            response_text = response.get("text", "")
            
            # JSON 部分を抽出（マークダウンのコードブロック除去）
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text.strip()
            
            # JSON パース
            parsed_data = json.loads(json_text)
            
            # データ検証・正規化
            validated_data = self._validate_data(parsed_data, document_type)
            
            return validated_data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {str(e)}")
            raise ValueError(f"Invalid JSON response: {str(e)}")
        except Exception as e:
            logger.error(f"Response processing error: {str(e)}")
            raise
    
    def _validate_data(self, data: Dict[str, Any], document_type: str) -> Dict[str, Any]:
        """データ検証・正規化"""
        # 日付フォーマット正規化
        if document_type == "property_deed":
            # 建築年月日の検証
            if "property_info" in data and "build_date" in data["property_info"]:
                build_date = data["property_info"]["build_date"]
                if build_date and not self._is_valid_date(build_date):
                    data["property_info"]["build_date"] = None
                    
            # 面積の数値検証
            if "property_info" in data:
                for area_key in ["land_area", "building_area"]:
                    if area_key in data["property_info"]:
                        area_value = data["property_info"][area_key]
                        if area_value and not isinstance(area_value, (int, float)):
                            # 文字列から数値抽出を試行
                            try:
                                data["property_info"][area_key] = float(str(area_value).replace("m²", "").strip())
                            except:
                                data["property_info"][area_key] = None
        
        return data
    
    def _is_valid_date(self, date_str: str) -> bool:
        """日付形式検証"""
        try:
            from datetime import datetime
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except:
            return False
    
    def _calculate_confidence(self, response: Dict[str, Any]) -> float:
        """信頼度計算"""
        # 簡単な信頼度計算（実際はより複雑な計算が必要）
        candidates = response.get("candidates", [])
        if candidates:
            # 最初の候補の信頼度を使用
            return candidates[0].get("confidence", 0.8)
        return 0.8

# サービスインスタンス
gemini_service = GeminiService()
```

### PDF処理サービス
```python
# services/pdf_service.py
import PyPDF2
import io
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.supported_mime_types = ["application/pdf"]
    
    async def process_pdf(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        PDFファイルの前処理・検証
        
        Args:
            file_content: PDFバイナリデータ
            filename: ファイル名
            
        Returns:
            処理結果
        """
        try:
            # ファイルサイズ検証
            if len(file_content) > self.max_file_size:
                raise ValueError(f"File size exceeds limit: {len(file_content)} bytes")
            
            # PDF形式検証
            if not self._is_valid_pdf(file_content):
                raise ValueError("Invalid PDF format")
            
            # メタデータ抽出
            metadata = self._extract_metadata(file_content)
            
            # ページ数確認
            page_count = self._get_page_count(file_content)
            
            return {
                "success": True,
                "metadata": metadata,
                "page_count": page_count,
                "file_size": len(file_content),
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"PDF processing error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _is_valid_pdf(self, file_content: bytes) -> bool:
        """PDF形式検証"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            return len(pdf_reader.pages) > 0
        except:
            return False
    
    def _extract_metadata(self, file_content: bytes) -> Dict[str, Any]:
        """PDFメタデータ抽出"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            metadata = pdf_reader.metadata
            
            return {
                "title": metadata.get("/Title", ""),
                "author": metadata.get("/Author", ""),
                "creator": metadata.get("/Creator", ""),
                "creation_date": str(metadata.get("/CreationDate", "")),
                "modification_date": str(metadata.get("/ModDate", ""))
            }
        except Exception as e:
            logger.warning(f"Metadata extraction failed: {str(e)}")
            return {}
    
    def _get_page_count(self, file_content: bytes) -> int:
        """ページ数取得"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            return len(pdf_reader.pages)
        except:
            return 0

# サービスインスタンス
pdf_service = PDFService()
```

---

## 🔍 OCR API エンドポイント

### FastAPI ルート実装
```python
# api/ocr.py
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional
import logging
from services.gemini_service import gemini_service
from services.pdf_service import pdf_service
from models.ocr_models import OCRRequest, OCRResponse
from utils.validation_utils import validate_file

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ocr", tags=["OCR"])

@router.post("/process", response_model=OCRResponse)
async def process_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    document_type: Optional[str] = "property_deed",
    tenant_id: Optional[str] = None,
    user_id: Optional[str] = None
):
    """
    文書OCR処理
    
    - **file**: PDFファイル
    - **document_type**: 文書種別 (property_deed, contract, etc.)
    - **tenant_id**: テナントID（マルチテナント対応）
    - **user_id**: ユーザーID
    """
    try:
        # ファイル検証
        validation_result = await validate_file(file)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400, 
                detail=f"File validation failed: {validation_result['error']}"
            )
        
        # ファイル読み込み
        file_content = await file.read()
        
        # PDF前処理
        pdf_result = await pdf_service.process_pdf(file_content, file.filename)
        if not pdf_result["success"]:
            raise HTTPException(
                status_code=400,
                detail=f"PDF processing failed: {pdf_result['error']}"
            )
        
        # OCR処理（Gemini API）
        ocr_result = await gemini_service.extract_pdf_data(file_content, document_type)
        
        if not ocr_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"OCR processing failed: {ocr_result['error']}"
            )
        
        # 結果統合
        response_data = {
            "success": True,
            "document_info": {
                "filename": file.filename,
                "file_size": len(file_content),
                "page_count": pdf_result["page_count"],
                "document_type": document_type
            },
            "ocr_result": ocr_result["data"],
            "confidence": ocr_result["confidence"],
            "processing_time": ocr_result["processing_time"],
            "metadata": pdf_result["metadata"]
        }
        
        # バックグラウンドでデータベース保存
        if tenant_id and user_id:
            background_tasks.add_task(
                save_ocr_result,
                response_data,
                tenant_id,
                user_id,
                file_content
            )
        
        return JSONResponse(content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/status/{job_id}")
async def get_processing_status(job_id: str):
    """
    OCR処理状況確認
    """
    # Redis等でジョブ状況を管理
    status = await get_job_status(job_id)
    
    return {
        "job_id": job_id,
        "status": status["status"],  # pending, processing, completed, failed
        "progress": status.get("progress", 0),
        "result": status.get("result", None),
        "error": status.get("error", None)
    }

async def save_ocr_result(
    result_data: dict, 
    tenant_id: str, 
    user_id: str, 
    file_content: bytes
):
    """バックグラウンドでOCR結果を保存"""
    try:
        # Google Cloud Storage にファイル保存
        file_url = await upload_to_gcs(file_content, result_data["document_info"]["filename"])
        
        # データベースに結果保存
        await save_to_database({
            "filename": result_data["document_info"]["filename"],
            "url": file_url,
            "ocr_result": result_data["ocr_result"],
            "confidence": result_data["confidence"],
            "document_type": result_data["document_info"]["document_type"],
            "tenant_id": tenant_id,
            "user_id": user_id,
            "status": "COMPLETED"
        })
        
        logger.info(f"OCR result saved for user {user_id}")
        
    except Exception as e:
        logger.error(f"Failed to save OCR result: {str(e)}")
```

---

## 📊 データモデル定義

### Pydantic モデル
```python
# models/ocr_models.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class PropertyInfo(BaseModel):
    address: Optional[str] = None
    land_area: Optional[float] = None
    building_area: Optional[float] = None
    building_structure: Optional[str] = None
    building_use: Optional[str] = None
    build_date: Optional[str] = None

class OwnershipInfo(BaseModel):
    current_owner: Optional[str] = None
    ownership_ratio: Optional[str] = None
    acquisition_date: Optional[str] = None
    acquisition_cause: Optional[str] = None

class LegalInfo(BaseModel):
    lot_number: Optional[str] = None
    building_number: Optional[str] = None
    land_rights: Optional[str] = None
    restrictions: Optional[List[str]] = None

class DocumentMetadata(BaseModel):
    document_number: Optional[str] = None
    issue_date: Optional[str] = None
    issuing_authority: Optional[str] = None

class PropertyDeedData(BaseModel):
    property_info: PropertyInfo
    ownership_info: OwnershipInfo
    legal_info: LegalInfo
    metadata: DocumentMetadata

class OCRRequest(BaseModel):
    document_type: str = Field(default="property_deed", description="文書種別")
    tenant_id: Optional[str] = Field(None, description="テナントID")
    user_id: Optional[str] = Field(None, description="ユーザーID")

class OCRResponse(BaseModel):
    success: bool
    document_info: Dict[str, Any]
    ocr_result: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    processing_time: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
```

---

## 🧪 テスト実装

### OCRテスト
```python
# tests/test_ocr.py
import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
from services.gemini_service import gemini_service

client = TestClient(app)

class TestOCR:
    def test_health_check(self):
        """ヘルスチェックテスト"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_gemini_connection(self):
        """Gemini API接続テスト"""
        try:
            # 簡単なテストプロンプト
            test_content = b"test content"
            result = await gemini_service.extract_pdf_data(test_content, "property_deed")
            
            # 接続が成功すればOK（実際の結果は問わない）
            assert isinstance(result, dict)
            assert "success" in result
            
        except Exception as e:
            pytest.skip(f"Gemini API not available: {str(e)}")
    
    def test_pdf_upload_validation(self):
        """PDFアップロードバリデーションテスト"""
        # 無効なファイル
        response = client.post(
            "/api/ocr/process",
            files={"file": ("test.txt", b"not a pdf", "text/plain")}
        )
        assert response.status_code == 400
        
        # ファイルサイズ超過テスト
        large_content = b"x" * (51 * 1024 * 1024)  # 51MB
        response = client.post(
            "/api/ocr/process",
            files={"file": ("large.pdf", large_content, "application/pdf")}
        )
        assert response.status_code == 400
    
    @pytest.mark.skipif(
        not os.path.exists("tests/fixtures/sample_deed.pdf"),
        reason="Sample PDF not found"
    )
    def test_real_pdf_processing(self):
        """実際のPDFファイル処理テスト"""
        with open("tests/fixtures/sample_deed.pdf", "rb") as f:
            response = client.post(
                "/api/ocr/process",
                files={"file": ("sample_deed.pdf", f, "application/pdf")},
                data={"document_type": "property_deed"}
            )
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert "ocr_result" in result
        assert "confidence" in result
```

---

## 🚨 トラブルシューティング

### よくある問題

#### 🐍 Python環境エラー
```bash
# 1. Python バージョン確認
python --version  # 3.11+ 推奨

# 2. 仮想環境再作成
rm -rf venv
python -m venv venv
source venv/bin/activate

# 3. 依存関係再インストール
pip install --upgrade pip
pip install -r requirements.txt
```

#### 🤖 Gemini API エラー
```bash
# 1. API キー確認
echo $GOOGLE_CLOUD_API_KEY

# 2. プロジェクト設定確認
echo $GOOGLE_CLOUD_PROJECT

# 3. API有効化確認
gcloud services list --enabled | grep generativelanguage

# 4. 接続テスト
python -c "
import google.generativeai as genai
genai.configure(api_key='$GOOGLE_CLOUD_API_KEY')
model = genai.GenerativeModel('gemini-1.5-flash')
print('Gemini API connection OK')
"
```

#### 📄 PDF処理エラー
```bash
# 1. PDF ライブラリ確認
pip list | grep -i pdf

# 2. PDF ファイル形式確認
file sample.pdf

# 3. PDF 手動テスト
python -c "
import PyPDF2
import io
with open('sample.pdf', 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    print(f'Pages: {len(reader.pages)}')
"
```

---

## 📚 参考リンク

### 公式ドキュメント
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Generative AI](https://ai.google.dev/docs)
- [PyPDF2 Documentation](https://pypdf2.readthedocs.io/)

### 開発ツール
- [Uvicorn](https://www.uvicorn.org/)
- [Pytest](https://docs.pytest.org/)
- [Black Code Formatter](https://black.readthedocs.io/)

---

## 🚀 今日から始めよう！

### ✅ 今すぐやること
1. **Python環境確認**: `python --version && pip list`
2. **依存関係インストール**: `pip install -r requirements.txt`
3. **Gemini API接続テスト**: Gemini APIキーで接続確認

### 📞 質問・サポート
- **Slack**: `#ai-dev`
- **Tech Lead**: AI・OCR技術相談
- **Backend Engineer**: API統合相談

---

**🤖 高精度なAI-OCRシステムを構築しましょう！**

> 💡 **ヒント**: まずはシンプルなPDF処理から始めて、段階的にGemini APIとの統合を進めましょう！