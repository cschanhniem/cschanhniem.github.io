export function buildAn3RagaPeyyalaContent(
    title: string,
    suttaRef: string,
    operation: string,
    defilement: string,
): string {
    return `
# ${title}
## ${suttaRef}

Đức Phật dạy:

"Này các Tỷ-kheo, để ${operation} ${defilement}, có ba pháp cần phải tu tập.

Thế nào là ba?

Không định,
vô tướng định,
và vô nguyện định.

Này các Tỷ-kheo, để ${operation} ${defilement}, ba pháp này cần phải tu tập."`
}
