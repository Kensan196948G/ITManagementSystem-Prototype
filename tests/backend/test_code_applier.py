import os
import sys

# テスト実行時に packages ディレクトリをパスに追加
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../packages"))
)

from backend.self_healing.code_applier import CodeApplier


class DummyCodeApplier(CodeApplier):
    def __init__(self):
        self.inserted = []

    def _insert_content(self, file_path, line_number, content):
        # テスト用に挿入内容を記録するだけのモック実装
        self.inserted.append((file_path, line_number, content))


def test_apply_repair_plan_success(tmp_path):
    # テスト用ファイルを作成
    test_file = tmp_path / "test_file.py"
    test_file.write_text("print('Hello')\n")

    applier = DummyCodeApplier()
    repair_plan = [
        {
            "file_path": str(test_file),
            "line_number": 1,
            "code_changes": "print('Inserted line')",
            "reason": "テスト挿入",
        }
    ]

    success, applied_files = applier.apply_repair_plan(repair_plan)

    assert success is True
    assert str(test_file) in applied_files
    assert len(applier.inserted) == 1
    inserted_file, inserted_line, inserted_content = applier.inserted[0]
    assert inserted_file == str(test_file)
    assert inserted_line == 1
    assert "テスト挿入" in inserted_content
    assert "print('Inserted line')" in inserted_content


def test_apply_repair_plan_invalid_format():
    applier = CodeApplier()
    success, applied_files = applier.apply_repair_plan("invalid_format")
    assert success is False
    assert applied_files == []


def test_apply_repair_plan_missing_fields(tmp_path):
    applier = CodeApplier()
    repair_plan = [{"file_path": None, "code_changes": None}]
    success, applied_files = applier.apply_repair_plan(repair_plan)
    assert success is False
    assert applied_files == []


def test_apply_repair_plan_forbidden_code(tmp_path):
    test_file = tmp_path / "test_file.py"
    test_file.write_text("print('Hello')\n")

    applier = CodeApplier()
    repair_plan = [
        {
            "file_path": str(test_file),
            "line_number": 1,
            "code_changes": "os.system('rm -rf /')",
            "reason": "危険なコード",
        }
    ]
    success, applied_files = applier.apply_repair_plan(repair_plan)
    assert success is False
    assert applied_files == []
