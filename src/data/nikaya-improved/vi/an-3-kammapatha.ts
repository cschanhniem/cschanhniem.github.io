export function buildAn3KammapathaContent(
    title: string,
    suttaRef: string,
    destination: 'địa ngục' | 'cõi trời',
    qualityBody: string,
): string {
    const destinationLine =
        destination === 'địa ngục'
            ? 'thì như được đặt sẵn vào địa ngục.'
            : 'thì như được đặt sẵn vào cõi trời.'

    return `
# ${title}
## ${suttaRef}

Đức Phật dạy:

"Này các Tỷ-kheo, ai thành tựu ba pháp này ${destinationLine}

Thế nào là ba?

${qualityBody}

Này các Tỷ-kheo, ai thành tựu ba pháp này ${destinationLine}"`
}
