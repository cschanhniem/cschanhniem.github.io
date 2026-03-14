from __future__ import annotations

import argparse
import re
import time
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Iterable

import pdfplumber


ROOT = Path(__file__).resolve().parents[2]
APP_ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "scrnguna.pdf"
CONTENT_ROOT = APP_ROOT / "src" / "content" / "teachings" / "critical-analysis-jhanas"
EN_ROOT = CONTENT_ROOT / "en"
VI_ROOT = CONTENT_ROOT / "vi"
SYSTEM_DICTIONARY = Path("/usr/share/dict/words")

TRANSLATION_CHUNK_LIMIT = 900
TRANSLATION_PAUSE_SECONDS = 0.05
NLLB_MODEL = "facebook/nllb-200-distilled-600M"


@dataclass(frozen=True)
class Section:
    slug: str
    title: str
    start_page: int
    end_page: int
    translate: bool = True


SECTIONS: tuple[Section, ...] = (
    Section("00-front-matter", "Front Matter", 1, 3, translate=False),
    Section("01-abstract", "Abstract", 4, 5),
    Section("02-contents", "Contents", 6, 6, translate=False),
    Section("03-preface", "Preface", 7, 9),
    Section("04-chapter-one-introduction", "Chapter One. Introduction", 10, 24),
    Section("05-chapter-two-preliminaries", "Chapter Two. The Preliminaries to Practice", 25, 36),
    Section("06-chapter-three-hindrances", "Chapter Three. The Conquest of the Hindrances", 37, 67),
    Section("07-chapter-four-first-jhana", "Chapter Four. The First Jhāna and its Factors", 68, 98),
    Section("08-chapter-five-higher-jhanas", "Chapter Five. The Higher Jhānas", 99, 128),
    Section("09-chapter-six-beyond-four-jhanas", "Chapter Six. Beyond the Four Jhānas", 129, 160),
    Section("10-chapter-seven-way-of-wisdom", "Chapter Seven. The Way of Wisdom", 161, 190),
    Section("11-chapter-eight-noble-attainments", "Chapter Eight. Jhāna and the Noble Attainments", 191, 220),
    Section("12-conclusion", "Conclusion", 221, 233),
    Section("13-glossary", "Glossary", 234, 244),
    Section("14-abbreviations", "List of Abbreviations Used", 245, 245, translate=False),
    Section("15-selected-bibliography", "Selected Bibliography", 246, 251, translate=False),
)


TITLE_BLOCKS = {
    "ABSTRACT",
    "PREFACE",
    "Chapter One",
    "INTRODUCTION",
    "Chapter Two",
    "THE PRELIMINARIES TO PRACTICE",
    "Chapter Three",
    "THE CONQUEST OF THE HINDRANCES",
    "Chapter Four",
    "THE FIRST JHĀNA AND ITS FACTORS",
    "Chapter Five",
    "THE HIGHER JHĀNAS",
    "Chapter Six",
    "BEYOND THE FOUR JHĀNAS",
    "Chapter Seven",
    "THE WAY OF WISDOM",
    "Chapter Eight",
    "JHĀNA AND THE NOBLE ATTAINMENTS",
    "CONCLUSION",
    "GLOSSARY",
    "List of Abbreviations used",
    "Selected Bibliography",
    "Primary Sources",
    "Secondary Sources",
}

NO_TRANSLATE_SECTIONS = {"00-front-matter", "02-contents", "14-abbreviations", "15-selected-bibliography"}

