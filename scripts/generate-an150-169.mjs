import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, "../src/data/nikaya-improved/vi");

const pairs = [
  { id: 150, title: "Kinh Điều Vô Phạm Là Có Phạm", type: "negative", key: "điều vô phạm là có phạm" },
  { id: 151, title: "Kinh Điều Có Phạm Là Vô Phạm", type: "negative", key: "điều có phạm là vô phạm" },
  { id: 152, title: "Kinh Tội Nhẹ Là Tội Nặng", type: "negative", key: "tội nhẹ là tội nặng" },
  { id: 153, title: "Kinh Tội Nặng Là Tội Nhẹ", type: "negative", key: "tội nặng là tội nhẹ" },
  { id: 154, title: "Kinh Tội Thô Trọng Là Tội Không Thô Trọng", type: "negative", key: "tội thô trọng (có ác ý) là tội không thô trọng" },
  { id: 155, title: "Kinh Tội Không Thô Trọng Là Tội Thô Trọng", type: "negative", key: "tội không thô trọng (không có ác ý) là tội thô trọng" },
  { id: 156, title: "Kinh Tội Cần Phục Hồi Là Tội Không Cần Phục Hồi", type: "negative", key: "tội cần phục hồi (có dư tàn) là tội không cần phục hồi" },
  { id: 157, title: "Kinh Tội Không Cần Phục Hồi Là Tội Cần Phục Hồi", type: "negative", key: "tội không cần phục hồi (không có dư tàn) là tội cần phục hồi" },
  { id: 158, title: "Kinh Tội Có Thể Sám Hối Là Tội Không Thể Sám Hối", type: "negative", key: "tội có thể sám hối (chuộc lỗi) là tội không thể sám hối" },
  { id: 159, title: "Kinh Tội Không Thể Sám Hối Là Tội Có Thể Sám Hối", type: "negative", key: "tội không thể sám hối (không thể chuộc lỗi) là tội có thể sám hối" },

  { id: 160, title: "Kinh Điều Vô Phạm Là Vô Phạm", type: "positive", key: "điều vô phạm là vô phạm" },
  { id: 161, title: "Kinh Điều Có Phạm Là Có Phạm", type: "positive", key: "điều có phạm là có phạm" },
  { id: 162, title: "Kinh Tội Nhẹ Là Tội Nhẹ", type: "positive", key: "tội nhẹ là tội nhẹ" },
  { id: 163, title: "Kinh Tội Nặng Là Tội Nặng", type: "positive", key: "tội nặng là tội nặng" },
  { id: 164, title: "Kinh Tội Thô Trọng Là Tội Thô Trọng", type: "positive", key: "tội thô trọng là tội thô trọng" },
  { id: 165, title: "Kinh Tội Không Thô Trọng Là Tội Không Thô Trọng", type: "positive", key: "tội không thô trọng là tội không thô trọng" },
  { id: 166, title: "Kinh Tội Cần Phục Hồi Là Tội Cần Phục Hồi", type: "positive", key: "tội cần phục hồi là tội cần phục hồi" },
  { id: 167, title: "Kinh Tội Không Cần Phục Hồi Là Tội Không Cần Phục Hồi", type: "positive", key: "tội không cần phục hồi là tội không cần phục hồi" },
  { id: 168, title: "Kinh Tội Có Thể Sám Hối Là Tội Có Thể Sám Hối", type: "positive", key: "tội có thể sám hối là tội có thể sám hối" },
  { id: 169, title: "Kinh Tội Không Thể Sám Hối Là Tội Không Thể Sám Hối", type: "positive", key: "tội không thể sám hối là tội không thể sám hối" }
];

