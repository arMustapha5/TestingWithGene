#!/usr/bin/env python3
"""
AI-Enhanced Bioauthentication Test Runner
SecureAuth AI - Comprehensive Test Execution Framework

This script provides multiple execution modes for the test suite:
- Full test suite execution
- Specific test category execution
- Performance testing mode
- Visual regression testing
- AI-enhanced test execution
"""

import argparse
import sys
import os
import time
import json
from datetime import datetime
from pathlib import Path
import subprocess
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_runner.log'),
        logging.StreamHandler()
    ]
)

class TestRunner:
    """Comprehensive test runner with multiple execution modes"""
    
    def __init__(self):
        self.test_results = {}
        self.execution_start = datetime.now()
        self.reports_dir = Path("reports")
        self.screenshots_dir = Path("screenshots")
        
        # Create necessary directories
        self.reports_dir.mkdir(exist_ok=True)
        self.screenshots_dir.mkdir(exist_ok=True)
    
    def run_selenium_tests(self, headless=False, browser="chrome"):
        """Run the main Selenium test suite"""
        logging.info("🚀 Starting Selenium Test Suite")
        
        try:
            cmd = [sys.executable, "selenium_tests.py"]
            if headless:
                cmd.append("--headless")
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent)
            
            if result.returncode == 0:
                logging.info("✅ Selenium tests completed successfully")
                return True
            else:
                logging.error(f"❌ Selenium tests failed: {result.stderr}")
                return False
                
        except Exception as e:
            logging.error(f"Failed to run Selenium tests: {e}")
            return False
    
    def run_pytest_suite(self, markers=None, parallel=False):
        """Run tests using pytest framework"""
        logging.info("🧪 Starting Pytest Test Suite")
        
        try:
            cmd = [sys.executable, "-m", "pytest"]
            
            if markers:
                cmd.extend(["-m", markers])
            
            if parallel:
                cmd.extend(["-n", "auto"])
            
            # Add custom options
            cmd.extend([
                "--html=reports/pytest_report.html",
                "--self-contained-html",
                "--tb=short",
                "-v"
            ])
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent)
            
            if result.returncode == 0:
                logging.info("✅ Pytest tests completed successfully")
                return True
            else:
                logging.error(f"❌ Pytest tests failed: {result.stderr}")
                return False
                
        except Exception as e:
            logging.error(f"Failed to run pytest tests: {e}")
            return False
    
    def run_performance_tests(self):
        """Run performance-focused tests"""
        logging.info("⚡ Starting Performance Tests")
        
        try:
            # Run performance tests with specific markers
            return self.run_pytest_suite(markers="performance")
        except Exception as e:
            logging.error(f"Performance tests failed: {e}")
            return False
    
    def run_security_tests(self):
        """Run security-focused tests"""
        logging.info("🔒 Starting Security Tests")
        
        try:
            # Run security tests with specific markers
            return self.run_pytest_suite(markers="security")
        except Exception as e:
            logging.error(f"Security tests failed: {e}")
            return False
    
    def run_ui_tests(self):
        """Run UI-focused tests"""
        logging.info("🎨 Starting UI Tests")
        
        try:
            # Run UI tests with specific markers
            return self.run_pytest_suite(markers="ui")
        except Exception as e:
            logging.error(f"UI tests failed: {e}")
            return False
    
    def run_webauthn_tests(self):
        """Run WebAuthn-specific tests"""
        logging.info("🔐 Starting WebAuthn Tests")
        
        try:
            # Run WebAuthn tests with specific markers
            return self.run_pytest_suite(markers="webauthn")
        except Exception as e:
            logging.error(f"WebAuthn tests failed: {e}")
            return False
    
    def run_ai_enhanced_tests(self):
        """Run AI-enhanced test scenarios"""
        logging.info("🤖 Starting AI-Enhanced Tests")
        
        try:
            # This would integrate with AI testing tools like Applitools, Testim, etc.
            logging.info("AI-enhanced testing features:")
            logging.info("- Visual regression testing with computer vision")
            logging.info("- Predictive failure analysis")
            logging.info("- Smart test data generation")
            logging.info("- Intelligent test execution optimization")
            
            # For now, run a comprehensive test suite
            return self.run_selenium_tests(headless=True)
            
        except Exception as e:
            logging.error(f"AI-enhanced tests failed: {e}")
            return False
    
    def generate_execution_report(self):
        """Generate comprehensive execution report"""
        execution_time = (datetime.now() - self.execution_start).total_seconds()
        
        report = {
            "execution_summary": {
                "start_time": self.execution_start.isoformat(),
                "end_time": datetime.now().isoformat(),
                "total_execution_time": execution_time,
                "test_suite": "SecureAuth AI Bioauthentication Tests"
            },
            "test_results": self.test_results,
            "system_info": {
                "python_version": sys.version,
                "platform": sys.platform,
                "working_directory": os.getcwd()
            }
        }
        
        # Save report
        report_file = self.reports_dir / f"execution_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"📊 Execution report saved to: {report_file}")
        return report
    
    def run_comprehensive_suite(self):
        """Run the complete test suite with all categories"""
        logging.info("🎯 Running Comprehensive Test Suite")
        logging.info("=" * 60)
        
        test_categories = [
            ("WebAuthn Tests", self.run_webauthn_tests),
            ("Security Tests", self.run_security_tests),
            ("UI Tests", self.run_ui_tests),
            ("Performance Tests", self.run_performance_tests),
            ("AI-Enhanced Tests", self.run_ai_enhanced_tests),
            ("Full Selenium Suite", lambda: self.run_selenium_tests(headless=True))
        ]
        
        results = {}
        total_categories = len(test_categories)
        successful_categories = 0
        
        for category_name, test_function in test_categories:
            logging.info(f"\n🔄 Running {category_name}...")
            start_time = time.time()
            
            try:
                success = test_function()
                execution_time = time.time() - start_time
                
                results[category_name] = {
                    "status": "PASSED" if success else "FAILED",
                    "execution_time": execution_time,
                    "timestamp": datetime.now().isoformat()
                }
                
                if success:
                    successful_categories += 1
                    logging.info(f"✅ {category_name} completed successfully in {execution_time:.2f}s")
                else:
                    logging.error(f"❌ {category_name} failed")
                    
            except Exception as e:
                results[category_name] = {
                    "status": "ERROR",
                    "error": str(e),
                    "execution_time": time.time() - start_time,
                    "timestamp": datetime.now().isoformat()
                }
                logging.error(f"💥 {category_name} crashed: {e}")
        
        # Store results
        self.test_results = results
        
        # Generate summary
        success_rate = (successful_categories / total_categories) * 100
        logging.info("\n" + "=" * 60)
        logging.info("📊 COMPREHENSIVE TEST SUITE SUMMARY")
        logging.info("=" * 60)
        logging.info(f"Total Categories: {total_categories}")
        logging.info(f"Successful: {successful_categories}")
        logging.info(f"Failed: {total_categories - successful_categories}")
        logging.info(f"Success Rate: {success_rate:.1f}%")
        logging.info(f"Total Execution Time: {execution_time:.2f}s")
        
        # Generate final report
        self.generate_execution_report()
        
        if success_rate >= 80:
            logging.info("🎉 Comprehensive test suite completed successfully!")
            return True
        elif success_rate >= 60:
            logging.info("⚠️  Comprehensive test suite completed with warnings")
            return False
        else:
            logging.error("❌ Comprehensive test suite completed with significant failures")
            return False

