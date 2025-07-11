"""
ハトサポBB 完全ログインテスト
実際のアカウント情報を使用した認証プロセス検証
"""

import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
import json
import time
import re
from datetime import datetime

class FullHatosapoLoginTest:
    def __init__(self):
        self.login_url = "https://account.zentaku.or.jp/login?origin=https%3A%2F%2Fmember.zentaku.or.jp%2F&oid=Z00"
        self.user_id = "05100001985000"
        self.password = "toyo6226"
        
        # Cookie管理
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookie_jar))
        self.opener.addheaders = [
            ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        ]
        
        self.test_results = {
            "start_time": datetime.now().isoformat(),
            "tests": [],
            "summary": {}
        }
    
    def test_initial_access(self):
        """初期アクセステスト"""
        test_result = {
            "test_name": "初期アクセス",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("=== ハトサポBB 初期アクセステスト ===")
            print(f"アクセス先: {self.login_url}")
            
            request = urllib.request.Request(self.login_url)
            response = self.opener.open(request, timeout=30)
            
            html_content = response.read().decode('utf-8', errors='ignore')
            
            print(f"✅ 初期アクセス成功")
            print(f"レスポンスコード: {response.getcode()}")
            print(f"レスポンスサイズ: {len(html_content)} 文字")
            
            test_result["details"]["response_code"] = response.getcode()
            test_result["details"]["content_length"] = len(html_content)
            test_result["details"]["url"] = response.geturl()
            
            # フォーム情報保存（後続テストで使用）
            self.initial_html = html_content
            
            test_result["success"] = True
            
        except Exception as e:
            print(f"❌ 初期アクセスエラー: {e}")
            test_result["errors"].append(f"アクセスエラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def test_login_execution(self):
        """実際のログイン実行テスト"""
        test_result = {
            "test_name": "ログイン実行",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("\\n=== 実際のログイン実行テスト ===")
            
            if not hasattr(self, 'initial_html'):
                print("❌ 初期HTMLが取得されていません")
                test_result["errors"].append("初期HTML未取得")
                return test_result
            
            html_content = self.initial_html
            
            # フォームアクションURLを取得
            action_match = re.search(r'<form[^>]*action=["\']?([^"\'>\s]*)["\']?[^>]*>', html_content, re.IGNORECASE)
            if action_match:
                form_action = action_match.group(1)
                if not form_action:
                    # 空の場合は同じURLにPOST
                    form_action_url = self.login_url
                elif form_action.startswith('/'):
                    # 相対パスの場合、絶対パスに変換
                    from urllib.parse import urljoin
                    form_action_url = urljoin(self.login_url, form_action)
                else:
                    form_action_url = form_action
            else:
                # フォームアクションが見つからない場合は同じURLにPOST
                form_action_url = self.login_url
            
            print(f"ログイン先URL: {form_action_url}")
            test_result["details"]["login_url"] = form_action_url
            
            # ログインデータの準備
            login_data = {
                'username': self.user_id,
                'password': self.password
            }
            
            # 隠しフィールドの抽出と追加
            hidden_fields = re.findall(r'<input[^>]*type=["\']?hidden["\']?[^>]*name=["\']?([^"\'>\s]+)["\']?[^>]*value=["\']?([^"\'>\s]*)["\']?[^>]*>', html_content, re.IGNORECASE)
            
            for field_name, field_value in hidden_fields:
                login_data[field_name] = field_value
                print(f"隠しフィールド追加: {field_name} = {field_value}")
            
            test_result["details"]["hidden_fields"] = dict(hidden_fields)
            
            # CSRF トークンの探索と追加
            csrf_patterns = [
                r'<input[^>]*name=["\']?([^"\'>\s]*(?:csrf|token|_token)[^"\'>\s]*)["\']?[^>]*value=["\']?([^"\'>\s]+)["\']?[^>]*>',
                r'<meta[^>]*name=["\']?([^"\'>\s]*(?:csrf|token)[^"\'>\s]*)["\']?[^>]*content=["\']?([^"\'>\s]+)["\']?[^>]*>'
            ]
            
            csrf_found = False
            for pattern in csrf_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                if matches:
                    for csrf_name, csrf_value in matches:
                        login_data[csrf_name] = csrf_value
                        print(f"CSRF トークン追加: {csrf_name} = {csrf_value[:20]}...")
                        csrf_found = True
                        break
                if csrf_found:
                    break
            
            test_result["details"]["csrf_token_used"] = csrf_found
            
            # ログインデータをURLエンコード
            post_data = urllib.parse.urlencode(login_data).encode('utf-8')
            
            # ログインリクエスト実行
            print(f"\\nログイン実行中...")
            print(f"送信データ: username={self.user_id}, password=[MASKED]")
            if hidden_fields:
                print(f"隠しフィールド: {len(hidden_fields)}個")
            
            login_request = urllib.request.Request(form_action_url, data=post_data)
            login_request.add_header('Content-Type', 'application/x-www-form-urlencoded')
            login_request.add_header('Referer', self.login_url)
            login_request.add_header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            login_request.add_header('Accept-Language', 'ja,en-US;q=0.7,en;q=0.3')
            
            # リクエスト実行
            try:
                login_response = self.opener.open(login_request, timeout=30)
                login_html = login_response.read().decode('utf-8', errors='ignore')
                
                # ログイン結果の解析
                final_url = login_response.geturl()
                response_code = login_response.getcode()
                
                print(f"\\n📋 ログイン結果詳細:")
                print(f"レスポンスコード: {response_code}")
                print(f"最終URL: {final_url}")
                print(f"レスポンスサイズ: {len(login_html)} 文字")
                
                test_result["details"]["post_login_url"] = final_url
                test_result["details"]["response_code"] = response_code
                test_result["details"]["content_length"] = len(login_html)
                
                # ページタイトル取得
                title_match = re.search(r'<title[^>]*>(.*?)</title>', login_html, re.IGNORECASE)
                if title_match:
                    page_title = title_match.group(1).strip()
                    print(f"ページタイトル: {page_title}")
                    test_result["details"]["page_title"] = page_title
                
                # ログイン成功の判定
                success_indicators = [
                    "member.zentaku.or.jp" in final_url,
                    "dashboard" in final_url.lower(),
                    "member" in final_url.lower(),
                    "menu" in final_url.lower(),
                    "home" in final_url.lower(),
                    "main" in final_url.lower()
                ]
                
                error_indicators = [
                    "ログインに失敗" in login_html,
                    "認証に失敗" in login_html,
                    "パスワードが正しくありません" in login_html,
                    "ユーザーIDが正しくありません" in login_html,
                    "認証エラー" in login_html,
                    "login" in final_url.lower() and "error" in login_html.lower()
                ]
                
                # 成功判定
                if any(success_indicators):
                    print("\\n✅ ログイン成功と判定")
                    print("🎯 判定理由: URL変化による成功検知")
                    test_result["success"] = True
                    test_result["details"]["login_success"] = True
                    test_result["details"]["success_reason"] = "URL変化による判定"
                    
                    # ログイン後のページ内容解析
                    self.analyze_post_login_page(login_html, test_result)
                    
                elif any(error_indicators):
                    print("\\n❌ ログイン失敗と判定")
                    print("🔍 判定理由: エラーメッセージ検出")
                    test_result["details"]["login_success"] = False
                    test_result["details"]["failure_reason"] = "エラーメッセージ検出"
                    
                    # エラーメッセージ抽出
                    self.extract_error_messages(login_html, test_result)
                    
                else:
                    print("\\n⚠️ ログイン結果が不明")
                    print("🔍 詳細分析が必要")
                    test_result["details"]["login_success"] = None
                    test_result["details"]["analysis_needed"] = True
                    
                    # 詳細分析
                    self.detailed_response_analysis(login_html, test_result)
                
                # レスポンス詳細を保存
                test_result["details"]["html_preview"] = login_html[:2000]
                
            except urllib.error.HTTPError as e:
                print(f"\\n❌ ログインHTTPエラー: {e.code} - {e.reason}")
                test_result["errors"].append(f"HTTPエラー: {e.code} - {e.reason}")
                
                # エラーレスポンスの詳細取得
                try:
                    error_body = e.read().decode('utf-8', errors='ignore')
                    print(f"エラーレスポンス詳細: {error_body[:500]}...")
                    test_result["details"]["error_response"] = error_body[:1000]
                except:
                    pass
                    
        except Exception as e:
            print(f"\\n❌ ログイン実行エラー: {e}")
            test_result["errors"].append(f"実行エラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def analyze_post_login_page(self, html_content, test_result):
        """ログイン後ページの詳細解析"""
        print("\\n📊 ログイン後ページ解析:")
        
        # 会員メニューの検出
        menu_keywords = ["メニュー", "menu", "ナビゲーション", "navigation", "ダッシュボード", "dashboard"]
        menu_detected = any(keyword in html_content.lower() for keyword in menu_keywords)
        
        if menu_detected:
            print("✅ 会員メニュー画面を確認")
            test_result["details"]["member_menu_detected"] = True
        
        # ログアウトリンクの確認
        logout_patterns = [
            r'<a[^>]*href[^>]*>.*?ログアウト.*?</a>',
            r'<a[^>]*href[^>]*>.*?logout.*?</a>'
        ]
        
        logout_found = False
        for pattern in logout_patterns:
            if re.search(pattern, html_content, re.IGNORECASE):
                logout_found = True
                break
        
        if logout_found:
            print("✅ ログアウト機能を確認")
            test_result["details"]["logout_function_detected"] = True
        
        # 物件検索関連機能の確認
        search_keywords = ["物件", "検索", "search", "不動産", "土地", "建物"]
        search_content = any(keyword in html_content for keyword in search_keywords)
        
        if search_content:
            print("✅ 物件関連機能を確認")
            test_result["details"]["property_functions_detected"] = True
        
        # ナビゲーションメニューの抽出
        nav_links = re.findall(r'<a[^>]*href=["\']?([^"\'>\s]+)["\']?[^>]*>([^<]+)</a>', html_content)
        if nav_links:
            print(f"✅ ナビゲーションリンク: {len(nav_links)}個発見")
            test_result["details"]["navigation_links"] = nav_links[:10]  # 最初の10個
    
    def extract_error_messages(self, html_content, test_result):
        """エラーメッセージの抽出"""
        print("\\n🔍 エラーメッセージ解析:")
        
        error_patterns = [
            r'<div[^>]*class=["\']?[^"\']*error[^"\']*["\']?[^>]*>([^<]+)</div>',
            r'<span[^>]*class=["\']?[^"\']*error[^"\']*["\']?[^>]*>([^<]+)</span>',
            r'<p[^>]*class=["\']?[^"\']*error[^"\']*["\']?[^>]*>([^<]+)</p>',
            r'<div[^>]*class=["\']?[^"\']*alert[^"\']*["\']?[^>]*>([^<]+)</div>',
            r'<div[^>]*id=["\']?[^"\']*error[^"\']*["\']?[^>]*>([^<]+)</div>'
        ]
        
        error_messages = []
        for pattern in error_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            error_messages.extend([msg.strip() for msg in matches if msg.strip()])
        
        if error_messages:
            print(f"❌ エラーメッセージ: {len(error_messages)}個")
            for i, msg in enumerate(error_messages[:3]):  # 最初の3個
                print(f"  {i+1}. {msg}")
            test_result["details"]["error_messages"] = error_messages
            test_result["errors"].extend(error_messages)
        else:
            print("⚠️ 明示的なエラーメッセージは検出されず")
    
    def detailed_response_analysis(self, html_content, test_result):
        """詳細レスポンス解析"""
        print("\\n🔬 詳細レスポンス解析:")
        
        # JavaScriptリダイレクト確認
        js_redirect = re.search(r'location\.href\s*=\s*["\']([^"\']+)["\']', html_content, re.IGNORECASE)
        if js_redirect:
            redirect_url = js_redirect.group(1)
            print(f"🔄 JavaScriptリダイレクト検出: {redirect_url}")
            test_result["details"]["js_redirect"] = redirect_url
        
        # メタリフレッシュ確認
        meta_refresh = re.search(r'<meta[^>]*http-equiv=["\']?refresh["\']?[^>]*content=["\']?[^"\']*url=([^"\'>\s]+)["\']?[^>]*>', html_content, re.IGNORECASE)
        if meta_refresh:
            refresh_url = meta_refresh.group(1)
            print(f"🔄 メタリフレッシュ検出: {refresh_url}")
            test_result["details"]["meta_refresh"] = refresh_url
        
        # フォーム要素確認
        forms = re.findall(r'<form[^>]*>(.*?)</form>', html_content, re.DOTALL | re.IGNORECASE)
        if forms:
            print(f"📝 フォーム要素: {len(forms)}個")
            test_result["details"]["forms_count"] = len(forms)
        
        # 特定キーワード検索
        analysis_keywords = {
            "captcha": "CAPTCHA機能",
            "verification": "認証処理",
            "session": "セッション管理",
            "timeout": "タイムアウト",
            "maintenance": "メンテナンス"
        }
        
        detected_features = []
        for keyword, description in analysis_keywords.items():
            if keyword in html_content.lower():
                detected_features.append(description)
                print(f"🔍 {description}を検出")
        
        if detected_features:
            test_result["details"]["detected_features"] = detected_features
    
    def test_session_verification(self):
        """セッション状態の検証"""
        test_result = {
            "test_name": "セッション検証",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("\\n=== セッション状態検証 ===")
            
            # 前回のログインが成功している場合のみ実行
            login_test = next((test for test in self.test_results["tests"] if test["test_name"] == "ログイン実行"), None)
            if not login_test or not login_test.get("success"):
                print("⚠️ ログインが成功していないため、セッション検証をスキップ")
                test_result["errors"].append("ログイン未成功のためスキップ")
                test_result["end_time"] = datetime.now().isoformat()
                self.test_results["tests"].append(test_result)
                return test_result
            
            # 会員ページへのアクセス試行
            member_url = "https://member.zentaku.or.jp/"
            print(f"会員ページアクセス: {member_url}")
            
            request = urllib.request.Request(member_url)
            response = self.opener.open(request, timeout=30)
            
            session_html = response.read().decode('utf-8', errors='ignore')
            final_url = response.geturl()
            
            print(f"アクセス結果URL: {final_url}")
            print(f"レスポンスサイズ: {len(session_html)} 文字")
            
            test_result["details"]["final_url"] = final_url
            test_result["details"]["content_length"] = len(session_html)
            
            # セッション有効性の判定
            if "login" in final_url.lower():
                print("❌ セッション無効 - ログインページにリダイレクト")
                test_result["details"]["session_valid"] = False
                test_result["errors"].append("セッション無効")
            else:
                print("✅ セッション有効 - 会員ページにアクセス成功")
                test_result["details"]["session_valid"] = True
                test_result["success"] = True
                
                # 会員ページの内容確認
                if "会員" in session_html or "member" in session_html.lower():
                    print("✅ 会員コンテンツを確認")
                    test_result["details"]["member_content_detected"] = True
        
        except Exception as e:
            print(f"❌ セッション検証エラー: {e}")
            test_result["errors"].append(f"検証エラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def save_results(self):
        """結果保存"""
        try:
            self.test_results["end_time"] = datetime.now().isoformat()
            
            # サマリー生成
            total_tests = len(self.test_results["tests"])
            successful_tests = sum(1 for test in self.test_results["tests"] if test["success"])
            
            self.test_results["summary"] = {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "success_rate": f"{(successful_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
                "overall_success": successful_tests >= (total_tests * 0.6),
                "login_successful": any(test["test_name"] == "ログイン実行" and test["success"] for test in self.test_results["tests"])
            }
            
            # ファイル保存
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"/mnt/c/Users/mtsid/OneDrive/ドキュメント/TALENT/AIDX/不動産売買システム/poc_tests/hatosapo_rpa_validation/full_login_test_results_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, ensure_ascii=False, indent=2)
            
            print(f"\\n✅ テスト結果保存: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ 結果保存エラー: {e}")
            return None
    
    def run_full_test(self):
        """完全ログインテスト実行"""
        try:
            print("ハトサポBB 完全ログインテスト開始")
            print("=" * 70)
            print(f"テスト対象: {self.login_url}")
            print(f"使用アカウント: {self.user_id}")
            print("=" * 70)
            
            # テスト実行
            access_result = self.test_initial_access()
            login_result = self.test_login_execution()
            session_result = self.test_session_verification()
            
            # 結果保存
            result_file = self.save_results()
            
            # 結果表示
            print("\\n" + "=" * 70)
            print("ハトサポBB 完全ログインテスト結果")
            print("=" * 70)
            
            for test in self.test_results["tests"]:
                status = "✅ 成功" if test["success"] else "❌ 失敗"
                print(f"{test['test_name']}: {status}")
                
                if test["errors"]:
                    for error in test["errors"]:
                        print(f"  ⚠️ {error}")
                
                # 重要な詳細情報の表示
                if test["test_name"] == "ログイン実行" and "login_success" in test["details"]:
                    if test["details"]["login_success"]:
                        print(f"  🎯 ログイン成功: {test['details'].get('success_reason', '不明')}")
                    elif test["details"]["login_success"] is False:
                        print(f"  🔍 ログイン失敗: {test['details'].get('failure_reason', '不明')}")
                    else:
                        print(f"  ❓ ログイン結果不明: 詳細解析が必要")
            
            summary = self.test_results["summary"]
            print(f"\\n📊 総合結果: {summary['successful_tests']}/{summary['total_tests']} ({summary['success_rate']})")
            
            # 最終判定
            if summary["login_successful"]:
                print("\\n🎉 ハトサポBB ログイン成功！")
                print("✅ RPA自動化の技術的実現可能性が確認されました")
                print("✅ 提供されたアカウント情報でアクセス可能")
            elif summary["overall_success"]:
                print("\\n⚠️ ハトサポBB 部分的成功")
                print("✅ 基本的な接続は可能だが、ログインに課題あり")
                print("🔍 認証プロセスの詳細調査が必要")
            else:
                print("\\n❌ ハトサポBB アクセスに重大な問題")
                print("🔍 技術的制約または認証情報の確認が必要")
            
            return summary["overall_success"]
            
        except Exception as e:
            print(f"❌ テスト実行エラー: {e}")
            return False

def main():
    """メイン実行"""
    test = FullHatosapoLoginTest()
    success = test.run_full_test()
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)