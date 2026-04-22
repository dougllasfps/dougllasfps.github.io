import {
  daysBetween,
  formatCurrency,
  formatNumber,
  minutesToTime,
  parseTimeToMinutes,
  toNumber,
} from './utils.js';

function dateFromInput(text) {
  const date = new Date(`${text}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function safeDivision(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return NaN;
  return a / b;
}

export const TOOL_DEFINITIONS = {
  'calculadora-porcentagem': {
    inputs: [
      { name: 'base', label: 'Valor base', type: 'number', step: 'any', placeholder: 'Ex.: 2500' },
      { name: 'percent', label: 'Percentual (%)', type: 'number', step: 'any', placeholder: 'Ex.: 12' },
    ],
    example: 'Exemplo: 12% de 2500 = 300.',
    explanation: 'Multiplicamos o valor base pelo percentual e dividimos por 100.',
    related: ['aumento-percentual', 'desconto-percentual', 'regra-de-tres'],
    calculate(values) {
      const base = toNumber(values.base);
      const percent = toNumber(values.percent);
      if (!Number.isFinite(base) || !Number.isFinite(percent)) return { error: 'Preencha valores numéricos válidos.' };
      const result = base * (percent / 100);
      return { value: `${formatNumber(result)} (${formatCurrency(result)})`, detail: `${formatNumber(percent)}% de ${formatNumber(base)}.` };
    },
  },
  'aumento-percentual': {
    inputs: [
      { name: 'value', label: 'Valor atual', type: 'number', step: 'any' },
      { name: 'percent', label: 'Aumento (%)', type: 'number', step: 'any' },
    ],
    example: 'Exemplo: R$ 1.000 com aumento de 8% resulta em R$ 1.080.',
    explanation: 'Aplicamos o percentual de aumento sobre o valor inicial.',
    related: ['calculadora-porcentagem', 'desconto-percentual', 'juros-simples'],
    calculate(values) {
      const value = toNumber(values.value);
      const percent = toNumber(values.percent);
      if (!Number.isFinite(value) || !Number.isFinite(percent)) return { error: 'Informe números válidos.' };
      const total = value * (1 + percent / 100);
      return { value: `${formatCurrency(total)}`, detail: `Valor final com +${formatNumber(percent)}%.` };
    },
  },
  'desconto-percentual': {
    inputs: [
      { name: 'value', label: 'Valor original', type: 'number', step: 'any' },
      { name: 'discount', label: 'Desconto (%)', type: 'number', step: 'any' },
    ],
    example: 'Exemplo: R$ 400 com desconto de 25% fica R$ 300.',
    explanation: 'Subtraímos o percentual de desconto do valor original.',
    related: ['calculadora-porcentagem', 'aumento-percentual', 'simulador-de-parcelas'],
    calculate(values) {
      const value = toNumber(values.value);
      const discount = toNumber(values.discount);
      if (!Number.isFinite(value) || !Number.isFinite(discount)) return { error: 'Informe números válidos.' };
      const total = value * (1 - discount / 100);
      return { value: `${formatCurrency(total)}`, detail: `Economia de ${formatCurrency(value - total)}.` };
    },
  },
  'regra-de-tres': {
    inputs: [
      { name: 'a', label: 'A', type: 'number', step: 'any' },
      { name: 'b', label: 'B', type: 'number', step: 'any' },
      { name: 'c', label: 'C', type: 'number', step: 'any' },
    ],
    example: 'Exemplo: Se 2 itens custam 30, 5 itens custam X. Resultado: 75.',
    explanation: 'Usamos X = (B x C) / A em proporção simples.',
    related: ['media-aritmetica', 'calculadora-porcentagem', 'km-para-milha'],
    calculate(values) {
      const a = toNumber(values.a);
      const b = toNumber(values.b);
      const c = toNumber(values.c);
      const x = safeDivision(b * c, a);
      if (!Number.isFinite(x)) return { error: 'Verifique os valores. A não pode ser zero.' };
      return { value: formatNumber(x), detail: `X = (${formatNumber(b)} x ${formatNumber(c)}) / ${formatNumber(a)}.` };
    },
  },
  'media-aritmetica': {
    inputs: [
      { name: 'numbers', label: 'Números separados por vírgula', type: 'text', placeholder: 'Ex.: 7, 8.5, 9' },
    ],
    example: 'Exemplo: 7, 8 e 9 -> média 8.',
    explanation: 'Somamos os valores e dividimos pela quantidade de itens.',
    related: ['regra-de-tres', 'imc', 'horas-trabalhadas'],
    calculate(values) {
      const numbers = String(values.numbers || '')
        .split(',')
        .map((n) => toNumber(n))
        .filter((n) => Number.isFinite(n));
      if (!numbers.length) return { error: 'Informe pelo menos um número válido separado por vírgula.' };
      const sum = numbers.reduce((acc, value) => acc + value, 0);
      const avg = sum / numbers.length;
      return { value: formatNumber(avg), detail: `Média de ${numbers.length} valor(es).` };
    },
  },
  'juros-simples': {
    inputs: [
      { name: 'capital', label: 'Capital inicial (R$)', type: 'number', step: 'any' },
      { name: 'rate', label: 'Taxa por período (%)', type: 'number', step: 'any' },
      { name: 'time', label: 'Quantidade de períodos', type: 'number', step: '1' },
    ],
    example: 'Exemplo: 1000, taxa 2% por 6 meses -> montante R$ 1.120.',
    explanation: 'Juros simples: J = C x i x t. Montante = C + J.',
    related: ['juros-compostos', 'simulador-de-parcelas', 'aumento-percentual'],
    calculate(values) {
      const capital = toNumber(values.capital);
      const rate = toNumber(values.rate);
      const time = toNumber(values.time);
      if (![capital, rate, time].every(Number.isFinite)) return { error: 'Preencha capital, taxa e período.' };
      const interest = capital * (rate / 100) * time;
      const total = capital + interest;
      return { value: formatCurrency(total), detail: `Juros: ${formatCurrency(interest)}.` };
    },
  },
  'juros-compostos': {
    inputs: [
      { name: 'capital', label: 'Capital inicial (R$)', type: 'number', step: 'any' },
      { name: 'rate', label: 'Taxa por período (%)', type: 'number', step: 'any' },
      { name: 'time', label: 'Quantidade de períodos', type: 'number', step: '1' },
    ],
    example: 'Exemplo: 2000 a 1% ao mês por 12 meses.',
    explanation: 'Montante composto: M = C x (1 + i)^t.',
    related: ['juros-simples', 'simulador-de-parcelas', 'desconto-percentual'],
    calculate(values) {
      const capital = toNumber(values.capital);
      const rate = toNumber(values.rate);
      const time = toNumber(values.time);
      if (![capital, rate, time].every(Number.isFinite)) return { error: 'Preencha capital, taxa e períodos.' };
      const total = capital * (1 + rate / 100) ** time;
      return { value: formatCurrency(total), detail: `Rendimento: ${formatCurrency(total - capital)}.` };
    },
  },
  'simulador-de-parcelas': {
    inputs: [
      { name: 'amount', label: 'Valor financiado (R$)', type: 'number', step: 'any' },
      { name: 'rate', label: 'Juros mensal (%)', type: 'number', step: 'any' },
      { name: 'months', label: 'Quantidade de parcelas', type: 'number', step: '1' },
    ],
    example: 'Exemplo: R$ 5.000 em 12x com 1,5% ao mês.',
    explanation: 'Utiliza fórmula da prestação fixa (sistema Price).',
    related: ['juros-compostos', 'juros-simples', 'desconto-percentual'],
    calculate(values) {
      const amount = toNumber(values.amount);
      const rate = toNumber(values.rate) / 100;
      const months = toNumber(values.months);
      if (![amount, rate, months].every(Number.isFinite) || months <= 0) return { error: 'Verifique valor, taxa e parcelas.' };
      const installment = rate === 0 ? amount / months : amount * ((rate * (1 + rate) ** months) / ((1 + rate) ** months - 1));
      return {
        value: `${formatCurrency(installment)} por mês`,
        detail: `Total aproximado: ${formatCurrency(installment * months)}.`,
      };
    },
  },
  'diferenca-entre-datas': {
    inputs: [
      { name: 'start', label: 'Data inicial', type: 'date' },
      { name: 'end', label: 'Data final', type: 'date' },
    ],
    example: 'Exemplo: 01/01/2026 até 10/01/2026 = 9 dias.',
    explanation: 'Subtrai o timestamp das datas em dias corridos.',
    related: ['idade-exata', 'horas-trabalhadas', 'horas-extras'],
    calculate(values) {
      const start = dateFromInput(values.start);
      const end = dateFromInput(values.end);
      if (!start || !end) return { error: 'Preencha as duas datas.' };
      const diff = daysBetween(start, end);
      return { value: `${formatNumber(diff, 0)} dia(s)`, detail: `Intervalo entre ${values.start} e ${values.end}.` };
    },
  },
  'idade-exata': {
    inputs: [{ name: 'birth', label: 'Data de nascimento', type: 'date' }],
    example: 'Exemplo: Informe sua data de nascimento para obter anos, meses e dias.',
    explanation: 'Compara a data de nascimento com a data atual.',
    related: ['diferenca-entre-datas', 'imc', 'horas-trabalhadas'],
    calculate(values) {
      const birth = dateFromInput(values.birth);
      if (!birth) return { error: 'Informe uma data de nascimento válida.' };
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += prevMonth;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years < 0) return { error: 'A data de nascimento não pode estar no futuro.' };
      return { value: `${years} ano(s), ${months} mês(es), ${days} dia(s)`, detail: 'Cálculo em relação à data atual.' };
    },
  },
  'horas-trabalhadas': {
    inputs: [
      { name: 'start', label: 'Hora de entrada', type: 'time' },
      { name: 'end', label: 'Hora de saída', type: 'time' },
      { name: 'break', label: 'Intervalo (minutos)', type: 'number', step: '1', value: '60' },
    ],
    example: 'Exemplo: 08:00 até 17:00 com 60 min de intervalo = 8h.',
    explanation: 'Subtraímos entrada e saída, descontando o intervalo.',
    related: ['horas-extras', 'diferenca-entre-datas', 'media-aritmetica'],
    calculate(values) {
      const start = parseTimeToMinutes(values.start);
      const end = parseTimeToMinutes(values.end);
      const pause = toNumber(values.break);
      if (![start, end, pause].every(Number.isFinite)) return { error: 'Preencha horários válidos e intervalo.' };
      let total = end - start - pause;
      if (total < 0) total += 24 * 60;
      return { value: `${minutesToTime(total)} h`, detail: `${formatNumber(total, 0)} minuto(s) trabalhados.` };
    },
  },
  'horas-extras': {
    inputs: [
      { name: 'extra', label: 'Horas extras (decimal)', type: 'number', step: 'any', placeholder: 'Ex.: 2.5' },
      { name: 'hourValue', label: 'Valor da hora (R$)', type: 'number', step: 'any' },
      { name: 'additional', label: 'Adicional (%)', type: 'number', step: 'any', value: '50' },
    ],
    example: 'Exemplo: 2 horas extras, R$ 20/h e adicional 50%.',
    explanation: 'Valor extra = horas x valor hora x (1 + adicional).',
    related: ['horas-trabalhadas', 'juros-simples', 'simulador-de-parcelas'],
    calculate(values) {
      const extra = toNumber(values.extra);
      const hourValue = toNumber(values.hourValue);
      const additional = toNumber(values.additional);
      if (![extra, hourValue, additional].every(Number.isFinite)) return { error: 'Preencha todos os campos numéricos.' };
      const total = extra * hourValue * (1 + additional / 100);
      return { value: formatCurrency(total), detail: `Para ${formatNumber(extra)} hora(s) extras.` };
    },
  },
  imc: {
    inputs: [
      { name: 'weight', label: 'Peso (kg)', type: 'number', step: 'any' },
      { name: 'height', label: 'Altura (m)', type: 'number', step: 'any', placeholder: 'Ex.: 1.75' },
    ],
    example: 'Exemplo: 70 kg e 1,75 m -> IMC 22,86.',
    explanation: 'IMC = peso / (altura x altura).',
    related: ['idade-exata', 'consumo-combustivel', 'media-aritmetica'],
    calculate(values) {
      const weight = toNumber(values.weight);
      const height = toNumber(values.height);
      const score = safeDivision(weight, height * height);
      if (!Number.isFinite(score)) return { error: 'Informe peso e altura válidos.' };
      let status = 'Obesidade';
      if (score < 18.5) status = 'Abaixo do peso';
      else if (score < 25) status = 'Peso adequado';
      else if (score < 30) status = 'Sobrepeso';
      return { value: formatNumber(score), detail: `Classificação: ${status}.` };
    },
  },
  'consumo-combustivel': {
    inputs: [
      { name: 'distance', label: 'Distância percorrida (km)', type: 'number', step: 'any' },
      { name: 'liters', label: 'Litros abastecidos', type: 'number', step: 'any' },
    ],
    example: 'Exemplo: 450 km com 35 litros -> 12,86 km/l.',
    explanation: 'Consumo médio = km rodados / litros consumidos.',
    related: ['estimativa-conta-luz', 'km-para-milha', 'imc'],
    calculate(values) {
      const distance = toNumber(values.distance);
      const liters = toNumber(values.liters);
      const result = safeDivision(distance, liters);
      if (!Number.isFinite(result)) return { error: 'Informe distância e litros válidos (litros > 0).' };
      return { value: `${formatNumber(result)} km/l`, detail: `Consumo baseado em ${formatNumber(distance)} km.` };
    },
  },
  'estimativa-conta-luz': {
    inputs: [
      { name: 'power', label: 'Potência do aparelho (W)', type: 'number', step: 'any' },
      { name: 'hoursPerDay', label: 'Horas de uso por dia', type: 'number', step: 'any' },
      { name: 'days', label: 'Dias no mês', type: 'number', step: '1', value: '30' },
      { name: 'rate', label: 'Tarifa de energia (R$/kWh)', type: 'number', step: 'any', value: '0.95' },
    ],
    example: 'Exemplo: 1000W por 2h/dia, 30 dias e tarifa de R$0,95/kWh.',
    explanation: 'Consumo kWh = (potência x horas x dias) / 1000. Custo = consumo x tarifa.',
    related: ['consumo-combustivel', 'juros-simples', 'desconto-percentual'],
    calculate(values) {
      const power = toNumber(values.power);
      const hoursPerDay = toNumber(values.hoursPerDay);
      const days = toNumber(values.days);
      const rate = toNumber(values.rate);
      if (![power, hoursPerDay, days, rate].every(Number.isFinite)) return { error: 'Preencha todos os campos com números válidos.' };
      const kwh = (power * hoursPerDay * days) / 1000;
      const cost = kwh * rate;
      return { value: formatCurrency(cost), detail: `Consumo estimado: ${formatNumber(kwh)} kWh/mês.` };
    },
  },
  'km-para-milha': converter('km', 'mi', 0.621371, 'Multiplica o valor em quilômetros por 0,621371.', ['milha-para-km', 'consumo-combustivel', 'regra-de-tres']),
  'milha-para-km': converter('mi', 'km', 1.60934, 'Multiplica o valor em milhas por 1,60934.', ['km-para-milha', 'consumo-combustivel', 'regra-de-tres']),
  'celsius-para-fahrenheit': {
    inputs: [{ name: 'value', label: 'Temperatura em Celsius (°C)', type: 'number', step: 'any' }],
    example: 'Exemplo: 30°C = 86°F.',
    explanation: 'F = (C x 9/5) + 32.',
    related: ['fahrenheit-para-celsius', 'km-para-milha', 'mb-para-gb'],
    calculate(values) {
      const value = toNumber(values.value);
      if (!Number.isFinite(value)) return { error: 'Digite uma temperatura válida.' };
      const result = value * (9 / 5) + 32;
      return { value: `${formatNumber(result)} °F`, detail: `${formatNumber(value)} °C convertido.` };
    },
  },
  'fahrenheit-para-celsius': {
    inputs: [{ name: 'value', label: 'Temperatura em Fahrenheit (°F)', type: 'number', step: 'any' }],
    example: 'Exemplo: 86°F = 30°C.',
    explanation: 'C = (F - 32) x 5/9.',
    related: ['celsius-para-fahrenheit', 'km-para-milha', 'mb-para-gb'],
    calculate(values) {
      const value = toNumber(values.value);
      if (!Number.isFinite(value)) return { error: 'Digite uma temperatura válida.' };
      const result = (value - 32) * (5 / 9);
      return { value: `${formatNumber(result)} °C`, detail: `${formatNumber(value)} °F convertido.` };
    },
  },
  'kg-para-libra': converter('kg', 'lb', 2.20462, 'Multiplica o valor em quilos por 2,20462.', ['libra-para-kg', 'imc', 'media-aritmetica']),
  'libra-para-kg': converter('lb', 'kg', 0.453592, 'Multiplica o valor em libras por 0,453592.', ['kg-para-libra', 'imc', 'media-aritmetica']),
  'litro-para-ml': converter('L', 'mL', 1000, 'Multiplica o valor em litros por 1000.', ['ml-para-litro', 'regra-de-tres', 'consumo-combustivel']),
  'ml-para-litro': converter('mL', 'L', 0.001, 'Multiplica o valor em mL por 0,001.', ['litro-para-ml', 'regra-de-tres', 'consumo-combustivel']),
  'horas-para-minutos': converter('h', 'min', 60, 'Multiplica o valor em horas por 60.', ['minutos-para-horas', 'horas-trabalhadas', 'horas-extras']),
  'minutos-para-horas': converter('min', 'h', 1 / 60, 'Divide os minutos por 60.', ['horas-para-minutos', 'horas-trabalhadas', 'horas-extras']),
  'mb-para-gb': converter('MB', 'GB', 1 / 1024, 'Divide o valor em MB por 1024.', ['gb-para-mb', 'mbps-para-mbs', 'px-para-rem']),
  'gb-para-mb': converter('GB', 'MB', 1024, 'Multiplica o valor em GB por 1024.', ['mb-para-gb', 'mbps-para-mbs', 'px-para-rem']),
  'mbps-para-mbs': converter('Mbps', 'MB/s', 1 / 8, 'Divide a taxa em Mbps por 8 para obter MB/s.', ['mb-para-gb', 'gb-para-mb', 'px-para-rem']),
  'px-para-rem': {
    inputs: [
      { name: 'value', label: 'Valor em px', type: 'number', step: 'any' },
      { name: 'base', label: 'Base de fonte (px)', type: 'number', step: 'any', value: '16' },
    ],
    example: 'Exemplo: 24px com base 16px = 1,5rem.',
    explanation: 'rem = px / base.',
    related: ['rem-para-px', 'mbps-para-mbs', 'gb-para-mb'],
    calculate(values) {
      const value = toNumber(values.value);
      const base = toNumber(values.base);
      const result = safeDivision(value, base);
      if (!Number.isFinite(result)) return { error: 'Informe px e base válidos (base > 0).' };
      return { value: `${formatNumber(result)} rem`, detail: `${formatNumber(value)}px usando base ${formatNumber(base)}px.` };
    },
  },
  'rem-para-px': {
    inputs: [
      { name: 'value', label: 'Valor em rem', type: 'number', step: 'any' },
      { name: 'base', label: 'Base de fonte (px)', type: 'number', step: 'any', value: '16' },
    ],
    example: 'Exemplo: 2rem com base 16px = 32px.',
    explanation: 'px = rem x base.',
    related: ['px-para-rem', 'mbps-para-mbs', 'gb-para-mb'],
    calculate(values) {
      const value = toNumber(values.value);
      const base = toNumber(values.base);
      if (![value, base].every(Number.isFinite) || base <= 0) return { error: 'Informe rem e base válidos.' };
      const result = value * base;
      return { value: `${formatNumber(result)} px`, detail: `${formatNumber(value)}rem usando base ${formatNumber(base)}px.` };
    },
  },
};

function converter(from, to, factor, explanation, related) {
  return {
    inputs: [{ name: 'value', label: `Valor em ${from}`, type: 'number', step: 'any' }],
    example: `Exemplo: informe um valor em ${from} para converter em ${to}.`,
    explanation,
    related,
    calculate(values) {
      const value = toNumber(values.value);
      if (!Number.isFinite(value)) return { error: 'Digite um número válido.' };
      const result = value * factor;
      return { value: `${formatNumber(result)} ${to}`, detail: `${formatNumber(value)} ${from} convertido.` };
    },
  };
}
