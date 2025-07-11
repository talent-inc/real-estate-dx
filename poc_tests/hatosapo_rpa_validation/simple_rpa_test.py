"""
ハトサポBB RPA接続テスト（簡易版）
標準ライブラリのみを使用した基本的な接続テスト
"""

import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
import json
import time
import re
from datetime import datetime

class SimpleHatosapoTest:
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
            
            # HTMLの基本解析
            if "<form" in html_content.lower():
                print("✅ ログインフォームを検出")
                test_result["details"]["login_form_detected"] = True
                
                # フォーム要素の検索
                form_match = re.search(r'<form[^>]*action="([^"]*)"[^>]*>(.*?)</form>', html_content, re.DOTALL | re.IGNORECASE)
                if form_match:
                    form_action = form_match.group(1)
                    form_content = form_match.group(2)
                    
                    print(f"フォームアクション: {form_action}")
                    test_result["details"]["form_action"] = form_action
                    
                    # 入力フィールドの検索
                    input_patterns = [
                        (r'<input[^>]*name=["\']?([^"\'>\s]+)["\']?[^>]*>', "input_fields"),
                        (r'<input[^>]*type=["\']?password["\']?[^>]*>', "password_fields"),
                        (r'<input[^>]*type=["\']?submit["\']?[^>]*>', "submit_buttons")
                    ]
                    
                    for pattern, field_type in input_patterns:
                        matches = re.findall(pattern, form_content, re.IGNORECASE)
                        if matches:
                            print(f"{field_type}: {len(matches)}個発見")
                            test_result["details"][field_type] = len(matches)
            
            # タイトル抽出
            title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE)
            if title_match:
                page_title = title_match.group(1).strip()
                print(f"ページタイトル: {page_title}")
                test_result["details"]["page_title"] = page_title
            
            # CAPTCHA検知
            captcha_keywords = ["captcha", "recaptcha", "認証", "画像認証"]
            captcha_detected = any(keyword in html_content.lower() for keyword in captcha_keywords)
            if captcha_detected:
                print("⚠️ CAPTCHA機能を検出")
                test_result["details"]["captcha_detected"] = True
                test_result["errors"].append("CAPTCHA機能が有効")
            else:
                print("✅ CAPTCHA機能は検出されず")
                test_result["details"]["captcha_detected"] = False
            
            # JavaScriptの確認
            if "<script" in html_content.lower():
                script_count = html_content.lower().count("<script")
                print(f"JavaScriptファイル: {script_count}個")
                test_result["details"]["javascript_count"] = script_count
                
                if script_count > 10:
                    print("⚠️ 多数のJavaScriptが使用されています（RPA複雑化の可能性）")
                    test_result["errors"].append("JavaScript多用によるRPA複雑化")
            
            # HTMLコンテンツの一部保存
            test_result["details"]["html_preview"] = html_content[:2000]
            
            test_result["success"] = True
            
        except urllib.error.HTTPError as e:
            print(f"❌ HTTP エラー: {e.code} - {e.reason}")
            test_result["errors"].append(f"HTTP エラー: {e.code}")
        except urllib.error.URLError as e:
            print(f"❌ URL エラー: {e.reason}")
            test_result["errors"].append(f"URL エラー: {e.reason}")
        except Exception as e:
            print(f"❌ 予期しないエラー: {e}")
            test_result["errors"].append(f"予期しないエラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def test_login_form_analysis(self):
        """ログインフォーム詳細解析"""
        test_result = {
            "test_name": "ログインフォーム解析",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("\\n=== ログインフォーム詳細解析 ===")
            
            request = urllib.request.Request(self.login_url)
            response = self.opener.open(request, timeout=30)
            html_content = response.read().decode('utf-8', errors='ignore')
            
            # より詳細なフォーム解析
            form_patterns = [
                (r'<form[^>]*>', "form_tag"),
                (r'<input[^>]*name=["\']?([^"\'>\s]+)["\']?[^>]*type=["\']?([^"\'>\s]+)["\']?[^>]*>', "input_name_type"),
                (r'<input[^>]*type=["\']?([^"\'>\s]+)["\']?[^>]*name=["\']?([^"\'>\s]+)["\']?[^>]*>', "input_type_name"),
                (r'<input[^>]*id=["\']?([^"\'>\s]+)["\']?[^>]*>', "input_ids")
            ]
            
            form_elements = {}
            
            for pattern, element_type in form_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                if matches:
                    form_elements[element_type] = matches
                    print(f"{element_type}: {len(matches)}個")
            
            test_result["details"]["form_elements"] = form_elements
            
            # 特定のフィールド探索
            user_id_candidates = []
            password_candidates = []
            submit_candidates = []
            
            # ユーザーIDフィールド候補
            userid_patterns = [
                r'<input[^>]*name=["\']?([^"\'>\s]*(?:user|id|login|account)[^"\'>\s]*)["\']?[^>]*>',
                r'<input[^>]*id=["\']?([^"\'>\s]*(?:user|id|login|account)[^"\'>\s]*)["\']?[^>]*>'
            ]
            
            for pattern in userid_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                user_id_candidates.extend(matches)
            
            # パスワードフィールド候補
            password_patterns = [
                r'<input[^>]*type=["\']?password["\']?[^>]*name=["\']?([^"\'>\s]+)["\']?[^>]*>',
                r'<input[^>]*name=["\']?([^"\'>\s]*password[^"\'>\s]*)["\']?[^>]*type=["\']?password["\']?[^>]*>'
            ]
            
            for pattern in password_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                password_candidates.extend(matches)
            
            # 送信ボタン候補
            submit_patterns = [
                r'<input[^>]*type=["\']?submit["\']?[^>]*value=["\']?([^"\'>\s]+)["\']?[^>]*>',
                r'<button[^>]*type=["\']?submit["\']?[^>]*>([^<]+)</button>'
            ]
            
            for pattern in submit_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                submit_candidates.extend(matches)
            
            print(f"ユーザーIDフィールド候補: {user_id_candidates}")
            print(f"パスワードフィールド候補: {password_candidates}")
            print(f"送信ボタン候補: {submit_candidates}")
            
            test_result["details"]["user_id_candidates"] = user_id_candidates
            test_result["details"]["password_candidates"] = password_candidates
            test_result["details"]["submit_candidates"] = submit_candidates
            
            # フォームアクションURL抽出
            action_match = re.search(r'<form[^>]*action=["\']?([^"\'>\s]+)["\']?[^>]*>', html_content, re.IGNORECASE)
            if action_match:
                form_action = action_match.group(1)
                print(f"フォームアクションURL: {form_action}")
                test_result["details"]["form_action_url"] = form_action
            
            # CSRF トークン探索
            csrf_patterns = [
                r'<input[^>]*name=["\']?([^"\'>\s]*(?:csrf|token|_token)[^"\'>\s]*)["\']?[^>]*value=["\']?([^"\'>\s]+)["\']?[^>]*>',
                r'<meta[^>]*name=["\']?([^"\'>\s]*(?:csrf|token)[^"\'>\s]*)["\']?[^>]*content=["\']?([^"\'>\s]+)["\']?[^>]*>'
            ]
            
            csrf_tokens = []
            for pattern in csrf_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                csrf_tokens.extend(matches)
            
            if csrf_tokens:
                print(f"CSRF トークン候補: {len(csrf_tokens)}個")
                test_result["details"]["csrf_tokens"] = csrf_tokens
                test_result["errors"].append("CSRF保護が有効 - トークン処理が必要")
            
            test_result["success"] = True
            
        except Exception as e:
            print(f"❌ フォーム解析エラー: {e}")
            test_result["errors"].append(f"解析エラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def test_login_attempt(self):
        """ログイン試行テスト"""
        test_result = {
            "test_name": "ログイン試行",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("\\n=== ログイン試行テスト ===")
            
            # まず初期ページを取得
            request = urllib.request.Request(self.login_url)
            response = self.opener.open(request, timeout=30)
            html_content = response.read().decode('utf-8', errors='ignore')
            
            # フォームアクションURLを取得
            action_match = re.search(r'<form[^>]*action=["\']?([^"\'>\s]+)["\']?[^>]*>', html_content, re.IGNORECASE)
            if not action_match:
                test_result["errors"].append("フォームアクションURLが見つからない")
                return test_result
            
            form_action = action_match.group(1)
            if form_action.startswith('/'):
                # 相対パスの場合、絶対パスに変換
                from urllib.parse import urljoin
                form_action_url = urljoin(self.login_url, form_action)
            else:
                form_action_url = form_action
            
            print(f"ログイン先URL: {form_action_url}")
            test_result["details"]["login_url"] = form_action_url
            
            # ログインデータの準備
            login_data = {
                'userId': self.user_id,
                'password': self.password
            }
            
            # CSRF トークンがある場合は取得
            csrf_match = re.search(r'<input[^>]*name=["\']?([^"\'>\s]*(?:csrf|token|_token)[^"\'>\s]*)["\']?[^>]*value=["\']?([^"\'>\s]+)["\']?[^>]*>', html_content, re.IGNORECASE)
            if csrf_match:
                csrf_name = csrf_match.group(1)
                csrf_value = csrf_match.group(2)
                login_data[csrf_name] = csrf_value
                print(f"CSRF トークン追加: {csrf_name}")
                test_result["details"]["csrf_token_used"] = True
            
            # ログインデータをURLエンコード
            post_data = urllib.parse.urlencode(login_data).encode('utf-8')
            
            # ログインリクエスト実行
            print("ログイン実行中...")
            print(f"送信データ: userId={self.user_id}, password=[MASKED]")
            
            login_request = urllib.request.Request(form_action_url, data=post_data)
            login_request.add_header('Content-Type', 'application/x-www-form-urlencoded')
            login_request.add_header('Referer', self.login_url)
            
            login_response = self.opener.open(login_request, timeout=30)
            login_html = login_response.read().decode('utf-8', errors='ignore')
            
            # ログイン結果の解析
            final_url = login_response.geturl()
            print(f"ログイン後URL: {final_url}")
            test_result["details"]["post_login_url"] = final_url
            
            # ログイン成功の判定
            success_indicators = [
                "member.zentaku.or.jp" in final_url,
                "dashboard" in final_url.lower(),
                "member" in final_url.lower(),
                "menu" in final_url.lower()
            ]
            
            error_indicators = [
                "ログインに失敗" in login_html,
                "パスワードが正しくありません" in login_html,
                "ユーザーIDが正しくありません" in login_html,
                "error" in login_html.lower(),
                "認証に失敗" in login_html
            ]
            
            if any(success_indicators):
                print("✅ ログイン成功（URL変化により判定）")
                test_result["success"] = True
                test_result["details"]["login_success"] = True
                
                # ログイン後のページ内容解析
                if "会員" in login_html or "メニュー" in login_html or "menu" in login_html.lower():
                    print("✅ 会員メニュー画面を確認")
                    test_result["details"]["member_menu_detected"] = True
            
            elif any(error_indicators):
                print("❌ ログイン失敗（エラーメッセージ検出）")
                test_result["details"]["login_success"] = False
                
                # エラーメッセージ抽出
                error_patterns = [
                    r'<div[^>]*class=["\']?[^"\']*error[^"\']*["\']?[^>]*>([^<]+)</div>',
                    r'<span[^>]*class=["\']?[^"\']*error[^"\']*["\']?[^>]*>([^<]+)</span>',
                    r'<p[^>]*class=["\']?[^"\']*error[^"\']*["\']?[^>]*>([^<]+)</p>'
                ]
                
                error_messages = []
                for pattern in error_patterns:
                    matches = re.findall(pattern, login_html, re.IGNORECASE)
                    error_messages.extend(matches)
                
                if error_messages:
                    print(f"エラーメッセージ: {error_messages}")
                    test_result["details"]["error_messages"] = error_messages
                    test_result["errors"].extend(error_messages)
            
            else:
                print("⚠️ ログイン結果が不明")
                test_result["details"]["login_success"] = None
                test_result["errors"].append("ログイン結果の判定ができない")
            
            # レスポンス詳細
            test_result["details"]["response_code"] = login_response.getcode()
            test_result["details"]["content_length"] = len(login_html)
            test_result["details"]["html_preview"] = login_html[:1000]
            
        except urllib.error.HTTPError as e:
            print(f"❌ ログインHTTPエラー: {e.code}")
            test_result["errors"].append(f"HTTPエラー: {e.code}")
        except Exception as e:
            print(f"❌ ログイン試行エラー: {e}")
            test_result["errors"].append(f"試行エラー: {str(e)}")
        
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
                "overall_success": successful_tests >= (total_tests * 0.6)  # 60%以上で成功とみなす
            }
            
            # ファイル保存
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"/mnt/c/Users/mtsid/OneDrive/ドキュメント/TALENT/AIDX/不動産売買システム/poc_tests/hatosapo_rpa_validation/simple_test_results_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, ensure_ascii=False, indent=2)
            
            print(f"\\n✅ テスト結果保存: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ 結果保存エラー: {e}")
            return None
    
    def run_all_tests(self):
        """全テスト実行"""
        try:
            print("ハトサポBB RPA接続技術検証（簡易版）")
            print("=" * 60)
            
            # テスト実行
            access_result = self.test_initial_access()
            form_result = self.test_login_form_analysis()
            login_result = self.test_login_attempt()
            
            # 結果保存
            result_file = self.save_results()
            
            # 結果表示
            print("\\n" + "=" * 60)
            print("ハトサポBB RPA技術検証結果（簡易版）")
            print("=" * 60)
            
            for test in self.test_results["tests"]:
                status = "✅ 成功" if test["success"] else "❌ 失敗"
                print(f"{test['test_name']}: {status}")
                
                if test["errors"]:
                    for error in test["errors"]:
                        print(f"  ⚠️ {error}")
            
            summary = self.test_results["summary"]
            print(f"\\n総合結果: {summary['successful_tests']}/{summary['total_tests']} ({summary['success_rate']})")
            
            if summary["overall_success"]:
                print("\\n🎉 ハトサポBB RPA接続は技術的に実現可能性が高い")
                print("詳細な検証には Selenium/Playwright による実装が必要")
            else:
                print("\\n⚠️ ハトサポBB RPA接続に技術的課題あり")
                print("認証機能やセキュリティ対策の詳細調査が必要")
            
            return summary["overall_success"]
            
        except Exception as e:
            print(f"❌ テスト実行エラー: {e}")
            return False

def main():
    """メイン実行"""
    test = SimpleHatosapoTest()
    success = test.run_all_tests()
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)