TERM_FIXUPS = {
    "(cid:4)": "ṭ",
    "(cid:10)": "ṅ",
    "A/guttara": "Aṅguttara",
    "A2guttara": "Aṅguttara",
    "APguttara": "Aṅguttara",
    "ANguttara": "Aṅguttara",
    "AKguttara": "Aṅguttara",
    "A5guttara": "Aṅguttara",
    "Sa(yutta": "Saṃyutta",
    "SaMyutta": "Saṃyutta",
    "SaJyutta": "Saṃyutta",
    "Sa.yutta": "Saṃyutta",
    "Pi.aka": "Piṭaka",
    "Piaka": "Piṭaka",
    "Pi(aka": "Piṭaka",
    "PiLaka": "Piṭaka",
    "Pi:aka": "Piṭaka",
    "Tipi.aka": "Tipiṭaka",
    "Tipi:aka": "Tipiṭaka",
    "A((hakathā": "Aṭṭhakathā",
    "a((hakathā": "aṭṭhakathā",
    "A((akathā": "Aṭṭhakathā",
    "ALLhakathā": "Aṭṭhakathā",
    "Ahakathā": "Aṭṭhakathā",
    "Xīkā": "Ṭīkā",
    "7īkā": "Ṭīkā",
    "PaLisambhidāmagga": "Paṭisambhidāmagga",
    "Paisambhidāmagga": "Paṭisambhidāmagga",
    "pa:hama": "paṭhama",
    "appa5ā": "appanā",
    "sa.sāra": "saṃsāra",
    "pa āsa": "paṇṇāsa",
    "Sa1āyatana": "Saḷāyatana",
    "DhammasaPgani": "Dhammasaṅgaṇi",
    "Dhammasa2ga i": "Dhammasaṅgaṇi",
    "Dhammasa/ga5i": "Dhammasaṅgaṇi",
    "VibhaPga": "Vibhaṅga",
    "Vibha2ga": "Vibhaṅga",
    "paññābhāvanā": "paññābhāvanā",
    "viññūhi": "viññūhi",
    "satipa((hāna": "satipaṭṭhāna",
    "Satipa((hāna": "Satipaṭṭhāna",
    "pa(ibhāga": "paṭibhāga",
    "di((hi": "diṭṭhi",
    "di((hadhamma": "diṭṭhadhamma",
    "a((ha/gika": "aṭṭhaṅgika",
    "a((ha": "aṭṭha",
    "vīma.s": "vīmaṃs",
    "sattati.sa": "sattatiṃsa",
    "sambojjha/g": "sambojjhaṅg",
    "sa.kappa": "saṅkappa",
    "DhammasaKgaLi": "Dhammasaṅgaṇi",
    "VibhaKga": "Vibhaṅga",
    "Sa/gaha": "Saṅgaha",
    "āsavakkhayañā3a": "āsavakkhayañāṇa",
    "di((hāsava": "diṭṭhāsava",
    "kāmagu5ā": "kāmaguṇā",
    "a((havimokkhā": "aṭṭhavimokkhā",
    "dhamma((hitiñā5a": "dhammaṭṭhitiñāṇa",
    "di((hadhammasukhavihāra": "diṭṭhadhammasukhavihāra",
    "Visuddhimagga)īkā": "Visuddhimaggaṭīkā",
    "gradual1y": "gradually",
    "kha5ikā": "khaṇikā",
    "phara5ā": "pharaṇā",
    "pañcanīvara5a": "pañcanīvaraṇa",
    "viññā5añcāyatana": "viññāṇañcāyatana",
    "sandi((hikanibbāna": "sandiṭṭhikanibbāna",
    "tada/ganibbāna": "tadaṅganibbāna",
    "pā1i": "pāli",
    "Pā1i": "Pāli",
    "BhavaPga": "Bhavaṅga",
    "AtītabhavaPga": "Atītabhavaṅga",
    "BhaPga": "Bhaṅga",
    "BhavaPgupaccheda": "Bhavaṅgupaccheda",
    "BojjhaPga": "Bojjhaṅga",
    "JhānaPga": "Jhānaṅga",
    "PahānaPga": "Pahānaṅga",
    "PubbaPgama": "Pubbaṅgama",
    "SamannāgataPgāni": "Samannāgataṅgāni",
}

CUSTOM_JOIN_WORDS = {
    "equanimity",
    "perception",
    "repeatedly",
    "childhood",
    "throughout",
    "altogether",
    "nonperception",
    "uplifting",
    "onepointedness",
}

WORD_CHARS = "A-Za-zĀĪŪṄÑṬḌṆḶṂāīūṅñṭḍṇḷṃṛ"

PROTECTED_TERMS = (
    "Jhāna",
    "jhāna",
    "Jhānas",
    "jhānas",
    "Nibbāna",
    "nibbāna",
    "Dhamma",
    "dhamma",
    "Theravāda",
    "Pāli",
    "Tipiṭaka",
    "Sutta",
    "sutta",
    "suttas",
    "bhikkhu",
    "bhikkhus",
    "saṃsāra",
    "kamma",
    "samādhi",
    "vipassanā",
    "samatha",
    "Buddha",
    "jhānic",
    "Noble Truths",
)

