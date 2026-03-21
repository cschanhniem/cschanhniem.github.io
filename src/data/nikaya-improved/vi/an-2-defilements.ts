export function buildAn2DefilementContent(
    title: string,
    suttaRef: string,
    purpose: string,
    defilement: string,
): string {
    return `
# ${title}
## ${suttaRef}

Đức Phật dạy:

"Này các Tỷ-kheo, để ${purpose} ${defilement}, có hai pháp cần phải tu tập.

Thế nào là hai?

Chỉ và quán.

Này các Tỷ-kheo, để ${purpose} ${defilement}, hai pháp này cần phải tu tập."`
}
