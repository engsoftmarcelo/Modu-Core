// Helpers de calendario para a agenda. O fuso de exibicao e fixo em
// America/Sao_Paulo (UTC-3, sem horario de verao), igual ao restante do app.

export const SP_TIME_ZONE = "America/Sao_Paulo";
export const SP_OFFSET = "-03:00";

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 22;
export const HOUR_HEIGHT = 56; // px por hora
export const GRID_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

export type CalendarView = "day" | "week";

export function isCalendarView(value: string | undefined): value is CalendarView {
  return value === "day" || value === "week";
}

const dateKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: SP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: SP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function isValidDateKey(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00${SP_OFFSET}`))
  );
}

export function todayDateKey() {
  return dateKeyFmt.format(new Date());
}

// "HH:MM" no fuso de Sao Paulo.
export function spTime(value: string) {
  return timeFmt.format(new Date(value));
}

// Minutos desde a meia-noite local (Sao Paulo).
export function spMinutes(value: string) {
  const [hour, minute] = spTime(value).split(":").map(Number);
  return hour * 60 + minute;
}

// Chave de data (YYYY-MM-DD) local de um instante.
export function spDateKey(value: string) {
  return dateKeyFmt.format(new Date(value));
}

function utcMidnight(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function keyFromUtcMs(ms: number) {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey: string, days: number) {
  return keyFromUtcMs(utcMidnight(dateKey) + days * 86_400_000);
}

// 0 = domingo ... 6 = sabado.
export function weekday(dateKey: string) {
  return new Date(utcMidnight(dateKey)).getUTCDay();
}

// Semana comeca no domingo, padrao dos calendarios pt-BR.
export function weekStart(dateKey: string) {
  return addDays(dateKey, -weekday(dateKey));
}

export function rangeDays(view: CalendarView, dateKey: string) {
  if (view === "day") {
    return [dateKey];
  }

  const start = weekStart(dateKey);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

// Instantes UTC (ISO) que delimitam o range para a consulta.
export function rangeInstants(view: CalendarView, dateKey: string) {
  const days = rangeDays(view, dateKey);
  const startISO = new Date(`${days[0]}T00:00:00${SP_OFFSET}`).toISOString();
  const endISO = new Date(
    `${addDays(days[days.length - 1], 1)}T00:00:00${SP_OFFSET}`,
  ).toISOString();

  return { days, startISO, endISO };
}

const weekdayLongFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: SP_TIME_ZONE,
  weekday: "long",
});
const weekdayShortFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: SP_TIME_ZONE,
  weekday: "short",
});
const dayNumberFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: SP_TIME_ZONE,
  day: "2-digit",
});
const rangeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: SP_TIME_ZONE,
  day: "2-digit",
  month: "short",
});
const fullFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: SP_TIME_ZONE,
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function noon(dateKey: string) {
  return new Date(`${dateKey}T12:00:00${SP_OFFSET}`);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clean(value: string) {
  return value.replace(".", "");
}

export type DayHeader = {
  dateKey: string;
  weekdayShort: string;
  dayNumber: string;
  isToday: boolean;
  isWeekend: boolean;
};

export function dayHeader(dateKey: string): DayHeader {
  const reference = noon(dateKey);
  const dow = weekday(dateKey);

  return {
    dateKey,
    weekdayShort: capitalize(clean(weekdayShortFmt.format(reference))),
    dayNumber: dayNumberFmt.format(reference),
    isToday: dateKey === todayDateKey(),
    isWeekend: dow === 0 || dow === 6,
  };
}

export function rangeTitle(view: CalendarView, dateKey: string) {
  if (view === "day") {
    return capitalize(fullFmt.format(noon(dateKey)));
  }

  const days = rangeDays(view, dateKey);
  const first = rangeFmt.format(noon(days[0]));
  const last = rangeFmt.format(noon(days[days.length - 1]));
  const year = noon(days[0]).toLocaleDateString("pt-BR", {
    timeZone: SP_TIME_ZONE,
    year: "numeric",
  });

  return `${clean(first)} - ${clean(last)} de ${year}`;
}

export function longDayLabel(dateKey: string) {
  return capitalize(
    `${clean(weekdayLongFmt.format(noon(dateKey)))}, ${rangeFmt
      .format(noon(dateKey))
      .replace(".", "")}`,
  );
}

export const hourMarks = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, index) => DAY_START_HOUR + index,
);

export type PositionedBlock<T> = {
  data: T;
  top: number;
  height: number;
  lane: number;
  lanes: number;
};

type LayoutInput<T> = {
  startMinutes: number;
  endMinutes: number;
  data: T;
};

// Posiciona os blocos do dia e distribui sobreposicoes em colunas (lanes).
export function layoutDay<T>(items: LayoutInput<T>[]): PositionedBlock<T>[] {
  const gridStart = DAY_START_HOUR * 60;
  const gridEnd = DAY_END_HOUR * 60;

  const normalized = items
    .map((item) => {
      const start = Math.min(Math.max(item.startMinutes, gridStart), gridEnd);
      const end = Math.min(Math.max(item.endMinutes, start + 15), gridEnd);
      return { start, end, data: item.data };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result: PositionedBlock<T>[] = [];
  let cluster: (typeof normalized)[number][] = [];
  let clusterEnd = -1;

  const flush = () => {
    const laneEnds: number[] = [];
    const lanesOf = cluster.map((block) => {
      let lane = laneEnds.findIndex((end) => end <= block.start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(block.end);
      } else {
        laneEnds[lane] = block.end;
      }
      return lane;
    });
    const lanes = laneEnds.length;

    cluster.forEach((block, index) => {
      result.push({
        data: block.data,
        top: ((block.start - gridStart) / 60) * HOUR_HEIGHT,
        height: Math.max(((block.end - block.start) / 60) * HOUR_HEIGHT, 22),
        lane: lanesOf[index],
        lanes,
      });
    });

    cluster = [];
  };

  for (const block of normalized) {
    if (cluster.length === 0) {
      cluster.push(block);
      clusterEnd = block.end;
      continue;
    }

    if (block.start < clusterEnd) {
      cluster.push(block);
      clusterEnd = Math.max(clusterEnd, block.end);
    } else {
      flush();
      cluster.push(block);
      clusterEnd = block.end;
    }
  }

  if (cluster.length) {
    flush();
  }

  return result;
}