TRANSLATION_OVERRIDES = {
    "The Doctrinal Context of Jhāna": "Bối cảnh giáo lý của Jhāna",
    "The Importance of Jhāna": "Tầm quan trọng của Jhāna",
    "Overview": "Toàn cảnh vấn đề",
    "The Preliminaries to Practice": "Những chuẩn bị trước khi hành trì",
    "The Conquest of the Hindrances": "Sự chế ngự các triền cái",
    "The First Jhāna and its Factors": "Sơ thiền và các thiền chi của nó",
    "The Higher Jhānas": "Các tầng Jhāna cao hơn",
    "Beyond the Four Jhānas": "Vượt ngoài bốn tầng Jhāna",
    "The Way of Wisdom": "Con đường của trí tuệ",
    "Jhāna and the Noble Attainments": "Jhāna và các Thánh chứng",
    "Conclusion": "Kết luận",
    "Abstract": "Tóm lược",
    "Preface": "Lời tựa",
    "Front Matter": "Phần dẫn nhập xuất bản",
}


def slug_to_path(root: Path, slug: str) -> Path:
    return root / f"{slug}.md"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract and translate scrnguna.pdf into markdown.")
    parser.add_argument(
        "mode",
        choices=("extract", "translate", "all"),
        nargs="?",
        default="all",
        help="Run extraction only, translation only, or both.",
    )
    return parser.parse_args()


@lru_cache(maxsize=1)
def load_dictionary_words() -> set[str]:
    if not SYSTEM_DICTIONARY.exists():
        return set(CUSTOM_JOIN_WORDS)

    words = {
        line.strip().lower()
        for line in SYSTEM_DICTIONARY.read_text(encoding="utf-8", errors="ignore").splitlines()
        if line.strip()
    }
    words.update(CUSTOM_JOIN_WORDS)
    return words


def group_words_into_lines(words: list[dict[str, float | str]]) -> list[dict[str, object]]:
    lines: list[dict[str, object]] = []
    current: list[dict[str, float | str]] = []
    current_top: float | None = None

    for word in sorted(words, key=lambda item: (round(float(item["top"]), 1), float(item["x0"]))):
        top = float(word["top"])
        if current_top is None or abs(top - current_top) <= 1.2:
            current.append(word)
            current_top = top if current_top is None else (current_top + top) / 2
            continue

        lines.append(build_line(current))
        current = [word]
        current_top = top

    if current:
        lines.append(build_line(current))

    return lines


def build_line(words: list[dict[str, float | str]]) -> dict[str, object]:
    ordered = sorted(words, key=lambda item: float(item["x0"]))
    parts: list[str] = []
    previous_x1: float | None = None
    previous_text = ""
    for word in ordered:
        text = str(word["text"])
        x0 = float(word["x0"])
        gap = 0 if previous_x1 is None else x0 - previous_x1
        needs_space = previous_x1 is not None
        if re.fullmatch(r"[,.;:?!)\]]+", text):
            needs_space = False
        elif re.fullmatch(r"\d+", text) and float(word["size"]) < 11 and gap < 12:
            needs_space = False
        elif previous_text.endswith(("(", "[", "“", '"', "'")):
            needs_space = False
        elif gap < 0.7:
            needs_space = False
        if needs_space:
            parts.append(" ")
        parts.append(text)
        previous_x1 = float(word["x1"])
        previous_text = text

    sizes = [float(word["size"]) for word in ordered if "size" in word]
    return {
        "text": "".join(parts).strip(),
        "top": float(ordered[0]["top"]),
        "x0": float(ordered[0]["x0"]),
        "size": round(sum(sizes) / len(sizes), 2) if sizes else 12.0,
    }


