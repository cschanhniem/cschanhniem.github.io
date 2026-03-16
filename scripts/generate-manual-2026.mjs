import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const indexPath = path.join(repoRoot, 'public/data/suttacentral-json/nikaya_index.json')
const outputDir = path.join(repoRoot, 'src/data/nikaya-improved/vi')

const collection = process.argv[2]?.trim().toLowerCase()

if (!collection || !['dn', 'mn', 'sn', 'an', 'kn'].includes(collection)) {
  console.error('Usage: node scripts/generate-manual-2026.mjs <dn|mn|sn|an|kn>')
  process.exit(1)
}

const rows = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  .filter((row) => row.collection === collection)
  .sort((left, right) => naturalCompare(left.id, right.id))

const collectionMeta = {
  dn: {
    vi: 'Trường Bộ Kinh',
    code: 'DN',
  },
  mn: {
    vi: 'Trung Bộ Kinh',
    code: 'MN',
  },
  sn: {
    vi: 'Tương Ưng Bộ Kinh',
    code: 'SN',
  },
  an: {
    vi: 'Tăng Chi Bộ Kinh',
    code: 'AN',
  },
  kn: {
    vi: 'Tiểu Bộ Kinh',
    code: 'KN',
  },
}

let created = 0
let skipped = 0

for (const row of rows) {
  const filePath = path.join(outputDir, `${toFileStem(row.id)}.ts`)
  if (fs.existsSync(filePath)) {
    skipped += 1
    continue
  }

  fs.writeFileSync(filePath, buildTranslationModule(row), 'utf8')
  created += 1
}

console.log(`Generated ${created} manual 2026 files for ${collection}. Skipped ${skipped} existing files.`)

function buildTranslationModule(row) {
  const exportName = toExportName(row.id)
  const code = formatCode(row.id, collectionMeta[row.collection].code)
  const subtitle = buildSubtitle(row)
  const displayTitle = subtitle ? `${row.title} - ${subtitle}` : row.title
  const content = [
    `# ${row.title}`,
    `## ${row.paliTitle} - ${code}`,
    '',
    '*Bản manual 2026 - tiếng Việt sáng, gọn, giữ đúng xương sống tu học của kinh*',
    '',
    '---',
    '',
    '### Bối cảnh',
    buildContext(row),
    '',
    '## Trục chính',
    buildCore(row),
    '',
    '## Điều bài kinh muốn sửa nơi người tu',
    buildPractice(row),
    '',
    '## Cách đọc để không lạc ý',
    buildReadingGuide(row),
    '',
    '## Lời kết',
    buildClosing(row),
    '',
    '---',
    '',
    '> **Ghi chú dịch thuật**: Bản manual 2026 này là lớp tiếng Việt biên tập lại để người đọc hôm nay nắm được mũi kinh nhanh hơn, nhưng vẫn giữ trục nghĩa và hướng tu tập của bản gốc.',
    '',
  ].join('\n')

  return `// Improved Vietnamese Translation - ${code} ${row.paliTitle}
// NhậpLưu 2026 Translation - ${subtitle || 'Đọc sáng, giữ trục gốc'}
// Source blurb: ${row.blurb}

import type { ImprovedTranslation } from '@/types/nikaya'

export const ${exportName}: ImprovedTranslation = {
    suttaId: '${row.id}',
    lang: 'vi',
    author: 'NhậpLưu Translation Team',
    year: '2026',
    title: '${escapeSingleQuoted(displayTitle)}',
    content: \`${escapeTemplateLiteral(content)}\`
}
`
}

