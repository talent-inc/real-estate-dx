"""
ハトサポBB RPA接続テスト
Selenium WebDriverを使用した自動ログイン・データ取得検証
"""

import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# 設定読み込み
from config import (
    HATOSAPO_LOGIN_URL, HATOSAPO_USER_ID, HATOSAPO_PASSWORD,
    WEBDRIVER_TIMEOUT, PAGE_LOAD_TIMEOUT, IMPLICIT_WAIT,
    CHROME_OPTIONS, HEADLESS_MODE,
    LOGIN_WAIT_TIME, FORM_WAIT_TIME, SEARCH_WAIT_TIME,
    MAX_RETRY_COUNT, REQUEST_INTERVAL
)

class HatosapoRPATest:
    def __init__(self):
        self.driver = None
        self.test_results = {
            "start_time": datetime.now().isoformat(),
            "tests": [],
            "summary": {}
        }
    
    def setup_driver(self):
        """Chrome WebDriverの初期化"""
        try:
            print("=== Chrome WebDriverの初期化 ===")
            
            # Chrome オプション設定
            chrome_options = Options()
            
            if HEADLESS_MODE:
                chrome_options.add_argument("--headless")
                print("ヘッドレスモードで実行")
            else:
                print("ブラウザ表示モードで実行")
            
            for option in CHROME_OPTIONS:
                chrome_options.add_argument(option)
            
            # WebDriverの初期化
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # タイムアウト設定
            self.driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
            self.driver.implicitly_wait(IMPLICIT_WAIT)
            
            print("✅ Chrome WebDriver初期化成功")
            return True
            
        except Exception as e:
            print(f"❌ Chrome WebDriver初期化失敗: {e}")
            return False
    
    def test_login_process(self):
        """ログインプロセスのテスト"""
        test_result = {
            "test_name": "ログインプロセス",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("\\n=== ハトサポBB ログインテスト ===")
            
            # ログインページへアクセス
            print(f"ログインページアクセス: {HATOSAPO_LOGIN_URL}")
            self.driver.get(HATOSAPO_LOGIN_URL)
            time.sleep(LOGIN_WAIT_TIME)
            
            # ページタイトル確認
            page_title = self.driver.title
            print(f"ページタイトル: {page_title}")
            test_result["details"]["page_title"] = page_title
            
            # ログインフォームの要素確認
            print("ログインフォーム要素の検索...")
            
            # ユーザーID入力フィールド
            try:
                user_id_field = WebDriverWait(self.driver, WEBDRIVER_TIMEOUT).until(
                    EC.presence_of_element_located((By.NAME, "userId"))
                )
                print("✅ ユーザーID入力フィールド発見")
                test_result["details"]["user_id_field_found"] = True
            except TimeoutException:
                # 代替セレクタで試行
                try:
                    user_id_field = self.driver.find_element(By.ID, "userId")
                    print("✅ ユーザーID入力フィールド発見（ID属性）")
                    test_result["details"]["user_id_field_found"] = True
                except NoSuchElementException:
                    print("❌ ユーザーID入力フィールドが見つからない")
                    test_result["details"]["user_id_field_found"] = False
                    test_result["errors"].append("ユーザーID入力フィールドが見つからない")
                    return test_result
            
            # パスワード入力フィールド
            try:
                password_field = WebDriverWait(self.driver, WEBDRIVER_TIMEOUT).until(
                    EC.presence_of_element_located((By.NAME, "password"))
                )
                print("✅ パスワード入力フィールド発見")
                test_result["details"]["password_field_found"] = True
            except TimeoutException:
                try:
                    password_field = self.driver.find_element(By.ID, "password")
                    print("✅ パスワード入力フィールド発見（ID属性）")
                    test_result["details"]["password_field_found"] = True
                except NoSuchElementException:
                    print("❌ パスワード入力フィールドが見つからない")
                    test_result["details"]["password_field_found"] = False
                    test_result["errors"].append("パスワード入力フィールドが見つからない")
                    return test_result
            
            # ログインボタン
            try:
                login_button = WebDriverWait(self.driver, WEBDRIVER_TIMEOUT).until(
                    EC.element_to_be_clickable((By.XPATH, "//input[@type='submit' or @type='button'][@value='ログイン' or contains(@value, 'ログイン')]"))
                )
                print("✅ ログインボタン発見")
                test_result["details"]["login_button_found"] = True
            except TimeoutException:
                try:
                    login_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'ログイン')]")
                    print("✅ ログインボタン発見（button要素）")
                    test_result["details"]["login_button_found"] = True
                except NoSuchElementException:
                    print("❌ ログインボタンが見つからない")
                    test_result["details"]["login_button_found"] = False
                    test_result["errors"].append("ログインボタンが見つからない")
                    return test_result
            
            # 認証情報の入力
            print("認証情報の入力...")
            user_id_field.clear()
            user_id_field.send_keys(HATOSAPO_USER_ID)
            print(f"ユーザーID入力: {HATOSAPO_USER_ID}")
            
            password_field.clear()
            password_field.send_keys(HATOSAPO_PASSWORD)
            print("パスワード入力: [MASKED]")
            
            time.sleep(FORM_WAIT_TIME)
            
            # CAPTCHA等のセキュリティ機能確認
            try:
                captcha_element = self.driver.find_element(By.XPATH, "//*[contains(@class, 'captcha') or contains(@id, 'captcha')]")
                print("⚠️ CAPTCHA機能を検出")
                test_result["details"]["captcha_detected"] = True
                test_result["errors"].append("CAPTCHA機能が有効 - 手動対応が必要")
            except NoSuchElementException:
                print("✅ CAPTCHA機能は検出されず")
                test_result["details"]["captcha_detected"] = False
            
            # ログイン実行
            print("ログインボタンクリック...")
            login_button.click()
            time.sleep(SEARCH_WAIT_TIME)
            
            # ログイン結果の確認
            current_url = self.driver.current_url
            print(f"ログイン後URL: {current_url}")
            test_result["details"]["post_login_url"] = current_url
            
            # ログイン成功の判定
            if "member.zentaku.or.jp" in current_url or "dashboard" in current_url.lower():
                print("✅ ログイン成功（URLの変化により判定）")
                test_result["success"] = True
                test_result["details"]["login_success"] = True
            else:
                # エラーメッセージの確認
                try:
                    error_elements = self.driver.find_elements(By.XPATH, "//*[contains(@class, 'error') or contains(@class, 'alert') or contains(text(), 'エラー')]")
                    if error_elements:
                        error_messages = [elem.text for elem in error_elements if elem.text.strip()]
                        print(f"❌ ログインエラー: {error_messages}")
                        test_result["details"]["error_messages"] = error_messages
                        test_result["errors"].extend(error_messages)
                    else:
                        print("⚠️ ログイン状態が不明（エラーメッセージなし）")
                        test_result["details"]["login_success"] = False
                except Exception as e:
                    print(f"エラーメッセージ取得時の例外: {e}")
            
            # ページソースの一部を保存（デバッグ用）
            page_source_preview = self.driver.page_source[:1000] + "..." if len(self.driver.page_source) > 1000 else self.driver.page_source
            test_result["details"]["page_source_preview"] = page_source_preview
            
        except Exception as e:
            print(f"❌ ログインテスト実行エラー: {e}")
            test_result["errors"].append(f"実行エラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def test_navigation_and_structure(self):
        """サイト構造とナビゲーションの調査"""
        test_result = {
            "test_name": "サイト構造調査",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("\\n=== サイト構造とナビゲーション調査 ===")
            
            # 現在のページ情報取得
            current_url = self.driver.current_url
            page_title = self.driver.title
            print(f"現在のURL: {current_url}")
            print(f"ページタイトル: {page_title}")
            
            test_result["details"]["current_url"] = current_url
            test_result["details"]["page_title"] = page_title
            
            # メニューやナビゲーション要素の確認
            navigation_elements = []
            
            # 一般的なナビゲーション要素を検索
            nav_selectors = [
                "nav",
                ".navigation",
                ".menu",
                ".navbar",
                "#navigation",
                "#menu",
                "ul.nav"
            ]
            
            for selector in nav_selectors:
                try:
                    if selector.startswith('.') or selector.startswith('#'):
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    else:
                        elements = self.driver.find_elements(By.TAG_NAME, selector)
                    
                    if elements:
                        for elem in elements:
                            if elem.text.strip():
                                navigation_elements.append({
                                    "selector": selector,
                                    "text": elem.text.strip()[:200]  # 最初の200文字
                                })
                except Exception as e:
                    continue
            
            if navigation_elements:
                print(f"✅ ナビゲーション要素を発見: {len(navigation_elements)}個")
                test_result["details"]["navigation_elements"] = navigation_elements
                
                # 物件検索関連のリンクを探す
                search_related_links = []
                for nav in navigation_elements:
                    nav_text = nav["text"].lower()
                    if any(keyword in nav_text for keyword in ["物件", "検索", "search", "物件検索", "情報"]):
                        search_related_links.append(nav)
                
                if search_related_links:
                    print(f"✅ 物件検索関連リンク発見: {len(search_related_links)}個")
                    test_result["details"]["search_related_links"] = search_related_links
            else:
                print("⚠️ ナビゲーション要素が見つからない")
            
            # リンク要素の調査
            all_links = self.driver.find_elements(By.TAG_NAME, "a")
            link_info = []
            
            for link in all_links[:20]:  # 最初の20個のリンクを調査
                try:
                    href = link.get_attribute("href")
                    text = link.text.strip()
                    if href and text:
                        link_info.append({
                            "href": href,
                            "text": text
                        })
                except Exception:
                    continue
            
            print(f"主要リンク情報: {len(link_info)}個")
            test_result["details"]["main_links"] = link_info
            
            # フォーム要素の確認
            forms = self.driver.find_elements(By.TAG_NAME, "form")
            form_info = []
            
            for form in forms:
                try:
                    action = form.get_attribute("action")
                    method = form.get_attribute("method")
                    inputs = form.find_elements(By.TAG_NAME, "input")
                    
                    input_info = []
                    for input_elem in inputs:
                        input_type = input_elem.get_attribute("type")
                        input_name = input_elem.get_attribute("name")
                        input_placeholder = input_elem.get_attribute("placeholder")
                        
                        input_info.append({
                            "type": input_type,
                            "name": input_name,
                            "placeholder": input_placeholder
                        })
                    
                    form_info.append({
                        "action": action,
                        "method": method,
                        "inputs": input_info
                    })
                except Exception:
                    continue
            
            if form_info:
                print(f"✅ フォーム要素発見: {len(form_info)}個")
                test_result["details"]["forms"] = form_info
            
            test_result["success"] = True
            
        except Exception as e:
            print(f"❌ サイト構造調査エラー: {e}")
            test_result["errors"].append(f"調査エラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def test_property_search_capability(self):
        """物件検索機能の調査"""
        test_result = {
            "test_name": "物件検索機能調査",
            "start_time": datetime.now().isoformat(),
            "success": False,
            "details": {},
            "errors": []
        }
        
        try:
            print("\\n=== 物件検索機能調査 ===")
            
            # 検索フォームの探索
            search_forms = []
            
            # 検索関連のキーワードでフォームを探索
            search_keywords = ["検索", "search", "物件", "Search"]
            
            for keyword in search_keywords:
                try:
                    # テキストに検索キーワードを含む要素を探す
                    elements = self.driver.find_elements(By.XPATH, f"//*[contains(text(), '{keyword}')]")
                    for element in elements:
                        # 親要素にフォームがあるかチェック
                        try:
                            parent_form = element.find_element(By.XPATH, "./ancestor::form")
                            if parent_form:
                                form_action = parent_form.get_attribute("action")
                                search_forms.append({
                                    "keyword": keyword,
                                    "element_text": element.text[:100],
                                    "form_action": form_action
                                })
                        except NoSuchElementException:
                            continue
                except Exception:
                    continue
            
            if search_forms:
                print(f"✅ 検索フォーム候補発見: {len(search_forms)}個")
                test_result["details"]["search_forms"] = search_forms
            else:
                print("⚠️ 検索フォームが見つからない")
            
            # 検索入力フィールドの探索
            search_input_fields = []
            
            # 一般的な検索入力フィールドの属性で探索
            search_input_selectors = [
                "input[name*='search']",
                "input[name*='Search']",
                "input[id*='search']",
                "input[placeholder*='検索']",
                "input[placeholder*='search']",
                "input[type='search']"
            ]
            
            for selector in search_input_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        search_input_fields.append({
                            "selector": selector,
                            "name": element.get_attribute("name"),
                            "id": element.get_attribute("id"),
                            "placeholder": element.get_attribute("placeholder"),
                            "type": element.get_attribute("type")
                        })
                except Exception:
                    continue
            
            if search_input_fields:
                print(f"✅ 検索入力フィールド発見: {len(search_input_fields)}個")
                test_result["details"]["search_input_fields"] = search_input_fields
            
            # 検索ボタンの探索
            search_buttons = []
            
            search_button_selectors = [
                "input[type='submit'][value*='検索']",
                "input[type='submit'][value*='Search']",
                "button[type='submit']:contains('検索')",
                "input[type='button'][value*='検索']"
            ]
            
            for selector in search_button_selectors:
                try:
                    if ":contains(" in selector:
                        # XPath に変換
                        xpath_selector = f"//button[contains(text(), '検索')]"
                        elements = self.driver.find_elements(By.XPATH, xpath_selector)
                    else:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    
                    for element in elements:
                        search_buttons.append({
                            "selector": selector,
                            "tag": element.tag_name,
                            "type": element.get_attribute("type"),
                            "value": element.get_attribute("value"),
                            "text": element.text
                        })
                except Exception:
                    continue
            
            if search_buttons:
                print(f"✅ 検索ボタン発見: {len(search_buttons)}個")
                test_result["details"]["search_buttons"] = search_buttons
            
            # 物件情報表示エリアの確認
            data_display_areas = []
            
            # テーブルやリスト形式のデータ表示エリアを探索
            display_selectors = [
                "table",
                ".data-table",
                ".result-list",
                ".property-list",
                ".search-result",
                "ul.list",
                "div.result"
            ]
            
            for selector in display_selectors:
                try:
                    if selector.startswith('.'):
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    else:
                        elements = self.driver.find_elements(By.TAG_NAME, selector)
                    
                    for element in elements:
                        if element.text.strip():
                            data_display_areas.append({
                                "selector": selector,
                                "tag": element.tag_name,
                                "text_preview": element.text[:200]
                            })
                except Exception:
                    continue
            
            if data_display_areas:
                print(f"✅ データ表示エリア発見: {len(data_display_areas)}個")
                test_result["details"]["data_display_areas"] = data_display_areas
            
            # 全体的な評価
            if search_forms or search_input_fields or search_buttons:
                print("✅ 物件検索機能の要素が確認できました")
                test_result["success"] = True
                test_result["details"]["search_capability"] = True
            else:
                print("❌ 物件検索機能の要素が見つかりません")
                test_result["details"]["search_capability"] = False
                test_result["errors"].append("検索機能の主要要素が見つからない")
            
        except Exception as e:
            print(f"❌ 物件検索機能調査エラー: {e}")
            test_result["errors"].append(f"調査エラー: {str(e)}")
        
        test_result["end_time"] = datetime.now().isoformat()
        self.test_results["tests"].append(test_result)
        return test_result
    
    def save_test_results(self):
        """テスト結果の保存"""
        try:
            self.test_results["end_time"] = datetime.now().isoformat()
            
            # サマリー生成
            total_tests = len(self.test_results["tests"])
            successful_tests = sum(1 for test in self.test_results["tests"] if test["success"])
            
            self.test_results["summary"] = {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "success_rate": f"{(successful_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
                "overall_success": successful_tests == total_tests
            }
            
            # ファイル保存
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"/mnt/c/Users/mtsid/OneDrive/ドキュメント/TALENT/AIDX/不動産売買システム/poc_tests/hatosapo_rpa_validation/test_results_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, ensure_ascii=False, indent=2)
            
            print(f"\\n✅ テスト結果保存: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ テスト結果保存エラー: {e}")
            return None
    
    def cleanup(self):
        """リソースのクリーンアップ"""
        if self.driver:
            try:
                self.driver.quit()
                print("✅ WebDriverクリーンアップ完了")
            except Exception as e:
                print(f"⚠️ WebDriverクリーンアップエラー: {e}")
    
    def run_all_tests(self):
        """全テストの実行"""
        try:
            print("ハトサポBB RPA接続技術検証開始")
            print("=" * 60)
            
            # WebDriver初期化
            if not self.setup_driver():
                print("❌ WebDriver初期化失敗 - テスト中止")
                return False
            
            # テスト実行
            login_result = self.test_login_process()
            structure_result = self.test_navigation_and_structure()
            search_result = self.test_property_search_capability()
            
            # 結果保存
            result_file = self.save_test_results()
            
            # 結果サマリー表示
            print("\\n" + "=" * 60)
            print("ハトサポBB RPA技術検証結果")
            print("=" * 60)
            
            for test in self.test_results["tests"]:
                status = "✅ 成功" if test["success"] else "❌ 失敗"
                print(f"{test['test_name']}: {status}")
                
                if test["errors"]:
                    for error in test["errors"]:
                        print(f"  エラー: {error}")
            
            summary = self.test_results["summary"]
            print(f"\\n総合結果: {summary['successful_tests']}/{summary['total_tests']} ({summary['success_rate']})")
            
            if summary["overall_success"]:
                print("\\n🎉 ハトサポBB RPAは技術的に実現可能です")
            else:
                print("\\n⚠️ 一部のRPA機能に制約があります")
            
            return summary["overall_success"]
            
        except Exception as e:
            print(f"❌ テスト実行エラー: {e}")
            return False
        finally:
            self.cleanup()

def main():
    """メイン実行関数"""
    rpa_test = HatosapoRPATest()
    success = rpa_test.run_all_tests()
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)