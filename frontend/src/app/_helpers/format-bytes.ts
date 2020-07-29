export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return bytes

    const k = 1024 * 1024;
    const dm = decimals < 0 ? 0 : decimals;

    return parseFloat( ( bytes / k ).toFixed(dm) )
} 