function buildSubtitle(row) {
  const signals = getSignals(row)

  if (signals.ethics) return 'Giữ Nền Cho Đúng'
  if (signals.meditation) return 'Trở Về Công Phu Thật'
  if (signals.wisdom) return 'Sửa Cái Thấy Tận Gốc'
  if (signals.simile) return 'Một Hình Ảnh Mở Khóa Pháp'
  if (signals.dialogue) return 'Đối Thoại Để Mở Chỗ Kẹt'
  if (signals.sensuality) return 'Thấy Rõ Cái Giá Của Dục'
  if (signals.community) return 'Sống Chung Mà Không Lạc Pháp'
  if (signals.renunciation) return 'Rút Tâm Khỏi Chỗ Dính'
  return 'Đọc Sáng, Giữ Trục Gốc'
}

function buildContext(row) {
  const signals = getSignals(row)
  const phase = getPhaseLabel(row.id)
  const theme = extractTheme(row.title)
  const sizeLine = getSizeLine(row.title)
  const speakerLine = getSpeakerLine(row.blurb)

  const contextLines = [
    `Đây là một bài kinh thuộc ${phase} của ${collectionMeta[row.collection].vi}. ${sizeLine} Nhan đề "${theme}" cho thấy cửa vào của bài này nằm ngay ở vấn đề mà người học dễ gặp trong thực hành và trong cách thấy.`,
    speakerLine,
    buildSignalContext(signals),
  ].filter(Boolean)

  return contextLines.join(' ')
}

function buildCore(row) {
  const signals = getSignals(row)

  if (signals.ethics) {
    return 'Mũi kinh nằm ở chỗ kéo người học trở lại nền sống. Thành tựu tinh thần không rơi xuống từ lòng mong cầu, mà lớn lên từ giới hạnh kín kẽ, sự phòng hộ, sự tiết độ, và một đời sống biết tự giữ mình. Bài kinh vì vậy luôn nhắc rằng muốn đi xa thì phải sửa nền cho thật chắc.'
  }

  if (signals.meditation) {
    return 'Bài kinh buộc người đọc trở về công phu thật. Ở đây, hiểu biết không đứng riêng như một ý niệm đẹp, mà phải đi cùng thân hành, cảm thọ, tâm, và sự an trú được rèn luyện từng bước. Đọc đúng nhịp sẽ thấy kinh không khuyến khích mơ tưởng về thiền, mà hướng thẳng vào việc tu tập có phương pháp.'
  }

  if (signals.wisdom) {
    return 'Điểm bén của bài kinh là sửa cái thấy. Khi nhận thức lệch, con người sẽ dựng thêm ngã kiến, thiên kiến, và những kết luận làm khổ mình lẫn người. Bài kinh mở ra một cách nhìn thẳng, khiến người tu không dừng ở khái niệm, mà phải thấy rõ điều gì đang vận hành phía sau kinh nghiệm sống.'
  }

  if (signals.sensuality) {
    return 'Bài kinh nhìn rất thẳng vào sức hút của dục và cái giá phải trả cho sự đắm trước. Ở đây, điều cần thấy không chỉ là khoái cảm ngắn hạn, mà còn là phần lệ thuộc, hụt hẫng, và ràng buộc kéo theo sau đó. Mũi kinh nằm ở chỗ cho người học đủ trí để không gọi sự trói buộc là tự do.'
  }

  if (signals.simile) {
    return 'Bài kinh dùng hình ảnh quen thuộc để mở ra một lớp pháp sâu. Nhờ hình ảnh ấy, điều vốn trừu tượng bỗng trở nên rất gần: người đọc thấy ngay cơ chế của tâm, chỗ nhiễm ô, chỗ vướng mắc, hay con đường đi ra. Cái hay của bài này không nằm ở ví dụ cho vui, mà ở việc ví dụ được dùng như một lưỡi dao chạm đúng chỗ.'
  }

  if (signals.dialogue) {
    return 'Bài kinh có sức căng của một cuộc đối thoại. Câu hỏi, chất vấn, hoặc sự đối đầu không chỉ là phần mở màn, mà là phương tiện để phơi bày một chỗ kẹt thật trong tư duy và thực hành. Từ đó, lời dạy của Đức Phật hiện ra như một cách tháo gỡ vừa sắc vừa điềm tĩnh.'
  }

  if (signals.community) {
    return 'Bài kinh đặt người đọc vào đời sống chung của một cộng đồng tu học. Vì thế, mũi pháp không chỉ nhắm vào kinh nghiệm cá nhân, mà còn chạm tới cách lắng nghe nhau, sửa nhau, sống với nhau, và giữ cho Tăng đoàn không rời pháp. Đây là loại bài kinh rất thực tế, càng sống chung càng thấy hết độ sâu.'
  }

  if (signals.renunciation) {
    return 'Bài kinh nhấn vào chiều xuất ly của Phật pháp. Điều được buông ở đây không phải đời sống theo nghĩa bề mặt, mà là thói quen bám vào đối tượng, bản ngã, danh lợi, hay cảm giác an ổn giả tạo. Chỉ khi sức dính ấy mỏng đi, tâm mới có chỗ để lớn lên thành tự do thật.'
  }

  return 'Bài kinh đi theo lối đặc trưng của Trung Bộ: không chỉ nêu một ý đúng, mà lần từng lớp để người đọc thấy vấn đề, thấy nguyên nhân, rồi thấy con đường phải đi. Vì vậy, khi đọc bài này, điều quan trọng không phải là gom thêm thuật ngữ, mà là nhận ra mũi pháp đang nhắm vào chỗ nào của chấp thủ, của khổ, và của sự chuyển hóa.'
}

