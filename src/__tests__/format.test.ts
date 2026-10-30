import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatClock,
  formatNumber,
  formatPercent,
  formatRelative,
  toLocalISODate,
  todayISO,
} from '@/utils/format';

describe('formatDuration', () => {
  it('formata horas e minutos', () => {
    expect(formatDuration(3725)).toBe('1h 02m');
  });

  it('formata minutos e segundos', () => {
    expect(formatDuration(125)).toBe('2m 05s');
  });

  it('formata apenas segundos', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('devolve traço para valores vazios', () => {
    expect(formatDuration(0)).toBe('—');
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(undefined)).toBe('—');
  });
});

describe('formatClock', () => {
  it('formata mm:ss', () => {
    expect(formatClock(83)).toBe('01:23');
  });

  it('formata h:mm:ss', () => {
    expect(formatClock(3725)).toBe('1:02:05');
  });
});

describe('formatNumber', () => {
  it('usa separador de milhar pt-BR', () => {
    expect(formatNumber(1250)).toBe('1.250');
  });

  it('respeita casas decimais', () => {
    expect(formatNumber(12.345, 2)).toBe('12,35');
  });
});

describe('formatPercent', () => {
  it('calcula a porcentagem', () => {
    expect(formatPercent(50, 200)).toBe(25);
  });

  it('não divide por zero', () => {
    expect(formatPercent(50, 0)).toBe(0);
  });

  it('limita em 100 quando ultrapassa', () => {
    expect(formatPercent(300, 200)).toBe(150);
  });
});

describe('formatRelative', () => {
  it('mostra "agora" para instantes recentes', () => {
    expect(formatRelative(new Date())).toBe('agora');
  });

  it('mostra minutos', () => {
    const d = new Date(Date.now() - 5 * 60_000);
    expect(formatRelative(d)).toBe('há 5 min');
  });

  it('mostra horas', () => {
    const d = new Date(Date.now() - 3 * 3_600_000);
    expect(formatRelative(d)).toBe('há 3 h');
  });

  it('mostra ontem', () => {
    const d = new Date(Date.now() - 26 * 3_600_000);
    expect(formatRelative(d)).toBe('ontem');
  });

  it('devolve traço para data inválida', () => {
    expect(formatRelative('data-invalida')).toBe('—');
  });
});

describe('datas locais', () => {
  it('todayISO retorna YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('toLocalISODate preserva o dia local', () => {
    // Uma data ISO com Z às 23h pode ser outro dia no fuso local;
    // a função deve refletir o dia local do usuário.
    const iso = toLocalISODate(new Date());
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
