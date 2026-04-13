/**
 * Tính toán position mới dựa trên vị trí trên/dưới
 * @param {number|null} prevPos - Position của task phía trên (null nếu ở đầu)
 * @param {number|null} nextPos - Position của task phía dưới (null nếu ở cuối)
 * @returns {number} Position mới được tính toán
 */
export const calculateNewPosition = (
  prevPos: number | null,
  nextPos: number | null,
): number => {
  // Trường hợp: cả prevPos và nextPos là null => vị trí đơn lẻ
  if (prevPos === null && nextPos === null) {
    return 1000;
  }

  // Trường hợp: prevPos null (ở đầu danh sách)
  if (prevPos === null) {
    return nextPos! - 1000;
  }

  // Trường hợp: nextPos null (ở cuối danh sách)
  if (nextPos === null) {
    return prevPos + 1000;
  }

  // Trường hợp: cả hai đều có giá trị - tính midpoint
  return (prevPos + nextPos) / 2;
};

/**
 * Precision guard để tránh float artifacts
 * @param {number} position - Position cần làm tròn
 * @returns {number} Position được làm tròn
 */
export const roundPosition = (position: number): number => {
  return Math.round(position * 1e10) / 1e10;
};
