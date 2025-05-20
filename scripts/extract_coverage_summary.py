import json
import os

def calculate_coverage(data):
    """
    coverage-final.jsonの各ファイルについて、
    statement, function, branchのカバレッジ率を計算し、
    低カバレッジ順にリストアップする。
    """
    coverage_summary = []

    for filepath, info in data.items():
        statements = info.get("s", {})
        functions = info.get("f", {})
        branches = info.get("b", {})

        total_statements = len(statements)
        covered_statements = sum(1 for count in statements.values() if count > 0)
        statement_coverage = covered_statements / total_statements if total_statements > 0 else 1.0

        total_functions = len(functions)
        covered_functions = sum(1 for count in functions.values() if count > 0)
        function_coverage = covered_functions / total_functions if total_functions > 0 else 1.0

        total_branches = sum(len(branch_list) for branch_list in branches.values())
        covered_branches = sum(sum(1 for count in branch_list if count > 0) for branch_list in branches.values())
        branch_coverage = covered_branches / total_branches if total_branches > 0 else 1.0

        coverage_summary.append({
            "file": filepath,
            "statement_coverage": statement_coverage,
            "function_coverage": function_coverage,
            "branch_coverage": branch_coverage,
        })

    # statement_coverageを基準に昇順ソート（低いものから）
    coverage_summary.sort(key=lambda x: x["statement_coverage"])

    return coverage_summary

def main():
    coverage_file = os.path.join("frontend", "coverage", "coverage-final.json")
    if not os.path.exists(coverage_file):
        print(f"Coverage file not found: {coverage_file}")
        return

    with open(coverage_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    summary = calculate_coverage(data)

    print("低カバレッジファイル一覧（statement coverage順）:")
    for item in summary:
        print(f"{item['file']}: statement {item['statement_coverage']:.2%}, "
              f"function {item['function_coverage']:.2%}, branch {item['branch_coverage']:.2%}")

if __name__ == "__main__":
    main()