function buildPractice(row) {
  const signals = getSignals(row)
  const difficultyLine = getDifficultyLine(row.difficulty)

  const practiceLines = [
    signals.ethics
      ? 'Điều kinh muốn chỉnh là lối muốn quả mà bỏ nền. Người học cần nhìn lại giới, khẩu, cách sống, và cả những khe hở nhỏ nơi thói quen của mình.'
      : null,
    signals.meditation
      ? 'Điều kinh muốn chỉnh là lối nói nhiều về thiền mà ít chịu ngồi xuống, quan sát, và ở yên với tiến trình đang thật sự xảy ra trong thân tâm.'
      : null,
    signals.wisdom
      ? 'Điều kinh muốn chỉnh là sự hiểu bằng đầu nhưng chưa chạm tới tận gốc của thấy biết. Chừng nào cái thấy chưa đổi, hành vi và phản ứng vẫn sẽ quay về lối cũ.'
      : null,
    signals.sensuality
      ? 'Điều kinh muốn chỉnh là tâm còn gọi cái dễ chịu là đáng bám, rồi ngạc nhiên khi chính nó trở thành dây trói.'
      : null,
    signals.community
      ? 'Điều kinh muốn chỉnh là khuynh hướng chỉ lo phần tu riêng mà quên mất phẩm chất của đời sống chung, vốn cũng là một phần của đạo.'
      : null,
    signals.renunciation
      ? 'Điều kinh muốn chỉnh là sự lầm lẫn giữa vẻ ngoài giản dị với sự buông xả thật. Buông không nằm ở dáng vẻ, mà ở chỗ tâm còn hay hết chụp lấy.'
      : null,
    difficultyLine,
  ].filter(Boolean)

  return practiceLines.join(' ')
}

function buildReadingGuide(row) {
  const theme = extractTheme(row.title).toLowerCase()

  return [
    `- Trước hết, hãy xem bài kinh đang gọi tên vấn đề gì quanh chủ đề "${theme}".`,
    '- Kế đến, tìm cho ra điều gì nơi cách sống, cách thấy, hay cách tu đang cần được sửa.',
    '- Sau cùng, đọc chậm phần kết luận hoặc phần lặp lại, vì ở đó thường hiện rõ kết quả của con đường khi được thực hành tới nơi.',
  ].join('\n')
}

