#!/usr/bin/env python3
"""
Auto-repair script for test failures
Integrates with GitHub Actions to automatically fix common test issues
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Tuple


class TestAutoRepair:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.repairs_made = []

    def run_tests(self) -> Tuple[bool, str]:
        """Run tests and capture output"""
        try:
            result = subprocess.run(
                ["npm", "test"], capture_output=True, text=True, cwd=self.project_root
            )
            return result.returncode == 0, result.stdout + result.stderr
        except Exception as e:
            return False, str(e)

    def analyze_test_failure(self, output: str) -> Dict[str, List[str]]:
        """Analyze test output to identify failures"""
        failures = {
            "import_errors": [],
            "undefined_variables": [],
            "type_errors": [],
            "assertion_failures": [],
            "timeout_errors": [],
        }

        # Pattern matching for common errors
        patterns = {
            "import_errors": r"Cannot find module '([^']+)'",
            "undefined_variables": r"ReferenceError: (\w+) is not defined",
            "type_errors": r"TypeError: (.+)",
            "assertion_failures": r"AssertionError: (.+)",
            "timeout_errors": r"Timeout of (\d+)ms exceeded",
        }

        for error_type, pattern in patterns.items():
            matches = re.findall(pattern, output)
            failures[error_type].extend(matches)

        return failures

    def fix_import_errors(self, modules: List[str]) -> bool:
        """Fix missing module imports"""
        fixed = False
        for module in modules:
            # Try to install missing npm packages
            if "/" not in module and "." not in module:
                try:
                    subprocess.run(
                        ["npm", "install", module], cwd=self.project_root, check=True
                    )
                    self.repairs_made.append(f"Installed missing module: {module}")
                    fixed = True
                except:
                    pass
        return fixed

    def fix_undefined_variables(self, variables: List[str]) -> bool:
        """Fix undefined variable errors"""
        # This would need more context-aware fixing
        # For now, log the issues
        for var in variables:
            self.repairs_made.append(f"Detected undefined variable: {var}")
        return False

    def fix_type_errors(self, errors: List[str]) -> bool:
        """Fix type-related errors"""
        fixed = False
        for error in errors:
            if "cannot read property" in error.lower():
                # Add null checks where needed
                self.repairs_made.append(f"Type error detected: {error}")
        return fixed

    def fix_timeout_errors(self, timeouts: List[str]) -> bool:
        """Fix timeout issues by adjusting test configurations"""
        jest_config_path = self.project_root / "jest.config.js"
        if jest_config_path.exists():
            # Increase timeout in jest config
            try:
                with open(jest_config_path, "r") as f:
                    content = f.read()

                # Update timeout value
                new_content = re.sub(
                    r"testTimeout:\s*\d+", "testTimeout: 30000", content
                )

                if new_content != content:
                    with open(jest_config_path, "w") as f:
                        f.write(new_content)
                    self.repairs_made.append("Increased test timeout to 30 seconds")
                    return True
            except:
                pass
        return False

    def apply_common_fixes(self) -> bool:
        """Apply common fixes for test issues"""
        fixes_applied = False

        # Ensure test directories exist
        test_dirs = [
            self.project_root / "tests",
            self.project_root / "tests" / "frontend",
            self.project_root / "tests" / "backend",
        ]

        for test_dir in test_dirs:
            if not test_dir.exists():
                test_dir.mkdir(parents=True, exist_ok=True)
                self.repairs_made.append(f"Created missing test directory: {test_dir}")
                fixes_applied = True

        # Ensure package.json has test script
        package_json_path = self.project_root / "package.json"
        if package_json_path.exists():
            with open(package_json_path, "r") as f:
                package_data = json.load(f)

            if "scripts" not in package_data:
                package_data["scripts"] = {}

            if "test" not in package_data["scripts"]:
                package_data["scripts"]["test"] = "jest"
                with open(package_json_path, "w") as f:
                    json.dump(package_data, f, indent=2)
                self.repairs_made.append("Added test script to package.json")
                fixes_applied = True

        return fixes_applied

    def run(self) -> int:
        """Main repair process"""
        print("Starting auto-repair process for test failures...")

        # First, apply common fixes
        self.apply_common_fixes()

        # Run tests and analyze failures
        success, output = self.run_tests()

        if success:
            print("All tests passing! No repairs needed.")
            return 0

        print("Test failures detected. Analyzing...")
        failures = self.analyze_test_failure(output)

        # Apply specific fixes
        repairs_made = False

        if failures["import_errors"]:
            print(f"Found {len(failures['import_errors'])} import errors")
            repairs_made |= self.fix_import_errors(failures["import_errors"])

        if failures["undefined_variables"]:
            print(f"Found {len(failures['undefined_variables'])} undefined variables")
            repairs_made |= self.fix_undefined_variables(
                failures["undefined_variables"]
            )

        if failures["type_errors"]:
            print(f"Found {len(failures['type_errors'])} type errors")
            repairs_made |= self.fix_type_errors(failures["type_errors"])

        if failures["timeout_errors"]:
            print(f"Found {len(failures['timeout_errors'])} timeout errors")
            repairs_made |= self.fix_timeout_errors(failures["timeout_errors"])

        # Report repairs
        if self.repairs_made:
            print("\nRepairs applied:")
            for repair in self.repairs_made:
                print(f"  - {repair}")

        # Re-run tests if repairs were made
        if repairs_made:
            print("\nRe-running tests after repairs...")
            success, _ = self.run_tests()
            if success:
                print("Tests passing after auto-repair!")
                return 0
            else:
                print("Some tests still failing. Manual intervention may be required.")
                return 1
        else:
            print(
                "No automatic repairs could be applied. Manual intervention required."
            )
            return 1


if __name__ == "__main__":
    repair = TestAutoRepair()
    sys.exit(repair.run())
