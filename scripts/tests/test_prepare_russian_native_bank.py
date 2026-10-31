import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prepare_russian_native_bank import transform_rows
class RussianNativeBankTests(unittest.TestCase):
    def test_native_and_international_forms_are_separate(self):
        row = {"name":"Александр","slug":"aleksandr","gender":"m","short_forms":"Саша; Саня","international_forms":"Alexander; Alessandro"}
        item = transform_rows([row])[0]
        self.assertEqual(item["displayName"], "Александр")
        self.assertEqual(item["sourceShortForms"], ["Саша", "Саня"])
        self.assertEqual(item["sourceInternationalForms"], ["Alexander", "Alessandro"])
        self.assertFalse(item["runtimeEligible"])
        self.assertEqual(item["humanReviewStatus"], "pending")
    def test_homographs_keep_separate_gender_rows(self):
        rows = [{"name":"Айнур","slug":"ainur-m","gender":"m"},{"name":"Айнур","slug":"ainur-f","gender":"f"}]
        items = transform_rows(rows)
        self.assertEqual(len(items), 2)
        self.assertEqual([x["sourceGender"] for x in items], ["male", "female"])
    def test_latin_or_mixed_native_spelling_is_rejected(self):
        with self.assertRaises(ValueError): transform_rows([{"name":"Aлександр","slug":"bad","gender":"m"}])
    def test_invalid_gender_is_rejected(self):
        with self.assertRaises(ValueError): transform_rows([{"name":"Александр","slug":"bad","gender":"x"}])
    def test_duplicate_source_id_is_rejected(self):
        rows = [{"name":"Александр","slug":"same","gender":"m"},{"name":"Александра","slug":"same","gender":"f"}]
        with self.assertRaises(ValueError): transform_rows(rows)
    def test_unpinned_checksum_is_rejected(self):
        with self.assertRaises(ValueError): transform_rows([{"name":"Александр","slug":"a","gender":"m"}], "0" * 64)
if __name__ == "__main__": unittest.main()