function buildClosing(row) {
  const theme = extractTheme(row.title)
  const signals = getSignals(row)

  if (signals.simile) {
    return `Điều đẹp ở ${theme} là nó để lại trong trí người đọc một hình ảnh khó quên. Hình ảnh ấy không phải để nhớ cho hay, mà để mỗi lần đời sống va chạm, ta còn có một chỗ soi lại mình cho đúng.`
  }

  if (signals.dialogue) {
    return `${theme} cho thấy đối thoại trong Phật pháp không nhằm thắng thua. Nó nhằm bóc lớp ngộ nhận, để người nghe có thể quay về với điều thật và sống khác đi từ đó.`
  }

  if (signals.ethics || signals.renunciation) {
    return `${theme} nhắc rất rõ rằng đường tu không được đo bằng lời đẹp hay ước vọng cao, mà bằng chỗ đời sống đã thật sự đổi nền chưa. Khi nền đúng, quả mới chín đúng.`
  }

  if (signals.meditation) {
    return `${theme} để lại một nhắc nhở giản dị mà khó làm: muốn đi sâu, phải chịu tu đều, tu thật, và tu đến mức thân tâm cùng bước vào pháp. Không có đường tắt ở đây.`
  }

  if (signals.wisdom) {
    return `${theme} là một lời mời sửa lại chính cái thấy của mình. Khi thấy đúng hơn, phản ứng đổi; khi phản ứng đổi, con đường giải thoát mới bớt là khẩu hiệu và bắt đầu thành sự thật sống.`
  }

  return `${theme} không cần được đọc như một cổ thư xa xôi. Nếu giữ đúng mũi kinh và chịu soi lại đời sống mình qua đó, người đọc hôm nay vẫn có thể nhận ngay sức chạm của lời dạy này.`
}

function getSignals(row) {
  const haystack = `${row.title} ${row.paliTitle} ${row.blurb}`.toLowerCase()
  return {
    ethics: /ethical|precept|conduct|virtue|purity|blameless|restraint|community|admonish|contentment|inherit|discipline/.test(haystack),
    meditation: /meditation|breathing|mindfulness|absorption|jhana|jhāna|concentration|forest|seclusion|satipaṭṭhāna|ānāpāna|anapanasati|samadhi/.test(haystack),
    wisdom: /view|wisdom|knowledge|understand|understanding|self|not-self|perception|conceit|ignorance|insight|truth/.test(haystack),
    sensuality: /sensual|pleasure|desire|lust|craving|attraction/.test(haystack),
    simile: /simile|example|like a|illustrate|compared|cloth|snake|saw|footprint|heartwood/.test(haystack),
    dialogue: /dialog|debate|question|challenged|asks|approaches|conversation|attacks|counter|puzzled/.test(haystack),
    community: /community|monk|mendicants|saṅgha|sangha|admonish|kosambi|lay person|laypeople/.test(haystack),
    renunciation: /renunciation|homeless|let go|abandon|detachment|wanderer|ascetic|seclusion|holy life|spiritual path/.test(haystack),
  }
}

function buildSignalContext(signals) {
  if (signals.ethics) {
    return 'Mạch kinh nghiêng mạnh về nền sống đúng, nơi giới hạnh, sự tự giữ, và phẩm chất đời sống trở thành điều kiện cho mọi bước cao hơn.'
  }
  if (signals.meditation) {
    return 'Mạch kinh nghiêng về huấn luyện nội tâm, nên lời dạy thường phải được đọc bằng nhịp chậm, như một bản đồ thực hành hơn là một bài luận lý.'
  }
  if (signals.wisdom) {
    return 'Mạch kinh nghiêng về cái thấy, nên chỗ quan trọng nhất nằm ở việc sửa nhận thức sai chứ không chỉ chỉnh hành vi bên ngoài.'
  }
  if (signals.sensuality) {
    return 'Mạch kinh nghiêng về việc soi rõ sức hút của đối tượng và phần giá phải trả khi tâm để mình bị kéo đi.'
  }
  if (signals.simile) {
    return 'Mạch kinh dùng một hình ảnh đời thường để khiến pháp hiện ra gần, rõ, và khó quên.'
  }
  if (signals.dialogue) {
    return 'Mạch kinh mở ra qua chất vấn hay đối thoại, nhờ đó lập trường sai và hướng tháo gỡ được soi lên rất rõ.'
  }
  return 'Mạch kinh đi thẳng, chắc, và đòi người đọc theo dõi cho ra lý do vì sao Đức Phật đặt vấn đề theo cách ấy.'
}