def extract_page_lines(page: pdfplumber.page.Page) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    deduped = page.dedupe_chars(tolerance=1)
    words = deduped.extract_words(extra_attrs=["size"])
    lines = group_words_into_lines(words)

    footnote_top: float | None = None
    for line in lines:
        text = str(line["text"])
        size = float(line["size"])
        x0 = float(line["x0"])
        top = float(line["top"])
        if top > 500 and x0 < 120 and size < 11 and text and not text.isdigit():
            footnote_top = top if footnote_top is None else min(footnote_top, top)

    body_lines: list[dict[str, object]] = []
    footnote_lines: list[dict[str, object]] = []
    for line in lines:
        text = str(line["text"]).strip()
        if not text:
            continue
        top = float(line["top"])
        x0 = float(line["x0"])
        if text.isdigit() and top > 760 and 240 < x0 < 340:
            continue
        if footnote_top is not None and top >= footnote_top:
            footnote_lines.append(line)
        else:
            body_lines.append(line)

    return body_lines, footnote_lines


def is_heading_line(text: str, size: float) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    if size >= 14:
        return True
    if len(stripped) <= 72 and stripped.upper() == stripped and any(char.isalpha() for char in stripped):
        return True
    return False


def normalize_heading(text: str) -> str:
    return " ".join(text.split())


def format_body_lines(
    lines: list[dict[str, object]],
    section: Section,
    page_number: int,
    footnote_numbers: set[str],
) -> str:
    output: list[str] = []
    paragraph: list[str] = []
    previous_top: float | None = None

    def flush_paragraph() -> None:
        nonlocal paragraph
        if not paragraph:
            return
        text = join_wrapped_lines(paragraph)
        if text:
            output.append(
                apply_text_fixups(
                    text,
                    page_number=page_number,
                    footnote_numbers=footnote_numbers,
                )
            )
        paragraph = []

    for index, line in enumerate(lines):
        text = str(line["text"]).strip()
        size = float(line["size"])
        top = float(line["top"])

        if not text:
            flush_paragraph()
            previous_top = None
            continue

        if text in TITLE_BLOCKS:
            previous_top = top
            continue

        if index == 0 and text == section.title:
            previous_top = top
            continue

        if is_heading_line(text, size):
            flush_paragraph()
            heading = normalize_heading(text)
            if heading not in TITLE_BLOCKS and heading != section.title:
                output.append(f"## {heading}")
            previous_top = top
            continue

        gap = 0 if previous_top is None else top - previous_top
        if gap > 18:
            flush_paragraph()

        paragraph.append(text)
        previous_top = top

    flush_paragraph()
    return cleanup_markdown("\n\n".join(output))


def join_wrapped_lines(lines: Iterable[str]) -> str:
    merged = ""
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        if not merged:
            merged = line
            continue
        if merged.endswith("-"):
            merged = merged[:-1] + line
            continue
        merged += f" {line}"
    return merged


def parse_footnotes(
    lines: list[dict[str, object]],
    page_number: int,
    carry_key: str | None,
) -> tuple[dict[str, str], str | None, set[str]]:
    notes: dict[str, str] = {}
    current_key: str | None = carry_key
    started_numbers: set[str] = set()
    for line in lines:
        text = " ".join(str(line["text"]).split())
        match = re.match(r"^(\d+)\.\s*(.*)$", text)
        if match:
            note_number = match.group(1)
            current_key = f"p{page_number}-{note_number}"
            started_numbers.add(note_number)
            notes[current_key] = match.group(2).strip()
            continue
        if current_key is not None:
            existing = notes.get(current_key, "")
            notes[current_key] = f"{existing} {text}".strip()
    return {key: apply_text_fixups(value) for key, value in notes.items()}, current_key, started_numbers


def rejoin_split_words_around_footnotes(text: str) -> str:
    dictionary = load_dictionary_words()

    def replace(match: re.Match[str]) -> str:
        left = match.group(1)
        note_label = match.group(2)
        right = match.group(3)
        combined = f"{left}{right}"
        left_is_word = left.lower() in dictionary
        right_is_word = right.lower() in dictionary

        if combined.lower() not in dictionary:
            return match.group(0)
        if left_is_word and right_is_word:
            return match.group(0)

        return f"{combined}[^{note_label}]"

    pattern = re.compile(rf"\b([{WORD_CHARS}]{{2,}})\[\^([^\]]+)\]\s+([{WORD_CHARS}]{{2,}})\b")
    return pattern.sub(replace, text)


