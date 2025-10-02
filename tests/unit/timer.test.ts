import { addSeconds, formatTime } from "../../apps/desktop/src/lib/timer";

describe("Timer Utils", () => {
  test("deve somar segundos corretamente", () => {
    expect(addSeconds(50, 10)).toBe(60);
  });

  test("não deve permitir valores negativos", () => {
    expect(addSeconds(10, -20)).toBe(0);
  });

  test("grandes valores devem somar corretamente", () => {
    expect(addSeconds(3600, 120)).toBe(3720);
  });

  test("formatar 0 segundos deve retornar 00:00:00", () => {
    expect(formatTime(0)).toBe("00:00:00");
  });

  test("formatar 65 segundos deve retornar 00:01:05", () => {
    expect(formatTime(65)).toBe("00:01:05");
  });

  test("formatar 3661 segundos deve retornar 01:01:01", () => {
    expect(formatTime(3661)).toBe("01:01:01");
  });
});