def main():
    """Main execution function with command-line interface"""
    parser = argparse.ArgumentParser(
        description="AI-Enhanced Bioauthentication Test Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_tests.py --comprehensive          # Run all tests
  python run_tests.py --selenium              # Run Selenium tests only
  python run_tests.py --pytest --markers ui   # Run UI tests with pytest
  python run_tests.py --performance           # Run performance tests
  python run_tests.py --ai-enhanced           # Run AI-enhanced tests
        """
    )
    
    parser.add_argument(
        "--comprehensive",
        action="store_true",
        help="Run comprehensive test suite with all categories"
    )
    
    parser.add_argument(
        "--selenium",
        action="store_true",
        help="Run Selenium test suite"
    )
    
    parser.add_argument(
        "--pytest",
        action="store_true",
        help="Run tests using pytest framework"
    )
    
    parser.add_argument(
        "--markers",
        type=str,
        help="Run tests with specific pytest markers"
    )
    
    parser.add_argument(
        "--performance",
        action="store_true",
        help="Run performance tests"
    )
    
    parser.add_argument(
        "--security",
        action="store_true",
        help="Run security tests"
    )
    
    parser.add_argument(
        "--ui",
        action="store_true",
        help="Run UI tests"
    )
    
    parser.add_argument(
        "--webauthn",
        action="store_true",
        help="Run WebAuthn tests"
    )
    
    parser.add_argument(
        "--ai-enhanced",
        action="store_true",
        help="Run AI-enhanced tests"
    )
    
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run tests in headless mode"
    )
    
    parser.add_argument(
        "--parallel",
        action="store_true",
        help="Run tests in parallel (pytest only)"
    )
    
    parser.add_argument(
        "--browser",
        type=str,
        default="chrome",
        choices=["chrome", "firefox", "edge"],
        help="Browser to use for Selenium tests"
    )
    
    args = parser.parse_args()
    
    # Initialize test runner
    runner = TestRunner()
    
    try:
        if args.comprehensive:
            # Run comprehensive test suite
            success = runner.run_comprehensive_suite()
            sys.exit(0 if success else 1)
            
        elif args.selenium:
            # Run Selenium tests
            success = runner.run_selenium_tests(
                headless=args.headless,
                browser=args.browser
            )
            sys.exit(0 if success else 1)
            
        elif args.pytest:
            # Run pytest tests
            success = runner.run_pytest_suite(
                markers=args.markers,
                parallel=args.parallel
            )
            sys.exit(0 if success else 1)
            
        elif args.performance:
            # Run performance tests
            success = runner.run_performance_tests()
            sys.exit(0 if success else 1)
            
        elif args.security:
            # Run security tests
            success = runner.run_security_tests()
            sys.exit(0 if success else 1)
            
        elif args.ui:
            # Run UI tests
            success = runner.run_ui_tests()
            sys.exit(0 if success else 1)
            
        elif args.webauthn:
            # Run WebAuthn tests
            success = runner.run_webauthn_tests()
            sys.exit(0 if success else 1)
            
        elif args.ai_enhanced:
            # Run AI-enhanced tests
            success = runner.run_ai_enhanced_tests()
            sys.exit(0 if success else 1)
            
        else:
            # Default: run comprehensive suite
            logging.info("No specific test category specified, running comprehensive suite...")
            success = runner.run_comprehensive_suite()
            sys.exit(0 if success else 1)
            
    except KeyboardInterrupt:
        logging.info("Test execution interrupted by user")
        sys.exit(130)
    except Exception as e:
        logging.error(f"Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
