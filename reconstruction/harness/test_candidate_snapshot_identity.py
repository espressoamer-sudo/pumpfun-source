import importlib.util
from pathlib import Path
import shutil
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch
from test_elf_symbols import fixture
import score


class CandidateSnapshotTests(unittest.TestCase):
    def test_symbol_reader_uses_the_loaded_snapshot_after_replacement(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            harness = root / 'harness'
            harness.mkdir()
            (root / 'base').mkdir()
            for name in ('win.py', 'score.py'):
                shutil.copyfile(Path(__file__).parent / name, harness / name)
            first = bytes(fixture())
            (root / 'base/original.so').write_bytes(first)
            spec = importlib.util.spec_from_file_location('snapshot_win', harness / 'win.py')
            module = importlib.util.module_from_spec(spec)
            # score is intentionally bound to this synthetic original for import.
            with patch.object(score, 'BASE', root / 'base'):
                spec.loader.exec_module(module)
            candidate = root / 'candidate.so'
            candidate.write_bytes(first)
            replacement = fixture()
            replacement[441:446] = b'other'
            seen = []
            def read_symbols(path):
                candidate.write_bytes(replacement)
                seen.append(Path(path))
                return score.candidate_functions(path)
            with patch.object(module, 'candidate_functions', side_effect=read_symbols):
                loaded = module.Cand(candidate)
            self.assertEqual(loaded.blob, first)
            self.assertEqual(loaded.funcs[0][2], 'local')
            self.assertNotEqual(seen[0], candidate)
            self.assertFalse(seen[0].exists())


if __name__ == '__main__': unittest.main()