def apply_text_fixups(
    text: str,
    page_number: int | None = None,
    footnote_numbers: set[str] | None = None,
) -> str:
    fixed = text
    for source, target in TERM_FIXUPS.items():
        fixed = fixed.replace(source, target)

    fixed = re.sub(r"\s+([,.;:?!])", r"\1", fixed)
    fixed = re.sub(r"\(\s+", "(", fixed)
    fixed = re.sub(r"\s+\)", ")", fixed)
    fixed = fixed.replace(" .", ".")
    fixed = fixed.replace(" ,", ",")
    fixed = fixed.replace(" ;", ";")
    fixed = fixed.replace(" :", ":")
    if page_number is not None and footnote_numbers:
        fixed = re.sub(
            r"([A-Za-zāīūṅñṭḍṇḷṃṛĀĪŪṄÑṬḌṆḶṂ”’)\]])(\d+)(\s|$)",
            lambda match: (
                f"{match.group(1)}[^p{page_number}-{match.group(2)}]{match.group(3)}"
                if match.group(2) in footnote_numbers
                else match.group(0)
            ),
            fixed,
        )
        fixed = re.sub(
            r"\s(\d{1,2})\s(?=[A-Za-zĀĪŪṄÑṬḌṆḶṂāīūṅñṭḍṇḷṃṛ“‘])",
            lambda match: (
                f"[^p{page_number}-{match.group(1)}] "
                if match.group(1) in footnote_numbers
                else match.group(0)
            ),
            fixed,
        )
        fixed = rejoin_split_words_around_footnotes(fixed)
    return fixed.strip()


def cleanup_markdown(text: str) -> str:
    collapsed = re.sub(r"\n{3,}", "\n\n", text.strip())
    return collapsed + "\n"


