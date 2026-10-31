import struct
from types import SimpleNamespace
import unittest
import bytecode_signatures as signatures


def instruction(op, regs=0, offset=0, immediate=0):
    return struct.pack('<BBhi', op, regs, offset, immediate)


class SignatureBoundaries(unittest.TestCase):
    def test_lddw_payload_is_not_a_syscall_or_store(self):
        for symbol in ('sol_memcpy_', 'sol_invoke_signed_rust'):
            syscall = next(key for key, value in signatures.SYSCALL_NAMES.items() if value == symbol)
            payload = instruction(0x85)[:4] + struct.pack('<I', syscall)
            elf = SimpleNamespace(b=instruction(0x18) + payload, relocations={})
            self.assertEqual(signatures.detect_cpi_patterns(elf, 0, 16), [])
            self.assertEqual(signatures.detect_serialization_patterns(elf, 0, 16)['memcpy_calls'], 0)
        elf = SimpleNamespace(b=instruction(0x18) + instruction(0x7b), relocations={})
        self.assertEqual(signatures.detect_serialization_patterns(elf, 0, 16)['sequential_stores'], 0)

    def test_payload_is_not_a_token_load_or_account_load(self):
        elf = SimpleNamespace(b=instruction(0x18) + instruction(0x18, immediate=3) + instruction(0x95), relocations={})
        self.assertEqual(signatures.detect_token_transfer_patterns(elf, 0, 24), [])
        elf.b = instruction(0x18) + instruction(0x79) + instruction(0x15)
        self.assertEqual(signatures.detect_account_validation(elf, 0, 24)['discriminator_checks'], 0)

    def test_truncated_windows_are_rejected_by_every_detector(self):
        functions = (signatures.extract_opcode_ngrams, signatures.detect_error_patterns,
                     signatures.detect_cpi_patterns, signatures.detect_token_transfer_patterns,
                     signatures.detect_serialization_patterns, signatures.detect_account_validation)
        for raw in (b'\x95', instruction(0x18)):
            for function in functions:
                with self.subTest(function=function.__name__, raw=raw):
                    with self.assertRaises(ValueError):
                        function(SimpleNamespace(b=raw, relocations={}), 0, len(raw))

    def test_real_stores_and_syscalls_remain_visible(self):
        syscall = next(key for key, value in signatures.SYSCALL_NAMES.items() if value == 'sol_invoke_signed_rust')
        call = instruction(0x85)[:4] + struct.pack('<I', syscall)
        elf = SimpleNamespace(b=instruction(0x7b) + instruction(0x18) + instruction(0x7b) + call, relocations={})
        self.assertEqual(signatures.detect_cpi_patterns(elf, 0, 32)[0]['setup_stores'], 1)
        self.assertEqual(signatures.extract_opcode_ngrams(elf, 0, 32)[1], [0x7b, 0x18, 0x85])


if __name__ == '__main__': unittest.main()