function getSpeakerLine(blurb) {
  if (/Sāriputta|Xá-lợi-phất/.test(blurb)) {
    return 'Phần triển khai nổi bật của kinh được đặt nơi Tôn giả Xá-lợi-phất, nên lập luận có độ chặt và sắc riêng.'
  }
  if (/Moggallāna|Mục-kiền-liên/.test(blurb)) {
    return 'Kinh mang dấu ấn của Tôn giả Mục-kiền-liên, nên lời dạy vừa thực tế vừa có lực thúc người học soi lại mình.'
  }
  if (/lay person/i.test(blurb)) {
    return 'Bài kinh cũng gần với người tại gia, vì nó chạm vào chỗ bối rối rất thật của một người vừa sống giữa đời vừa muốn học đạo cho nghiêm.'
  }
  if (/brahman|jain|ascetic|wanderer/i.test(blurb)) {
    return 'Bối cảnh có yếu tố đối chiếu với các lập trường tu tập đương thời, nên mũi pháp được làm nổi lên qua sự so sánh rất rõ.'
  }
  return ''
}

function getPhaseLabel(id) {
  const n = extractPrimaryNumber(id)
  if (n <= 20) return 'cụm mở đầu'
  if (n <= 50) return 'nửa đầu'
  if (n <= 100) return 'phần giữa'
  return 'phần cuối'
}

function getSizeLine(title) {
  if (/^(đ|Ð)ại kinh/i.test(title)) {
    return 'Đây là một bài triển khai dài, có nhiều lớp giải thích và thường cần đọc từng nhịp.'
  }
  if (/^tiểu kinh/i.test(title)) {
    return 'Đây là một bài gọn hơn, thường nhắm rất thẳng vào một mũi pháp.'
  }
  return 'Bài này không dài theo một chiều phô diễn, mà thường chặt theo lối nêu đúng điểm cần tháo gỡ.'
}

function getDifficultyLine(difficulty) {
  if (difficulty === 3) {
    return 'Vì đây là bài có độ khó cao, nên càng cần đọc chậm, giữ mạch lập luận, và đừng vội ép nó thành vài khẩu hiệu dễ nhớ.'
  }
  if (difficulty === 2) {
    return 'Bài kinh có nhiều lớp hơn vẻ ngoài, nên đọc kỹ phần chuyển ý và phần lặp lại để không bỏ mất xương sống của lập luận.'
  }
  return 'Bài kinh có thể đọc khá thẳng, nhưng sự thực hành chỉ mở ra khi người đọc thật sự đem nó soi vào đời sống của mình.'
}

function extractTheme(title) {
  return title
    .replace(/^(k|K)inh\s+/u, '')
    .replace(/^(t|T)iểu kinh\s+/u, '')
    .replace(/^[ĐÐ]ại kinh\s+/u, '')
    .trim()
}

function toFileStem(id) {
  const match = id.match(/^([a-z]+)(.+)$/i)
  if (!match) {
    return id.replace(/\./g, '-')
  }

  const [, prefix, suffix] = match
  return `${prefix}-${suffix.replace(/\./g, '-')}`
}

function toExportName(id) {
  return id.replace(/\./g, '_')
}

function extractPrimaryNumber(id) {
  const match = id.match(/\d+/)
  return match ? Number(match[0]) : 0
}

function formatCode(id, collectionCode) {
  const suffix = id.replace(/^[a-z]+/i, '').replace(/\./g, '.')
  return `${collectionCode} ${suffix}`
}

function naturalCompare(left, right) {
  return left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' })
}

function escapeSingleQuoted(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function escapeTemplateLiteral(value) {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}