def build_conclusion_appendices_markdown() -> str:
    return """
## Appendix 1. The Thirty-seven Constituents of Enlightenment

### I. The Four Foundations of Mindfulness

1. Contemplation of the body as a foundation of mindfulness (*kāyānupassanā satipaṭṭhāna*)
2. Contemplation of feelings as a foundation of mindfulness (*vedanānupassanā satipaṭṭhāna*)
3. Contemplation of mind as a foundation of mindfulness (*cittānupassanā satipaṭṭhāna*)
4. Contemplation of dhammas as a foundation of mindfulness (*dhammānupassanā satipaṭṭhāna*)

### II. The Four Right Endeavors

1. The effort to prevent unarisen unwholesome states (*anuppannānaṃ pāpakānaṃ akusalānaṃ dhammānaṃ anuppādāya vāyāma*)
2. The effort to abandon arisen unwholesome states (*uppannānaṃ pāpakānaṃ akusalānaṃ dhammānaṃ pahānāya vāyāma*)
3. The effort to arouse unarisen wholesome states (*anuppannānaṃ kusalānaṃ dhammānaṃ uppādāya vāyāma*)
4. The effort to maintain and increase arisen wholesome states (*uppannānaṃ kusalānaṃ dhammānaṃ ṭhitiyā asammosāya bhiyyobhāvāya vāyāma*)

### III. The Four Bases of Success

1. The base of success consisting in zeal (*chandiddhipāda*)
2. The base of success consisting in energy (*viriyiddhipāda*)
3. The base of success consisting in consciousness (*cittiddhipāda*)
4. The base of success consisting in investigation (*vīmaṃsiddhipāda*)

### IV. The Five Spiritual Faculties

1. Faith (*saddhindriya*)
2. Energy (*viriyindriya*)
3. Mindfulness (*satindriya*)
4. Concentration (*samādhindriya*)
5. Wisdom (*paññindriya*)

### V. The Five Spiritual Powers

1. Faith (*saddhābala*)
2. Energy (*viriyabala*)
3. Mindfulness (*satibala*)
4. Concentration (*samādhibala*)
5. Wisdom (*paññābala*)

### VI. The Seven Factors of Enlightenment

1. Mindfulness (*satisambojjhaṅga*)
2. Investigation of dhammas (*dhammavicayasambojjhaṅga*)
3. Energy (*viriyasambojjhaṅga*)
4. Rapture (*pītisambojjhaṅga*)
5. Tranquility (*passaddhisambojjhaṅga*)
6. Concentration (*samādhisambojjhaṅga*)
7. Equanimity (*upekkhāsambojjhaṅga*)

### VII. The Noble Eightfold Path

1. Right view (*sammādiṭṭhi*)
2. Right intention (*sammāsaṅkappa*)
3. Right speech (*sammāvācā*)
4. Right action (*sammākammanta*)
5. Right livelihood (*sammā-ājīva*)
6. Right effort (*sammāvāyāma*)
7. Right mindfulness (*sammāsati*)
8. Right concentration (*sammāsamādhi*)

## Appendix 2. Forty Subjects of Meditation

The dissertation lays this appendix out as a three-page reference table. To preserve the original structure, the scanned tables are included below. A compact textual summary is added first so the information remains searchable in markdown.

### Summary of the Forty Subjects

- Ten kasiṇas: earth, water, fire, air, blue, yellow, red, white, light, and limited space.
- Ten contemplations of foulness (*asubha*): the ten cemetery contemplations.
- Ten recollections (*anussati*): the Buddha, Dhamma, Saṅgha, virtue, generosity, devas, death, the body, breathing, and peace.
- Four divine abodes (*brahmavihāra*): loving-kindness, compassion, sympathetic joy, and equanimity.
- Four immaterial attainments (*arūppa*): boundless space, boundless consciousness, nothingness, and neither-perception-nor-non-perception.
- One perception: loathsomeness in food.
- One analysis: the defining of the four elements.

![Appendix 2, page 1](/teachings/critical-analysis-jhanas/appendix-2-page-228.png)

![Appendix 2, page 2](/teachings/critical-analysis-jhanas/appendix-2-page-229.png)

![Appendix 2, page 3](/teachings/critical-analysis-jhanas/appendix-2-page-230.png)

## Appendix 3. Jhāna Factors

### Sequence of Attainment

1. The four fine-material jhānas: first, second, third, and fourth jhāna.
2. The four immaterial attainments: the base of boundless space, the base of boundless consciousness, the base of nothingness, and the base of neither-perception-nor-non-perception.

### Factors Present at Each Jhāna Level

- First jhāna: initial thought, sustained thought, rapture, happiness, and one-pointedness. The five hindrances are suppressed.
- Second jhāna: rapture, happiness, and one-pointedness. Initial and sustained thought fall away.
- Third jhāna: happiness and one-pointedness. Rapture falls away.
- Fourth jhāna: neutral feeling and one-pointedness. Happiness falls away.

![Appendix 3 chart](/teachings/critical-analysis-jhanas/appendix-3-page-231.png)

## Appendix 4. Kamma and Rebirth

### Fine-Material Kamma and Rebirth

- First jhāna -> Brahmā's retinue, Brahmā's ministers, Great Brahmā.
- Second jhāna -> Limited Lustre, Measureless Lustre, Streaming Lustre.
- Third jhāna -> Limited Glory, Measureless Glory, Refulgent Glory.
- Fourth jhāna -> Great Reward, Non-percipient beings, and the five Pure Abodes: Aviha, Atappa, Sudassa, Sudassī, and Akaniṭṭha.

### Immaterial Kamma and Rebirth

- Base of boundless space -> Plane of infinite space.
- Base of boundless consciousness -> Plane of infinite consciousness.
- Base of nothingness -> Plane of nothingness.
- Base of neither-perception-nor-non-perception -> Plane of neither-perception-nor-non-perception.

![Appendix 4 chart](/teachings/critical-analysis-jhanas/appendix-4-page-232.png)
""".strip()


def replace_garbled_conclusion_appendices(text: str) -> str:
    marker = "Appendix 1"
    if marker not in text:
        return text

    body = text.split(marker, 1)[0].strip()
    return cleanup_markdown(f"{body}\n\n{build_conclusion_appendices_markdown()}")


