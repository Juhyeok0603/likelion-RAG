import tempfile
import unittest
from pathlib import Path

from rag import load_sections


class LoadSectionsTest(unittest.TestCase):
    def test_loads_markdown_h2_sections(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as directory:
            path = Path(directory) / "knowledge.md"
            path.write_text("# 안내\n\n## 출결\n공지 확인\n\n## 과제\n제출 확인\n", encoding="utf-8")

            self.assertEqual(
                load_sections(path),
                [("출결", "출결\n공지 확인"), ("과제", "과제\n제출 확인")],
            )


if __name__ == "__main__":
    unittest.main()

