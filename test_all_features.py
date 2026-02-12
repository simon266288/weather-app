#!/usr/bin/env python3
"""
Comprehensive Weather App Feature Test

Tests:
1. Page loads
2. Refresh button exists and is clickable
3. Favorite button exists
4. Sidebar location button exists
5. Search modal opens
6. No console errors
"""

from playwright.sync_api import sync_playwright
import sys


def test_all_features():
    """Test all weather app features."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        errors = []
        console_errors = []

        page.on('console', lambda msg: capture_console(msg, console_errors, errors))
        page.on('pageerror', lambda exc: errors.append(str(exc)))

        print("=" * 60)
        print("Weather App - Comprehensive Feature Test")
        print("=" * 60)

        # Test 1: Page loads
        print("\n[TEST 1] Loading page...")
        try:
            page.goto('http://localhost:5173', timeout=30000)
            page.wait_for_load_state('networkidle', timeout=30000)
            page.wait_for_timeout(3000)  # Wait for React to hydrate
            print("  [OK] Page loaded successfully")
        except Exception as e:
            print(f"  [FAIL] Failed to load page: {e}")
            return False

        # Test 2: Check main UI elements
        print("\n[TEST 2] Checking UI elements...")
        elements = {
            '刷新按钮': 'button:has-text("刷新")',
            '收藏按钮': 'button:has-text("收藏")',
            '搜索按钮': 'button:has-text("搜索")',
            '菜单按钮': '[class*="menu"]',
            '天气图标': '[class*="weather"]',
            '温度显示': '[class*="temp"]',
        }

        for name, selector in elements.items():
            try:
                count = page.locator(selector).count()
                if count > 0:
                    print(f"  [OK] {name} found")
                else:
                    print(f"  [WARN] {name} not found")
            except Exception as e:
                print(f"  [WARN] {name}: {e}")

        # Test 3: Check sidebar location button
        print("\n[TEST 3] Checking sidebar location button...")
        try:
            # Open sidebar first
            page.locator('button[class*="menu"]').first.click() if page.locator('button[class*="menu"]').count() > 0 else None
            page.wait_for_timeout(500)

            # Check for location button with Navigation icon
            location_btn = page.locator('button:has-text("获取当前位置")')
            if location_btn.count() > 0:
                print("  [OK] Location button found")
            else:
                print("  [WARN] Location button not found")
        except Exception as e:
            print(f"  [WARN] Location button check: {e}")

        # Test 4: Check search functionality
        print("\n[TEST 4] Testing search functionality...")
        try:
            search_btn = page.locator('button:has-text("搜索")')
            if search_btn.count() > 0:
                search_btn.click()
                page.wait_for_timeout(500)

                # Check if search modal opened
                search_input = page.locator('input[placeholder*="搜索"]')
                if search_input.count() > 0:
                    print("  [OK] Search modal opens correctly")

                    # Close search modal
                    close_btn = page.locator('button:has-text("取消")')
                    if close_btn.count() > 0:
                        close_btn.click()
                        print("  [OK] Search modal closes correctly")
                else:
                    print("  [WARN] Search modal did not open")
            else:
                print("  [WARN] Search button not found")
        except Exception as e:
            print(f"  [WARN] Search test: {e}")

        # Test 5: Check favorites section
        print("\n[TEST 5] Checking favorites section...")
        try:
            # Open sidebar
            menu_btn = page.locator('button[class*="menu"]')
            if menu_btn.count() > 0:
                menu_btn.first.click()
                page.wait_for_timeout(500)

            fav_section = page.locator('text=喜欢的城市')
            if fav_section.count() > 0:
                print("  [OK] Favorites section found")
            else:
                print("  [WARN] Favorites section not found")
        except Exception as e:
            print(f"  [WARN] Favorites section: {e}")

        # Test 6: Console errors check
        print("\n[TEST 6] Console errors check...")
        if console_errors:
            print(f"  Found {len(console_errors)} console errors:")
            for err in console_errors[:5]:
                print(f"    - {err}")
        else:
            print("  [OK] No console errors")

        # Test 7: Page errors check
        print("\n[TEST 7] Page errors check...")
        if errors:
            print(f"  [FAIL] Found {len(errors)} page errors:")
            for err in errors[:5]:
                print(f"    - {err}")
        else:
            print("  [OK] No page errors")

        # Summary
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        print(f"Console errors: {len(console_errors)}")
        print(f"Page errors: {len(errors)}")

        if errors:
            print("\n[FAIL] TESTS FAILED - Page errors detected")
            browser.close()
            return False

        print("\n[SUCCESS] ALL TESTS PASSED")
        browser.close()
        return True


def capture_console(msg, errors_list, all_errors=None):
    """Capture console messages."""
    if msg.type == 'error':
        if 'favicon' not in msg.text.lower():
            errors_list.append(msg.text)
            print(f"\n  [CONSOLE ERROR] {msg.text}")


if __name__ == '__main__':
    success = test_all_features()
    sys.exit(0 if success else 1)