def extract_sections() -> None:
    EN_ROOT.mkdir(parents=True, exist_ok=True)

    with pdfplumber.open(PDF_PATH) as pdf:
        for section in SECTIONS:
            body_parts: list[str] = []
            footnotes: dict[str, str] = {}
            carry_footnote_key: str | None = None

            for page_number in range(section.start_page, section.end_page + 1):
                page = pdf.pages[page_number - 1]
                body_lines, footnote_lines = extract_page_lines(page)
                parsed_notes, carry_footnote_key, footnote_numbers = parse_footnotes(
                    footnote_lines,
                    page_number,
                    carry_footnote_key,
                )
                body = format_body_lines(body_lines, section, page_number, footnote_numbers)
                if body:
                    body_parts.append(body.strip())

                for key, value in parsed_notes.items():
                    if key in footnotes:
                        footnotes[key] = f"{footnotes[key]} {value}".strip()
                    else:
                        footnotes[key] = value

            section_text = "\n\n".join(part for part in body_parts if part)

            if section.slug == "02-contents":
                section_text = build_contents_markdown()
            elif section.slug == "14-abbreviations":
                section_text = build_abbreviations_markdown(section_text)
            elif section.slug == "13-glossary":
                section_text = build_glossary_markdown(section_text)
            elif section.slug == "12-conclusion":
                section_text = replace_garbled_conclusion_appendices(section_text)

            if footnotes:
                note_lines = [f"[^{key}]: {value}" for key, value in footnotes.items()]
                section_text = cleanup_markdown(f"{section_text}\n\n" + "\n".join(note_lines))
            else:
                section_text = cleanup_markdown(section_text)

            slug_to_path(EN_ROOT, section.slug).write_text(section_text, encoding="utf-8")
            print(f"wrote {slug_to_path(EN_ROOT, section.slug)}")


def build_contents_markdown() -> str:
    lines = ["## Contents"]
    for section in SECTIONS:
        if section.slug in {"00-front-matter", "02-contents"}:
            continue
        lines.append(f"- {section.title}")
    return "\n".join(lines)


