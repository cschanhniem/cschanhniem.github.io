export const an2VinayaReasons = `Vì cực thiện cho Tăng chúng và an lạc cho Tăng chúng.
Vì để chế ngự những người ác và để các Tỷ-kheo hiền thiện được an ổn.
Vì để phòng hộ các lậu hoặc trong hiện tại và ngăn chặn các lậu hoặc trong tương lai.
Vì để phòng hộ các oán thù trong hiện tại và ngăn chặn các oán thù trong tương lai.
Vì để phòng hộ các lỗi lầm trong hiện tại và ngăn chặn các lỗi lầm trong tương lai.
Vì để phòng hộ các hiểm họa trong hiện tại và ngăn chặn các hiểm họa trong tương lai.
Vì để phòng hộ các pháp bất thiện trong hiện tại và ngăn chặn các pháp bất thiện trong tương lai.
Vì lòng từ mẫn đối với hàng gia chủ và để đoạn tuyệt các phần tử ác dục.
Vì để đem lại lòng tin cho người chưa có lòng tin và làm tăng trưởng lòng tin nơi người đã có lòng tin.
Vì để diệu pháp được an trú lâu dài và để hộ trì giới luật.`

export function buildAn2VinayaContent(
    title: string,
    suttaRef: string,
    subject: string,
): string {
    return `
# ${title}
## ${suttaRef}

Đức Phật dạy:

"Này các Tỷ-kheo, do thấy hai lợi ích này, Như Lai chế lập ${subject} cho các đệ tử.

Thế nào là hai?

${an2VinayaReasons}

Này các Tỷ-kheo, do thấy hai lợi ích này, Như Lai chế lập ${subject} cho các đệ tử."`
}