for (const p of pairs) {
    const isNeg = p.type === 'negative';
    const subTitle = isNeg ? 'Làm Chánh Pháp Biến Mất' : 'Giữ Chánh Pháp Trường Tồn';
    const descAction = isNeg 
        ? "đang hành động gây bất hạnh và đau khổ cho số đông, đi ngược lại số đông, đem đến tai hại, bất hạnh và đau khổ cho chư thiên và loài người"
        : "đang hành động đem lại lợi ích và hạnh phúc cho số đông, thuận vì số đông, đem đến phúc lợi, lợi ích và hạnh phúc cho chư thiên và loài người";
    const descResult = isNeg
        ? "Những vị ấy tích tựu vô vàn ác nghiệp và làm cho chánh pháp biến mất"
        : "Những vị ấy tích tựu vô vàn phước báu và làm cho chánh pháp trường tồn";

    const summaryBlock = isNeg
        ? "Khi kỷ cương, ranh giới và luật nghi của bậc giác ngộ bị diễn giải sai lệch, khả năng bảo hộ đại chúng bị phá vỡ. Đảo lộn những lỗi lầm thành ra không lỗi lầm, hay chuyện nghiêm trọng lại hóa ra nhỏ nhẹ, là chuyện sinh ra tai hại lớn, vì nó trực tiếp dẫn đến sự tàn lụi của diệu pháp."
        : "Khi kỷ cương, ranh giới và luật nghi được giữ nguyên vẹn đúng như nó là, khả năng bảo hộ đại chúng trở nên kiên cố. Gọi đúng tên sự vi phạm, phân minh rạch ròi đâu là điều thô trọng, đâu là điều cần phục hồi, là chuyện sinh ra phước báu vô lượng, vì nó nuôi dưỡng xương sống thiết thực bảo toàn diệu pháp.";

    const lesson = isNeg
        ? "Sự vi phạm tự thân nó đôi khi không phá hoại hệ thống bằng việc diễn giải bóp méo sự vi phạm đó. Việc phá vỡ sự trong sáng của ranh giới pháp và luật thực chất đang chia rẽ đại chúng và xóa sổ chánh pháp khỏi dòng chảy thế gian."
        : "Sự ngay thẳng, rạch ròi trước giới luật chính là công phu tu hành cốt lõi. Sự bảo hộ ranh giới sai đúng một cách chính xác không chỉ là phẩm chất cá nhân, mà là lá chắn an toàn vĩ đại nhất dành cho tất thảy.";

    const note = isNeg
        ? "Bản dịch này phối hợp sát thuật ngữ luật học và nhịp điệu Việt ngữ. Từ Pāli gốc *duṭṭhullā* và *aduṭṭhullā* được Suttacentral tiếng Anh dịch thành *corrupt intention* (do ác ý) và *not corrupt intention*, nhưng trong Pāli gốc vốn là thô trọng / không thô trọng. HT Minh Châu cũng dùng thô trọng. Tương tự, *sāvasesa* (có dư tàn) và *anavasesa* (không dư tàn) được ưu tiên dùng 'cần phục hồi' theo cụm từ *requiring rehabilitation* của tiếng Anh để bật rõ ý nghĩa thi hành."
        : "Cụm từ *tích tựu vô vàn phước báu* được diễn đạt bám sát nhịp điệu *brim with much merit* (pasavanti puññaṃ), tạo sức đối kháng với *ác nghiệp* (apuññaṃ) của nhóm bài trước.";

    const content = `// Improved Vietnamese Translation - AN 1.${p.id}
// NhậpLưu 2026 Translation

import type { ImprovedTranslation } from '@/types/nikaya'

export const an1_${p.id}: ImprovedTranslation = {
    suttaId: 'an1.${p.id}',
    lang: 'vi',
    author: 'NhậpLưu Translation Team',
    year: '2026',
    title: '${p.title} - ${subTitle}',
    content: \`
# ${p.title}
## AN 1.${p.id}

*Bản dịch manual 2026, đi thẳng vào nguyên lý của giới luật: bảo vệ ranh giới sự thật cũng là bảo trì chánh pháp.*

---

### Mũi kinh

Phân định rõ ràng và gọi đúng ranh giới cấu trúc của hành vi.

## Lời dạy chính

Đức Phật nói:

> "Này các tỷ-kheo, những tỷ-kheo nào giảng giải ${p.key}; các vị ấy ${descAction}. ${descResult}."

## Điều bài kinh muốn chỉ ra

${summaryBlock}

## Bài học thực hành

${lesson}

## Lời kết

Việc gọi tên chuẩn xác sự sai trái mang một quyền lực lớn: quyền lực giữ gìn chánh giáo.

---

> **Ghi chú dịch thuật**: ${note}
\`
}
`;

    fs.writeFileSync(path.join(outDir, `an-1-${p.id}.ts`), content, "utf8");
}
console.log("Generated 20 files successfully");