def build_glossary_markdown(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    output: list[str] = []
    for line in lines:
        parts = re.split(r"\s{2,}", line)
        if len(parts) >= 2:
            term = parts[0].strip()
            definition = " ".join(parts[1:]).strip()
            output.append(f"- **{term}**: {definition}")
        elif line != "Glossary":
            output.append(f"- {line}")
    return "\n".join(output)


def build_abbreviations_markdown(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    output: list[str] = []
    for line in lines:
        if line in TITLE_BLOCKS:
            continue
        parts = re.split(r"\s{2,}", line)
        if len(parts) >= 2:
            output.append(f"- **{parts[0].strip()}**: {' '.join(parts[1:]).strip()}")
        else:
            output.append(f"- {line}")
    return "\n".join(output)


def translate_sections() -> None:
    VI_ROOT.mkdir(parents=True, exist_ok=True)
    translator = LocalNllbTranslator()

    for section in SECTIONS:
        source_path = slug_to_path(EN_ROOT, section.slug)
        target_path = slug_to_path(VI_ROOT, section.slug)
        source_text = source_path.read_text(encoding="utf-8")

        if section.slug in NO_TRANSLATE_SECTIONS or not section.translate:
            target_path.write_text(source_text, encoding="utf-8")
            print(f"copied {target_path}")
            continue

        translated = translate_markdown(source_text, translator)
        target_path.write_text(translated, encoding="utf-8")
        print(f"translated {target_path}")


def translate_markdown(markdown: str, translator: "LocalNllbTranslator") -> str:
    lines = markdown.splitlines()
    output: list[str] = []
    paragraph: list[str] = []
    footnote_indent = "    "

    def flush_paragraph() -> None:
        nonlocal paragraph
        if not paragraph:
            return
        block = "\n".join(paragraph)
        output.append(translate_block(block, translator))
        paragraph = []

    for line in lines:
        if not line.strip():
            flush_paragraph()
            output.append("")
            continue

        if line.startswith("## "):
            flush_paragraph()
            heading = line[3:].strip()
            translated_heading = TRANSLATION_OVERRIDES.get(heading, translator.translate_text(heading))
            output.append(f"## {translated_heading}")
            continue

        if line.startswith("![") and "](" in line:
            flush_paragraph()
            output.append(line)
            continue

        if line.startswith("[^"):
            flush_paragraph()
            label, content = line.split("]:", 1)
            output.append(f"{label}]: {translate_block(content.strip(), translator)}")
            continue

        if line.startswith("- **") and "**:" in line:
            flush_paragraph()
            term_match = re.match(r"^- \*\*(.+?)\*\*: (.+)$", line)
            if term_match:
                term = term_match.group(1)
                definition = term_match.group(2)
                output.append(f"- **{term}**: {translate_block(definition, translator)}")
                continue

        if line.startswith("- "):
            flush_paragraph()
            content = line[2:].strip()
            output.append(f"- {translate_block(content, translator)}")
            continue

        if line.startswith(footnote_indent):
            flush_paragraph()
            output.append(f"{footnote_indent}{translate_block(line.strip(), translator)}")
            continue

        paragraph.append(line)

    flush_paragraph()
    translated = "\n".join(output)
    translated = apply_translation_cleanups(translated)
    return cleanup_markdown(translated)


def translate_block(block: str, translator: "LocalNllbTranslator") -> str:
    protected_text, placeholders = protect_terms(block)
    translated = translator.translate_text(protected_text)
    return restore_terms(translated, placeholders)


def protect_terms(text: str) -> tuple[str, dict[str, str]]:
    placeholders: dict[str, str] = {}
    protected = text

    for index, term in enumerate(PROTECTED_TERMS):
        token = f"__TERM_{index}__"
        pattern = re.compile(rf"\b{re.escape(term)}\b")
        if pattern.search(protected):
            protected = pattern.sub(token, protected)
            placeholders[token] = term

    return protected, placeholders


def restore_terms(text: str, placeholders: dict[str, str]) -> str:
    restored = text
    for token, term in placeholders.items():
        restored = restored.replace(token, term)
    return restored


def apply_translation_cleanups(text: str) -> str:
    cleaned = text
    replacements = {
        "tâm trí": "tâm",
        "thống nhất tinh thần": "nhất tâm",
        "thiền định Theravāda": "thiền học Theravāda",
        "sự chìm đắm hoàn toàn": "sự chuyên chú trọn vẹn",
        "sự hợp nhất": "sự hợp nhất",
        "Các bản sao": "Các Jhāna",
        "Jhana": "Jhāna",
    }
    for source, target in replacements.items():
        cleaned = cleaned.replace(source, target)
    return cleaned


class LocalNllbTranslator:
    def __init__(self) -> None:
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        self.torch = torch
        self.tokenizer = AutoTokenizer.from_pretrained(
            NLLB_MODEL,
            local_files_only=True,
            src_lang="eng_Latn",
        )
        self.model = AutoModelForSeq2SeqLM.from_pretrained(NLLB_MODEL, local_files_only=True)
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.model.to(self.device)
        self.model.eval()
        self.target_lang_id = self.tokenizer.convert_tokens_to_ids("vie_Latn")

    def translate_text(self, text: str) -> str:
        if not text.strip():
            return text

        chunks = chunk_text(text, TRANSLATION_CHUNK_LIMIT)
        translated_chunks: list[str] = []
        for chunk in chunks:
            translated_chunks.append(self._translate_chunk(chunk))
            time.sleep(TRANSLATION_PAUSE_SECONDS)
        return "".join(translated_chunks).strip()

    def _translate_chunk(self, chunk: str) -> str:
        inputs = self.tokenizer([chunk], return_tensors="pt", padding=True, truncation=True)
        inputs = {key: value.to(self.device) for key, value in inputs.items()}
        with self.torch.no_grad():
            output = self.model.generate(
                **inputs,
                forced_bos_token_id=self.target_lang_id,
                max_new_tokens=512,
            )
        return self.tokenizer.batch_decode(output, skip_special_tokens=True)[0]


def chunk_text(text: str, limit: int) -> list[str]:
    if len(text) <= limit:
        return [text]

    chunks: list[str] = []
    current = ""
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        candidate = sentence if not current else f"{current} {sentence}"
        if len(candidate) <= limit:
            current = candidate
            continue
        if current:
            chunks.append(current)
        current = sentence

    if current:
        chunks.append(current)

    return chunks


def main() -> None:
    args = parse_args()
    if args.mode in {"extract", "all"}:
        extract_sections()
    if args.mode in {"translate", "all"}:
        translate_sections()


if __name__ == "__main__":
    main()
